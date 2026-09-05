import os
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from werkzeug.utils import secure_filename


class FileService:
    """文件上传服务"""

    # 允许的图片格式
    ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

    # 允许的文件格式
    ALLOWED_FILE_EXTENSIONS = {'pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'gif'}

    # 文件大小限制（字节）
    MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
    MAX_FILE_SIZE = 20 * 1024 * 1024   # 20MB

    def __init__(self, upload_folder: str = 'uploads'):
        """
        初始化文件服务

        Args:
            upload_folder: 文件上传目录
        """
        self.upload_folder = upload_folder
        self._ensure_upload_folders()

    def _ensure_upload_folders(self):
        """确保上传目录存在"""
        folders = [
            os.path.join(self.upload_folder, 'images'),
            os.path.join(self.upload_folder, 'documents'),
            os.path.join(self.upload_folder, 'temp')
        ]

        for folder in folders:
            os.makedirs(folder, exist_ok=True)

    def allowed_image_file(self, filename: str) -> bool:
        """检查是否为允许的图片格式"""
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in self.ALLOWED_IMAGE_EXTENSIONS

    def allowed_file(self, filename: str, allowed_extensions: set = None) -> bool:
        """
        检查是否为允许的文件格式

        Args:
            filename: 文件名
            allowed_extensions: 允许的扩展名集合
        """
        if allowed_extensions is None:
            allowed_extensions = self.ALLOWED_FILE_EXTENSIONS

        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in allowed_extensions

    def generate_unique_filename(self, original_filename: str) -> str:
        """
        生成唯一的文件名

        Args:
            original_filename: 原始文件名

        Returns:
            唯一的文件名
        """
        ext = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
        unique_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        return f"{timestamp}_{unique_id}.{ext}" if ext else f"{timestamp}_{unique_id}"

    def save_image(self, file) -> Dict[str, Any]:
        """
        保存图片文件

        Args:
            file: 文件对象

        Returns:
            包含文件信息的字典
        """
        if not file:
            raise ValueError("文件不能为空")

        if not self.allowed_image_file(file.filename):
            raise ValueError(f"不支持的图片格式，仅支持：{', '.join(self.ALLOWED_IMAGE_EXTENSIONS)}")

        # 检查文件大小
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)

        if file_size > self.MAX_IMAGE_SIZE:
            raise ValueError(f"图片大小不能超过{self.MAX_IMAGE_SIZE // (1024*1024)}MB")

        # 生成唯一文件名
        original_filename = secure_filename(file.filename)
        unique_filename = self.generate_unique_filename(original_filename)

        # 保存文件
        folder_path = os.path.join(self.upload_folder, 'images')
        file_path = os.path.join(folder_path, unique_filename)
        file.save(file_path)

        # 返回文件信息
        return {
            "name": original_filename,
            "filename": unique_filename,
            "path": file_path,
            "url": f"/uploads/images/{unique_filename}",
            "size": file_size,
            "type": "image"
        }

    def save_document(self, file, allowed_extensions: List[str] = None) -> Dict[str, Any]:
        """
        保存文档文件

        Args:
            file: 文件对象
            allowed_extensions: 允许的文件扩展名列表

        Returns:
            包含文件信息的字典
        """
        if not file:
            raise ValueError("文件不能为空")

        if allowed_extensions:
            allowed_set = set(allowed_extensions)
        else:
            allowed_set = self.ALLOWED_FILE_EXTENSIONS

        if not self.allowed_file(file.filename, allowed_set):
            raise ValueError(f"不支持的文件格式，仅支持：{', '.join(allowed_set)}")

        # 检查文件大小
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)

        if file_size > self.MAX_FILE_SIZE:
            raise ValueError(f"文件大小不能超过{self.MAX_FILE_SIZE // (1024*1024)}MB")

        # 生成唯一文件名
        original_filename = secure_filename(file.filename)
        unique_filename = self.generate_unique_filename(original_filename)

        # 保存文件
        folder_path = os.path.join(self.upload_folder, 'documents')
        file_path = os.path.join(folder_path, unique_filename)
        file.save(file_path)

        # 返回文件信息
        return {
            "name": original_filename,
            "filename": unique_filename,
            "path": file_path,
            "url": f"/uploads/documents/{unique_filename}",
            "size": file_size,
            "type": "document"
        }

    def save_files(self, files, file_type: str = 'image', allowed_extensions: List[str] = None) -> List[Dict[str, Any]]:
        """
        批量保存文件

        Args:
            files: 文件对象列表
            file_type: 文件类型 ('image' 或 'document')
            allowed_extensions: 允许的文件扩展名列表

        Returns:
            文件信息列表
        """
        result = []

        for file in files:
            try:
                if file_type == 'image':
                    file_info = self.save_image(file)
                else:
                    file_info = self.save_document(file, allowed_extensions)
                result.append(file_info)
            except Exception as e:
                # 记录错误但继续处理其他文件
                result.append({
                    "error": str(e),
                    "filename": file.filename if hasattr(file, 'filename') else 'unknown'
                })

        return result

    def delete_file(self, file_path: str) -> bool:
        """
        删除文件

        Args:
            file_path: 文件路径

        Returns:
            是否删除成功
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception as e:
            print(f"删除文件失败：{e}")
            return False

    def get_file_info(self, filename: str, file_type: str = 'image') -> Optional[Dict[str, Any]]:
        """
        获取文件信息

        Args:
            filename: 文件名
            file_type: 文件类型 ('image' 或 'document')

        Returns:
            文件信息字典
        """
        folder = 'images' if file_type == 'image' else 'documents'
        file_path = os.path.join(self.upload_folder, folder, filename)

        if not os.path.exists(file_path):
            return None

        file_stat = os.stat(file_path)

        return {
            "filename": filename,
            "path": file_path,
            "url": f"/uploads/{folder}/{filename}",
            "size": file_stat.st_size,
            "created_time": datetime.fromtimestamp(file_stat.st_ctime).isoformat(),
            "modified_time": datetime.fromtimestamp(file_stat.st_mtime).isoformat()
        }
