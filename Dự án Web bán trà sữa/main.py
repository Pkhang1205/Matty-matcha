from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {
        "message": "Welcome to Matty Matcha API"
    }
    
from fastapi import FastAPI
from database import get_connection

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Welcome to Matty Matcha API"}

@app.get("/api/products")
def get_products():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT ma_sanpham, ten_sanpham, gia, mo_ta, hinh_anh
        FROM sanpham
        WHERE trang_thai = 1
    """)

    rows = cursor.fetchall()

    products = []

    for row in rows:
        products.append({
            "id": row[0],
            "name": row[1],
            "price": float(row[2]),
            "description": row[3],
            "image": row[4]
        })

    cursor.close()
    conn.close()

    return products