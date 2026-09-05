import re
from typing import Dict, List, Optional, Any


class NLPService:
    """NLP语义分析服务 - 支持实体识别和意图识别"""

    def __init__(self, api_provider: str = 'local'):
        self.api_provider = api_provider
        self.api_config = {
            'baidu': {
                'app_id': '',
                'api_key': '',
                'secret_key': '',
                'api_url': 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/eb-instant'
            },
            'tencent': {
                'secret_id': '',
                'secret_key': '',
                'region': 'ap-beijing',
                'api_url': 'https://nlp.tencentcloudapi.com'
            },
            'aliyun': {
                'access_key_id': '',
                'access_key_secret': '',
                'api_url': 'https://nlp-meta.cn-hangzhou.aliyuncs.com'
            }
        }

        # 本地实体识别规则
        self.entity_patterns = {
            'location': [
                r'(.{2,4}大学)',
                r'(.{2,4}校区)',
                r'(.{1,3}楼)',
                r'(教室|自习室|图书馆|实验室|食堂|宿舍|操场|体育馆)',
                r'(.{2,6}路)',
                r'(.{2,6}街)',
                r'(.{2,6}广场|公园|商场|超市)'
            ],
            'brand': [
                r'(苹果|Apple|iPhone|iPad|MacBook)',
                r'(小米|Xiaomi|Redmi|黑鲨)',
                r'(华为|Huawei|荣耀|Honor)',
                r'(三星|Samsung)',
                r'(OPPO|Vivo|一加|realme|iqoo)',
                r'(索尼|Sony|PlayStation)',
                r'(微软|Microsoft|Xbox)',
                r'(任天堂|Nintendo|Switch)',
                r'(戴森|Dyson)',
                r'(美的|Midea|海尔|Haier|格力|Gree)',
                r'(Nike|Adidas|李宁|安踏)',
                r'(捷安特|Giant|美利达|Merida)',
                r'(特斯拉|Tesla|比亚迪|BYD|宝马|BMW|奔驰|Benz)'
            ],
            'product_type': [
                r'(手机|智能机|5G手机)',
                r'(电脑|笔记本|台式机|平板|iPad)',
                r'(耳机|音箱|音响|键盘|鼠标)',
                r'(吸尘器|空调|冰箱|洗衣机|电视)',
                r'(自行车|单车|电动车|汽车|SUV)',
                r'(书包|背包|手表|手环|眼镜)',
                r'(球鞋|运动鞋|衣服|裤子|外套)',
                r'(书|笔|本子|文具)'
            ],
            'color': [
                r'(黑色|白色|红色|蓝色|绿色|黄色|粉色|紫色|橙色)',
                r'(金色|银色|灰色|棕色|钛金属)',
                r'(星空色|午夜色|星光色)',
            ],
            'specification': [
                r'(\d+GB|\d+G)',
                r'(\d+英寸|\d+寸)',
                r'(\d+英寸|\d+寸)',
                r'(WiFi版|蜂窝版|5G版)'
            ]
        }

        # 分类映射
        self.category_mapping = {
            '物品': ['电子产品', '交通工具', '家用电器', '文具', '服装鞋帽'],
            '地点': ['学校', '办公场所', '公共场所', '商业场所', '住宅']
        }

    def analyze_text(self, text: str) -> Dict[str, Any]:
        """
        分析文本，提取实体和意图

        Args:
            text: 用户输入的文本

        Returns:
            包含实体、意图和分类的分析结果
        """
        if self.api_provider == 'local':
            return self._local_nlp_analyze(text)
        elif self.api_provider == 'baidu':
            return self._baidu_nlp_analyze(text)
        elif self.api_provider == 'tencent':
            return self._tencent_nlp_analyze(text)
        else:
            return self._local_nlp_analyze(text)

    def _local_nlp_analyze(self, text: str) -> Dict[str, Any]:
        """本地NLP分析"""
        entities = self._extract_entities(text)
        intent = self._detect_intent(text)
        category = self._classify_category(entities, text)
        structured_name = self._generate_structured_name(entities, category)

        return {
            'entities': entities,
            'intent': intent,
            'category': category,
            'structured_name': structured_name,
            'suggested_fields': self._generate_suggested_fields(entities)
        }

    def _extract_entities(self, text: str) -> Dict[str, List[str]]:
        """提取实体"""
        entities = {
            'location': [],
            'brand': [],
            'product_type': [],
            'color': [],
            'specification': []
        }

        for entity_type, patterns in self.entity_patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, text)
                if matches:
                    entities[entity_type].extend(matches)

        # 去重
        for key in entities:
            entities[key] = list(set(entities[key]))

        return entities

    def _detect_intent(self, text: str) -> str:
        """识别用户意图"""
        create_keywords = ['创建', '新建', '添加', '记一下', '保存', '录入']
        search_keywords = ['搜索', '查找', '找', '查询', '看看']

        for keyword in create_keywords:
            if keyword in text:
                return 'create'

        for keyword in search_keywords:
            if keyword in text:
                return 'search'

        # 默认为创建意图
        return 'create'

    def _classify_category(self, entities: Dict, text: str) -> str:
        """分类：物品或地点"""
        if entities.get('location'):
            return 'place'
        elif entities.get('brand') or entities.get('product_type'):
            return 'item'
        else:
            # 根据关键词判断
            place_keywords = ['教室', '自习室', '图书馆', '食堂', '宿舍', '操场',
                            '公园', '广场', '商场', '超市', '校区', '大学']
            for keyword in place_keywords:
                if keyword in text:
                    return 'place'
            return 'item'

    def _generate_structured_name(self, entities: Dict, category: str) -> str:
        """生成结构化标题"""
        if category == 'place':
            location = entities.get('location', [])
            if location:
                return ''.join(location[:3])
            return '未命名地点'
        else:
            brand_list = entities.get('brand', [])
            product_type_list = entities.get('product_type', [])
            color_list = entities.get('color', [])

            brand = brand_list[0] if brand_list else ''
            product_type = product_type_list[0] if product_type_list else ''
            color = color_list[0] if color_list else ''

            parts = [brand, color, product_type]
            result = ' '.join([p for p in parts if p])
            return result if result else '未命名物品'

    def _generate_suggested_fields(self, entities: Dict) -> Dict[str, str]:
        """生成建议的字段值"""
        product_type_list = entities.get('product_type', [])
        brand_list = entities.get('brand', [])

        return {
            'product_name': product_type_list[0] if product_type_list else '未命名物品',
            'brand': brand_list[0] if brand_list else '',
            'model': '',
            'specification': ', '.join(entities.get('specification', [])),
            'main_image': ''
        }

    def _baidu_nlp_analyze(self, text: str) -> Dict[str, Any]:
        """百度NLP分析（待配置API密钥）"""
        config = self.api_config['baidu']
        if not config['api_key']:
            return self._local_nlp_analyze(text)

        try:
            # TODO: 实现百度API调用
            # 参考文档：https://ai.baidu.com/ai-doc/NLP/ekkzYb35i
            import requests

            url = f"{config['api_url']}?access_token={self._get_baidu_token()}"
            payload = {'messages': [{'role': 'user', 'content': text}]}

            response = requests.post(url, json=payload, timeout=5)
            return self._parse_baidu_response(response.json())
        except Exception as e:
            print(f"Baidu API Error: {e}")
            return self._local_nlp_analyze(text)

    def _tencent_nlp_analyze(self, text: str) -> Dict[str, Any]:
        """腾讯NLP分析（待配置API密钥）"""
        config = self.api_config['tencent']
        if not config['secret_id']:
            return self._local_nlp_analyze(text)

        try:
            # TODO: 实现腾讯API调用
            # 参考文档：https://cloud.tencent.com/document/product/271/9488
            pass
        except Exception as e:
            print(f"Tencent API Error: {e}")
            return self._local_nlp_analyze(text)

    def _get_baidu_token(self) -> str:
        """获取百度API token"""
        # TODO: 实现token获取逻辑
        return ''

    def _parse_baidu_response(self, data: Dict) -> Dict[str, Any]:
        """解析百度API响应"""
        # TODO: 实现响应解析
        return {}
