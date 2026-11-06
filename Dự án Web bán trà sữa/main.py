from fastapi import FastAPI, HTTPException
from database import get_connection
from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

class OrderItem(BaseModel):
    product_id: int
    quantity: int

class Customer(BaseModel):
    name: str
    phone: str
    address: str
    note: Optional[str] = ""

class OrderData(BaseModel):
    customer: Customer
    items: List[OrderItem]
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Matty Matcha API"}

@app.get("/api/products")
def get_products():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT ma_sp, ten_sp, gia_sp, mo_ta, hinh_anh
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



@app.post("/api/orders")
def create_order(order: OrderData):

    conn = get_connection()
    cursor = conn.cursor()

    try:
        # 1. Kiểm tra danh sách sản phẩm
        if not order.items:
            raise HTTPException(
                status_code=400,
                detail="Giỏ hàng đang trống"
            )

        total = Decimal("0.00")
        order_items = []

        # 2. Kiểm tra sản phẩm và lấy giá từ SQL Server
        for item in order.items:

            if item.quantity <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="Số lượng sản phẩm không hợp lệ"
                )

            cursor.execute("""
                SELECT gia_sp
                FROM sanpham
                WHERE ma_sp = ? AND trang_thai = 1
            """, (item.product_id,))

            product = cursor.fetchone()

            if product is None:
                raise HTTPException(
                    status_code=400,
                    detail=f"Sản phẩm {item.product_id} không tồn tại hoặc đã ngừng bán"
                )

            price = Decimal(str(product[0]))
            item_total = price * item.quantity

            total += item_total

            order_items.append({
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price": price,
                "total": item_total
            })

        # 3. Tìm khách hàng bằng số điện thoại
        cursor.execute("""
            SELECT ma_khachhang
            FROM khachhang
            WHERE so_dien_thoai = ?
        """, (order.customer.phone,))

        customer = cursor.fetchone()

        if customer:
            customer_id = customer[0]

            # Cập nhật thông tin khách hàng
            cursor.execute("""
                UPDATE khachhang
                SET ho_ten = ?, dia_chi = ?
                WHERE ma_khachhang = ?
            """, (
                order.customer.name,
                order.customer.address,
                customer_id
            ))

        else:
            # Tạo khách hàng mới
            cursor.execute("""
                INSERT INTO khachhang (ho_ten, so_dien_thoai, dia_chi)
                OUTPUT INSERTED.ma_khachhang
                VALUES (?, ?, ?)
            """, (
                order.customer.name,
                order.customer.phone,
                order.customer.address
            ))

            customer_id = cursor.fetchone()[0]

        # 4. Tạo đơn hàng
        cursor.execute("""
            INSERT INTO donhang (
                ma_khachhang,
                ngay_dat,
                tong_tien,
                trang_thai,
                ghi_chu
            )
            OUTPUT INSERTED.ma_donhang
            VALUES (?, GETDATE(), ?, ?, ?)
        """, (
            customer_id,
            total,
            "Chờ xác nhận",
            order.customer.note
        ))

        order_id = cursor.fetchone()[0]

        # 5. Lưu chi tiết đơn hàng
        for item in order_items:

            cursor.execute("""
                INSERT INTO chitiet_donhang (
                    ma_donhang,
                    ma_sp,
                    so_luong,
                    don_gia,
                    tong_tien
                )
                VALUES (?, ?, ?, ?, ?)
            """, (
                order_id,
                item["product_id"],
                item["quantity"],
                item["price"],
                item["total"]
            ))

        # 6. Xác nhận lưu dữ liệu
        conn.commit()

        return {
            "message": "Đặt hàng thành công",
            "order_id": order_id,
            "total": float(total),
            "status": "Chờ xác nhận"
        }

    except HTTPException:
        conn.rollback()
        raise

    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=500,
            detail="Lỗi khi lưu đơn hàng"
        ) from e

    finally:
        cursor.close()
        conn.close()
