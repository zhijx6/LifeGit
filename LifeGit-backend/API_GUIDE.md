# LifeGit API 文档

> 基础地址：`http://localhost:5000`
> 通用响应格式：`{ "code": 0, "message": "ok", "data": {...} }`
> 错误码：`0` 成功 | `202` 需确认 | `400` 参数错误 | `401` 未登录 | `403` 无权限 | `404` 不存在 | `500` 服务器错误

---

## 一、认证模块 `/api/auth`

### 1.1 注册

```
POST /api/auth/register
```

**请求体：**
```json
{
  "phone": "13800138000",
  "email": "test@example.com",
  "password": "123456",
  "nickname": "小明"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 二选一 | 手机号 |
| email | string | 二选一 | 邮箱 |
| password | string | 是 | 密码，至少6位 |
| nickname | string | 否 | 昵称，默认"用户+手机号" |

**响应：**
```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "user_id": 1,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "nickname": "小明"
  }
}
```

### 1.2 登录

```
POST /api/auth/login
```

**请求体：**
```json
{
  "account": "13800138000",
  "password": "123456"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| account | string | 是 | 手机号或邮箱 |
| password | string | 是 | 密码 |

**响应：**
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "user_id": 1,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "nickname": "小明",
    "avatar": null
  }
}
```

### 1.3 获取用户信息

```
GET /api/auth/profile
Authorization: Bearer <token>
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "phone": "13800138000",
    "email": "test@example.com",
    "nickname": "小明",
    "avatar": null,
    "create_time": "2026-04-19 10:00:00",
    "last_login_time": "2026-04-19 12:00:00"
  }
}
```

### 1.4 修改用户信息

```
PUT /api/auth/profile
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "nickname": "新昵称",
  "avatar": "https://example.com/avatar.jpg"
}
```

### 1.5 修改密码

```
POST /api/auth/change_password
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "old_password": "123456",
  "new_password": "654321"
}
```

---

## 二、仓库模块 `/api/repo`

仓库分为两种类型：
- **物品型**（`type: "item"`）— 对应7种物品事件（购入/维护/升级/体验/记忆/故障/转让）
- **地点型**（`type: "place"`）— 对应4种地点事件（到访打卡/评价/信息变更/种草）。**不支持fork**

### 2.1 创建仓库（通用）

```
POST /api/repo/create
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "name": "我的iPhone",
  "type": "item",
  "description": "我的手机",
  "cover_image": "https://..."
}
```

### 2.2 扫码创仓 — 获取商品信息

```
POST /api/repo/scan
```

**请求体：**
```json
{ "barcode": "6901234567890" }
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "product_info": {
      "product_name": "iPhone 15 Pro Max 256GB",
      "brand": "Apple",
      "model": "A2849",
      "specification": "256GB / 钛金属原色",
      "main_image": "https://..."
    },
    "source": "scan"
  }
}
```

### 2.3 扫码创仓 — 确认创建

```
POST /api/repo/confirm_scan
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "product_name": "iPhone 15 Pro Max",
  "brand": "Apple",
  "model": "A2849",
  "specification": "256GB",
  "main_image": "https://...",
  "name": "我的手机",
  "type": "item",
  "description": ""
}
```

### 2.4 NLP语义创仓 — 分析

```
POST /api/repo/nlp_analyze
```

**请求体：**
```json
{ "text": "我的蓝色捷安特山地车" }
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "entities": {
      "location": [],
      "brand": ["捷安特"],
      "product_type": [],
      "color": ["蓝色"],
      "specification": []
    },
    "intent": "create",
    "category": "item",
    "structured_name": "捷安特 蓝色",
    "suggested_fields": {
      "product_name": "未命名物品",
      "brand": "捷安特",
      "model": "",
      "specification": "",
      "main_image": ""
    }
  }
}
```

### 2.5 NLP语义创仓 — 确认创建

```
POST /api/repo/confirm_nlp
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "product_name": "蓝色捷安特山地车",
  "brand": "捷安特",
  "type": "item",
  "description": "我的通勤自行车"
}
```

### 2.6 手动创仓

```
POST /api/repo/create_manual
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "product_name": "我的笔记本电脑",
  "brand": "Apple",
  "model": "MacBook Pro 14",
  "specification": "M3 Max 36GB 1TB",
  "main_image": "",
  "type": "item",
  "description": ""
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| product_name | 是 | 产品名称 |
| brand | 是 | 品牌 |
| model | 否 | 型号 |
| specification | 否 | 规格 |
| main_image | 否 | 主图URL |
| type | 否 | item/place，默认item |

### 2.7 获取我的仓库列表

```
GET /api/repo/my?page=1&page_size=10
Authorization: Bearer <token>
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "repos": [
      {
        "id": 1,
        "name": "我的iPhone",
        "product_name": "iPhone 15 Pro Max",
        "brand": "Apple",
        "model": "A2849",
        "specification": "256GB",
        "main_image": "https://...",
        "type": "item",
        "description": "",
        "cover_image": "",
        "creator_id": 1,
        "create_time": "2026-04-19 10:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 10,
      "total": 25,
      "total_pages": 3
    }
  }
}
```

### 2.8 获取仓库详情（含事件时间线）

```
GET /api/repo/<repo_id>
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "repo": { "id": 1, "name": "...", "type": "item", "..." },
    "timeline": [
      { "id": 1, "event_type": "purchase", "content": {...}, "..." }
    ]
  }
}
```

### 2.9 删除仓库

```
DELETE /api/repo/<repo_id>
Authorization: Bearer <token>
```

删除仓库及其所有关联数据（事件、Issue、回复、@提醒）。仅仓库创建者可操作。

**响应：**
```json
{
  "code": 0,
  "message": "仓库已删除"
}
```

| 错误码 | 说明 |
|------|------|
| 403 | 非仓库创建者，无权删除 |
| 404 | 仓库不存在 |

---

## 三、事件模块 `/api/event`

事件类型按仓库类型区分：

**物品型事件（item）：** purchase / maintenance / upgrade / experience / memory / fault / transfer

**地点型事件（place）：** visit / review / info_change / wishlist

创建事件时会自动校验事件类型是否与仓库类型匹配。

### 3.1 获取事件类型列表

```
GET /api/event/types
```

**可选参数：**

| 参数 | 说明 |
|------|------|
| repo_type | 筛选仓库类型：`item` 或 `place`，不传返回全部 |

**示例请求：**

```
GET /api/event/types?repo_type=place
```

**全部事件类型响应（不传 repo_type）：**
```json
{
  "code": 0,
  "data": [
    { "value": "purchase",    "name": "购入",       "icon": "shopping-cart", "color": "#52c41a", "repo_types": ["item"] },
    { "value": "maintenance", "name": "维护保养",   "icon": "tool",          "color": "#1890ff", "repo_types": ["item"] },
    { "value": "upgrade",     "name": "升级改装",   "icon": "upgrade",       "color": "#722ed1", "repo_types": ["item"] },
    { "value": "experience",  "name": "使用体验",   "icon": "star",          "color": "#faad14", "repo_types": ["item"] },
    { "value": "memory",      "name": "体验节点",   "icon": "heart",         "color": "#eb2f96", "repo_types": ["item"] },
    { "value": "fault",       "name": "故障维修",   "icon": "alert-circle",  "color": "#f5222d", "repo_types": ["item"] },
    { "value": "transfer",    "name": "转让出售",   "icon": "swap",          "color": "#13c2c2", "repo_types": ["item"] },
    { "value": "visit",       "name": "到访打卡",   "icon": "map-pin",       "color": "#52c41a", "repo_types": ["place"] },
    { "value": "review",      "name": "菜品/体验评价","icon": "star",         "color": "#faad14", "repo_types": ["place"] },
    { "value": "info_change", "name": "信息变更",   "icon": "edit",          "color": "#1890ff", "repo_types": ["place"] },
    { "value": "wishlist",    "name": "待探/种草",  "icon": "bookmark",      "color": "#722ed1", "repo_types": ["place"] }
  ]
}
```

**地点型事件类型响应（`?repo_type=place`）：**
```json
{
  "code": 0,
  "data": [
    { "value": "visit",       "name": "到访打卡",     "icon": "map-pin",  "color": "#52c41a" },
    { "value": "review",      "name": "菜品/体验评价", "icon": "star",     "color": "#faad14" },
    { "value": "info_change", "name": "信息变更",     "icon": "edit",     "color": "#1890ff" },
    { "value": "wishlist",    "name": "待探/种草",    "icon": "bookmark", "color": "#722ed1" }
  ]
}
```

### 3.2 获取事件类型的表单结构

```
GET /api/event/schema/<event_type>
```

示例：`GET /api/event/schema/visit`

**响应：**
```json
{
  "code": 0,
  "data": {
    "name": "到访打卡",
    "description": "记录到访地点的打卡信息",
    "icon": "map-pin",
    "color": "#52c41a",
    "fields": [
      { "field": "visit_date", "label": "到访时间", "type": "date", "required": true },
      { "field": "wait_time", "label": "等位时长", "type": "select", "required": false, "options": [...] },
      { "field": "amount_paid", "label": "实付金额", "type": "number", "required": false, "prefix": "¥" },
      { "field": "photos", "label": "随手拍", "type": "images", "required": false, "max_count": 9 }
    ]
  }
}
```

### 3.3 检查事件是否需要确认（负面信息/转让等）

```
POST /api/event/check_confirmation
```

**请求体：**
```json
{
  "event_type": "fault",
  "data": { "fault_date": "2026-04-19", "..." }
}
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "requires": true,
    "title": "负面信息确认",
    "message": "此记录将公开，可能帮助他人避坑，是否确认提交？",
    "type": "negative"
  }
}
```

| type | 说明 |
|------|------|
| negative | 负面信息（故障、低评分体验、差评） |
| transfer | 转让确认 |
| warning | 报废确认 |

### 3.4 创建事件

```
POST /api/event/create
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "repo_id": 1,
  "event_type": "purchase",
  "data": {
    "purchase_date": "2026-04-19",
    "price": 8999.00,
    "channel": "jd",
    "images": ["https://..."],
    "initial_experience": "非常棒"
  },
  "skip_confirmation": false
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| repo_id | 是 | 仓库ID |
| event_type | 是 | 事件类型 |
| data | 是 | 事件结构化数据，字段根据schema而定 |
| skip_confirmation | 否 | 是否跳过确认检查，默认false |

**若需确认时返回（code=202）：**
```json
{
  "code": 202,
  "message": "需要确认",
  "data": {
    "requires": true,
    "title": "负面信息确认",
    "message": "此记录将公开，可能帮助他人避坑，是否确认提交？",
    "type": "negative"
  }
}
```

前端应弹出确认框，用户确认后重新请求并设置 `skip_confirmation: true`。

**事件类型与仓库类型不匹配时返回（code=400）：**
```json
{
  "code": 400,
  "message": "事件类型 \"purchase\" 不适用于类型为 \"place\" 的仓库"
}
```

### 3.5 获取仓库的事件列表

```
GET /api/event/list/<repo_id>?page=1&page_size=10&event_type=purchase
```

| 参数 | 说明 |
|------|------|
| page | 页码，默认1 |
| page_size | 每页数量，默认10 |
| event_type | 筛选事件类型（可选） |

**响应：**
```json
{
  "code": 0,
  "data": {
    "events": [
      {
        "id": 1,
        "repo_id": 1,
        "event_type": "purchase",
        "content": { "purchase_date": "2026-04-19", "price": 8999, "channel": "jd" },
        "images": ["https://..."],
        "user_id": 1,
        "create_time": "2026-04-19 10:00:00"
      }
    ],
    "pagination": { "page": 1, "page_size": 10, "total": 5, "total_pages": 1 }
  }
}
```

### 3.6 获取事件详情

```
GET /api/event/<event_id>
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "event": { "id": 1, "event_type": "purchase", "content": {...}, "..." },
    "schema": { "name": "购入", "fields": [...] }
  }
}
```

### 3.7 删除事件

```
DELETE /api/event/<event_id>
```

---

## 四、物品型事件字段速查

### purchase（购入）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| purchase_date | date | 是 | 购买时间 |
| price | number | 是 | 价格（¥） |
| channel | select | 是 | 官网/天猫/京东/拼多多/线下门店/二手平台/其他 |
| images | images | 否 | 开箱图文，最多9张 |
| initial_experience | textarea | 否 | 初始体验，最多500字 |

### maintenance（维护保养）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| maintenance_date | date | 是 | 维护时间 |
| maintenance_project | text | 是 | 项目，如"更换电池" |
| maintenance_type | select | 是 | 清洁保养/更换配件/系统更新/性能优化/预防性维护/其他 |
| cost | number | 否 | 费用（¥） |
| service_provider | text | 否 | 维修点/服务商 |
| service_address | text | 否 | 服务地址 |
| service_contact | text | 否 | 联系方式 |
| parts_images | images | 否 | 更换零件照片，最多9张 |
| maintenance_images | images | 否 | 维护过程照片，最多6张 |
| documents | files | 否 | 维护凭证（PDF/图片），最多5个 |
| warranty_info | textarea | 否 | 质保信息，最多200字 |
| description | textarea | 否 | 详细说明，最多1000字 |

### upgrade（升级改装）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| upgrade_date | date | 是 | 升级时间 |
| upgrade_type | select | 是 | 硬件升级/软件升级/配件改装/外观改装/性能优化/其他 |
| upgrade_items | text | 是 | 项目，如"内存8G→16G" |
| before_specification | text | 否 | 升级前规格 |
| after_specification | text | 否 | 升级后规格 |
| cost | number | 否 | 费用（¥） |
| service_provider | text | 否 | 服务商 |
| upgrade_images | images | 否 | 升级过程照片，最多6张 |
| parts_images | images | 否 | 新部件照片，最多9张 |
| performance_improvement | textarea | 否 | 性能提升感受，最多1000字 |
| description | textarea | 否 | 详细说明，最多1000字 |

### experience（使用体验）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| experience_date | date | 是 | 记录时间 |
| rating | rating | 是 | 满意度1-5星 |
| usage_scenario | select | 否 | 日常/工作/运动/娱乐/旅行/其他 |
| pros | tags | 否 | 优点标签 |
| cons | tags | 否 | 缺点标签 |
| images | images | 否 | 配图，最多6张 |
| content | textarea | 否 | 详细描述，最多1000字 |

### memory（体验节点）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| memory_date | date | 是 | 体验时间 |
| memory_title | text | 是 | 标题，如"带父母出游的体验" |
| memory_type | select | 是 | 重要时刻/难忘回忆/成就感/温馨时刻/挑战突破/第一次/其他 |
| participants | text | 否 | 参与人员 |
| location | text | 否 | 体验地点 |
| emotional_rating | rating | 否 | 情感评分1-5星 |
| keywords | tags | 否 | 关键词标签 |
| story_background | textarea | 否 | 故事背景，最多500字 |
| emotional_experience | textarea | 否 | 情感体验，最多1500字 |
| learnings | textarea | 否 | 收获与感悟，最多1000字 |
| memory_images | images | 否 | 回忆照片，最多12张 |
| is_public | boolean | 否 | 是否公开分享 |

### fault（故障维修）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| fault_date | date | 是 | 故障时间 |
| fault_description | textarea | 是 | 故障描述，最多500字 |
| fault_frequency | select | 是 | 首次/偶尔/频繁/持续 |
| fault_impact | select | 否 | 轻微/中度/严重/完全无法使用 |
| fault_type | select | 是 | 硬件/软件/性能/外观/电池/连接/其他 |
| is_repaired | boolean | 是 | 是否已维修 |
| fault_project | text | 条件 | 维修项目（已维修时） |
| repair_date | date | 条件 | 维修时间（已维修时） |
| repair_cost | number | 条件 | 维修费用（已维修时） |
| service_provider | text | 条件 | 维修点/服务商 |
| service_address | text | 条件 | 维修地址 |
| service_contact | text | 条件 | 联系方式 |
| parts_images | images | 条件 | 更换零件照片，最多9张 |
| fault_images | images | 否 | 故障照片，最多6张 |
| repair_images | images | 条件 | 维修过程照片，最多6张 |
| documents | files | 条件 | 维修凭证（PDF/图片），最多5个 |
| warranty_info | textarea | 条件 | 维修质保 |
| repair_description | textarea | 条件 | 维修说明 |
| official_response | textarea | 否 | 官方回应，最多1000字 |
| contact_channel | select | 否 | 联系渠道 |
| contact_date | date | 否 | 联系时间 |
| satisfaction_rating | rating | 否 | 处理满意度1-5星 |

### transfer（转让出售）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| transfer_date | date | 是 | 转让时间 |
| transfer_type | select | 是 | 出售/赠送/置换/丢失/报废/捐赠 |
| transfer_price | number | 条件 | 转让价格（出售时） |
| item_condition | select | 否 | 全新/九成新/八成新/七成新/可用/需维修/故障 |
| includes_accessories | text | 否 | 配件情况 |
| transfer_reason | textarea | 否 | 转让原因，最多500字 |
| recipient | text | 条件 | 接收人（赠送/置换时） |
| transfer_channel | select | 否 | 闲鱼/转转/朋友圈/线下/亲友/其他 |
| message_to_next_owner | textarea | 否 | 对下一个主人的寄语，最多1000字 |
| usage_tips | textarea | 否 | 使用建议，最多800字 |
| transfer_images | images | 否 | 物品照片，最多9张 |
| transfer_documents | files | 否 | 转让凭证（PDF/图片），最多5个 |
| description | textarea | 否 | 补充说明 |

---

## 五、地点型事件字段速查

### visit（到访打卡）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| visit_date | date | 是 | 到访时间，默认当天 |
| wait_time | select | 否 | `none` 不用等 / `within_15` 15分钟内 / `over_30` 30分钟以上 |
| amount_paid | number | 否 | 实付金额（¥） |
| photos | images | 否 | 随手拍，最多9张 |

**请求示例：**
```json
{
  "repo_id": 2,
  "event_type": "visit",
  "data": {
    "visit_date": "2026-04-22",
    "wait_time": "none",
    "amount_paid": 88.5,
    "photos": ["url1.jpg", "url2.jpg"]
  }
}
```

### review（菜品/体验评价）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| overall_rating | select | 是 | `recommend` 推荐 / `average` 一般 / `not_recommend` 不推荐 |
| taste_rating | rating | 是 | 口味评分 1-5 星 |
| environment_rating | rating | 是 | 环境评分 1-5 星 |
| service_rating | rating | 是 | 服务评分 1-5 星 |
| per_capita_cost | number | 否 | 人均消费（¥） |
| recommended_dishes | tags | 否 | 推荐菜品标签，如 ["毛血旺", "杨枝甘露"] |
| disliked_dishes | tags | 否 | 踩雷菜品标签 |
| detail_review | textarea | 否 | 详细评价，最多1500字 |
| images | images | 否 | 配图，最多9张 |

> `overall_rating` 为 `not_recommend` 时会触发确认提示。

**请求示例：**
```json
{
  "repo_id": 2,
  "event_type": "review",
  "data": {
    "overall_rating": "recommend",
    "taste_rating": 4,
    "environment_rating": 5,
    "service_rating": 4,
    "per_capita_cost": 120,
    "recommended_dishes": ["毛血旺", "杨枝甘露"],
    "disliked_dishes": ["酸菜鱼"],
    "detail_review": "环境很好，毛血旺必点...",
    "images": ["url1.jpg"]
  }
}
```

### info_change（信息变更）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| change_type | select | 是 | `business_status` 营业状态变更 / `price_change` 价格调整 / `menu_update` 菜单更新 / `renovation` 装修 / `relocation` 搬址 / `closure` 歇业 |
| change_description | textarea | 是 | 变更说明，最多1000字 |
| evidence_images | images | 否 | 证据图片，最多9张 |

**请求示例：**
```json
{
  "repo_id": 2,
  "event_type": "info_change",
  "data": {
    "change_type": "menu_update",
    "change_description": "换了新菜单，增加了川菜系列",
    "evidence_images": ["new_menu.jpg"]
  }
}
```

### wishlist（待探/种草）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| reason | text | 是 | 想去的理由 |
| source | select | 是 | `friend` 朋友推荐 / `xiaohongshu` 小红书 / `passing_by` 路过看到 / `other` 其他 |
| planned_date | date | 否 | 计划到访日期 |

**请求示例：**
```json
{
  "repo_id": 2,
  "event_type": "wishlist",
  "data": {
    "reason": "听说他家的提拉米苏很绝",
    "source": "xiaohongshu",
    "planned_date": "2026-05-01"
  }
}
```

---

## 六、Issue 问答模块 `/api/issue`

### 6.1 创建Issue

```
POST /api/issue/create
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "repo_id": 1,
  "title": "这个手机的电池续航怎么样？",
  "content": "想了解一下正常使用能撑多久"
}
```

### 6.2 获取仓库的Issue列表

```
GET /api/issue/list/<repo_id>?page=1&page_size=10&status=open
```

| 参数 | 说明 |
|------|------|
| page | 页码，默认1 |
| page_size | 每页数量，默认10 |
| status | 筛选状态：open/answered/closed（可选） |

**响应：**
```json
{
  "code": 0,
  "data": {
    "issues": [
      {
        "id": 1,
        "repo_id": 1,
        "title": "这个手机的电池续航怎么样？",
        "content": "想了解一下...",
        "status": "open",
        "creator_id": 1,
        "reply_count": 3,
        "has_best_answer": 1,
        "create_time": "2026-04-19 10:00:00",
        "update_time": "2026-04-19 11:00:00"
      }
    ],
    "pagination": { "page": 1, "page_size": 10, "total": 8, "total_pages": 1 }
  }
}
```

### 6.3 获取Issue详情（含回复）

```
GET /api/issue/<issue_id>
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "issue": { "id": 1, "title": "...", "status": "answered", "..." },
    "replies": [
      {
        "id": 1,
        "issue_id": 1,
        "content": "正常使用一天没问题",
        "author_id": 2,
        "is_best_answer": 1,
        "create_time": "2026-04-19 11:00:00"
      },
      {
        "id": 2,
        "content": "玩游戏的话大概5小时",
        "author_id": 3,
        "is_best_answer": 0,
        "create_time": "2026-04-19 11:30:00"
      }
    ],
    "reply_count": 2
  }
}
```

> 回复列表按 `is_best_answer DESC, create_time ASC` 排序，最佳答案始终置顶。

### 6.4 更新Issue状态

```
PUT /api/issue/<issue_id>/status
```

**请求体：**
```json
{ "status": "closed" }
```

状态流转：`open` → `answered` → `closed`

### 6.5 删除Issue

```
DELETE /api/issue/<issue_id>
```

---

## 七、回复模块 `/api/reply`

### 7.1 创建回复（支持@提醒）

```
POST /api/reply/create
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "issue_id": 1,
  "content": "我觉得续航不错 @用户2 你觉得呢？",
  "mentioned_users": [2]
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| issue_id | 是 | Issue ID |
| content | 是 | 回复内容 |
| mentioned_users | 否 | 被@的用户ID数组 |

> 首次回复时，Issue状态自动从 `open` 变为 `answered`。

### 7.2 设置最佳答案

```
PUT /api/reply/<reply_id>/best
```

同一Issue只能有一个最佳答案，设置新答案时自动取消旧的。

### 7.3 取消最佳答案

```
PUT /api/reply/<reply_id>/cancel_best
```

---

## 八、@提醒模块 `/api/mention`

### 8.1 获取我的@提醒列表

```
GET /api/mention/my?page=1&page_size=20&is_read=0
Authorization: Bearer <token>
```

| 参数 | 说明 |
|------|------|
| is_read | 0=未读，1=已读，不传=全部 |

**响应：**
```json
{
  "code": 0,
  "data": {
    "mentions": [
      {
        "id": 1,
        "is_read": 0,
        "mention_time": "2026-04-19 11:00:00",
        "reply_id": 3,
        "reply_content": "你觉得续航怎么样？",
        "issue_id": 1,
        "issue_title": "电池续航问题"
      }
    ],
    "unread_count": 5,
    "pagination": { "page": 1, "page_size": 20, "total": 12, "total_pages": 1 }
  }
}
```

### 8.2 标记单条已读

```
PUT /api/mention/read/<mention_id>
Authorization: Bearer <token>
```

### 8.3 全部标记已读

```
PUT /api/mention/read_all
Authorization: Bearer <token>
```

### 8.4 获取仓库参与者列表（用于@提醒选人）

```
GET /api/issue/<repo_id>/participants
```

**响应：**
```json
{
  "code": 0,
  "data": [
    { "id": 1 },
    { "id": 2 },
    { "id": 3 }
  ]
}
```

---

## 九、文件上传模块 `/api/upload`

### 9.1 上传单张图片

```
POST /api/upload/image
Content-Type: multipart/form-data

file: <图片文件>
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "name": "photo.jpg",
    "filename": "20260419120000_abc123.jpg",
    "url": "/uploads/images/20260419120000_abc123.jpg",
    "size": 102400,
    "type": "image"
  }
}
```

支持格式：png、jpg、jpeg、gif、webp，最大10MB。

### 9.2 批量上传图片

```
POST /api/upload/images
Content-Type: multipart/form-data

files: <多张图片>
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "success_files": [...],
    "total_count": 5,
    "success_count": 4,
    "failed_count": 1
  }
}
```

### 9.3 上传文档（PDF等）

```
POST /api/upload/document
Content-Type: multipart/form-data

file: <文件>
allowed_extensions: pdf,jpg,png  （可选，逗号分隔）
```

支持格式：pdf、doc、docx、png、jpg、jpeg、gif，最大20MB。

### 9.4 批量上传文档

```
POST /api/upload/documents
Content-Type: multipart/form-data

files: <多个文件>
allowed_extensions: pdf,jpg  （可选）
```

---

## 十、前端接入指南

### 请求头

所有需要登录的接口，在请求头中携带Token：

```javascript
headers: {
  'Authorization': 'Bearer ' + token,
  'Content-Type': 'application/json'
}
```

### 通用错误处理

```javascript
if (res.code === 401) {
  // Token过期或未登录，跳转登录页
  router.push('/login')
}
```

### 创建事件的完整流程

```
1. GET  /api/event/types?repo_type=place  → 获取该仓库类型可用的事件类型
2. GET  /api/event/schema/visit           → 根据schema动态渲染表单
3. POST /api/event/check_confirmation     → 检查是否需要确认
   ├─ requires: false → 直接提交
   └─ requires: true  → 弹窗确认 → 用户确认后
4. POST /api/event/create                 → skip_confirmation: true
```

### 文件上传后使用

上传文件返回 `url` 字段，在创建事件时将 url 放入对应的 images 或 documents 数组：

```javascript
// 1. 上传图片
const res = await fetch('/api/upload/image', { method: 'POST', body: formData })
const { data } = await res.json()

// 2. 将url存入事件数据
eventData.photos = [data.url]

// 3. 创建事件
await fetch('/api/event/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    repo_id: 2,
    event_type: 'visit',
    data: eventData
  })
})
```
