from typing import Dict, List, Any, Optional
from datetime import datetime
from enum import Enum


class EventType(str, Enum):
    """事件类型枚举"""
    # 物品型事件
    PURCHASE = "purchase"       # 购入
    MAINTENANCE = "maintenance"  # 维护保养
    UPGRADE = "upgrade"          # 升级改装
    EXPERIENCE = "experience"    # 使用体验
    MEMORY = "memory"           # 体验节点/记忆时刻
    FAULT = "fault"             # 故障维修
    TRANSFER = "transfer"        # 转让出售
    # 地点型事件
    VISIT = "visit"              # 到访打卡
    REVIEW = "review"            # 菜品/体验评价
    INFO_CHANGE = "info_change"  # 信息变更
    WISHLIST = "wishlist"        # 待探/种草


class EventSchemaService:
    """事件结构化表单服务"""

    # 事件类型定义
    EVENT_TYPES = {
        EventType.PURCHASE: {
            "name": "购入",
            "description": "记录物品的购买信息",
            "icon": "shopping-cart",
            "color": "#52c41a",
            "repo_types": ["item"],
            "fields": [
                {
                    "field": "purchase_date",
                    "label": "购买时间",
                    "type": "date",
                    "required": True,
                    "default": lambda: datetime.now().strftime("%Y-%m-%d"),
                    "placeholder": "选择购买日期"
                },
                {
                    "field": "price",
                    "label": "购买价格",
                    "type": "number",
                    "required": True,
                    "placeholder": "请输入价格",
                    "min": 0,
                    "precision": 2,
                    "prefix": "¥"
                },
                {
                    "field": "channel",
                    "label": "购买渠道",
                    "type": "select",
                    "required": True,
                    "options": [
                        {"label": "官网", "value": "official"},
                        {"label": "天猫", "value": "tmall"},
                        {"label": "京东", "value": "jd"},
                        {"label": "拼多多", "value": "pinduoduo"},
                        {"label": "线下门店", "value": "offline"},
                        {"label": "二手平台", "value": "secondhand"},
                        {"label": "其他", "value": "other"}
                    ]
                },
                {
                    "field": "images",
                    "label": "开箱图文",
                    "type": "images",
                    "required": False,
                    "max_count": 9,
                    "description": "支持最多9张图片"
                },
                {
                    "field": "initial_experience",
                    "label": "初始体验",
                    "type": "textarea",
                    "required": False,
                    "placeholder": "记录第一印象、开箱感受等...",
                    "max_length": 500
                }
            ]
        },
        EventType.MAINTENANCE: {
            "name": "维护保养",
            "description": "记录物品的维护、保养情况，构建健康档案",
            "icon": "tool",
            "color": "#1890ff",
            "repo_types": ["item"],
            "fields": [
                {
                    "field": "maintenance_date",
                    "label": "维护时间",
                    "type": "date",
                    "required": True,
                    "default": lambda: datetime.now().strftime("%Y-%m-%d"),
                    "placeholder": "选择维护日期"
                },
                {
                    "field": "maintenance_project",
                    "label": "维护项目",
                    "type": "text",
                    "required": True,
                    "placeholder": "如：更换电池、屏幕贴膜、系统清理等",
                    "description": "简要描述维护内容"
                },
                {
                    "field": "maintenance_type",
                    "label": "维护类型",
                    "type": "select",
                    "required": True,
                    "options": [
                        {"label": "清洁保养", "value": "cleaning"},
                        {"label": "更换配件", "value": "replacement"},
                        {"label": "系统更新", "value": "update"},
                        {"label": "性能优化", "value": "optimization"},
                        {"label": "预防性维护", "value": "preventive"},
                        {"label": "其他", "value": "other"}
                    ]
                },
                {
                    "field": "cost",
                    "label": "维护费用",
                    "type": "number",
                    "required": False,
                    "placeholder": "请输入维护费用",
                    "min": 0,
                    "precision": 2,
                    "prefix": "¥",
                    "description": "记录维护成本"
                },
                {
                    "field": "service_provider",
                    "label": "维修点/服务商",
                    "type": "text",
                    "required": False,
                    "placeholder": "如：苹果官方售后、小米之家、第三方维修店",
                    "description": "记录服务商信息，便于后续追溯"
                },
                {
                    "field": "service_address",
                    "label": "服务地址",
                    "type": "text",
                    "required": False,
                    "placeholder": "如：北京市朝阳区xxx"
                },
                {
                    "field": "service_contact",
                    "label": "联系方式",
                    "type": "text",
                    "required": False,
                    "placeholder": "如：电话或联系人"
                },
                {
                    "field": "parts_images",
                    "label": "更换零件照片",
                    "type": "images",
                    "required": False,
                    "max_count": 9,
                    "description": "上传更换零件的照片，作为关键证据"
                },
                {
                    "field": "maintenance_images",
                    "label": "维护过程照片",
                    "type": "images",
                    "required": False,
                    "max_count": 6,
                    "description": "维护过程中的照片记录"
                },
                {
                    "field": "documents",
                    "label": "维护凭证",
                    "type": "files",
                    "required": False,
                    "max_count": 5,
                    "accept": ["pdf", "jpg", "jpeg", "png"],
                    "description": "支持上传维修单、发票等PDF或图片文件"
                },
                {
                    "field": "warranty_info",
                    "label": "质保信息",
                    "type": "textarea",
                    "required": False,
                    "placeholder": "如：更换电池质保6个月",
                    "max_length": 200,
                    "description": "记录本次维护的质保期限和范围"
                },
                {
                    "field": "description",
                    "label": "详细说明",
                    "type": "textarea",
                    "required": False,
                    "placeholder": "详细描述维护内容、效果和建议...",
                    "max_length": 1000
                }
            ]
        },
        EventType.UPGRADE: {
            "name": "升级改装",
            "description": "记录物品的升级、改装情况，展示物品的改进历程",
            "icon": "upgrade",
            "color": "#722ed1",
            "repo_types": ["item"],
            "fields": [
                {
                    "field": "upgrade_date",
                    "label": "升级时间",
                    "type": "date",
                    "required": True,
                    "default": lambda: datetime.now().strftime("%Y-%m-%d"),
                    "placeholder": "选择升级日期"
                },
                {
                    "field": "upgrade_type",
                    "label": "升级类型",
                    "type": "select",
                    "required": True,
                    "options": [
                        {"label": "硬件升级", "value": "hardware"},
                        {"label": "软件升级", "value": "software"},
                        {"label": "配件改装", "value": "accessory"},
                        {"label": "外观改装", "value": "appearance"},
                        {"label": "性能优化", "value": "performance"},
                        {"label": "其他", "value": "other"}
                    ]
                },
                {
                    "field": "upgrade_items",
                    "label": "升级项目",
                    "type": "text",
                    "required": True,
                    "placeholder": "如：内存从8G升级到16G、加装固态硬盘、更换电池等",
                    "description": "描述具体升级的部件或项目"
                },
                {
                    "field": "before_specification",
                    "label": "升级前规格",
                    "type": "text",
                    "required": False,
                    "placeholder": "如：8GB内存、256GB硬盘"
                },
                {
                    "field": "after_specification",
                    "label": "升级后规格",
                    "type": "text",
                    "required": False,
                    "placeholder": "如：16GB内存、512GB硬盘"
                },
                {
                    "field": "cost",
                    "label": "升级费用",
                    "type": "number",
                    "required": False,
                    "placeholder": "请输入升级花费金额",
                    "min": 0,
                    "precision": 2,
                    "prefix": "¥",
                    "description": "记录升级成本"
                },
                {
                    "field": "service_provider",
                    "label": "服务商",
                    "type": "text",
                    "required": False,
                    "placeholder": "如：官方售后、第三方维修店、自行购买"
                },
                {
                    "field": "upgrade_images",
                    "label": "升级过程照片",
                    "type": "images",
                    "required": False,
                    "max_count": 6,
                    "description": "升级过程中的照片记录"
                },
                {
                    "field": "parts_images",
                    "label": "新部件照片",
                    "type": "images",
                    "required": False,
                    "max_count": 9,
                    "description": "新升级部件的照片"
                },
                {
                    "field": "performance_improvement",
                    "label": "性能提升感受",
                    "type": "textarea",
                    "required": False,
                    "placeholder": "描述升级后的性能提升、使用体验变化等...",
                    "max_length": 1000,
                    "description": "如：运行速度明显提升、软件响应更快、续航时间延长等"
                },
                {
                    "field": "description",
                    "label": "详细说明",
                    "type": "textarea",
                    "required": False,
                    "placeholder": "详细描述升级原因、过程和建议...",
                    "max_length": 1000
                }
            ]
        },
        EventType.EXPERIENCE: {
            "name": "使用体验",
            "description": "记录使用过程中的体验和感受",
            "icon": "star",
            "color": "#faad14",
            "repo_types": ["item"],
            "fields": [
                {
                    "field": "experience_date",
                    "label": "记录时间",
                    "type": "date",
                    "required": True,
                    "default": lambda: datetime.now().strftime("%Y-%m-%d"),
                    "placeholder": "选择记录日期"
                },
                {
                    "field": "rating",
                    "label": "满意度评分",
                    "type": "rating",
                    "required": True,
                    "min": 1,
                    "max": 5,
                    "default": 5,
                    "description": "1星-很不满意，5星-非常满意"
                },
                {
                    "field": "usage_scenario",
                    "label": "使用场景",
                    "type": "select",
                    "required": False,
                    "options": [
                        {"label": "日常使用", "value": "daily"},
                        {"label": "工作学习", "value": "work"},
                        {"label": "运动健身", "value": "sports"},
                        {"label": "娱乐休闲", "value": "entertainment"},
                        {"label": "旅行出行", "value": "travel"},
                        {"label": "其他", "value": "other"}
                    ]
                },
                {
                    "field": "pros",
                    "label": "优点",
                    "type": "tags",
                    "required": False,
                    "placeholder": "输入优点后按回车添加"
                },
                {
                    "field": "cons",
                    "label": "缺点",
                    "type": "tags",
                    "required": False,
                    "placeholder": "输入缺点后按回车添加"
                },
                {
                    "field": "images",
                    "label": "配图",
                    "type": "images",
                    "required": False,
                    "max_count": 6
                },
                {
                    "field": "content",
                    "label": "详细描述",
                    "type": "textarea",
                    "required": False,
                    "placeholder": "详细描述使用体验...",
                    "max_length": 1000
                }
            ]
        },
        EventType.MEMORY: {
            "name": "体验节点",
            "description": "记录特定时刻的深度体验，为地点/物品赋予情感和故事价值",
            "icon": "heart",
            "color": "#eb2f96",
            "repo_types": ["item"],
            "fields": [
                {
                    "field": "memory_date",
                    "label": "体验时间",
                    "type": "date",
                    "required": True,
                    "default": lambda: datetime.now().strftime("%Y-%m-%d"),
                    "placeholder": "选择体验日期"
                },
                {
                    "field": "memory_title",
                    "label": "体验标题",
                    "type": "text",
                    "required": True,
                    "placeholder": "如：带父母出游的体验、完成第一个项目的感受",
                    "description": "为这个特殊时刻起一个有意义的标题"
                },
                {
                    "field": "memory_type",
                    "label": "体验类型",
                    "type": "select",
                    "required": True,
                    "options": [
                        {"label": "重要时刻", "value": "milestone"},
                        {"label": "难忘回忆", "value": "unforgettable"},
                        {"label": "成就感", "value": "achievement"},
                        {"label": "温馨时刻", "value": "heartwarming"},
                        {"label": "挑战突破", "value": "breakthrough"},
                        {"label": "第一次", "value": "first_time"},
                        {"label": "其他", "value": "other"}
                    ]
                },
                {
                    "field": "participants",
                    "label": "参与人员",
                    "type": "text",
                    "required": False,
                    "placeholder": "如：和家人、和朋友、和同事",
                    "description": "记录和你一起体验这个时刻的人"
                },
                {
                    "field": "location",
                    "label": "体验地点",
                    "type": "text",
                    "required": False,
                    "placeholder": "如：北京故宫、云南大理、家里"
                },
                {
                    "field": "emotional_rating",
                    "label": "情感评分",
                    "type": "rating",
                    "required": False,
                    "min": 1,
                    "max": 5,
                    "default": 5,
                    "description": "1星-平淡无奇，5星-终生难忘"
                },
                {
                    "field": "keywords",
                    "label": "关键词标签",
                    "type": "tags",
                    "required": False,
                    "placeholder": "添加关键词标签，如：温馨、感动、突破、成就等"
                },
                {
                    "field": "story_background",
                    "label": "故事背景",
                    "type": "textarea",
                    "required": False,
                    "placeholder": "描述这个时刻的背景、起因...",
                    "max_length": 500
                },
                {
                    "field": "emotional_experience",
                    "label": "情感体验",
                    "type": "textarea",
                    "required": False,
                    "placeholder": "详细描述你的感受、心情、情感体验...",
                    "max_length": 1500,
                    "description": "这是最核心的部分，记录真实的感受和情感"
                },
                {
                    "field": "learnings",
                    "label": "收获与感悟",
                    "type": "textarea",
                    "required": False,
                    "placeholder": "从这个经历中学到了什么、有什么感悟...",
                    "max_length": 1000
                },
                {
                    "field": "memory_images",
                    "label": "回忆照片",
                    "type": "images",
                    "required": False,
                    "max_count": 12,
                    "description": "上传与这个时刻相关的照片，最多12张"
                },
                {
                    "field": "is_public",
                    "label": "是否公开分享",
                    "type": "boolean",
                    "required": False,
                    "default": False,
                    "description": "是否愿意将这个体验分享给他人"
                }
            ]
        },
        EventType.FAULT: {
            "name": "故障维修",
            "description": "记录故障和维修情况，构建完整的健康档案",
            "icon": "alert-circle",
            "color": "#f5222d",
            "repo_types": ["item"],
            "fields": [
                {
                    "field": "fault_date",
                    "label": "故障时间",
                    "type": "date",
                    "required": True,
                    "default": lambda: datetime.now().strftime("%Y-%m-%d"),
                    "placeholder": "选择故障日期"
                },
                {
                    "field": "fault_description",
                    "label": "故障描述",
                    "type": "textarea",
                    "required": True,
                    "placeholder": "详细描述故障现象、出现场景等...",
                    "max_length": 500,
                    "description": "尽可能详细地描述故障情况"
                },
                {
                    "field": "fault_frequency",
                    "label": "发生频率",
                    "type": "select",
                    "required": True,
                    "options": [
                        {"label": "首次出现", "value": "first"},
                        {"label": "偶尔发生", "value": "occasional"},
                        {"label": "频繁出现", "value": "frequent"},
                        {"label": "持续存在", "value": "continuous"}
                    ],
                    "description": "记录故障发生的频率"
                },
                {
                    "field": "fault_impact",
                    "label": "影响程度",
                    "type": "select",
                    "required": False,
                    "options": [
                        {"label": "轻微影响", "value": "minor"},
                        {"label": "中度影响", "value": "moderate"},
                        {"label": "严重影响", "value": "severe"},
                        {"label": "完全无法使用", "value": "critical"}
                    ]
                },
                {
                    "field": "fault_project",
                    "label": "维修项目",
                    "type": "text",
                    "required": False,
                    "placeholder": "如：更换电池、屏幕维修、主板更换等",
                    "condition": lambda data: data.get('is_repaired', False)
                },
                {
                    "field": "fault_type",
                    "label": "故障类型",
                    "type": "select",
                    "required": True,
                    "options": [
                        {"label": "硬件故障", "value": "hardware"},
                        {"label": "软件故障", "value": "software"},
                        {"label": "性能问题", "value": "performance"},
                        {"label": "外观损坏", "value": "appearance"},
                        {"label": "电池问题", "value": "battery"},
                        {"label": "连接问题", "value": "connectivity"},
                        {"label": "其他", "value": "other"}
                    ]
                },
                {
                    "field": "is_repaired",
                    "label": "是否已维修",
                    "type": "boolean",
                    "required": True,
                    "default": False
                },
                {
                    "field": "repair_date",
                    "label": "维修时间",
                    "type": "date",
                    "required": False,
                    "placeholder": "选择维修完成日期",
                    "condition": lambda data: data.get('is_repaired', False)
                },
                {
                    "field": "repair_cost",
                    "label": "维修费用",
                    "type": "number",
                    "required": False,
                    "placeholder": "请输入维修费用",
                    "min": 0,
                    "precision": 2,
                    "prefix": "¥",
                    "condition": lambda data: data.get('is_repaired', False)
                },
                {
                    "field": "service_provider",
                    "label": "维修点/服务商",
                    "type": "text",
                    "required": False,
                    "placeholder": "如：苹果官方售后、华为授权服务中心、第三方维修店",
                    "condition": lambda data: data.get('is_repaired', False),
                    "description": "记录服务商信息，便于后续追溯"
                },
                {
                    "field": "service_address",
                    "label": "维修地址",
                    "type": "text",
                    "required": False,
                    "placeholder": "维修点地址",
                    "condition": lambda data: data.get('is_repaired', False)
                },
                {
                    "field": "service_contact",
                    "label": "联系方式",
                    "type": "text",
                    "required": False,
                    "placeholder": "如：电话或联系人",
                    "condition": lambda data: data.get('is_repaired', False)
                },
                {
                    "field": "parts_images",
                    "label": "更换零件照片",
                    "type": "images",
                    "required": False,
                    "max_count": 9,
                    "condition": lambda data: data.get('is_repaired', False),
                    "description": "上传更换零件的照片，作为关键证据"
                },
                {
                    "field": "fault_images",
                    "label": "故障照片",
                    "type": "images",
                    "required": False,
                    "max_count": 6,
                    "description": "故障发生时的照片"
                },
                {
                    "field": "repair_images",
                    "label": "维修过程照片",
                    "type": "images",
                    "required": False,
                    "max_count": 6,
                    "condition": lambda data: data.get('is_repaired', False),
                    "description": "维修过程中的照片记录"
                },
                {
                    "field": "documents",
                    "label": "维修凭证",
                    "type": "files",
                    "required": False,
                    "max_count": 5,
                    "accept": ["pdf", "jpg", "jpeg", "png"],
                    "condition": lambda data: data.get('is_repaired', False),
                    "description": "支持上传维修单、发票等PDF或图片文件"
                },
                {
                    "field": "warranty_info",
                    "label": "维修质保",
                    "type": "textarea",
                    "required": False,
                    "placeholder": "如：维修部分质保3个月",
                    "max_length": 200,
                    "condition": lambda data: data.get('is_repaired', False)
                },
                {
                    "field": "repair_description",
                    "label": "维修说明",
                    "type": "textarea",
                    "required": False,
                    "placeholder": "描述维修过程、更换部件、维修结果等...",
                    "max_length": 1000,
                    "condition": lambda data: data.get('is_repaired', False)
                },
                {
                    "field": "official_response",
                    "label": "官方回应",
                    "type": "textarea",
                    "required": False,
                    "placeholder": "记录客服或售后的反馈、回复内容等...",
                    "max_length": 1000,
                    "description": "记录官方对此次故障的回应和处理方案"
                },
                {
                    "field": "contact_channel",
                    "label": "联系渠道",
                    "type": "select",
                    "required": False,
                    "options": [
                        {"label": "官方客服", "value": "official_service"},
                        {"label": "线下门店", "value": "offline_store"},
                        {"label": "在线客服", "value": "online_service"},
                        {"label": "社交媒体", "value": "social_media"},
                        {"label": "邮件联系", "value": "email"},
                        {"label": "其他", "value": "other"}
                    ]
                },
                {
                    "field": "contact_date",
                    "label": "联系时间",
                    "type": "date",
                    "required": False,
                    "placeholder": "联系客服的时间"
                },
                {
                    "field": "satisfaction_rating",
                    "label": "处理满意度",
                    "type": "rating",
                    "required": False,
                    "min": 1,
                    "max": 5,
                    "default": 3,
                    "description": "对官方处理结果的满意度评分"
                }
            ]
        },
        EventType.TRANSFER: {
            "name": "转让出售",
            "description": "记录物品的转让或出售情况，完成生命周期闭环",
            "icon": "swap",
            "color": "#13c2c2",
            "repo_types": ["item"],
            "fields": [
                {
                    "field": "transfer_date",
                    "label": "转让时间",
                    "type": "date",
                    "required": True,
                    "default": lambda: datetime.now().strftime("%Y-%m-%d"),
                    "placeholder": "选择转让日期"
                },
                {
                    "field": "transfer_type",
                    "label": "转让方式",
                    "type": "select",
                    "required": True,
                    "options": [
                        {"label": "出售", "value": "sell"},
                        {"label": "赠送", "value": "gift"},
                        {"label": "置换", "value": "exchange"},
                        {"label": "丢失", "value": "lost"},
                        {"label": "报废", "value": "discard"},
                        {"label": "捐赠", "value": "donate"}
                    ]
                },
                {
                    "field": "transfer_price",
                    "label": "转让价格",
                    "type": "number",
                    "required": False,
                    "placeholder": "请输入转让价格",
                    "min": 0,
                    "precision": 2,
                    "prefix": "¥",
                    "condition": lambda data: data.get('transfer_type') == 'sell',
                    "description": "记录实际成交价格"
                },
                {
                    "field": "item_condition",
                    "label": "物品状态",
                    "type": "select",
                    "required": False,
                    "options": [
                        {"label": "全新未使用", "value": "brand_new"},
                        {"label": "九成新", "value": "excellent"},
                        {"label": "八成新", "value": "great"},
                        {"label": "七成新", "value": "good"},
                        {"label": "可用", "value": "usable"},
                        {"label": "需维修", "value": "needs_repair"},
                        {"label": "故障", "value": "broken"}
                    ],
                    "description": "描述物品的当前状态"
                },
                {
                    "field": "includes_accessories",
                    "label": "配件情况",
                    "type": "text",
                    "required": False,
                    "placeholder": "如：含原装充电器、数据线、保护壳等",
                    "description": "列出包含的所有配件"
                },
                {
                    "field": "transfer_reason",
                    "label": "转让原因",
                    "type": "textarea",
                    "required": False,
                    "placeholder": "描述为什么转让这个物品...",
                    "max_length": 500,
                    "description": "如实记录转让原因"
                },
                {
                    "field": "recipient",
                    "label": "接收人",
                    "type": "text",
                    "required": False,
                    "placeholder": "记录转让给谁",
                    "condition": lambda data: data.get('transfer_type') in ['gift', 'exchange']
                },
                {
                    "field": "transfer_channel",
                    "label": "转让渠道",
                    "type": "select",
                    "required": False,
                    "options": [
                        {"label": "闲鱼", "value": "xianyu"},
                        {"label": "转转", "value": "zhuanzhuan"},
                        {"label": "朋友圈", "value": "wechat"},
                        {"label": "线下交易", "value": "offline"},
                        {"label": "亲友赠送", "value": "friend"},
                        {"label": "其他", "value": "other"}
                    ]
                },
                {
                    "field": "message_to_next_owner",
                    "label": "对下一个主人的寄语",
                    "type": "textarea",
                    "required": False,
                    "placeholder": "写下你想对下任主人说的话...",
                    "max_length": 1000,
                    "description": "分享使用心得、注意事项或美好祝愿"
                },
                {
                    "field": "usage_tips",
                    "label": "使用建议",
                    "type": "textarea",
                    "required": False,
                    "placeholder": "分享使用技巧、注意事项等...",
                    "max_length": 800
                },
                {
                    "field": "transfer_images",
                    "label": "物品照片",
                    "type": "images",
                    "required": False,
                    "max_count": 9,
                    "description": "转让时物品的实物照片"
                },
                {
                    "field": "transfer_documents",
                    "label": "转让凭证",
                    "type": "files",
                    "required": False,
                    "max_count": 5,
                    "accept": ["pdf", "jpg", "jpeg", "png"],
                    "description": "支持上传交易凭证、发票等文件"
                },
                {
                    "field": "description",
                    "label": "补充说明",
                    "type": "textarea",
                    "required": False,
                    "placeholder": "其他需要说明的内容...",
                    "max_length": 500
                }
            ]
        },
        # ==================== 地点型事件 ====================
        EventType.VISIT: {
            "name": "到访打卡",
            "description": "记录到访地点的打卡信息",
            "icon": "map-pin",
            "color": "#52c41a",
            "repo_types": ["place"],
            "fields": [
                {
                    "field": "visit_date",
                    "label": "到访时间",
                    "type": "date",
                    "required": True,
                    "default": lambda: datetime.now().strftime("%Y-%m-%d"),
                    "placeholder": "选择到访日期"
                },
                {
                    "field": "wait_time",
                    "label": "等位时长",
                    "type": "select",
                    "required": False,
                    "options": [
                        {"label": "不用等", "value": "none"},
                        {"label": "15分钟内", "value": "within_15"},
                        {"label": "30分钟以上", "value": "over_30"}
                    ]
                },
                {
                    "field": "amount_paid",
                    "label": "实付金额",
                    "type": "number",
                    "required": False,
                    "placeholder": "请输入金额",
                    "min": 0,
                    "precision": 2,
                    "prefix": "¥"
                },
                {
                    "field": "photos",
                    "label": "随手拍",
                    "type": "images",
                    "required": False,
                    "max_count": 9
                }
            ]
        },
        EventType.REVIEW: {
            "name": "菜品/体验评价",
            "description": "对地点的菜品或体验进行综合评价",
            "icon": "star",
            "color": "#faad14",
            "repo_types": ["place"],
            "fields": [
                {
                    "field": "overall_rating",
                    "label": "综合推荐",
                    "type": "select",
                    "required": True,
                    "options": [
                        {"label": "推荐", "value": "recommend"},
                        {"label": "一般", "value": "average"},
                        {"label": "不推荐", "value": "not_recommend"}
                    ]
                },
                {
                    "field": "taste_rating",
                    "label": "口味评分",
                    "type": "rating",
                    "required": True,
                    "min": 1,
                    "max": 5,
                    "default": 5
                },
                {
                    "field": "environment_rating",
                    "label": "环境评分",
                    "type": "rating",
                    "required": True,
                    "min": 1,
                    "max": 5,
                    "default": 5
                },
                {
                    "field": "service_rating",
                    "label": "服务评分",
                    "type": "rating",
                    "required": True,
                    "min": 1,
                    "max": 5,
                    "default": 5
                },
                {
                    "field": "per_capita_cost",
                    "label": "人均消费",
                    "type": "number",
                    "required": False,
                    "placeholder": "请输入人均消费金额",
                    "min": 0,
                    "precision": 2,
                    "prefix": "¥"
                },
                {
                    "field": "recommended_dishes",
                    "label": "推荐菜品",
                    "type": "tags",
                    "required": False,
                    "placeholder": "输入推荐菜品后按回车添加"
                },
                {
                    "field": "disliked_dishes",
                    "label": "踩雷菜品",
                    "type": "tags",
                    "required": False,
                    "placeholder": "输入踩雷菜品后按回车添加"
                },
                {
                    "field": "detail_review",
                    "label": "详细评价",
                    "type": "textarea",
                    "required": False,
                    "placeholder": "详细描述你的体验...",
                    "max_length": 1500
                },
                {
                    "field": "images",
                    "label": "配图",
                    "type": "images",
                    "required": False,
                    "max_count": 9
                }
            ]
        },
        EventType.INFO_CHANGE: {
            "name": "信息变更",
            "description": "记录地点的信息变更情况",
            "icon": "edit",
            "color": "#1890ff",
            "repo_types": ["place"],
            "fields": [
                {
                    "field": "change_type",
                    "label": "变更类型",
                    "type": "select",
                    "required": True,
                    "options": [
                        {"label": "营业状态变更", "value": "business_status"},
                        {"label": "价格调整", "value": "price_change"},
                        {"label": "菜单更新", "value": "menu_update"},
                        {"label": "装修", "value": "renovation"},
                        {"label": "搬址", "value": "relocation"},
                        {"label": "歇业", "value": "closure"}
                    ]
                },
                {
                    "field": "change_description",
                    "label": "变更说明",
                    "type": "textarea",
                    "required": True,
                    "placeholder": "描述变更的具体内容...",
                    "max_length": 1000
                },
                {
                    "field": "evidence_images",
                    "label": "证据图片",
                    "type": "images",
                    "required": False,
                    "max_count": 9
                }
            ]
        },
        EventType.WISHLIST: {
            "name": "待探/种草",
            "description": "标记想去探访的地点",
            "icon": "bookmark",
            "color": "#722ed1",
            "repo_types": ["place"],
            "fields": [
                {
                    "field": "reason",
                    "label": "想去的理由",
                    "type": "text",
                    "required": True,
                    "placeholder": "为什么想去这个地方..."
                },
                {
                    "field": "source",
                    "label": "种草来源",
                    "type": "select",
                    "required": True,
                    "options": [
                        {"label": "朋友推荐", "value": "friend"},
                        {"label": "小红书", "value": "xiaohongshu"},
                        {"label": "路过看到", "value": "passing_by"},
                        {"label": "其他", "value": "other"}
                    ]
                },
                {
                    "field": "planned_date",
                    "label": "计划时间",
                    "type": "date",
                    "required": False,
                    "placeholder": "选择计划到访日期"
                }
            ]
        }
    }

    @classmethod
    def get_event_types(cls) -> List[Dict[str, Any]]:
        """获取所有事件类型列表"""
        return [
            {
                "value": event_type.value,
                "name": config["name"],
                "description": config["description"],
                "icon": config["icon"],
                "color": config["color"],
                "repo_types": config.get("repo_types", ["item", "place"])
            }
            for event_type, config in cls.EVENT_TYPES.items()
        ]

    @classmethod
    def get_event_types_by_repo_type(cls, repo_type: str) -> List[Dict[str, Any]]:
        """获取指定仓库类型的事件类型列表"""
        return [
            {
                "value": event_type.value,
                "name": config["name"],
                "description": config["description"],
                "icon": config["icon"],
                "color": config["color"]
            }
            for event_type, config in cls.EVENT_TYPES.items()
            if repo_type in config.get("repo_types", ["item", "place"])
        ]

    @classmethod
    def validate_event_type_for_repo(cls, event_type: str, repo_type: str) -> bool:
        """验证事件类型是否适用于指定仓库类型"""
        try:
            event_enum = EventType(event_type)
            config = cls.EVENT_TYPES[event_enum]
            return repo_type in config.get("repo_types", ["item", "place"])
        except ValueError:
            return False

    @classmethod
    def get_event_schema(cls, event_type: str) -> Optional[Dict[str, Any]]:
        """获取指定事件类型的表单结构"""
        try:
            event_enum = EventType(event_type)
            return cls.EVENT_TYPES[event_enum]
        except ValueError:
            return None

    @classmethod
    def get_event_schema_safe(cls, event_type: str) -> Optional[Dict[str, Any]]:
        """获取JSON安全的表单结构（去除lambda函数）"""
        schema = cls.get_event_schema(event_type)
        if not schema:
            return None
        safe_fields = []
        for field in schema['fields']:
            safe_field = {k: v for k, v in field.items() if not callable(v)}
            if 'default' in field and callable(field['default']):
                safe_field['default'] = field['default']()
            safe_fields.append(safe_field)
        return {
            'name': schema['name'],
            'description': schema['description'],
            'icon': schema['icon'],
            'color': schema['color'],
            'fields': safe_fields
        }

    @classmethod
    def validate_event_data(cls, event_type: str, data: Dict[str, Any]) -> tuple[bool, List[str]]:
        """
        验证事件数据

        Returns:
            (是否有效, 错误信息列表)
        """
        schema = cls.get_event_schema(event_type)
        if not schema:
            return False, ["无效的事件类型"]

        errors = []

        for field in schema["fields"]:
            field_name = field["field"]
            is_required = field.get("required", False)
            value = data.get(field_name)

            # 检查必填字段
            if is_required and not value:
                errors.append(f"{field['label']}为必填项")
                continue

            # 检查条件字段
            if "condition" in field:
                condition = field["condition"]
                if not condition(data):
                    continue

            # 非必填字段且值为空，跳过类型验证
            if not is_required and not value:
                continue

            # 类型验证
            if value is not None:
                if field["type"] == "number":
                    try:
                        num_value = float(value)
                        if "min" in field and num_value < field["min"]:
                            errors.append(f"{field['label']}不能小于{field['min']}")
                    except ValueError:
                        errors.append(f"{field['label']}必须是数字")

                elif field["type"] == "date":
                    # 验证日期格式
                    try:
                        datetime.strptime(value, "%Y-%m-%d")
                    except (ValueError, TypeError):
                        errors.append(f"{field['label']}日期格式不正确")

                elif field["type"] == "images":
                    if not isinstance(value, list):
                        errors.append(f"{field['label']}必须是数组格式")
                    elif "max_count" in field and len(value) > field["max_count"]:
                        errors.append(f"{field['label']}最多支持{field['max_count']}张图片")

                elif field["type"] == "files":
                    if not isinstance(value, list):
                        errors.append(f"{field['label']}必须是数组格式")
                    elif "max_count" in field and len(value) > field["max_count"]:
                        errors.append(f"{field['label']}最多支持{field['max_count']}个文件")
                    elif "accept" in field:
                        for file_info in value:
                            if isinstance(file_info, dict):
                                file_ext = file_info.get('name', '').split('.')[-1].lower()
                                if file_ext not in field["accept"]:
                                    errors.append(f"{field['label']}只支持{', '.join(field['accept'])}格式")

                elif field["type"] == "textarea":
                    if "max_length" in field and len(str(value)) > field["max_length"]:
                        errors.append(f"{field['label']}不能超过{field['max_length']}个字符")

                elif field["type"] == "rating":
                    try:
                        rating = int(value)
                        if "min" in field and rating < field["min"]:
                            errors.append(f"{field['label']}不能小于{field['min']}")
                        if "max" in field and rating > field["max"]:
                            errors.append(f"{field['label']}不能大于{field['max']}")
                    except (ValueError, TypeError):
                        errors.append(f"{field['label']}必须是整数")

        return len(errors) == 0, errors

    @classmethod
    def format_event_content(cls, event_type: str, data: Dict[str, Any]) -> tuple[Dict[str, Any], List[str]]:
        """
        格式化事件内容，返回数据库存储格式

        Returns:
            (content字段数据, images字段数据)
        """
        schema = cls.get_event_schema(event_type)
        if not schema:
            return {}, []

        content = {}
        all_images = []

        for field in schema["fields"]:
            field_name = field["field"]
            value = data.get(field_name)

            if value is not None:
                if field["type"] == "images":
                    # 收集所有图片类型的字段
                    if isinstance(value, list):
                        all_images.extend(value)
                    content[field_name] = value
                elif field["type"] == "files":
                    # 文件类型也存储到content中
                    content[field_name] = value
                else:
                    content[field_name] = value

        return content, all_images

    @classmethod
    def is_negative_event(cls, event_type: str, data: Dict[str, Any] = None) -> tuple[bool, str]:
        """
        检测是否为负面事件（需要确认的事件）

        Args:
            event_type: 事件类型
            data: 事件数据

        Returns:
            (是否为负面事件, 确认消息)
        """
        # 故障维修事件
        if event_type == EventType.FAULT.value:
            return True, "此故障记录将公开，可能帮助他人避坑，是否确认提交？"

        # 需要判断的负面事件
        negative_indicators = {
            EventType.EXPERIENCE.value: lambda d: d.get('rating', 5) <= 2,  # 低评分体验
            EventType.REVIEW.value: lambda d: d.get('overall_rating') == 'not_recommend',  # 差评
        }

        if event_type in negative_indicators and data:
            if negative_indicators[event_type](data):
                return True, "此负面体验记录将公开，是否确认提交？"

        return False, ""

    @classmethod
    def requires_confirmation(cls, event_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        获取事件是否需要特殊确认

        Returns:
            确认信息字典，包含：
            - requires: 是否需要确认
            - title: 确认标题
            - message: 确认消息
            - type: 确认类型（warning/negative/public）
        """
        is_negative, message = cls.is_negative_event(event_type, data)

        if is_negative:
            return {
                "requires": True,
                "title": "负面信息确认",
                "message": message,
                "type": "negative"
            }

        # 转让出售确认
        if event_type == EventType.TRANSFER.value:
            transfer_type = data.get('transfer_type', '')
            if transfer_type == 'sell':
                return {
                    "requires": True,
                    "title": "转让确认",
                    "message": "此记录将标记物品已转让，完成生命周期闭环，是否确认？",
                    "type": "transfer"
                }
            elif transfer_type == 'discard':
                return {
                    "requires": True,
                    "title": "报废确认",
                    "message": "此记录将标记物品已报废，是否确认？",
                    "type": "warning"
                }

        return {
            "requires": False,
            "title": "",
            "message": "",
            "type": ""
        }
