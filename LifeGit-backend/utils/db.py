# utils/db.py
import pymysql
from config import DB_CONFIG

def get_connection():
    return pymysql.connect(**DB_CONFIG)

def execute_query(sql, params=None):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(sql, params)
        result = cursor.fetchall()
        return result
    finally:
        cursor.close()
        conn.close()

def execute_insert(sql, params=None):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(sql, params)
        conn.commit()
        return cursor.lastrowid
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


def execute_update(sql, params=None):
    """执行UPDATE/DELETE语句并提交"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(sql, params)
        conn.commit()
        return cursor.rowcount
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()