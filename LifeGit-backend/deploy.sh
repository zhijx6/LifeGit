#!/bin/bash
# deploy.sh - LifeGit 后端一键部署脚本 (Ubuntu 22.04)
# 用法: 在 /opt/LifeGit-backend 目录下执行  bash deploy.sh
set -e

echo "============================================"
echo " LifeGit 后端一键部署开始"
echo "============================================"

MYSQL_PASS="Lifegit2026"
APP_DIR=$(cd "$(dirname "$0")" && pwd)

# ---------- 1. 系统依赖 ----------
echo "[1/7] 安装系统依赖 (python3-venv / nginx / mysql-server)..."
apt update -y
apt install -y python3-venv python3-pip nginx mysql-server

# ---------- 2. MySQL 建库建表 ----------
echo "[2/7] 配置 MySQL (建库/建表/建账号)..."
mysql -e "CREATE DATABASE IF NOT EXISTS lifegit DEFAULT CHARSET utf8mb4;"
mysql -e "CREATE USER IF NOT EXISTS 'lifegit'@'localhost' IDENTIFIED BY '${MYSQL_PASS}';"
mysql -e "GRANT ALL PRIVILEGES ON lifegit.* TO 'lifegit'@'localhost'; FLUSH PRIVILEGES;"
mysql lifegit < "${APP_DIR}/schema.sql"
echo "  数据库 lifegit 就绪,账号 lifegit,密码 ${MYSQL_PASS}"

# ---------- 3. Python 虚拟环境 ----------
echo "[3/7] 安装 Python 依赖..."
cd "${APP_DIR}"
python3 -m venv .venv
.venv/bin/pip install --upgrade pip -q
.venv/bin/pip install -r requirements.txt gunicorn -q

# ---------- 4. 写入数据库配置 ----------
echo "[4/7] 更新 config.py 数据库配置..."
sed -i "s/'user': '[^']*'/'user': 'lifegit'/" config.py
sed -i "s/'password': '[^']*'/'password': '${MYSQL_PASS}'/" config.py
sed -i "s/'host': '[^']*'/'host': '127.0.0.1'/" config.py

# ---------- 5. systemd 服务 ----------
echo "[5/7] 配置开机自启服务 (lifegit.service)..."
cat > /etc/systemd/system/lifegit.service <<EOF
[Unit]
Description=LifeGit Flask backend (gunicorn)
After=network.target mysql.service

[Service]
WorkingDirectory=${APP_DIR}
ExecStart=${APP_DIR}/.venv/bin/gunicorn -w 3 -k gthread --threads 4 --timeout 120 -b 127.0.0.1:5000 app:app
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable lifegit
systemctl restart lifegit

# ---------- 6. Nginx 反向代理 ----------
echo "[6/7] 配置 Nginx 反向代理 (80 -> 5000)..."
cat > /etc/nginx/sites-available/lifegit <<EOF
server {
    listen 80;
    server_name _;
    client_max_body_size 20m;
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF
ln -sf /etc/nginx/sites-available/lifegit /etc/nginx/sites-enabled/lifegit
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# ---------- 7. 健康检查 ----------
echo "[7/7] 健康检查..."
sleep 3
if curl -s http://127.0.0.1/api/health | grep -q "ok"; then
    echo "============================================"
    echo " 部署成功! 后端已在 80 端口对外服务"
    echo " 测试: curl http://118.31.38.183/api/health"
    echo "============================================"
else
    echo "!!! 健康检查未通过,查看日志:"
    systemctl status lifegit --no-pager
    journalctl -u lifegit -n 30 --no-pager
fi
