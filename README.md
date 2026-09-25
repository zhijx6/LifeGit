# LifeGit —— 物品的 Git

> 给现实中的物品和地点建一个"Git 仓库"：购入是 `init`，每次使用、维修、升级都是一次 `commit`，转让给别人则是一次 `fork` —— 完整记录物品从入手到转手的每一个重要时刻。

LifeGit 是一个物品/地点全生命周期管理系统（微信小程序），已完成后端云端部署与前端真机联调，可正常使用。

---

## 核心功能

| 模块 | 说明 |
|---|---|
| 🔐 用户系统 | 手机号/邮箱注册登录，JWT 鉴权，资料与密码管理 |
| 📦 智能建仓 | 三种方式创建物品仓库：**扫条码**（自动带出商品信息）/ **NLP 语义描述**（AI 解析"我上周买的白色 iPhone 15"自动填表）/ **手动填写** |
| 📝 事件记录 | 7 类结构化事件：购入 purchase、维修 maintenance、升级 upgrade、心得 experience、回忆 memory、故障 fault、转让 transfer，支持图片/文档附件 |
| 🔄 物品转让 | 生成转让码（TF 开头）→ 对方凭码接收，系统自动 `fork` 出新仓库并**继承全部事件历史**，原仓库标记为已转让 |
| 🌳 Fork 图谱 | 可视化物品的"流转链"——一个物品在多人之间的传承关系 |
| 💬 Issue 问答 | 针对物品的提问/回答，支持采纳最佳答案（open → answered → closed） |
| 🔔 @提醒 | 问答中被 @ 的人会收到未读提醒 |
| 🤖 AI 语义解析 | 接入阿里云通义千问 API 解析自然语言描述，本地规则兜底，确保弱网/超时也能建仓 |

## 系统架构

```
微信小程序 (TypeScript)
        │  HTTPS
        ▼
Nginx (80)  ──  阿里云 ECS (118.31.38.183)
        ▼
Gunicorn (3 workers × 4 threads, gthread, timeout 120s)
        ▼
Flask 应用 (app.py, 约 1700 行, 44 个 API)
        ▼
MySQL 8 (7 张表: user / repo / event / transfer / issue / mention / reply)
```

- 前端 API 基地址：`http://118.31.38.183`（集中封装于 `utils/api.js`）
- AI 建仓请求超时 60s，其余接口 30s

## 目录结构

```
LifeGit/
├── database/
│   └── lifegit.sql              # 全量数据库转储（建表 + 初始数据）
├── LifeGit-backend/             # Flask 后端
│   ├── app.py                   # 全部路由入口
│   ├── config.example.py        # 配置模板（复制为 config.py 后填入真实凭据）
│   ├── requirements.txt         # Python 依赖
│   ├── schema.sql               # 7 张表建表脚本
│   ├── migration_fork.sql       # 转让/fork 功能增量迁移
│   ├── deploy.sh                # 服务器一键部署脚本
│   ├── start.ps1                # Windows 本地启动脚本
│   ├── API_GUIDE.md             # 后端 API 手册
│   ├── EVENT_API_GUIDE.md       # 事件 API 专项手册
│   ├── ADVANCED_FEATURES.md     # 高级功能说明
│   ├── 快速启动指南.txt          # Windows 本地启动手册（新手向）
│   ├── 服务器部署指南.txt        # 阿里云部署手册
│   ├── services/                # 业务服务层
│   │   ├── auth_service.py      # 认证
│   │   ├── event_service.py     # 事件
│   │   ├── file_service.py      # 文件上传
│   │   ├── nlp_service.py       # NLP 语义解析（千问 API + 本地规则兜底）
│   │   └── product_api_service.py  # 条码商品信息（当前 mock，京东/淘宝渠道预留）
│   ├── utils/db.py              # PyMySQL 封装
│   └── uploads/                 # 上传文件存储（images / documents / temp）
└── LifeGit-frontend/
    └── LifeGit/                 # 微信小程序（TypeScript 原生框架）
        ├── miniprogram/
        │   ├── utils/api.js     # API 封装层（40+ 函数，统一 401 处理）
        │   └── pages/           # 18 个页面
        │       ├── login / my / change-password / mentions / logs（模板遗留）
        │       ├── index（创建仓库）/ repo-detail
        │       ├── add-event / event-form / event-detail
        │       ├── nlp-input / nlp-result（AI 建仓）
        │       ├── transfer-initiate / transfer-receive / fork-graph（转让流转）
        │       └── issue-list / issue-detail / ask-question（问答）
        ├── typings/
        └── tsconfig.json        # target ES2017（真机兼容）
```

## 快速开始

### 1. 准备数据库（MySQL 8 / MariaDB）

```bash
# 推荐：schema.sql 已包含全部 7 张表（含转让/fork 功能），一步到位
mysql -u root -p < LifeGit-backend/schema.sql

# 或使用早期全量转储（⚠️ 缺 transfer 表和 fork 字段，必须补跑迁移）：
mysql -u root -p < database/lifegit.sql
mysql -u root -p < LifeGit-backend/migration_fork.sql
```

### 2. 启动后端

```bash
cd LifeGit-backend
pip install -r requirements.txt
cp config.example.py config.py    # 然后填入数据库凭据、JWT 密钥、千问 API Key
python app.py                     # 本地开发，默认 http://localhost:5000
```

> ⚠️ `config.py` 含真实密钥，已被 `.gitignore` 排除，**不要提交**。
> 生产部署参考 `deploy.sh`（Nginx + Gunicorn）与 `服务器部署指南.txt`。

### 3. 启动前端

1. 用微信开发者工具导入 `LifeGit-frontend/LifeGit` 目录
2. 修改 `miniprogram/utils/api.js` 中的 `BASE_URL` 指向你的后端地址
3. 详情设置中勾选「不校验合法域名」（本地调试）
4. 编译运行；真机调试请保持 TS 编译目标为 ES2017（低版本 JS 引擎兼容）

## 设计要点

- **事件即提交**：所有事件 `content` 以 JSON 存储，配合字段 Schema 校验，天然支持不同类型物品的差异化字段
- **转让即 fork**：接收转让时后端复制出新仓库并继承原仓库全部事件，`repo` 表通过 `parent_repo_id` 与 `fork_depth` 维护流转链
- **AI 优先、规则兜底**：NLP 建仓先调千问 API（3 次重试、每次 15s），失败自动降级本地正则规则，保证功能可用性
- **负面信息二次确认**：故障、低评分、转让、报废等负面事件均有确认弹窗，防止误录

## 相关文档

- [后端 API 手册](LifeGit-backend/API_GUIDE.md)
- [事件 API 手册](LifeGit-backend/EVENT_API_GUIDE.md)
- [高级功能说明](LifeGit-backend/ADVANCED_FEATURES.md)
- [服务器部署指南](LifeGit-backend/服务器部署指南.txt)
- [本地快速启动指南](LifeGit-backend/快速启动指南.txt)

## 已知限制 / 待办

- [ ] 条码商品 API 为 mock 数据（京东/淘宝渠道预留未接入）
- [ ] 小程序 openid 静默登录（目前为账密注册）
- [ ] fork 图谱递归查询存在 N+1 问题，超长流转链下有性能优化空间
- [ ] 上传文件存本地磁盘，生产建议替换为 OSS/COS 对象存储
- [ ] 小细节：仓库增加修改名称；用户添加头像；智能创仓ai识别名称会直接包括名字牌子规格，无法添加仓库照片；
- [ ]fork没让填内容，但是你查看信息就发现这些都有，其他     事件也有这个问题
- [ ]issue 问题很大，因为只能在仓库里面提问，可是别人都没有你的仓库，根本就无法提问，而且@别人好像别人也收不到