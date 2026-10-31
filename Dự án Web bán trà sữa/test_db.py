from database import get_connection

try:
    conn = get_connection()
    print("Kết nối SQL Server thành công!")

    conn.close()

except Exception as e:
    print("Lỗi kết nối:", e)
    
