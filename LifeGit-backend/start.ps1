# LifeGit 后端一键启动脚本
# 使用方式: 右键 -> 用 PowerShell 运行
# 或在终端: powershell -ExecutionPolicy Bypass -File start.ps1

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ROOT

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LifeGit 后端启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 检查 Python
Write-Host "[1/4] 检查 Python..." -ForegroundColor Yellow
try {
    $pyVer = python --version 2>&1
    Write-Host "  OK: $pyVer" -ForegroundColor Green
} catch {
    Write-Host "  失败: 未安装 Python 或未加入 PATH" -ForegroundColor Red
    Write-Host "  请从 https://www.python.org/downloads/ 下载安装" -ForegroundColor Red
    pause; exit 1
}

# 2. 检查 config.py 是否已配置
Write-Host ""
Write-Host "[2/4] 检查 config.py..." -ForegroundColor Yellow
if (-not (Test-Path "$ROOT\config.py")) {
    Write-Host "  失败: 未找到 config.py,请复制 config.example.py 为 config.py 并填写 MySQL 密码" -ForegroundColor Red
    pause; exit 1
}
$configContent = Get-Content "$ROOT\config.py" -Raw
if ($configContent -match "在这里填入你的MySQL密码") {
    Write-Host "  警告: config.py 中的密码尚未修改!" -ForegroundColor Red
    $pwd = Read-Host "  请输入 MySQL root 密码(直接回车跳过,需手动改 config.py)"
    if ($pwd) {
        $configContent = $configContent -replace "在这里填入你的MySQL密码", $pwd
        Set-Content -Path "$ROOT\config.py" -Value $configContent -Encoding UTF8
        Write-Host "  已写入 config.py" -ForegroundColor Green
    } else {
        Write-Host "  跳过,请手动编辑 config.py" -ForegroundColor Red
        pause; exit 1
    }
} else {
    Write-Host "  OK: config.py 已配置" -ForegroundColor Green
}

# 3. 安装依赖
Write-Host ""
Write-Host "[3/4] 检查/安装依赖..." -ForegroundColor Yellow
Write-Host "  正在安装 requirements.txt 中的依赖(已安装会跳过)..." -ForegroundColor Gray
pip install -r requirements.txt --quiet --disable-pip-version-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "  依赖安装失败,请检查网络或手动执行: pip install Flask PyMySQL PyJWT Werkzeug" -ForegroundColor Red
    pause; exit 1
}
Write-Host "  OK: 依赖已就绪" -ForegroundColor Green

# 4. 测试数据库连接
Write-Host ""
Write-Host "[4/4] 测试数据库连接..." -ForegroundColor Yellow
$testPy = @"
import sys
sys.path.insert(0, '.')
try:
    from utils.db import execute_query
    r = execute_query('SELECT 1 AS ok')
    print('  OK: 数据库连接成功,数据库已存在')
except Exception as e:
    print(f'  失败: {e}')
    print('  请确认:')
    print('  1) MySQL 服务已启动(服务管理器或 net start MySQL80)')
    print('  2) 已执行建表脚本: mysql -u root -p < schema.sql')
    sys.exit(1)
"@
$testPy | Out-File -FilePath "$ROOT\_test_db.py" -Encoding UTF8
python _test_db.py
$testResult = $LASTEXITCODE
Remove-Item "$ROOT\_test_db.py" -Force -ErrorAction SilentlyContinue
if ($testResult -ne 0) {
    pause; exit 1
}

# 启动 Flask
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  启动 Flask 服务(端口 5000)..." -ForegroundColor Cyan
Write-Host "  访问: http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host "  按 Ctrl+C 停止" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
python app.py
pause
