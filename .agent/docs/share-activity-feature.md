# Fitur Share Activity

## 📋 Ringkasan

Menambahkan tombol **Share** di halaman `/activity` yang memungkinkan user untuk membagikan rekap pesanan melalui WhatsApp atau menyalin link halaman activity.

**Status: ✅ SELESAI** (Diimplementasikan pada 19 Januari 2026)

---

## 🎯 Requirements

### 1. Tombol Share
- Lokasi: Di halaman `/activity`, di samping heading "Aktivitas Pesanan"
- Membuka modal/dialog dengan opsi share

### 2. Modal Share
Modal akan menampilkan:
- **Header**: "Bagikan Aktivitas Pesanan"
- **Opsi Share**:
  - 🔗 **Salin Link** - Copy URL `/activity` ke clipboard
  - 📱 **WhatsApp by Qobilah** - Direct link ke wa.me dengan teks rekap per qobilah
  - 📱 **WhatsApp by Varian** - Direct link ke wa.me dengan teks rekap per varian SKU
- **Preview teks** akan ditampilkan sebelum user klik share
- **Summary badges** menampilkan total pesanan, lunas, dan belum lunas

### 3. Data yang Di-share
- 50 data pesanan terakhir (tanpa filter search)
- Link mengarah ke: `{BASE_URL}/activity`

---

## 📝 Format Teks WhatsApp

### By Qobilah

```
📊 *REKAP PESANAN TERBARU*
🔗 Detail: https://example.com/activity
📅 Per tanggal: 19 January 2026

━━━━━━━━━━━━━━━━━━━━━━━━

📌 *QOBILAH MARIYAH* (8 pesanan)
────────────────────────
• nnn
  Modern Jaket Rayon - L, Maroon (1x) ⏳
• nnn
  Modern Jaket Rayon - M, Maroon (2x) ⏳
• Cawisono Habibi
  Modern Jaket Rayon - M, Abu-abu (1x) ⏳

📌 *QOBILAH MUZAMMAH* (2 pesanan)
────────────────────────
• anas
  Premium Sweater Rayon - M, Putih (1x) ⏳
• anas
  Premium Sweater Rayon - XXL, Navy (1x) ⏳

━━━━━━━━━━━━━━━━━━━━━━━━
Total: 50 pesanan
✅ Lunas: 11 | ⏳ Belum Lunas: 39
```

**Keterangan:**
- Dikelompokkan per Qobilah
- Menampilkan jumlah pesanan per qobilah
- List nama pemesan + produk + varian + quantity
- Status: ✅ = Lunas (paid), ⏳ = Belum Lunas (pending/unpaid)

---

### By Varian SKU

```
📊 *REKAP PESANAN BY VARIAN*
🔗 Detail: https://example.com/activity
📅 Per tanggal: 19 January 2026

━━━━━━━━━━━━━━━━━━━━━━━━

🏷️ *Modern Jaket Rayon - L, Maroon* (1 pcs)
────────────────────────
• nnn (1x) ⏳

🏷️ *Modern Jaket Rayon - M, Maroon* (2 pcs)
────────────────────────
• nnn (2x) ⏳

🏷️ *Premium Sweater Rayon - M, Putih* (1 pcs)
────────────────────────
• anas (1x) ⏳

━━━━━━━━━━━━━━━━━━━━━━━━
Total: 99 pcs dari 50 pesanan
✅ Lunas: 11 | ⏳ Belum Lunas: 39
```

**Keterangan:**
- Dikelompokkan per SKU (Produk + Varian)
- Menampilkan total quantity per SKU
- List nama pemesan + quantity + status
- Tidak menampilkan detail qobilah

---

## 🛠️ Implementasi Teknis

### Backend (Laravel)

#### 1. File: `backend/app/Http/Controllers/Api/OrderActivityController.php`

**Perubahan:**
- Menambahkan field `qobilah` ke response endpoint existing `/order-activity`
- Membuat method baru `export()` untuk endpoint `/order-activity/export`

**Endpoint Baru: `GET /api/order-activity/export`**

```php
public function export(Request $request)
{
    $items = OrderItem::with(['product', 'variants', 'order'])
        ->whereHas('order', function($q) {
            $q->where('status', '!=', 'cancelled');
        })
        ->latest()
        ->limit(50)
        ->get();

    // Map items, group by qobilah, group by variant
    // Return structured response
}
```

**Response structure:**
```json
{
  "items": [
    {
      "id": 85,
      "recipient_name": "nnn",
      "product_name": "Modern Jaket Rayon",
      "variants": "L, Maroon",
      "sku": "Modern Jaket Rayon - L, Maroon",
      "quantity": 1,
      "date": "2026-01-07 17:00",
      "status": "new",
      "qobilah": "QOBILAH MARIYAH"
    }
  ],
  "by_qobilah": [
    {
      "name": "QOBILAH MARIYAH",
      "total_orders": 8,
      "total_paid": 0,
      "total_unpaid": 8,
      "items": [...]
    }
  ],
  "by_variant": [
    {
      "sku": "Modern Jaket Rayon - L, Maroon",
      "total_quantity": 1,
      "total_orders": 1,
      "total_paid": 0,
      "total_unpaid": 1,
      "items": [...]
    }
  ],
  "summary": {
    "total_orders": 50,
    "total_paid": 11,
    "total_unpaid": 39,
    "total_quantity": 99,
    "export_date": "19 January 2026"
  }
}
```

#### 2. File: `backend/routes/api.php`

**Perubahan:**
```php
Route::get('/order-activity/export', [\App\Http\Controllers\Api\OrderActivityController::class, 'export']);
Route::get('/order-activity', [\App\Http\Controllers\Api\OrderActivityController::class, 'index']);
```

> **Note:** Route `/export` harus didefinisikan sebelum route index untuk menghindari konflik routing.

---

### Frontend (React + Chakra UI)

#### 1. File Baru: `frontend/src/components/ShareActivityDrawer.tsx`

**Komponen utama dengan fitur:**
- Dialog/Modal dari Chakra UI v3
- State management untuk mode toggle (qobilah/variant)
- Fetch data dari `/order-activity/export`
- Generate teks share berdasarkan mode yang dipilih
- Copy link ke clipboard dengan toast notification
- Direct link ke WhatsApp (`wa.me/?text={encoded_text}`)

**Key Functions:**
```typescript
const generateByQobilahText = (data: ExportData): string => {
  // Generate formatted text grouped by qobilah
}

const generateByVariantText = (data: ExportData): string => {
  // Generate formatted text grouped by SKU/variant
}

const handleCopyLink = async () => {
  await navigator.clipboard.writeText(activityUrl);
  // Show toast notification
}

const handleShareWhatsApp = () => {
  const encodedText = encodeURIComponent(shareText);
  window.open(`https://wa.me/?text=${encodedText}`, '_blank');
}
```

#### 2. File: `frontend/src/pages/OrderActivity.tsx`

**Perubahan:**
- Import `ShareActivityDrawer` component
- Tambah state `isShareOpen` untuk kontrol modal
- Tambah tombol Share di header dengan icon `FiShare2`
- Render `ShareActivityDrawer` dengan props `isOpen` dan `onClose`

```tsx
<Flex justify="space-between" align="center" mb={6}>
  <Heading>Aktivitas Pesanan</Heading>
  <Button
    colorPalette="blue"
    variant="outline"
    size="sm"
    onClick={() => setIsShareOpen(true)}
  >
    <FiShare2 />
    <Text ml={2}>Share</Text>
  </Button>
</Flex>

{/* Share Drawer */}
<ShareActivityDrawer 
  isOpen={isShareOpen} 
  onClose={() => setIsShareOpen(false)} 
/>
```

---

## 📐 UI Screenshot

### Halaman Activity dengan Tombol Share
- Tombol "Share" berwarna biru outline di kanan atas
- Sejajar dengan heading "Aktivitas Pesanan"

### Modal Share - By Qobilah
- Header: "Bagikan Aktivitas Pesanan"
- Toggle button: "By Qobilah" (active/blue) | "By Varian"
- Summary badges: "50 Pesanan" | "11 Lunas" | "39 Belum Lunas"
- Preview textarea dengan teks terformat
- Footer buttons: "Salin Link" | "Bagikan via WhatsApp" (green)

### Modal Share - By Varian
- Toggle button: "By Qobilah" | "By Varian" (active/blue)
- Preview textarea menampilkan teks grouped by SKU

---

## ✅ Checklist Implementasi

### Backend
- [x] Modifikasi `OrderActivityController.php`:
  - [x] Tambah field `qobilah` ke response existing endpoint
  - [x] Buat endpoint baru `GET /order-activity/export` untuk data share
- [x] Tambah route di `routes/api.php`

### Frontend
- [x] Buat komponen `ShareActivityDrawer.tsx`
  - [x] UI Dialog dengan preview teks
  - [x] Fungsi generate teks by Qobilah
  - [x] Fungsi generate teks by Varian
  - [x] Tombol salin link dengan toast notification
  - [x] Tombol share WhatsApp (wa.me)
- [x] Modifikasi `OrderActivity.tsx`
  - [x] Tambah tombol Share
  - [x] Integrate ShareActivityDrawer

### Testing
- [x] Test copy link functionality ✅
- [x] Test WhatsApp share (by Qobilah) ✅
- [x] Test WhatsApp share (by Varian) ✅
- [x] Test format teks di WhatsApp actual ✅
- [x] Test responsive (mobile & desktop) ✅

---

## � Files Changed

| File | Perubahan |
|------|-----------|
| `backend/app/Http/Controllers/Api/OrderActivityController.php` | Tambah field qobilah + endpoint export |
| `backend/routes/api.php` | Tambah route /order-activity/export |
| `frontend/src/components/ShareActivityDrawer.tsx` | **NEW** - Komponen share modal |
| `frontend/src/pages/OrderActivity.tsx` | Tambah tombol Share + integrasi modal |

---

## �📚 Referensi

- WhatsApp Share URL: `https://wa.me/?text={encoded_text}`
- Chakra UI Dialog v3: https://www.chakra-ui.com/docs/components/dialog
- Clipboard API: `navigator.clipboard.writeText()`

---

## 📅 Timeline

| Task | Estimasi | Aktual |
|------|----------|--------|
| Backend: Modifikasi endpoint | 15 menit | ✅ 10 menit |
| Frontend: ShareActivityDrawer | 45 menit | ✅ 30 menit |
| Frontend: Integrasi | 15 menit | ✅ 10 menit |
| Testing & Polish | 15 menit | ✅ 15 menit |
| **Total** | **~1.5 jam** | **~1 jam** |

---

*Dokumen ini dibuat pada: 19 Januari 2026*
*Terakhir diupdate: 19 Januari 2026 - Status: SELESAI*
