import jwt
import hashlib
import os
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from functools import wraps
from flask import request, jsonify


SECRET_KEY = os.environ.get('JWT_SECRET', 'lifegit_secret_key_2026_x9k2m7p4q1')
TOKEN_EXPIRE_HOURS = 72


class AuthService:

    @staticmethod
    def hash_password(password: str) -> str:
        """SHA256 + 随机盐值加密密码"""
        salt = os.urandom(16).hex()
        hashed = hashlib.sha256((salt + password).encode()).hexdigest()
        return f"{salt}${hashed}"

    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """验证密码"""
        try:
            salt, hashed = password_hash.split('$')
            return hashlib.sha256((salt + password).encode()).hexdigest() == hashed
        except ValueError:
            return False

    @staticmethod
    def generate_token(user_id: int) -> str:
        """生成JWT Token"""
        payload = {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

    @staticmethod
    def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """验证JWT Token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    @staticmethod
    def get_current_user_id() -> Optional[int]:
        """从请求头获取当前用户ID"""
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
            payload = AuthService.verify_token(token)
            if payload:
                return payload.get('user_id')
        return None


def login_required(f):
    """登录验证装饰器"""
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = AuthService.get_current_user_id()
        if not user_id:
            return jsonify({'code': 401, 'message': '请先登录'}), 401
        request.current_user_id = user_id
        return f(*args, **kwargs)
    return decorated
