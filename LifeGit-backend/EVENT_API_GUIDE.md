# Commit 事件 API 使用指南

## 概述

Commit功能是产品的核心，用于记录物品生命周期中的重要事件。每个事件都是结构化的，包含特定类型的字段和数据验证。

---

## 事件类型

系统支持6种事件类型：

| 事件类型 | 值 | 说明 | 图标 | 颜色 |
|---------|-----|------|------|------|
| 购入 | `purchase` | 记录物品的购买信息 | shopping-cart | #52c41a |
| 维护保养 | `maintenance` | 记录物品的维护、保养情况 | tool | #1890ff |
| 升级改装 | `upgrade` | 记录物品的升级、改装情况 | upgrade | #722ed1 |
| 使用体验 | `experience` | 记录使用过程中的体验和感受 | star | #faad14 |
| 故障维修 | `fault` | 记录故障和维修情况 | alert-circle | #f5222d |
| 转让出售 | `transfer` | 记录物品的转让或出售情况 | swap | #13c2c2 |

---

## API端点

### 1. 获取所有事件类型

**端点：** `GET /api/event/types`

**响应示例：**
```json
{
  "code": 0,
  "data": [
    {
      "value": "purchase",
      "name": "购入",
      "description": "记录物品的购买信息",
      "icon": "shopping-cart",
      "color": "#52c41a"
    }
  ]
}
```

### 2. 获取事件类型的表单结构

**端点：** `GET /api/event/schema/<event_type>`

**示例：** `GET /api/event/schema/purchase`

**响应示例：**
```json
{
  "code": 0,
  "data": {
    "name": "购入",
    "description": "记录物品的购买信息",
    "icon": "shopping-cart",
    "color": "#52c41a",
    "fields": [
      {
        "field": "purchase_date",
        "label": "购买时间",
        "type": "date",
        "required": true,
        "placeholder": "选择购买日期"
      },
      {
        "field": "price",
        "label": "购买价格",
        "type": "number",
        "required": true,
        "placeholder": "请输入价格",
        "min": 0,
        "precision": 2,
        "prefix": "¥"
      }
    ]
  }
}
```

### 3. 创建事件

**端点：** `POST /api/event/create`

**请求参数：**
```json
{
  "repo_id": 123,
  "event_type": "purchase",
  "data": {
    "purchase_date": "2026-04-19",
    "price": 8999.00,
    "channel": "jd",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "initial_experience": "开箱第一感觉非常棒，做工精良"
  }
}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "事件创建成功",
  "data": {
    "event_id": 456
  }
}
```

### 4. 获取仓库的事件列表

**端点：** `GET /api/event/list/<repo_id>`

**查询参数：**
- `page` - 页码（默认：1）
- `page_size` - 每页数量（默认：10）
- `event_type` - 筛选事件类型（可选）

**示例：** `GET /api/event/list/123?page=1&event_type=purchase`

**响应示例：**
```json
{
  "code": 0,
  "data": {
    "events": [
      {
        "id": 456,
        "repo_id": 123,
        "event_type": "purchase",
        "content": {
          "purchase_date": "2026-04-19",
          "price": 8999.00,
          "channel": "jd"
        },
        "images": [
          "https://example.com/image1.jpg"
        ],
        "user_id": 1,
        "create_time": "2026-04-19 10:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 10,
      "total": 1,
      "total_pages": 1
    }
  }
}
```

### 5. 获取事件详情

**端点：** `GET /api/event/<event_id>`

**示例：** `GET /api/event/456`

**响应示例：**
```json
{
  "code": 0,
  "data": {
    "event": {
      "id": 456,
      "repo_id": 123,
      "event_type": "purchase",
      "content": {
        "purchase_date": "2026-04-19",
        "price": 8999.00,
        "channel": "jd"
      },
      "images": ["https://example.com/image1.jpg"],
      "user_id": 1,
      "create_time": "2026-04-19 10:00:00"
    },
    "schema": {
      "name": "购入",
      "fields": [...]
    }
  }
}
```

### 6. 删除事件

**端点：** `DELETE /api/event/<event_id>`

**示例：** `DELETE /api/event/456`

**响应示例：**
```json
{
  "code": 0,
  "message": "事件删除成功"
}
```

---

## 各事件类型的字段说明

### 购入 (purchase)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| purchase_date | date | 是 | 购买时间 |
| price | number | 是 | 购买价格（元） |
| channel | select | 是 | 购买渠道 |
| images | images | 否 | 开箱图文（最多9张） |
| initial_experience | textarea | 否 | 初始体验（最多500字） |

**购买渠道选项：**
- `official` - 官网
- `tmall` - 天猫
- `jd` - 京东
- `pinduoduo` - 拼多多
- `offline` - 线下门店
- `secondhand` - 二手平台
- `other` - 其他

### 维护保养 (maintenance)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| maintenance_date | date | 是 | 保养时间 |
| maintenance_type | select | 是 | 保养类型 |
| cost | number | 否 | 花费金额（元） |
| images | images | 否 | 保养记录（最多6张） |
| description | textarea | 否 | 保养描述（最多500字） |

### 升级改装 (upgrade)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| upgrade_date | date | 是 | 升级时间 |
| upgrade_type | select | 是 | 升级类型 |
| upgrade_items | text | 是 | 升级项目描述 |
| cost | number | 否 | 升级花费（元） |
| images | images | 否 | 升级记录（最多6张） |
| description | textarea | 否 | 升级说明（最多500字） |

### 使用体验 (experience)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| experience_date | date | 是 | 记录时间 |
| rating | rating | 是 | 满意度评分（1-5星） |
| usage_scenario | select | 否 | 使用场景 |
| pros | tags | 否 | 优点标签 |
| cons | tags | 否 | 缺点标签 |
| images | images | 否 | 配图（最多6张） |
| content | textarea | 否 | 详细描述（最多1000字） |

### 故障维修 (fault)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| fault_date | date | 是 | 故障时间 |
| fault_description | textarea | 是 | 故障描述（最多500字） |
| fault_type | select | 是 | 故障类型 |
| is_repaired | boolean | 是 | 是否已维修 |
| repair_cost | number | 条件必填 | 维修费用（已维修时必填） |
| repair_description | textarea | 条件必填 | 维修说明（已维修时必填） |
| images | images | 否 | 故障图片（最多6张） |

### 转让出售 (transfer)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| transfer_date | date | 是 | 转让时间 |
| transfer_type | select | 是 | 转让方式 |
| transfer_price | number | 条件必填 | 转让价格（出售时必填） |
| recipient | text | 否 | 接收人 |
| images | images | 否 | 转让凭证（最多6张） |
| description | textarea | 否 | 转让说明（最多500字） |

---

## 表单字段类型说明

### date
日期选择器，返回格式：`YYYY-MM-DD`

### number
数字输入框，支持：
- `min` - 最小值
- `max` - 最大值
- `precision` - 小数位数
- `prefix` - 前缀（如货币符号）

### select
下拉选择框，选项格式：
```json
{
  "label": "显示文本",
  "value": "实际值"
}
```

### textarea
多行文本输入，支持：
- `max_length` - 最大字符数
- `placeholder` - 占位符文本

### images
图片上传组件，支持：
- `max_count` - 最大图片数量

### rating
评分组件，支持：
- `min` - 最小值
- `max` - 最大值

### tags
标签输入组件，支持回车添加标签

### boolean
布尔值，true/false

### text
单行文本输入

---

## 数据验证

系统会自动验证提交的数据：

1. **必填字段检查** - 所有标记为`required: true`的字段必须提供值
2. **数据类型验证** - 检查字段值是否符合类型要求
3. **范围验证** - 检查数字字段是否在允许范围内
4. **长度验证** - 检查文本和图片数量是否超限
5. **条件验证** - 根据其他字段的值判断某些字段是否必填

验证失败时会返回详细的错误信息：
```json
{
  "code": 400,
  "message": "数据验证失败",
  "errors": [
    "购买价格为必填项",
    "开箱图文最多支持9张图片"
  ]
}
```
