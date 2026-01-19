# Proposal: Implementasi Fitur Kupon Diskon (Discount Coupon)

Dokumen ini merinci rencana implementasi fitur kupon diskon untuk **BAM Store**. Desain ini mengikuti praktik terbaik industri (industry best practices) untuk keamanan, skalabilitas, dan pengalaman pengguna (UX) yang optimal.

## 1. Arsitektur Database (Schema Design)

Kita membutuhkan tabel baru untuk menyimpan data kupon dan penyesuaian pada tabel order untuk mencatat penggunaan diskon.

### Tabel Baru: `coupons`
Menyimpan definisi kupon.

| Kolom | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `id` | BigInt (PK) | Primary Key |
| `code` | String (Unique) | Kode unik kupon (misal: `RAMADHAN2025`, `WELCOME10`). Case-insensitive. |
| `description` | String | Deskripsi singkat kupon. |
| `type` | Enum | `fixed` (potongan harga tetap) atau `percent` (persentase). |
| `value` | Decimal | Nilai potongan. Jika `percent`, misal `10` berarti 10%. Jika `fixed`, misal `10000`. |
| `max_discount_amount`| Decimal (Nullable)| Maksimal potongan (penting untuk tipe `percent`). Null jika tidak ada limit. |
| `min_purchase` | Decimal (Nullable)| Minimal total belanja agar kupon valid. |
| `start_date` | Timestamp | Waktu mulai berlaku. |
| `end_date` | Timestamp | Waktu berakhir (expired). |
| `usage_limit` | Integer (Nullable)| Batas total penggunaan kupon global (untuk kupon terbatas). |
| `usage_limit_per_user`| Integer | Batas penggunaan per user/nomor telepon. Default `1`. |
| `is_active` | Boolean | Switch manual untuk menonaktifkan kupon darurat. |
| `timestamps` | - | created_at, updated_at |

### Tabel Baru: `coupon_usages`
Mencatat riwayat penggunaan kupon untuk validasi `usage_limit_per_user`.

| Kolom | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `id` | BigInt (PK) | Primary Key |
| `coupon_id` | BigInt (FK) | Relasi ke tabel `coupons`. |
| `order_id` | BigInt (FK) | Relasi ke tabel `orders`. |
| `user_identifier` | String | User ID atau Phone Number (karena checkout bisa guest/tanpa login). |
| `discount_amount` | Decimal | Besar potongan yang didapat pada transaksi ini. |
| `created_at` | Timestamp | Waktu penggunaan. |

### Update Tabel Existing: `orders`
Menambahkan kolom untuk persistensi data finansial.

| Kolom | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `coupon_id` | BigInt (FK) | (Nullable) ID kupon yang digunakan. |
| `coupon_code` | String | (Nullable) Snapshot kode kupon (untuk history jika master data dihapus). |
| `discount_amount` | Decimal | (Default 0) Total potongan yang diberikan. |
| `grand_total` | Decimal | Nilai bersih (`total_amount` - `discount_amount`). |

---

## 2. Logika Backend (Business Logic & Security)

### A. Validasi (Security & Integrity)
Validasi kupon tidak boleh hanya di frontend. Backend **wajib** melakukan re-validasi total saat endpoint Checkout dipanggil.

**Checklist Validasi:**
1.  **Existence**: Apakah kode kupon ada di DB?
2.  **Active Status**: Apakah `is_active` true?
3.  **Time Window**: Apakah `now()` berada di antara `start_date` dan `end_date`?
4.  **Min Purchase**: Apakah subtotal keranjang >= `min_purchase`?
5.  **Global Usage Limit**: Apakah jumlah di `coupon_usages` < `usage_limit`?
6.  **User Usage Limit**: Apakah user/no_hp ini sudah memakai kupon ini melebihi `usage_limit_per_user`?

### B. Kalkulasi Diskon
Kalkulasi harus konsisten.
*   **Fixed**: `discount = value`
*   **Percent**: `discount = subtotal * (value / 100)`
    *   *Rule*: Jika ada `max_discount_amount` dan hasil hitungan melebihi itu, gunakan `max_discount_amount`.

### C. Race Condition Handling
Untuk kupon dengan kuota terbatas (Flash Sale), gunakan **Database Transaction** dan **Locking** (`lockForUpdate`) saat checkout untuk mencegah penggunaan melebihi kuota saat traffic tinggi.

---

## 3. Implementasi API

### 1. `POST /api/coupons/check`
Endpoint ringan untuk validasi di Frontend sebelum user klik "Place Order".

*   **Request**:
    ```json
    {
      "code": "SUPERHEMAT",
      "cart_total": 150000,
      "phone_number": "08123456789" // Untuk cek limit per user
    }
    ```
*   **Response (Success)**:
    ```json
    {
      "valid": true,
      "discount_amount": 10000,
      "final_total": 140000,
      "message": "Kupon berhasil dipasang!"
    }
    ```
*   **Response (Error)**:
    ```json
    {
      "valid": false,
      "message": "Maaf, kupon ini sudah habis."
    }
    ```

### 2. Update `POST /api/checkout`
Modifikasi controller checkout yang ada.

*   **Request**: Tambahkan field `coupon_code` (optional).
*   **Process**:
    1.  Mulai DB Transaction.
    2.  Hitung ulang subtotal item (security standard).
    3.  Jika ada `coupon_code`, jalankan fungsi validasi full.
    4.  Hitung `grand_total`.
    5.  Simpan `Order`.
    6.  Simpan `CouponUsage`.
    7.  Commit Transaction.

---

## 4. UI/UX Plan (Frontend)

### Halaman Cart / Checkout
1.  **Input Field**: Tambahkan input text "Kode Kupon" dekat ringkasan pembayaran.
2.  **Feedback**:
    *   Tombol "Apply".
    *   Loading state saat validasi ke server.
    *   **Success**: Tampilkan badge hijau, dan baris "Diskon: -Rp XX.XXX" di ringkasan harga.
    *   **Error**: Pesan merah yang jelas (misal: "Minimal belanja Rp 50rb").
3.  **Auto-remove**: Jika user mengubah isi keranjang sehingga total turun di bawah `min_purchase`, otomatis hapus kupon atau beri peringatan.

---

## 5. Rencana Kerja (Implementation Steps)

### Phase 1: Database & Backend Foundation
1.  **Schema Migration**:
    *   Buat migration `create_coupons_table` dengan field lengkap (code, type, limits, dates).
    *   Buat migration `create_coupon_usages_table` untuk tracking penggunaan.
    *   Add column `coupon_id`, `coupon_code`, `discount_amount` ke tabel `orders`.
2.  **Models & Relations**:
    *   Setup model `Coupon` (fillable, casts, scopes).
    *   Setup model `CouponUsage`.
    *   Update relation di model `Order` (`belongsTo Coupon`).

### Phase 2: Core Logic (Service Layer)
3.  **CouponService Implementation**:
    *   Method `validate(code, cartValue, userId)`: Cek exist, active, date range, min purchase, quota global, quota user.
    *   Method `calculate(coupon, cartValue)`: Logic `fixed` vs `percent` (dengan cap `max_discount`).
    *   Standardize Exception handling untuk error message yang jelas (e.g. `CouponExpiredException`).

### Phase 3: API Development
4.  **Checkout Controller**:
    *   Integrasi `CouponService` ke `CheckoutController@store`.
    *   Implement DB lock (`lockForUpdate`) pada record coupon saat checkout final.
    *   Insert record ke `coupon_usages` setelah order berhasil dibuat.
5.  **Check Endpoint**:
    *   Buat endpoint `POST /api/check-coupon` untuk validasi ringan di frontend (tanpa mengurangi quota).

### Phase 4: Frontend Implementation
6.  **UI Component**:
    *   Buat komponen `CouponInput` di halaman Checkout.
    *   State management untuk menyimpan applied coupon & discount amount.
7.  **Integration**:
    *   Hit endpoint check saat user apply.
    *   Tampilkan error message spesifik jika gagal.
    *   Kirim `coupon_code` saat submit order.

### Phase 5: Admin Reporting & Dashboard Adjustments
8.  **Dashboard Analytics**:
    *   Update `DashboardController` untuk menggunakan `grand_total` saat menghitung total pendapatan (Revenue).
    *   Update grafik penjualan agar mencerminkan angka riil (`grand_total`).
9.  **Financial Reports**:
    *   Update `FinancialReportController` untuk menyertakan `total_discount`.
    *   Pastikan `Gross Profit` dihitung berdasarkan `Net Sales` (`grand_total`) dikurangi COGS.
    *   Tambahkan kolom rincian diskon pada daftar transaksi di laporan keuangan.
10. **Admin UI Updates**:
    *   Tampilkan informasi kupon dan diskon pada detail order di sisi Admin.

---

## 6. User Stories & Acceptance Criteria (AC)

### Story 1: Admin Mengelola Kupon (Backend Direct/Seeder first)
**As an** Admin,
**I want to** membuat berbagai jenis kupon (potongan tetap atau persen),
**So that** saya bisa mengadakan promosi marketing.

*   **AC 1**: Admin bisa set `code`, `start_date`, `end_date`.
*   **AC 2**: Admin bisa pilih tipe `fixed` (misal Rp 10rb) atau `percent` (misal 10%).
*   **AC 3**: Untuk tipe `percent`, admin bisa set `max_discount` (misal Max Rp 50rb).
*   **AC 4**: Admin bisa batasi kuota global (misal 100 orang pertama).

### Story 2: User Menggunakan Kupon Valid
**As a** Customer,
**I want to** memasukkan kode kupon saat checkout,
**So that** saya mendapatkan harga lebih murah.

*   **AC 1**: User bisa input kode di field tersedia.
*   **AC 2**: Jika valid, "Total Bayar" berkurang sesuai nominal diskon.
*   **AC 3**: Muncul feedback visual hijau "Kupon [CODE] berhasil terpasang -Rp XX.XXX".

### Story 3: Validasi Validitas Kupon
**As a** Customer,
**I want to** segera tahu jika kupon saya tidak bisa dipakai,
**So that** saya tidak bingung kenapa harga tidak berubah.

*   **AC 1**: Error message muncul jika:
    *   Kode salah/typo ("Kupon tidak ditemukan").
    *   Belum mulai atau sudah expired ("Kupon tidak aktif").
    *   Total belanja kurang dari `min_purchase` ("Min. belanja Rp 100rb").
    *   Kuota habis ("Kuota kupon ini sudah habis").
    *   User sudah pernah pakai ("Anda sudah menggunakan kupon ini").

### Story 4: Perlindungan Kuota (Race Condition)
**As a** System Owner,
**I want to** memastikan jumlah pemakaian tidak melebihi kuota saat traffic tinggi,
**So that** perusahaan tidak rugi.

*   **AC 1**: Jika sisa kuota 1, dan ada 2 user checkout bersamaan, hanya 1 yang berhasil proceed. User kedua mendapat error saat klik "Place Order".

### Story 5: History Transaksi & Laporan Keuangan
**As an** Admin,
**I want to** melihat data pendapatan yang akurat setelah dipotong diskon,
**So that** saya tidak salah dalam menghitung profit.

*   **AC 1**: Laporan keuangan menampilkan kolom `Discount` dan `Net Sales`.
*   **AC 2**: Profit dihitung dari `Net Sales (grand_total)` - `COGS`.
*   **AC 3**: Dashboard Admin menggunakan `grand_total` untuk metrics "Total Revenue".

---

## 7. Implementation Guidelines (Do's and Don'ts)

### Do's (Best Practices)
*   **Do Use Dependency Injection**: Gunakan `CouponService` yang di-inject ke controller, jangan tulis logic di controller/model.
*   **Do Handle Errors Gracefully**: Gunakan custom exception (e.g., `CouponException`) dan tangkap di controller untuk mengembalikan pesan user-friendly (400/422), bukan 500 Server Error.
*   **Do Use Database Transactions**: Bungkus logic validasi final dan insert order dalam `DB::transaction` untuk integritas data.
*   **Do Use Decimal Data Types**: Selalu gunakan `decimal` (bukan float) untuk nilai uang di database dan perhitungan PHP.
*   **Do Validate Everything on Backend**: Asumsikan semua input dari frontend adalah tidak aman/manipulatif.
*   **Do Use Grand Total for Accounting**: Selalu gunakan `grand_total` untuk semua laporan keuangan dan dashboard agar angka mencerminkan uang kas riil.

### Don'ts (Common Pitfalls)
*   **Don't Trust Client Calculations**: Jangan terima `discount_amount` dari request frontend. Hitung ulang di backend berdasarkan kode kupon.
*   **Don't Hardcode Rules**: Hindari `if ($code == 'LEBARAN')`. Semua rule harus berbasis data di database.
*   **Don't Use Floating Point Math**: Hindari `0.1 + 0.2` problem. Gunakan library money atau integer cents jika memungkinkan, atau hati-hati dengan rounding.
*   **Don't Ignore Concurrency**: Jangan validasi kuota hanya dengan `if ($quota > 0)`. Gunakan `lockForUpdate()` saat checkout final.
*   **Don't Expose Sensitive Data**: Jangan return seluruh object Coupon di API response jika ada field internal yang tidak perlu dilihat user. Cukup return info publik (code, description, discount amount).

---

## 8. Penyesuaian Laporan Keuangan & Dashboard

### Dashboard Stats (`DashboardController`)
*   **Metrics Update**: Mengubah semua kalkulasi agregat (SUM) yang sebelumnya menggunakan `total_amount` menjadi `grand_total`.
*   **Sales Chart**: Grafik harian/bulanan harus menggunakan `grand_total` agar admin melihat tren uang masuk yang sebenarnya.

### Financial Reports (`FinancialReportController`)
*   **Income Items**: Setiap transaksi income harus menampilkan `total_amount` (gross), `discount_amount`, dan `amount` (net/grand_total).
*   **Summary Box**:
    *   `Gross Sales`: Sum of `total_amount`.
    *   `Total Discounts`: Sum of `discount_amount`.
    *   `Net Sales`: Sum of `grand_total`.
    *   `Gross Profit`: `Net Sales` - `Total COGS`.
*   **Integrity**: Memastikan status order yang dihitung (misal: 'paid', 'completed') konsisten antara hitungan Gross dan Net.
