IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'MattyMatcha')
BEGIN
  CREATE DATABASE MattyMatcha;
END
GO

USE MattyMatcha;
GO


-- TẠO BẢNG

CREATE TABLE sanpham(
  ma_sp INT IDENTITY(1,1) PRIMARY KEY,
  ten_sp NVARCHAR(100) NOT NULL, 
  gia_sp DECIMAL(10,2) NOT NULL,
  mo_ta NVARCHAR(500),
  hinh_anh NVARCHAR(500),
  trang_thai BIT NOT NULL DEFAULT 1,

  CONSTRAINT chk_gia_sp CHECK (gia_sp >= 0),
);
GO

CREATE TABLE khachhang (
    ma_khachhang INT IDENTITY(1,1) PRIMARY KEY,
    ho_ten NVARCHAR(100) NOT NULL,
    so_dien_thoai VARCHAR(15) NOT NULL,
    dia_chi NVARCHAR(255)
);
GO

CREATE TABLE donhang (
    ma_donhang INT IDENTITY(1,1) PRIMARY KEY,
    ma_khachhang INT NOT NULL,
    ngay_dat DATETIME NOT NULL DEFAULT GETDATE(),
    tong_tien DECIMAL(12,2) NOT NULL DEFAULT 0,
    trang_thai NVARCHAR(30) NOT NULL DEFAULT N'Cho xac nhan',

    CONSTRAINT fk_donhang_khachhang FOREIGN KEY (ma_khachhang) REFERENCES khachhang(ma_khachhang),
    CONSTRAINT chk_donhang_tongtien CHECK (tong_tien >= 0)
);
GO

CREATE TABLE chitiet_donhang (
    ma_chitiet INT IDENTITY(1,1) PRIMARY KEY,
    ma_donhang INT NOT NULL,
    ma_sp INT NOT NULL,
    so_luong INT NOT NULL,
    don_gia DECIMAL(10,2) NOT NULL,

    tong_tien AS (so_luong * don_gia) PERSISTED, 

    CONSTRAINT fk_chitiet_donhang FOREIGN KEY (ma_donhang) REFERENCES donhang(ma_donhang),
    CONSTRAINT fk_chitiet_sanpham FOREIGN KEY (ma_sp) REFERENCES sanpham(ma_sp),
    CONSTRAINT chk_chitiet_soluong CHECK (so_luong > 0),
    CONSTRAINT chk_chitiet_dongia CHECK (don_gia >= 0),
    CONSTRAINT uq_donhang_sanpham UNIQUE (ma_donhang, ma_sp)
);
GO

--THÊM SẢN PHẨM 
INSERT into sanpham (ten_sp, gia_sp, mo_ta, hinh_anh)
VALUES
(N'Matcha Latte', 35000, N'Matcha kết hợp sữa tươi', 'matcha-latte.jpg'),
(N'Matcha Kem Trứng', 40000, N'Matcha kết hợp kem trứng', 'matcha-kem-trung.jpg'),
(N'Matcha Đậu Đỏ', 45000, N'Matcha kết hợp đậu đỏ', 'matcha-dau-do.jpg'),
(N'Matcha Dừa', 40000, N'Matcha kết hợp nước cốt dừa', 'matcha-dua.jpg'),
(N'Matcha Đá Xay', 45000, N'Matcha đá xay mát lạnh', 'matcha-da-xay.jpg'),
(N'Matcha Caramel', 35000, N'Matcha kết hợp với Caramel', 'matcha-caramel.jpg');
GO


