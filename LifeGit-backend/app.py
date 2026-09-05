# app.py
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import json
import os
import uuid
from utils.db import execute_query, execute_insert, execute_update
from services.product_api_service import ProductAPIService
from services.nlp_service import NLPService
from services.event_service import EventSchemaService, EventType
from services.file_service import FileService
from services.auth_service import AuthService, login_required

app = Flask(__name__)

# 配置文件上传
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max upload

product_api = ProductAPIService(api_provider='mock')
nlp_service = NLPService(api_provider='local')
file_service = FileService(upload_folder=UPLOAD_FOLDER)


def extract_image_url(value):
    """从上传接口返回的dict中提取url字符串，兼容直接传字符串的情况"""
    if isinstance(value, dict):
        return value.get('url', '')
    return value or ''


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'code': 0, 'message': 'ok'})


# ==================== 认证相关API ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """注册"""
    try:
        data = request.json
        phone = data.get('phone', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        nickname = data.get('nickname', '').strip()

        if not password or len(password) < 6:
            return jsonify({'code': 400, 'message': '密码至少6位'})
        if not phone and not email:
            return jsonify({'code': 400, 'message': '手机号或邮箱至少填一项'})

        # 检查重复
        if phone:
            exists = execute_query("SELECT id FROM user WHERE phone = %s", (phone,))
            if exists:
                return jsonify({'code': 400, 'message': '手机号已注册'})
        if email:
            exists = execute_query("SELECT id FROM user WHERE email = %s", (email,))
            if exists:
                return jsonify({'code': 400, 'message': '邮箱已注册'})

        password_hash = AuthService.hash_password(password)
        openid = f"local_{uuid.uuid4().hex[:32]}"

        sql = """
            INSERT INTO user (openid, phone, email, password_hash, nickname, status)
            VALUES (%s, %s, %s, %s, %s, 'active')
        """
        user_id = execute_insert(sql, (
            openid,
            phone or None,
            email or None,
            password_hash,
            nickname or f'用户{phone or email}'
        ))

        token = AuthService.generate_token(user_id)

        return jsonify({
            'code': 0,
            'message': '注册成功',
            'data': {
                'user_id': user_id,
                'token': token,
                'nickname': nickname or f'用户{phone or email}'
            }
        })
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/auth/login', methods=['POST'])
def login():
    """登录（支持手机号/邮箱）"""
    try:
        data = request.json
        account = data.get('account', '').strip()
        password = data.get('password', '')

        if not account or not password:
            return jsonify({'code': 400, 'message': '请输入账号和密码'})

        # 按手机号或邮箱查找
        sql = "SELECT id, password_hash, nickname, avatar, status FROM user WHERE phone = %s OR email = %s"
        users = execute_query(sql, (account, account))

        if not users:
            return jsonify({'code': 400, 'message': '账号不存在'})

        user = users[0]

        if user['status'] == 'disabled':
            return jsonify({'code': 403, 'message': '账号已被禁用'})

        if not AuthService.verify_password(password, user['password_hash']):
            return jsonify({'code': 400, 'message': '密码错误'})

        # 更新登录时间
        execute_update("UPDATE user SET last_login_time = NOW() WHERE id = %s", (user['id'],))

        token = AuthService.generate_token(user['id'])

        return jsonify({
            'code': 0,
            'message': '登录成功',
            'data': {
                'user_id': user['id'],
                'token': token,
                'nickname': user['nickname'],
                'avatar': user['avatar']
            }
        })
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/auth/profile', methods=['GET'])
@login_required
def get_profile():
    """获取当前用户信息"""
    try:
        user_id = request.current_user_id
        sql = "SELECT id, phone, email, nickname, avatar, create_time, last_login_time FROM user WHERE id = %s"
        result = execute_query(sql, (user_id,))

        if not result:
            return jsonify({'code': 404, 'message': '用户不存在'})

        return jsonify({'code': 0, 'data': result[0]})
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/auth/profile', methods=['PUT'])
@login_required
def update_profile():
    """更新用户信息"""
    try:
        data = request.json
        user_id = request.current_user_id
        nickname = data.get('nickname')
        avatar = data.get('avatar')

        updates = []
        params = []
        if nickname:
            updates.append("nickname = %s")
            params.append(nickname)
        if avatar:
            updates.append("avatar = %s")
            params.append(avatar)

        if not updates:
            return jsonify({'code': 400, 'message': '没有需要更新的内容'})

        params.append(user_id)
        execute_update(f"UPDATE user SET {', '.join(updates)} WHERE id = %s", params)

        return jsonify({'code': 0, 'message': '更新成功'})
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/auth/change_password', methods=['POST'])
@login_required
def change_password():
    """修改密码"""
    try:
        data = request.json
        user_id = request.current_user_id
        old_password = data.get('old_password', '')
        new_password = data.get('new_password', '')

        if not old_password or not new_password:
            return jsonify({'code': 400, 'message': '请输入旧密码和新密码'})
        if len(new_password) < 6:
            return jsonify({'code': 400, 'message': '新密码至少6位'})

        user = execute_query("SELECT password_hash FROM user WHERE id = %s", (user_id,))
        if not AuthService.verify_password(old_password, user[0]['password_hash']):
            return jsonify({'code': 400, 'message': '旧密码错误'})

        new_hash = AuthService.hash_password(new_password)
        execute_update("UPDATE user SET password_hash = %s WHERE id = %s", (new_hash, user_id))

        return jsonify({'code': 0, 'message': '密码修改成功'})
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


# ==================== 原有业务API ====================
# NOTE: 地点型仓库(type='place')不支持fork功能。
# fork功能在实现时必须检查仓库类型，对place类型返回错误。

@app.route('/api/repo/create', methods=['POST'])
@login_required
def create_repo():
    try:
        data = request.json
        sql = """
            INSERT INTO repo (name, type, description, cover_image, creator_id)
            VALUES (%s, %s, %s, %s, %s)
        """
        repo_id = execute_insert(sql, (
            data['name'],
            data['type'],
            data.get('description', ''),
            extract_image_url(data.get('cover_image')),
            request.current_user_id
        ))
        return jsonify({'code': 0, 'data': {'repo_id': repo_id}})
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/repo/my', methods=['GET'])
@login_required
def get_my_repos():
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 10, type=int)
        offset = (page - 1) * page_size

        sql = """
            SELECT * FROM repo
            WHERE creator_id = %s
            ORDER BY create_time DESC
            LIMIT %s OFFSET %s
        """
        repos = execute_query(sql, (request.current_user_id, page_size, offset))

        count_sql = "SELECT COUNT(*) as total FROM repo WHERE creator_id = %s"
        count_result = execute_query(count_sql, (request.current_user_id,))
        total = count_result[0]['total'] if count_result else 0

        return jsonify({
            'code': 0,
            'data': {
                'repos': repos,
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total': total,
                    'total_pages': (total + page_size - 1) // page_size
                }
            }
        })
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/repo/<int:repo_id>', methods=['GET'])
def get_repo_detail(repo_id):
    try:
        sql = "SELECT * FROM repo WHERE id = %s"
        result = execute_query(sql, (repo_id,))
        if not result:
            return jsonify({'code': 404, 'message': '仓库不存在'})

        event_sql = "SELECT * FROM event WHERE repo_id = %s ORDER BY create_time DESC"
        events = execute_query(event_sql, (repo_id,))

        return jsonify({'code': 0, 'data': {'repo': result[0], 'timeline': events}})
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/repo/<int:repo_id>', methods=['DELETE'])
@login_required
def delete_repo(repo_id):
    """删除仓库及其关联数据"""
    try:
        # 验证仓库是否存在且属于当前用户
        repo = execute_query("SELECT id, creator_id FROM repo WHERE id = %s", (repo_id,))
        if not repo:
            return jsonify({'code': 404, 'message': '仓库不存在'})
        if repo[0]['creator_id'] != request.current_user_id:
            return jsonify({'code': 403, 'message': '无权删除此仓库'})

        # 删除关联的mention（通过reply -> issue -> repo）
        reply_ids_sql = """
            SELECT r.id FROM reply r
            JOIN issue i ON r.issue_id = i.id
            WHERE i.repo_id = %s
        """
        reply_ids = execute_query(reply_ids_sql, (repo_id,))
        if reply_ids:
            rid_list = ','.join(str(r['id']) for r in reply_ids)
            execute_update(f"DELETE FROM mention WHERE reply_id IN ({rid_list})")

        # 删除关联的reply
        execute_update("""
            DELETE FROM reply WHERE issue_id IN (
                SELECT id FROM issue WHERE repo_id = %s
            )
        """, (repo_id,))

        # 删除关联的issue
        execute_update("DELETE FROM issue WHERE repo_id = %s", (repo_id,))

        # 删除关联的event
        execute_update("DELETE FROM event WHERE repo_id = %s", (repo_id,))

        # 删除仓库
        execute_update("DELETE FROM repo WHERE id = %s", (repo_id,))

        return jsonify({'code': 0, 'message': '仓库已删除'})
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/repo/scan', methods=['POST'])
def scan_create_repo():
    """路径A：扫码创仓"""
    try:
        data = request.json
        barcode = data.get('barcode')

        if not barcode:
            return jsonify({'code': 400, 'message': '缺少条形码参数'})

        product_info = product_api.get_product_by_barcode(barcode)

        if not product_info:
            return jsonify({'code': 404, 'message': '未找到该商品信息'})

        return jsonify({
            'code': 0,
            'message': '获取商品信息成功',
            'data': {
                'product_info': product_info,
                'source': 'scan'
            }
        })

    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/repo/confirm_scan', methods=['POST'])
@login_required
def confirm_scan_create():
    """确认扫码创仓（用户核对后确认创建）"""
    try:
        data = request.json
        required_fields = ['product_name', 'brand', 'main_image']

        for field in required_fields:
            if field not in data:
                return jsonify({'code': 400, 'message': f'缺少字段: {field}'})

        sql = """
            INSERT INTO repo (
                product_name, brand, model, specification, main_image,
                name, type, description, cover_image, creator_id
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        repo_id = execute_insert(sql, (
            data['product_name'],
            data['brand'],
            data.get('model', ''),
            data.get('specification', ''),
            extract_image_url(data.get('main_image')),
            data.get('name', data['product_name']),
            data.get('type', 'item'),
            data.get('description', ''),
            extract_image_url(data.get('main_image')),
            request.current_user_id
        ))

        return jsonify({
            'code': 0,
            'message': '仓库创建成功',
            'data': {'repo_id': repo_id}
        })
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/repo/nlp_analyze', methods=['POST'])
def nlp_analyze():
    """路径B：NLP语义分析"""
    try:
        data = request.json
        text = data.get('text')

        if not text:
            return jsonify({'code': 400, 'message': '缺少输入文本'})

        analysis_result = nlp_service.analyze_text(text)

        return jsonify({
            'code': 0,
            'message': '语义分析成功',
            'data': analysis_result
        })

    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/repo/confirm_nlp', methods=['POST'])
@login_required
def confirm_nlp_create():
    """确认NLP创仓（用户确认后创建）"""
    try:
        data = request.json
        required_fields = ['product_name', 'type']

        for field in required_fields:
            if field not in data:
                return jsonify({'code': 400, 'message': f'缺少字段: {field}'})

        sql = """
            INSERT INTO repo (
                product_name, brand, model, specification, main_image,
                name, type, description, cover_image, creator_id
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        repo_id = execute_insert(sql, (
            data['product_name'],
            data.get('brand', ''),
            data.get('model', ''),
            data.get('specification', ''),
            extract_image_url(data.get('main_image')),
            data.get('name', data['product_name']),
            data['type'],
            data.get('description', ''),
            extract_image_url(data.get('cover_image')),
            request.current_user_id
        ))

        return jsonify({
            'code': 0,
            'message': '仓库创建成功',
            'data': {'repo_id': repo_id}
        })
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/repo/create_manual', methods=['POST'])
@login_required
def create_manual_repo():
    """路径C：手动创仓"""
    try:
        data = request.json

        if not data:
            return jsonify({'code': 400, 'message': '请求数据不能为空'})

        repo_type = data.get('type', 'item')

        # 根据仓库类型校验必填字段
        if repo_type == 'place':
            required_fields = ['product_name']
        else:
            required_fields = ['product_name', 'brand']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'code': 400, 'message': f'缺少必填字段: {field}'})

        sql = """
            INSERT INTO repo (
                product_name, brand, model, specification, main_image,
                name, type, description, cover_image, creator_id
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        repo_id = execute_insert(sql, (
            data['product_name'],
            data.get('brand', ''),
            data.get('model', ''),
            data.get('specification', ''),
            extract_image_url(data.get('main_image')),
            data.get('name', data['product_name']),
            repo_type,
            data.get('description', ''),
            extract_image_url(data.get('main_image')),
            request.current_user_id
        ))

        return jsonify({
            'code': 0,
            'message': '手动创仓成功',
            'data': {'repo_id': repo_id}
        })
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


# ==================== 事件相关API ====================

@app.route('/api/event/types', methods=['GET'])
def get_event_types():
    """获取事件类型列表（可按仓库类型筛选）"""
    try:
        repo_type = request.args.get('repo_type')
        if repo_type:
            event_types = EventSchemaService.get_event_types_by_repo_type(repo_type)
        else:
            event_types = EventSchemaService.get_event_types()
        return jsonify({
            'code': 0,
            'data': event_types
        })
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/event/schema/<event_type>', methods=['GET'])
def get_event_schema(event_type):
    """获取指定事件类型的表单结构"""
    try:
        schema = EventSchemaService.get_event_schema_safe(event_type)
        if not schema:
            return jsonify({'code': 404, 'message': '无效的事件类型'})

        return jsonify({
            'code': 0,
            'data': schema
        })
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/event/check_confirmation', methods=['POST'])
def check_event_confirmation():
    """检查事件是否需要确认"""
    try:
        data = request.json
        event_type = data.get('event_type')
        event_data = data.get('data', {})

        if not event_type:
            return jsonify({'code': 400, 'message': '缺少事件类型'})

        # 获取确认信息
        confirmation_info = EventSchemaService.requires_confirmation(event_type, event_data)

        return jsonify({
            'code': 0,
            'data': confirmation_info
        })
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/event/create', methods=['POST'])
@login_required
def create_event():
    """创建事件"""
    try:
        data = request.json
        repo_id = data.get('repo_id')
        event_type = data.get('event_type')
        event_data = data.get('data', {})
        skip_confirmation = data.get('skip_confirmation', False)

        if not repo_id:
            return jsonify({'code': 400, 'message': '缺少仓库ID'})
        if not event_type:
            return jsonify({'code': 400, 'message': '缺少事件类型'})

        # 检查是否需要确认
        if not skip_confirmation:
            confirmation_info = EventSchemaService.requires_confirmation(event_type, event_data)
            if confirmation_info['requires']:
                return jsonify({
                    'code': 202,  # Accepted - 需要确认
                    'message': '需要确认',
                    'data': confirmation_info
                })

        # 验证仓库是否存在，并获取仓库类型
        repo_sql = "SELECT id, type FROM repo WHERE id = %s"
        repo = execute_query(repo_sql, (repo_id,))
        if not repo:
            return jsonify({'code': 404, 'message': '仓库不存在'})

        # 验证事件类型是否适用于该仓库类型
        repo_type = repo[0].get('type', 'item')
        if not EventSchemaService.validate_event_type_for_repo(event_type, repo_type):
            return jsonify({
                'code': 400,
                'message': f'事件类型 "{event_type}" 不适用于类型为 "{repo_type}" 的仓库'
            })

        # 验证事件数据
        is_valid, errors = EventSchemaService.validate_event_data(event_type, event_data)
        if not is_valid:
            return jsonify({'code': 400, 'message': '数据验证失败', 'errors': errors})

        # 格式化事件内容
        content, images = EventSchemaService.format_event_content(event_type, event_data)

        # 插入事件
        sql = """
            INSERT INTO event (repo_id, event_type, content, images, user_id)
            VALUES (%s, %s, %s, %s, %s)
        """
        event_id = execute_insert(sql, (
            repo_id,
            event_type,
            json.dumps(content, ensure_ascii=False),
            json.dumps(images, ensure_ascii=False) if images else None,
            request.current_user_id
        ))

        return jsonify({
            'code': 0,
            'message': '事件创建成功',
            'data': {'event_id': event_id}
        })
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/event/list/<int:repo_id>', methods=['GET'])
def get_event_list(repo_id):
    """获取仓库的事件列表"""
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 10, type=int)
        event_type = request.args.get('event_type')
        offset = (page - 1) * page_size

        # 验证仓库是否存在
        repo_sql = "SELECT id FROM repo WHERE id = %s"
        repo = execute_query(repo_sql, (repo_id,))
        if not repo:
            return jsonify({'code': 404, 'message': '仓库不存在'})

        # 构建查询条件
        where_conditions = ["repo_id = %s"]
        params = [repo_id]

        if event_type:
            where_conditions.append("event_type = %s")
            params.append(event_type)

        where_clause = " AND ".join(where_conditions)

        # 查询事件列表
        sql = f"""
            SELECT * FROM event
            WHERE {where_clause}
            ORDER BY create_time DESC
            LIMIT %s OFFSET %s
        """
        events = execute_query(sql, params + [page_size, offset])

        # 查询总数
        count_sql = f"SELECT COUNT(*) as total FROM event WHERE {where_clause}"
        count_result = execute_query(count_sql, params)
        total = count_result[0]['total'] if count_result else 0

        # 解析JSON字段
        for event in events:
            if event.get('content'):
                try:
                    event['content'] = json.loads(event['content'])
                except:
                    pass
            if event.get('images'):
                try:
                    event['images'] = json.loads(event['images'])
                except:
                    event['images'] = []

        return jsonify({
            'code': 0,
            'data': {
                'events': events,
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total': total,
                    'total_pages': (total + page_size - 1) // page_size
                }
            }
        })
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/event/<int:event_id>', methods=['GET'])
def get_event_detail(event_id):
    """获取事件详情"""
    try:
        sql = "SELECT * FROM event WHERE id = %s"
        result = execute_query(sql, (event_id,))

        if not result:
            return jsonify({'code': 404, 'message': '事件不存在'})

        event = result[0]

        # 解析JSON字段
        if event.get('content'):
            try:
                event['content'] = json.loads(event['content'])
            except:
                pass
        if event.get('images'):
            try:
                event['images'] = json.loads(event['images'])
            except:
                event['images'] = []

        # 获取事件类型配置
        schema = EventSchemaService.get_event_schema_safe(event['event_type'])

        return jsonify({
            'code': 0,
            'data': {
                'event': event,
                'schema': schema
            }
        })
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/event/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    """删除事件"""
    try:
        # 验证事件是否存在
        sql = "SELECT id FROM event WHERE id = %s"
        result = execute_query(sql, (event_id,))
        if not result:
            return jsonify({'code': 404, 'message': '事件不存在'})

        # 删除事件
        execute_update("DELETE FROM event WHERE id = %s", (event_id,))

        return jsonify({
            'code': 0,
            'message': '事件删除成功'
        })
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


# ==================== 文件上传API ====================

@app.route('/api/upload/image', methods=['POST'])
def upload_image():
    """上传图片"""
    try:
        if 'file' not in request.files:
            return jsonify({'code': 400, 'message': '没有上传文件'})

        file = request.files['file']

        if file.filename == '':
            return jsonify({'code': 400, 'message': '未选择文件'})

        try:
            file_info = file_service.save_image(file)
            return jsonify({
                'code': 0,
                'message': '图片上传成功',
                'data': file_info
            })
        except ValueError as e:
            return jsonify({'code': 400, 'message': str(e)})
        except Exception as e:
            return jsonify({'code': 500, 'message': f'上传失败：{str(e)}'})

    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/upload/images', methods=['POST'])
def upload_images():
    """批量上传图片"""
    try:
        if 'files' not in request.files:
            return jsonify({'code': 400, 'message': '没有上传文件'})

        files = request.files.getlist('files')

        if not files:
            return jsonify({'code': 400, 'message': '未选择文件'})

        try:
            files_info = file_service.save_files(files, file_type='image')

            # 分离成功和失败的文件
            success_files = [f for f in files_info if 'error' not in f]
            failed_files = [f for f in files_info if 'error' in f]

            response_data = {
                'success_files': success_files,
                'total_count': len(files),
                'success_count': len(success_files),
                'failed_count': len(failed_files)
            }

            if failed_files:
                response_data['failed_files'] = failed_files

            return jsonify({
                'code': 0,
                'message': f'成功上传{len(success_files)}张图片',
                'data': response_data
            })
        except Exception as e:
            return jsonify({'code': 500, 'message': f'上传失败：{str(e)}'})

    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/upload/document', methods=['POST'])
def upload_document():
    """上传文档文件（PDF等）"""
    try:
        if 'file' not in request.files:
            return jsonify({'code': 400, 'message': '没有上传文件'})

        file = request.files['file']

        if file.filename == '':
            return jsonify({'code': 400, 'message': '未选择文件'})

        # 获取允许的文件格式
        allowed_extensions = request.form.get('allowed_extensions')
        if allowed_extensions:
            allowed_extensions = allowed_extensions.split(',')

        try:
            file_info = file_service.save_document(file, allowed_extensions)
            return jsonify({
                'code': 0,
                'message': '文件上传成功',
                'data': file_info
            })
        except ValueError as e:
            return jsonify({'code': 400, 'message': str(e)})
        except Exception as e:
            return jsonify({'code': 500, 'message': f'上传失败：{str(e)}'})

    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/upload/documents', methods=['POST'])
def upload_documents():
    """批量上传文档文件"""
    try:
        if 'files' not in request.files:
            return jsonify({'code': 400, 'message': '没有上传文件'})

        files = request.files.getlist('files')

        if not files:
            return jsonify({'code': 400, 'message': '未选择文件'})

        # 获取允许的文件格式
        allowed_extensions = request.form.get('allowed_extensions')
        if allowed_extensions:
            allowed_extensions = allowed_extensions.split(',')

        try:
            files_info = file_service.save_files(files, file_type='document', allowed_extensions=allowed_extensions)

            # 分离成功和失败的文件
            success_files = [f for f in files_info if 'error' not in f]
            failed_files = [f for f in files_info if 'error' in f]

            response_data = {
                'success_files': success_files,
                'total_count': len(files),
                'success_count': len(success_files),
                'failed_count': len(failed_files)
            }

            if failed_files:
                response_data['failed_files'] = failed_files

            return jsonify({
                'code': 0,
                'message': f'成功上传{len(success_files)}个文件',
                'data': response_data
            })
        except Exception as e:
            return jsonify({'code': 500, 'message': f'上传失败：{str(e)}'})

    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/uploads/<path:filename>', methods=['GET'])
def serve_file(filename):
    """提供文件访问"""
    try:
        from flask import send_from_directory
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception:
        return jsonify({'code': 404, 'message': '文件不存在'})


# ==================== Issue 问答系统API ====================

@app.route('/api/issue/create', methods=['POST'])
@login_required
def create_issue():
    """创建Issue"""
    try:
        data = request.json
        repo_id = data.get('repo_id')
        title = data.get('title')
        content = data.get('content')

        if not all([repo_id, title, content]):
            return jsonify({'code': 400, 'message': '缺少必填字段'})

        # 验证仓库是否存在
        repo = execute_query("SELECT id FROM repo WHERE id = %s", (repo_id,))
        if not repo:
            return jsonify({'code': 404, 'message': '仓库不存在'})

        sql = """
            INSERT INTO issue (repo_id, title, content, status, creator_id)
            VALUES (%s, %s, %s, 'open', %s)
        """
        issue_id = execute_insert(sql, (repo_id, title, content, request.current_user_id))

        return jsonify({
            'code': 0,
            'message': 'Issue创建成功',
            'data': {'issue_id': issue_id}
        })
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/issue/list/<int:repo_id>', methods=['GET'])
def get_issue_list(repo_id):
    """获取仓库的Issue列表"""
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 10, type=int)
        status = request.args.get('status')
        offset = (page - 1) * page_size

        # 验证仓库是否存在
        repo = execute_query("SELECT id FROM repo WHERE id = %s", (repo_id,))
        if not repo:
            return jsonify({'code': 404, 'message': '仓库不存在'})

        where = ["i.repo_id = %s"]
        params = [repo_id]

        if status:
            where.append("i.status = %s")
            params.append(status)

        where_clause = " AND ".join(where)

        sql = f"""
            SELECT i.*, u.id as creator_uid,
                (SELECT COUNT(*) FROM reply r WHERE r.issue_id = i.id) as reply_count,
                (SELECT COUNT(*) FROM reply r WHERE r.issue_id = i.id AND r.is_best_answer = 1) as has_best_answer
            FROM issue i
            LEFT JOIN user u ON i.creator_id = u.id
            WHERE {where_clause}
            ORDER BY i.create_time DESC
            LIMIT %s OFFSET %s
        """
        issues = execute_query(sql, params + [page_size, offset])

        count_sql = f"SELECT COUNT(*) as total FROM issue i WHERE {where_clause}"
        count_result = execute_query(count_sql, params)
        total = count_result[0]['total'] if count_result else 0

        return jsonify({
            'code': 0,
            'data': {
                'issues': issues,
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total': total,
                    'total_pages': (total + page_size - 1) // page_size
                }
            }
        })
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/issue/<int:issue_id>', methods=['GET'])
def get_issue_detail(issue_id):
    """获取Issue详情（含所有回复）"""
    try:
        sql = """
            SELECT i.*, u.id as creator_uid
            FROM issue i
            LEFT JOIN user u ON i.creator_id = u.id
            WHERE i.id = %s
        """
        result = execute_query(sql, (issue_id,))
        if not result:
            return jsonify({'code': 404, 'message': 'Issue不存在'})
        issue = result[0]

        # 获取回复列表（最佳答案置顶）
        reply_sql = """
            SELECT r.*, u.id as author_uid
            FROM reply r
            LEFT JOIN user u ON r.author_id = u.id
            WHERE r.issue_id = %s
            ORDER BY r.is_best_answer DESC, r.create_time ASC
        """
        replies = execute_query(reply_sql, (issue_id,))

        return jsonify({
            'code': 0,
            'data': {
                'issue': issue,
                'replies': replies,
                'reply_count': len(replies)
            }
        })
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/issue/<int:issue_id>/status', methods=['PUT'])
def update_issue_status(issue_id):
    """更新Issue状态（开放/已解答/已关闭）"""
    try:
        data = request.json
        new_status = data.get('status')

        if new_status not in ('open', 'answered', 'closed'):
            return jsonify({'code': 400, 'message': '无效的状态值'})

        issue = execute_query("SELECT id, creator_id FROM issue WHERE id = %s", (issue_id,))
        if not issue:
            return jsonify({'code': 404, 'message': 'Issue不存在'})

        execute_query(
            "UPDATE issue SET status = %s, update_time = NOW() WHERE id = %s",
            (new_status, issue_id)
        )

        return jsonify({
            'code': 0,
            'message': f'状态已更新为{new_status}'
        })
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/issue/<int:issue_id>', methods=['DELETE'])
def delete_issue(issue_id):
    """删除Issue"""
    try:
        issue = execute_query("SELECT id FROM issue WHERE id = %s", (issue_id,))
        if not issue:
            return jsonify({'code': 404, 'message': 'Issue不存在'})

        execute_update("DELETE FROM issue WHERE id = %s", (issue_id,))

        return jsonify({'code': 0, 'message': 'Issue已删除'})
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


# ==================== Reply 回复系统API ====================

@app.route('/api/reply/create', methods=['POST'])
@login_required
def create_reply():
    """创建回复（支持@提醒）"""
    try:
        data = request.json
        issue_id = data.get('issue_id')
        content = data.get('content')
        mentioned_users = data.get('mentioned_users', [])

        if not all([issue_id, content]):
            return jsonify({'code': 400, 'message': '缺少必填字段'})

        # 验证Issue是否存在且未关闭
        issue = execute_query("SELECT id, status FROM issue WHERE id = %s", (issue_id,))
        if not issue:
            return jsonify({'code': 404, 'message': 'Issue不存在'})
        if issue[0]['status'] == 'closed':
            return jsonify({'code': 400, 'message': 'Issue已关闭，无法回复'})

        # 插入回复
        sql = """
            INSERT INTO reply (issue_id, content, author_id, is_best_answer)
            VALUES (%s, %s, %s, 0)
        """
        reply_id = execute_insert(sql, (issue_id, content, request.current_user_id))

        # 处理@提醒
        if mentioned_users:
            for uid in mentioned_users:
                execute_insert(
                    "INSERT INTO mention (reply_id, mentioned_user_id) VALUES (%s, %s)",
                    (reply_id, uid)
                )

        # 自动更新Issue状态为answered
        execute_query(
            "UPDATE issue SET status = 'answered', update_time = NOW() WHERE id = %s AND status = 'open'",
            (issue_id,)
        )

        return jsonify({
            'code': 0,
            'message': '回复成功',
            'data': {'reply_id': reply_id}
        })
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/reply/<int:reply_id>/best', methods=['PUT'])
def set_best_answer(reply_id):
    """设置最佳答案"""
    try:
        # 验证回复是否存在
        reply = execute_query("SELECT id, issue_id FROM reply WHERE id = %s", (reply_id,))
        if not reply:
            return jsonify({'code': 404, 'message': '回复不存在'})

        issue_id = reply[0]['issue_id']

        # 取消该Issue下其他最佳答案
        execute_query(
            "UPDATE reply SET is_best_answer = 0 WHERE issue_id = %s",
            (issue_id,)
        )

        # 设置当前回复为最佳答案
        execute_query(
            "UPDATE reply SET is_best_answer = 1 WHERE id = %s",
            (reply_id,)
        )

        return jsonify({
            'code': 0,
            'message': '已设置为最佳答案'
        })
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/reply/<int:reply_id>/cancel_best', methods=['PUT'])
def cancel_best_answer(reply_id):
    """取消最佳答案"""
    try:
        reply = execute_query("SELECT id FROM reply WHERE id = %s", (reply_id,))
        if not reply:
            return jsonify({'code': 404, 'message': '回复不存在'})

        execute_update("UPDATE reply SET is_best_answer = 0 WHERE id = %s", (reply_id,))
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


# ==================== @提醒 API ====================

@app.route('/api/mention/my', methods=['GET'])
@login_required
def get_my_mentions():
    """获取我的@提醒列表"""
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 20, type=int)
        offset = (page - 1) * page_size
        is_read = request.args.get('is_read')

        where = ["m.mentioned_user_id = %s"]
        params = [request.current_user_id]

        if is_read is not None:
            where.append("m.is_read = %s")
            params.append(int(is_read))

        where_clause = " AND ".join(where)

        sql = f"""
            SELECT m.id, m.is_read, m.create_time as mention_time,
                r.id as reply_id, r.content as reply_content,
                i.id as issue_id, i.title as issue_title
            FROM mention m
            JOIN reply r ON m.reply_id = r.id
            JOIN issue i ON r.issue_id = i.id
            WHERE {where_clause}
            ORDER BY m.create_time DESC
            LIMIT %s OFFSET %s
        """
        mentions = execute_query(sql, params + [page_size, offset])

        count_sql = f"SELECT COUNT(*) as total FROM mention m WHERE {where_clause}"
        count_result = execute_query(count_sql, params)
        total = count_result[0]['total'] if count_result else 0

        # 未读数
        unread_sql = "SELECT COUNT(*) as count FROM mention WHERE mentioned_user_id = %s AND is_read = 0"
        unread_result = execute_query(unread_sql, (request.current_user_id,))
        unread_count = unread_result[0]['count'] if unread_result else 0

        return jsonify({
            'code': 0,
            'data': {
                'mentions': mentions,
                'unread_count': unread_count,
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total': total,
                    'total_pages': (total + page_size - 1) // page_size
                }
            }
        })
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/mention/read/<int:mention_id>', methods=['PUT'])
@login_required
def mark_mention_read(mention_id):
    """标记@提醒为已读"""
    try:
        execute_query(
            "UPDATE mention SET is_read = 1 WHERE id = %s AND mentioned_user_id = %s",
            (mention_id, request.current_user_id)
        )
        return jsonify({'code': 0, 'message': '已标记为已读'})
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/mention/read_all', methods=['PUT'])
@login_required
def mark_all_mentions_read():
    """标记所有@提醒为已读"""
    try:
        execute_query(
            "UPDATE mention SET is_read = 1 WHERE mentioned_user_id = %s AND is_read = 0",
            (request.current_user_id,)
        )
        return jsonify({'code': 0, 'message': '已全部标记为已读'})
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


@app.route('/api/issue/<int:repo_id>/participants', methods=['GET'])
def get_repo_participants(repo_id):
    """获取仓库下有记录的用户列表（用于@提醒）"""
    try:
        sql = """
            SELECT DISTINCT e.user_id as id
            FROM event e
            WHERE e.repo_id = %s
            UNION
            SELECT DISTINCT i.creator_id as id
            FROM issue i
            WHERE i.repo_id = %s
        """
        users = execute_query(sql, (repo_id, repo_id))

        return jsonify({
            'code': 0,
            'data': users
        })
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)