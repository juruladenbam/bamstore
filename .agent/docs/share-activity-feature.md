# Fitur Share Activity

## 📋 Ringkasan

Menambahkan tombol **Share** di halaman `/activity` yang memungkinkan user untuk membagikan rekap pesanan melalui WhatsApp atau menyalin link halaman activity.

---

## 🎯 Requirements

### 1. Tombol Share
- Lokasi: Di halaman `/activity`, di samping search input
- Membuka modal/drawer dengan opsi share

### 2. Modal Share
Modal akan menampilkan:
- **Header**: "Bagikan Aktivitas Pesanan"
- **Opsi Share**:
  - 🔗 **Salin Link** - Copy URL `/activity` ke clipboard
  - 📱 **WhatsApp by Qobilah** - Direct link ke wa.me dengan teks rekap per qobilah
  - 📱 **WhatsApp by Varian** - Direct link ke wa.me dengan teks rekap per varian SKU
- **Preview teks** akan ditampilkan sebelum user klik share

### 3. Data yang Di-share
- 50 data pesanan terakhir (tanpa filter search)
- Link mengarah ke: `{BASE_URL}/activity`

---

## 📝 Format Teks WhatsApp

### By Qobilah

```
📊 *REKAP PESANAN TERBARU*
🔗 Detail: https://example.com/activity
📅 Per tanggal: 19 Januari 2026

━━━━━━━━━━━━━━━━━━━━━━━━

📌 *QOBILAH MARIYAH* (3 pesanan)
────────────────────────
• Budi Ahmad
  Kaos Hitam - L (2x) ✅
• Siti Aminah
  Kaos Putih - M (1x) ⏳
• Ahmad Fauzi
  Celana Jeans - 32 (1x) ✅

📌 *QOBILAH BUSYRI* (2 pesanan)
────────────────────────
• Dewi Lestari
  Hijab Pashmina - Pink (3x) ✅
• Ratna Sari
  Gamis Syari - XL (1x) ⏳

━━━━━━━━━━━━━━━━━━━━━━━━
Total: 5 pesanan
✅ Lunas: 3 | ⏳ Belum Lunas: 2
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
📅 Per tanggal: 19 Januari 2026

━━━━━━━━━━━━━━━━━━━━━━━━

🏷️ *Kaos Hitam - L* (4 pcs)
────────────────────────
• Budi Ahmad (2x) ✅
• Ahmad Fauzi (1x) ✅
• Dewi Ratna (1x) ⏳

🏷️ *Kaos Putih - M* (2 pcs)
────────────────────────
• Siti Aminah (1x) ⏳
• Rina Wati (1x) ✅

🏷️ *Hijab Pashmina - Pink* (3 pcs)
────────────────────────
• Dewi Lestari (3x) ✅

━━━━━━━━━━━━━━━━━━━━━━━━
Total: 9 pcs dari 6 pesanan
✅ Lunas: 4 | ⏳ Belum Lunas: 2
```

**Keterangan:**
- Dikelompokkan per SKU (Produk + Varian)
- Menampilkan total quantity per SKU
- List nama pemesan + quantity + status
- Tidak menampilkan detail qobilah

---

## 🛠️ Implementasi Teknis

### Backend (Laravel)

#### 1. Modifikasi `OrderActivityController.php`

Menambahkan field `qobilah` ke response dan membuat endpoint baru untuk export data lengkap:

```php
// GET /api/order-activity/export
// Returns all 50 latest items with qobilah info for sharing
```

**Response structure:**
```json
{
  "items": [
    {
      "id": 1,
      "recipient_name": "Budi Ahmad",
      "product_name": "Kaos Hitam",
      "variants": "L",
      "quantity": 2,
      "date": "2026-01-19",
      "status": "paid",
      "qobilah": "QOBILAH MARIYAH"
    }
  ],
  "summary": {
    "total_orders": 50,
    "total_paid": 35,
    "total_unpaid": 15
  },
  "share_url": "https://example.com/activity"
}
```

---

### Frontend (React + Chakra UI)

#### 1. Komponen Baru: `ShareActivityModal.tsx`

```
/frontend/src/components/ShareActivityModal.tsx
```

**Features:**
- Drawer/Modal dari Chakra UI
- Tab atau button group untuk pilih mode (By Qobilah / By Varian)
- Preview teks dalam box yang scrollable
- Tombol:
  - "Salin Link" → Copy URL ke clipboard
  - "Bagikan via WhatsApp" → Open wa.me dengan teks

#### 2. Modifikasi `OrderActivity.tsx`

- Import dan render `ShareActivityModal`
- Tambah state untuk modal open/close
- Tambah tombol Share di header

---

## 📐 UI Mockup

```
┌─────────────────────────────────────────────────────┐
│  Aktivitas Pesanan                           [Share]│
├─────────────────────────────────────────────────────┤
│  [🔍 Cari berdasarkan Nama Penerima...          ]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ... table/list data ...                            │
│                                                     │
└─────────────────────────────────────────────────────┘

// Modal saat Share diklik:

┌─────────────────────────────────────────────────────┐
│  ✕  Bagikan Aktivitas Pesanan                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [By Qobilah]  [By Varian]                          │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ 📊 *REKAP PESANAN TERBARU*                    │  │
│  │ 🔗 Detail: https://example.com/activity       │  │
│  │ 📅 Per tanggal: 19 Januari 2026               │  │
│  │                                               │  │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━                      │  │
│  │                                               │  │
│  │ 📌 *QOBILAH MARIYAH* (3 pesanan)              │  │
│  │ ────────────────────────                      │  │
│  │ • Budi Ahmad                                  │  │
│  │   Kaos Hitam - L (2x) ✅                      │  │
│  │ ...                                           │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [🔗 Salin Link]        [📱 Bagikan via WhatsApp]   │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Checklist Implementasi

### Backend
- [ ] Modifikasi `OrderActivityController.php`:
  - [ ] Tambah field `qobilah` ke response existing endpoint
  - [ ] Buat endpoint baru `GET /order-activity/export` untuk data share

### Frontend
- [ ] Buat komponen `ShareActivityModal.tsx`
  - [ ] UI Modal/Drawer dengan preview teks
  - [ ] Fungsi generate teks by Qobilah
  - [ ] Fungsi generate teks by Varian
  - [ ] Tombol salin link dengan toast notification
  - [ ] Tombol share WhatsApp (wa.me)
- [ ] Modifikasi `OrderActivity.tsx`
  - [ ] Tambah tombol Share
  - [ ] Integrate ShareActivityModal

### Testing
- [ ] Test copy link functionality
- [ ] Test WhatsApp share (by Qobilah)
- [ ] Test WhatsApp share (by Varian)
- [ ] Test format teks di WhatsApp actual
- [ ] Test responsive (mobile & desktop)

---

## 📚 Referensi

- WhatsApp Share URL: `https://wa.me/?text={encoded_text}`
- Chakra UI Drawer: https://chakra-ui.com/docs/components/drawer
- Clipboard API: `navigator.clipboard.writeText()`

---

## 📅 Timeline

| Task | Estimasi |
|------|----------|
| Backend: Modifikasi endpoint | 15 menit |
| Frontend: ShareActivityModal | 45 menit |
| Frontend: Integrasi | 15 menit |
| Testing & Polish | 15 menit |
| **Total** | **~1.5 jam** |

---

*Dokumen ini dibuat pada: 19 Januari 2026*
