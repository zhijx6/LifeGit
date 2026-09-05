import requests
from typing import Optional, Dict, Any


class ProductAPIService:
    """商品数据库API服务 - 支持多个第三方API"""

    def __init__(self, api_provider: str = 'mock'):
        self.api_provider = api_provider
        self.api_config = {
            'jd': {
                'app_key': '',
                'app_secret': '',
                'api_url': 'https://api.jd.com/routerjson'
            },
            'taobao': {
                'app_key': '',
                'app_secret': '',
                'api_url': 'https://eco.taobao.com/router/rest'
            },
            'aliyun': {
                'access_key_id': '',
                'access_key_secret': '',
                'api_url': 'https://dm-81.data.aliyun.com'
            }
        }

    def get_product_by_barcode(self, barcode: str) -> Optional[Dict[str, Any]]:
        """
        通过条形码获取商品信息

        Args:
            barcode: 商品条形码

        Returns:
            商品信息字典，包含：product_name, brand, model, specification, main_image
        """
        if self.api_provider == 'mock':
            return self._mock_product_data(barcode)
        elif self.api_provider == 'jd':
            return self._fetch_from_jd(barcode)
        elif self.api_provider == 'taobao':
            return self._fetch_from_taobao(barcode)
        else:
            return self._mock_product_data(barcode)

    def _fetch_from_jd(self, barcode: str) -> Optional[Dict[str, Any]]:
        """从京东API获取商品信息（待配置）"""
        try:
            config = self.api_config['jd']
            if not config['app_key']:
                return self._mock_product_data(barcode)

            # TODO: 实现京东API调用
            # 参考文档：https://union.jd.com/helpcenter
            params = {
                'method': 'jd.union.open.goods.query',
                'app_key': config['app_key'],
                'barcode': barcode
            }

            response = requests.get(config['api_url'], params=params, timeout=5)
            data = response.json()

            return self._parse_jd_response(data)
        except Exception as e:
            print(f"JD API Error: {e}")
            return self._mock_product_data(barcode)

    def _fetch_from_taobao(self, barcode: str) -> Optional[Dict[str, Any]]:
        """从淘宝API获取商品信息（待配置）"""
        try:
            config = self.api_config['taobao']
            if not config['app_key']:
                return self._mock_product_data(barcode)

            # TODO: 实现淘宝API调用
            params = {
                'method': 'taobao.item.get',
                'app_key': config['app_key'],
                'barcode': barcode
            }

            response = requests.get(config['api_url'], params=params, timeout=5)
            data = response.json()

            return self._parse_taobao_response(data)
        except Exception as e:
            print(f"Taobao API Error: {e}")
            return self._mock_product_data(barcode)

    def _parse_jd_response(self, data: Dict) -> Dict[str, Any]:
        """解析京东API响应"""
        return {
            'product_name': data.get('goodsName', ''),
            'brand': data.get('brandName', ''),
            'model': data.get('model', ''),
            'specification': data.get('specification', ''),
            'main_image': data.get('imageInfo', {}).get('mainImage', '')
        }

    def _parse_taobao_response(self, data: Dict) -> Dict[str, Any]:
        """解析淘宝API响应"""
        return {
            'product_name': data.get('title', ''),
            'brand': data.get('brand', ''),
            'model': '',
            'specification': data.get('props', ''),
            'main_image': data.get('pic_url', '')
        }

    def _mock_product_data(self, barcode: str) -> Dict[str, Any]:
        """Mock商品数据（用于测试）"""
        mock_data = {
            '6901234567890': {
                'product_name': 'iPhone 15 Pro Max 256GB',
                'brand': 'Apple',
                'model': 'A2849',
                'specification': '256GB / 钛金属原色',
                'main_image': 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-9inch-naturaltitanium?wid=400'
            },
            '6901234567891': {
                'product_name': '小米14 Ultra 5G智能手机',
                'brand': 'Xiaomi',
                'model': '24031PN0DC',
                'specification': '16GB+512GB / 龙晶蓝',
                'main_image': 'https://cdn.cnbj0.fds.api.mi-img.com/b2c-shopapi-pms/pms_1707387883.66991030.jpg'
            },
            '6901234567892': {
                'product_name': '戴森V12 Detect Slim Fluffy吸尘器',
                'brand': 'Dyson',
                'model': 'V12 Detect Slim',
                'specification': '激光探测 / 软绒滚筒吸头',
                'main_image': 'https://images.dyson.com/dyson/images/us/product-images/vacuum-cleaners/slim/mainsite/assemblies/hero/hero.jpg'
            }
        }
        return mock_data.get(barcode, {
            'product_name': f'商品 {barcode}',
            'brand': '未知品牌',
            'model': '',
            'specification': '',
            'main_image': ''
        })
