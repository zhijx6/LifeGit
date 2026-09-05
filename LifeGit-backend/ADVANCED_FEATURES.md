# 高级功能说明

## 1. 负面信息确认机制

### 功能概述
当用户提交负面事件（如故障维修、低评分体验）时，系统会弹出确认对话框，提示用户此记录将公开，可能帮助他人避坑，体现对数据严谨性的尊重。

### 触发条件
以下情况会触发确认机制：

1. **故障维修事件** - 任何故障记录
2. **低评分体验** - 评分≤2星的使用体验记录

### 确认弹窗内容
```
标题：负面信息确认
内容：此记录将公开，可能帮助他人避坑，是否确认提交？
```

### API使用方式

#### 步骤1：检查是否需要确认
```bash
POST /api/event/check_confirmation
Content-Type: application/json

{
  "event_type": "fault",
  "data": {
    "fault_date": "2026-04-19",
    "fault_description": "设备突然黑屏无法开机",
    "fault_frequency": "first",
    "fault_type": "hardware"
  }
}
```

**响应示例（需要确认）：**
```json
{
  "code": 0,
  "data": {
    "requires": true,
    "title": "负面信息确认",
    "message": "此故障记录将公开，可能帮助他人避坑，是否确认提交？",
    "type": "negative"
  }
}
```

**响应示例（不需要确认）：**
```json
{
  "code": 0,
  "data": {
    "requires": false,
    "title": "",
    "message": "",
    "type": ""
  }
}
```

#### 步骤2：用户确认后创建事件
```bash
POST /api/event/create
Content-Type: application/json

{
  "repo_id": 123,
  "event_type": "fault",
  "data": {
    "fault_date": "2026-04-19",
    "fault_description": "设备突然黑屏无法开机",
    "fault_frequency": "first",
    "fault_type": "hardware"
  },
  "skip_confirmation": true  // 用户已确认，跳过确认检查
}
```

### 前端实现建议

```javascript
// 创建事件的流程
async function createEvent(repoId, eventType, eventData) {
  // 1. 先检查是否需要确认
  const checkResponse = await fetch('/api/event/check_confirmation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_type: eventType,
      data: eventData
    })
  });

  const checkResult = await checkResponse.json();
  const confirmation = checkResult.data;

  // 2. 如果需要确认，显示确认弹窗
  if (confirmation.requires) {
    const userConfirmed = await showConfirmDialog({
      title: confirmation.title,
      message: confirmation.message,
      type: confirmation.type
    });

    if (!userConfirmed) {
      return; // 用户取消
    }
  }

  // 3. 确认后创建事件
  const createResponse = await fetch('/api/event/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repo_id: repoId,
      event_type: eventType,
      data: eventData,
      skip_confirmation: true
    })
  });

  return await createResponse.json();
}
```

---

## 2. 转让/出售事件优化

### 功能概述
增强转让/出售事件类型，完成物品生命周期闭环，添加对下一个主人的寄语功能。

### 新增字段

| 字段 | 类型 | 说明 |
|------|------|------|
| 物品状态 | 下拉选择 | 全新未使用/九成新/八成新/七成新/可用/需维修/故障 |
| 配件情况 | 文本 | 列出包含的所有配件 |
| 转让原因 | 多行文本 | 如实记录转让原因 |
| 转让渠道 | 下拉选择 | 闲鱼/转转/朋友圈/线下交易/亲友赠送/其他 |
| **对下一个主人的寄语** | 多行文本 | 分享使用心得、注意事项或美好祝愿 |
| 使用建议 | 多行文本 | 分享使用技巧、注意事项等 |
| 物品照片 | 图片上传（最多9张） | 转让时物品的实物照片 |
| 转让凭证 | 文件上传 | 支持上传交易凭证、发票等文件 |

### 核心字段：对下一个主人的寄语

这是转让/出售事件中最有温度的字段，让物品的传承更有意义：

```
标签：对下一个主人的寄语
类型：多行文本
最多：1000字
示例：
"这台笔记本陪伴我度过了大学四年的时光，帮我完成了无数个作业和项目。
它性能稳定，从未出过故障。记得每隔三个月清理一下风扇，可以保持良好的散热。
希望它能继续陪伴你，见证更多美好的时刻！"
```

### 使用示例

```json
POST /api/event/create
{
  "repo_id": 123,
  "event_type": "transfer",
  "data": {
    "transfer_date": "2026-04-19",
    "transfer_type": "sell",
    "transfer_price": 3500.00,
    "item_condition": "great",
    "includes_accessories": "含原装充电器、鼠标、电脑包、Windows安装盘",
    "transfer_reason": "毕业工作后公司配发了新电脑，这台旧电脑闲置了",
    "transfer_channel": "xianyu",
    "message_to_next_owner": "这台笔记本陪伴我度过了大学四年的时光，帮我完成了无数个作业和项目。它性能稳定，从未出过故障。记得每隔三个月清理一下风扇，可以保持良好的散热。希望它能继续陪伴你，见证更多美好的时刻！",
    "usage_tips": "1. 定期清理风扇灰尘\n2. 电池建议保持在20%-80%之间\n3. 原装系统恢复盘请妥善保管",
    "transfer_images": ["https://example.com/laptop1.jpg"],
    "description": "即将毕业，忍痛割爱"
  }
}
```

### 生命周期闭环

转让/出售事件标志着物品当前用户所有权的结束，完成了物品在这一用户手中的完整生命周期记录：

1. **购入** → 记录物品的来源和初始状态
2. **使用** → 记录使用体验和维护保养
3. **升级** → 记录物品的改进和提升
4. **故障** → 记录问题和解决方案
5. **体验节点** → 记录情感价值和美好回忆
6. **转让** → 完成生命周期闭环，传递给下一个主人

每个物品都拥有完整的故事档案，这些记录：
- 提升物品的二手价值
- 帮助新主人了解物品历史
- 传承使用经验和情感价值
- 构建物品的完整生命周期

---

## 确认类型说明

系统支持多种确认类型，每种类型有不同的提示内容和样式：

| 确认类型 | 标题 | 适用场景 |
|---------|------|---------|
| negative | 负面信息确认 | 故障维修、低评分体验 |
| transfer | 转让确认 | 出售物品 |
| warning | 报废确认 | 报废物品 |
| public | 公开确认 | 标记为公开分享的体验节点 |

---

## 注意事项

1. **负面信息确认**不可跳过，必须用户明确确认才能提交
2. **转让/出售事件**完成后，物品将被标记为已转让状态
3. **对下一个主人的寄语**是可选的，但强烈建议填写，这是物品传承中最有温度的部分
4. 所有确认信息都会被记录，用于数据质量监控和改进
