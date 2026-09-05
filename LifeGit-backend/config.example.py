import pymysql.cursors

# 使用方法：复制本文件为 config.py，并填入你的数据库密码
# cp config.example.py config.py

DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': '在这里填入你的MySQL密码',
    'database': 'lifegit',
    'charset': 'utf8',
    'cursorclass': pymysql.cursors.DictCursor
}
