import os
import time
import psycopg2
from psycopg2 import OperationalError

DB_HOST = os.getenv('DB_HOST', 'db')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'wellifydb')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', '123456')

def wait_for_db():
    while True:
        try:
            conn = psycopg2.connect(
                dbname=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD,
                host=DB_HOST,
                port=DB_PORT
            )
            conn.close()
            print("✅ Database is ready!")
            break
        except OperationalError:
            print("⏳ Database is not ready, waiting 2 seconds...")
            time.sleep(2)

if __name__ == '__main__':
    wait_for_db()
