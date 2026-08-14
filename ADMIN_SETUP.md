# Admin Users Setup Guide - Production

## Overview
Sistem authentication admin menggunakan database Supabase dengan password hashing (bcrypt). Ini adalah solusi yang aman dan professional untuk production.

## What's New

✅ **Database-Backed Authentication**
- Password di-hash dengan bcrypt (aman, tidak bisa di-reverse)
- Multiple admin support
- Username + Password login
- Session management dengan secure cookies

✅ **Admin Management Panel**
- Tambah admin baru
- Hapus admin yang tidak perlu
- Track last login time
- Status aktif/nonaktif

✅ **Security Features**
- HTTP-only cookies (tidak bisa diakses JS)
- Secure flag (hanya HTTPS di production)
- SameSite protection (CSRF prevention)
- 8 jam session timeout
- Password hashing dengan bcrypt (10 salt rounds)

---

## Setup Steps

### 1. Create Supabase Table

Jalankan SQL query di Supabase SQL Editor:

```sql
-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index untuk faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
```

### 2. Create First Admin User

**Option A: Local/Development**
```bash
npm run setup-admin
```

Akan meminta:
- Username
- Password (minimal 8 karakter)
- Email (opsional)

**Option B: Production (Vercel)**

Buka Supabase SQL Editor dan jalankan (ganti dengan data Anda):

```sql
-- Ganti 'admin_username' dan 'password_hash' dengan data Anda
-- Password hash bisa dibuat di: https://bcrypt.online/
INSERT INTO admin_users (username, password_hash, email)
VALUES (
  'admin_username',
  '$2b$10$...generated_bcrypt_hash...',
  'admin@nusafishing.com'
);
```

Atau gunakan Node.js di local:
```bash
npm run setup-admin
```
Kemudian pastikan Supabase credentials benar di `.env.project`

### 3. Login

Buka: https://cek.nusafishing.com/admin/login

Masukkan:
- Username: (yang Anda setup)
- Password: (yang Anda setup)

---

## Admin Management Panel

**Akses:** https://cek.nusafishing.com/admin/manage

Fitur:
- ✅ Tambah admin baru
- ✅ Lihat daftar admin
- ✅ Track last login
- ✅ Hapus admin
- ✅ (Coming soon) Ubah password admin

---

## Password Requirements

**Aman untuk Production:**
- Minimal 8 karakter
- Mix huruf + angka + simbol
- Jangan gunakan yang mudah ditebak

**Contoh Password Aman:**
- `NF_AdminPortal#2024`
- `SecurePortal@NusaFishing123`
- `Admin$Nusafishing#CekKeaslian`
- `Prod@12345678NF`

---

## Environment Variables

Pastikan di `.env.project` sudah ada:
```
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... (untuk backend operations)
```

---

## Security Best Practices

✅ **DO:**
- Use strong, unique passwords
- Store passwords securely (use bcrypt, not plaintext)
- Implement session timeouts (sudah 8 jam)
- Use HTTPS only in production (sudah ada)
- Track admin login history (sudah ada)

❌ **DON'T:**
- Don't share admin credentials
- Don't use the same password as other services
- Don't log passwords in console/logs
- Don't expose admin URL publicly

---

## API Reference

### Authentication Functions

**verifyAdminPassword(username, password)**
```typescript
const admin = await verifyAdminPassword("admin_username", "password");
// Returns: { id, username, password_hash, is_active } or null
```

**loginAdmin(adminId)**
```typescript
loginAdmin(admin.id); // Sets secure session cookie
```

**isAdminLoggedIn()**
```typescript
if (isAdminLoggedIn()) {
  // Admin is logged in
}
```

**logoutAdmin()**
```typescript
logoutAdmin(); // Clears session cookies
```

### Admin Management Functions

**createAdminUser(username, password, email?)**
```typescript
const result = await createAdminUser("newadmin", "password123", "newadmin@nusafishing.com");
// Returns: { success: true, data: admin } or { success: false, error: message }
```

**getAdminUsers()**
```typescript
const result = await getAdminUsers();
// Returns: { success: true, data: admins[] } or { success: false, error: message }
```

**deleteAdminUser(id)**
```typescript
const result = await deleteAdminUser(adminId);
// Returns: { success: true } or { success: false, error: message }
```

**updateAdminPassword(id, newPassword)**
```typescript
const result = await updateAdminPassword(adminId, "newpassword123");
// Returns: { success: true } or { success: false, error: message }
```

---

## Troubleshooting

**Q: Login gagal dengan "Username atau password salah"**
A: Pastikan:
- Username dan password benar
- Admin user sudah dibuat di database
- Supabase connection string benar

**Q: Saya lupa password admin**
A: 
1. Buka Supabase SQL Editor
2. Jalankan:
```sql
-- Hapus admin lama yang terlupa
DELETE FROM admin_users WHERE username = 'admin_lama';
```
3. Buat admin baru dengan `npm run setup-admin`

**Q: Bagaimana cara update password admin yang sudah ada?**
A: Buka `/admin/manage` dan gunakan fitur "Reset Password" (coming soon)

**Q: Saya ingin enable 2FA**
A: Hubungi support untuk implementasi 2FA

---

## Migration from Old System

Jika sebelumnya pakai environment variable `ADMIN_PASSWORD`:

1. Create admin user dengan password dari env var
2. Test login di `/admin/login`
3. Remove env variable `ADMIN_PASSWORD`
4. Deploy

---

## Support

Untuk masalah atau pertanyaan, silakan hubungi tim development.
