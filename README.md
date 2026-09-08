# LifeGit 项目搭建进度

> LifeGit 是一个物品/地点全生命周期管理系统,为每个实体(物品或地点)建立完整的"生命档案",记录从购入到转让的每一个重要时刻。

---

## 一、后端 (LifeGit-backend) — 基本完成 ✅

**整体状态**:7 大模块 / 36 个 API 全部完成,可投入联调。

**技术栈**:Python Flask + MySQL + JWT 认证
**后端地址**:`http://localhost:5000`

### 1. 已完成模块

| 模块 | 状态 | 说明 |
|---|---|---|
| ① 用户认证 | ✅ | 注册/登录(手机号+邮箱)/资料/改密 + JWT |
| ② 智能创仓(3 路径) | ✅ | 扫码 / NLP 语义 / 手动创仓 |
| ③ 结构化事件(7 类) | ✅ | purchase/maintenance/upgrade/experience/memory/fault/transfer + JSON Schema 校验 |
| ④ 负面信息确认 | ✅ | 故障、低评分、转让、报废二次确认 |
| ⑤ Issue 问答 | ✅ | open→answered→closed 状态流转 + 最佳答案 |
| ⑥ @提醒通知 | ✅ | 未读数、单条/全部已读 |
| ⑦ 文件上传 | ✅ | 单/批量图片、PDF/Word 文档 |

### 2. 关键技术细节

- 代码约 1300 行,`app.py` 含全部路由
- `utils/db.py` 用 PyMySQL 封装查询/插入/更新
- 服务层分层清晰:auth / event / file / nlp / product_api 五个 service
- `event` 表 `event_type` 为枚举字段,`content` 为 JSON 字段,支持灵活扩展

### 3. 后端遗留项 ⚠️

- [ ] 小程序端 openid 登录(目前仅账密)
- [ ] 商品 API 仍为 mock(`api_provider='mock'`)
- [ ] NLP 仍为本地规则匹配(`api_provider='local'`),非真实模型
- [ ] 无 `requirements.txt`(进度文档提到但实际未找到)
- [ ] `config.py` 未提交(仅 `config.example.py`,需手动 cp 填密码)
- [ ] 无数据库初始化 SQL/迁移脚本,6 张表(user/repo/event/issue/reply/mention)需手工建表
- [ ] `app.py` 中 `cancel_best_answer` 函数缺 `return` 语句(漏返回成功响应)
- [ ] fork-graph 页面前端已存在,但后端无对应 fork 接口
- [ ] transfer-initiate / transfer-receive 前端已存在,但后端转让仅靠 transfer 事件,无独立接口

---

## 二、前端 (LifeGit-frontend) — 大部分完成,联调阶段 🟡

**整体状态**:18 个页面全部注册,API 对接层 100% 覆盖 36 个后端接口,主体页面已联调。

### 1. 已对接并验证的功能

- ✅ 登录/注册页 `pages/login/login.ts` — 账密登录 + 注册切换 + token 存储
- ✅ 首页/创仓 `pages/index/index.ts` — 扫码创仓 + 手动创仓 + 图片上传 + NLP 跳转
- ✅ 我的仓库 `pages/my/my.ts` — 列表 + 改昵称 + 退出 + 下拉刷新
- ✅ API 封装层 `utils/api.js` — 40+ 函数全量对接,统一处理 401 跳登录
- ✅ TabBar 配置(创建仓库 / 我的仓库 2 个 tab)

### 2. 已开发但未确认联调状态的页面

- repo-detail / add-event / event-form / event-detail — 事件相关
- nlp-input / nlp-result — NLP 创仓流程
- issue-list / issue-detail / ask-question — 问答
- transfer-initiate / transfer-receive — 转让(⚠️ 后端无对应独立接口)
- fork-graph — fork 图谱(⚠️ 后端无对应接口)
- mentions — @提醒
- change-password — 改密

---

## 三、关键待办汇总

| 优先级 | 事项 | 归属 |
|---|---|---|
| 🔴 高 | 数据库初始化 SQL(6 张表 DDL) | 后端 |
| 🔴 高 | 补 `requirements.txt` | 后端 |
| 🔴 高 | `app.py` 中 `cancel_best_answer` 漏 return | 后端 |
| 🟡 中 | 确认 transfer / fork-graph 页面是否有对应后端逻辑 | 全栈 |
| 🟡 中 | 逐页面联调未验证的 11 个页面 | 前端 |
| 🟢 低 | 微信 openid 登录、真实商品 API、真实 NLP、图片 CDN、统计面板 | 后端 |

---

## 四、结论

- **后端**:主体完工(约 95%)
- **前端**:框架与核心流程已对接(约 70%)
- **当前卡点**:数据库建表 SQL 缺失 + transfer/fork 后端接口缺口
- **建议路径**:先补建表脚本和依赖清单 → 再逐页联调剩余 11 个页面
