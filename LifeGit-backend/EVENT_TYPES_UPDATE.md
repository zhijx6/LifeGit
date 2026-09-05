# 事件类型更新说明

## 新增事件类型

### 体验节点 (memory)
为地点/物品赋予情感和故事价值，记录特定时刻的深度体验。

**图标：** heart
**颜色：** #eb2f96

**主要字段：**
- 体验时间 - 日期选择器（必填）
- 体验标题 - 文本输入（必填），如"带父母出游的体验"、"完成第一个项目的感受"
- 体验类型 - 下拉选择（重要时刻、难忘回忆、成就感、温馨时刻、挑战突破、第一次、其他）
- 参与人员 - 文本输入，如"和家人、和朋友、和同事"
- 体验地点 - 文本输入
- 情感评分 - 评分组件（1-5星），1星平淡无奇，5星终生难忘
- 关键词标签 - 标签输入，如"温馨、感动、突破、成就"
- 故事背景 - 多行文本（最多500字）
- 情感体验 - 多行文本（最多1500字），这是最核心的部分
- 收获与感悟 - 多行文本（最多1000字）
- 回忆照片 - 图片上传（最多12张）
- 是否公开分享 - 布尔值

## 优化的事件类型

### 升级改装 (upgrade)
增强升级记录，更好地展示物品的改进历程。

**新增字段：**
- 升级前规格 - 如"8GB内存、256GB硬盘"
- 升级后规格 - 如"16GB内存、512GB硬盘"
- 服务商 - 记录升级服务商
- 新部件照片 - 图片上传（最多9张）

**优化字段：**
- 升级项目 - 更详细的描述
- 性能提升感受 - 多行文本（最多1000字），描述升级后的性能提升和使用体验变化

### 故障维修 (fault)
增强故障记录，更全面地追踪问题和处理情况。

**新增字段：**
- 发生频率 - 单选（首次出现、偶尔发生、频繁出现、持续存在）
- 影响程度 - 单选（轻微影响、中度影响、严重影响、完全无法使用）
- 官方回应 - 多行文本（最多1000字），记录客服或售后反馈
- 联系渠道 - 单选（官方客服、线下门店、在线客服、社交媒体、邮件、其他）
- 联系时间 - 日期选择器
- 处理满意度 - 评分组件（1-5星）

## 使用示例

### 创建体验节点事件

```json
POST /api/event/create
{
  "repo_id": 123,
  "event_type": "memory",
  "data": {
    "memory_date": "2026-04-19",
    "memory_title": "带父母第一次出游",
    "memory_type": "heartwarming",
    "participants": "和父母、妹妹",
    "location": "云南大理",
    "emotional_rating": 5,
    "keywords": ["温馨", "感动", "难忘"],
    "story_background": "这是工作以来第一次有时间带父母出去旅游...",
    "emotional_experience": "看到父母在洱海边开心的笑容，我感到非常幸福...",
    "learnings": "家人是最重要的，要多花时间陪伴...",
    "memory_images": ["https://example.com/photo1.jpg"],
    "is_public": false
  }
}
```

### 记录升级事件（增强版）

```json
POST /api/event/create
{
  "repo_id": 123,
  "event_type": "upgrade",
  "data": {
    "upgrade_date": "2026-04-19",
    "upgrade_type": "hardware",
    "upgrade_items": "内存从16GB升级到32GB",
    "before_specification": "16GB DDR4 2666MHz",
    "after_specification": "32GB DDR4 3200MHz",
    "cost": 699.00,
    "service_provider": "京东自营",
    "performance_improvement": "运行速度明显提升，多任务处理更流畅，大型软件启动时间缩短约30%",
    "upgrade_images": ["https://example.com/upgrade1.jpg"],
    "parts_images": ["https://example.com/new_ram.jpg"]
  }
}
```

### 记录故障事件（增强版）

```json
POST /api/event/create
{
  "repo_id": 123,
  "event_type": "fault",
  "data": {
    "fault_date": "2026-04-19",
    "fault_description": "使用过程中突然黑屏，无法开机，电源指示灯闪烁",
    "fault_frequency": "first",
    "fault_impact": "critical",
    "fault_type": "hardware",
    "is_repaired": true,
    "repair_date": "2026-04-20",
    "fault_project": "更换主板",
    "repair_cost": 1200.00,
    "service_provider": "苹果官方售后",
    "official_response": "客服确认是主板故障，提供免费更换服务，质保90天",
    "contact_channel": "official_service",
    "contact_date": "2026-04-19",
    "satisfaction_rating": 5,
    "repair_description": "官方售后检测后确认主板故障，当天完成更换"
  }
}
```

## 获取更新后的事件类型列表

```bash
GET /api/event/types
```

## 获取特定事件类型的表单结构

```bash
# 获取体验节点表单结构
GET /api/event/schema/memory

# 获取升级改装表单结构
GET /api/event/schema/upgrade

# 获取故障维修表单结构
GET /api/event/schema/fault
```

## 数据价值

这些增强的事件类型将为物品和地点记录带来更大的价值：

1. **升级历程** - 清晰展示物品的改进过程和性能提升
2. **情感价值** - 通过体验节点为物品赋予故事和情感意义
3. **健康档案** - 详细的故障和处理记录，建立完整的维护历史
4. **二手价值** - 完整的记录将极大提升物品的二手交易价值

通过这些结构化的事件记录，每个物品和地点都将拥有丰富的生命周期档案！
