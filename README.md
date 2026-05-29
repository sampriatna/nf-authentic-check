# NF Authentic Check

Aplikasi web sederhana untuk cek keaslian produk menggunakan Next.js, Tailwind CSS, dan Supabase.

## Fitur

- Halaman publik untuk cek serial number dan PIN produk.
- Status produk asli untuk scan pertama.
- Peringatan bila kode valid sudah pernah dicek sebelumnya.
- Status kode tidak valid bila serial tidak ditemukan atau PIN salah.
- Detail produk, jumlah scan, scan pertama, dan scan terakhir.
- Tombol WhatsApp admin untuk laporan produk mencurigakan.
- Login admin sederhana.
- Tambah produk, import CSV, daftar serial, kode mencurigakan, dan export laporan CSV.

## Setup

1. Buat project Supabase.
2. Jalankan SQL di `supabase/schema.sql` pada SQL Editor Supabase.
3. Salin `.env.example` menjadi `.env.local`, lalu isi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=password-admin-anda
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_WHATSAPP=6281234567890
NEXT_PUBLIC_PUBLIC_CHECK_BASE_URL=https://cek.nusafishing.com
```

4. Install dependency dan jalankan aplikasi:

```bash
npm install
npm run dev
```

5. Buka:

- Customer: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`
- Admin generator QR: `http://localhost:3000/admin/authenticator`
- Public QR check: `https://cek.nusafishing.com/cek/[unique_code]`

## Domain

Gunakan project ini hanya untuk portal cek:

- Development/testing: `https://cek-dev.nusafishing.com`
- Production checker: `https://cek.nusafishing.com`

Website utama `https://nusafishing.com` sebaiknya tetap berada di project/hosting terpisah.

## Cek Deploy

Setelah deploy, buka:

```text
https://cek-dev.nusafishing.com/api/health
```

Jika `ok: false`, perbaiki item yang ditampilkan:

- `missingEnv`: environment variable belum diisi di hosting.
- `tables`: SQL Supabase belum dijalankan atau nama tabel belum cocok.

## Format CSV Import

Gunakan header berikut:

```csv
serial_number,pin_code,product_name,batch_code,production_date,expired_date,status,note
NF-2026-0001,123456,NF Serum,BATCH-A,2026-01-10,2028-01-10,active,Sample
```

Kolom wajib: `serial_number`, `pin_code`, `product_name`, dan `batch_code`.

## Authenticator Generator

Halaman `Admin generator QR` ada di `/admin/authenticator`.

Admin dapat mengisi nama produk, varian, batch, jumlah kode, prefix kode, tanggal produksi, dan catatan. Sistem akan membuat kode random seperti `NF-GK-A7K9P2QX`, menyimpan `qr_url` dengan format `https://cek.nusafishing.com/cek/[unique_code]`, dan menyediakan:

- Filter daftar kode berdasarkan produk, batch, dan status.
- Copy link publik.
- Download QR per kode.
- Download semua QR sekaligus dalam file ZIP.
- Export semua kode ke CSV.
- Halaman label QR di `/admin/authenticator/labels` untuk cetak atau Save as PDF.

Setiap scan ke `/cek/[unique_code]` akan menambah `scan_count`, menyimpan waktu scan pertama, dan memperbarui waktu scan terakhir.

## Catatan Keamanan

Versi ini sengaja dibuat sederhana. Untuk production, sebaiknya:

- Hash `pin_code`, jangan simpan PIN mentah.
- Gunakan Supabase Auth atau provider login yang lebih kuat untuk admin.
- Tambahkan rate limiting pada endpoint cek produk.
- Ganti `NEXT_PUBLIC_ADMIN_WHATSAPP` dengan nomor WhatsApp admin resmi.
- Generator QR menggunakan kode random 8 karakter dari alfabet yang menghindari karakter rancu, dengan prefix admin dan unique constraint database untuk mencegah duplikasi.
