-- ==========================================
-- 1. MIGRASI: PEMBUATAN TABEL KUPON
-- ==========================================

-- Buat tabel coupons
CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    type ENUM('fixed', 'percent') NOT NULL,
    value DECIMAL(15, 2) NOT NULL,
    max_discount_amount DECIMAL(15, 2) NULL,
    min_purchase DECIMAL(15, 2) NULL,
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    usage_limit INT NULL,
    usage_limit_per_user INT DEFAULT 1,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Buat tabel coupon_usages
CREATE TABLE IF NOT EXISTS coupon_usages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    coupon_id BIGINT UNSIGNED NOT NULL,
    order_id BIGINT UNSIGNED NOT NULL,
    user_identifier VARCHAR(255) NOT NULL,
    discount_amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX (user_identifier),
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Modifikasi tabel orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id BIGINT UNSIGNED NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(255) NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(15, 2) DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS grand_total DECIMAL(15, 2) NULL;

-- Tambahkan foreign key ke orders (opsional, sesuaikan jika ada error duplicate)
-- ALTER TABLE orders ADD CONSTRAINT fk_orders_coupon_id FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;

-- ==========================================
-- 2. SEEDER: DATA KUPON AWAL
-- ==========================================

INSERT INTO coupons (code, description, type, value, max_discount_amount, min_purchase, start_date, end_date, usage_limit, usage_limit_per_user, is_active, created_at, updated_at)
VALUES 
('JURULADENBAM2026', 'Diskon 50% Khusus Event 2026', 'percent', 50.00, NULL, 0, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 1 YEAR), 12, 1, 1, NOW(), NOW()),
('SDRNPL', 'Diskon 50% Khusus SDRNPL', 'percent', 50.00, NULL, 0, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 1 YEAR), 2, 1, 1, NOW(), NOW());

-- ==========================================
-- 3. DATA SYNC: UPDATE ORDER LAMA
-- ==========================================

UPDATE orders 
SET grand_total = total_amount, 
    discount_amount = 0 
WHERE grand_total IS NULL;
