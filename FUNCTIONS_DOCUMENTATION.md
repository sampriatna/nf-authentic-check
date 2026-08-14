# NF Authentic Check System - Dokumentasi Fungsi Lengkap

## Daftar Isi
1. [Authentication Functions](#authentication-functions)
2. [Product Functions](#product-functions)
3. [Authenticator Functions](#authenticator-functions)
4. [Admin Setup Functions](#admin-setup-functions)
5. [Server Actions](#server-actions)
6. [Utility Functions](#utility-functions)
7. [Types](#types)

---

## Authentication Functions

**File:** `lib/auth.ts`

### `loginAdmin(password: string): boolean`
Memverifikasi password admin dan membuat session cookie.
- **Parameter:** Password yang diinput user
- **Return:** true jika password benar, false jika salah
- **Keamanan:** Password di-convert ke lowercase dan di-trim, HTTP-only cookie dengan max age 8 jam
- **Usage:** Digunakan di `loginAction` untuk login admin

### `logoutAdmin(): void`
Menghapus session cookie admin.
- **Effect:** Menghapus cookie bernama 'admin-session'
- **Usage:** Dipanggil saat user klik logout di admin dashboard

### `isAdminLoggedIn(): boolean`
Mengecek apakah user saat ini sudah login.
- **Return:** true jika session cookie aktif, false jika tidak
- **Usage:** Digunakan di middleware untuk proteksi route /admin

---

## Product Functions

**File:** `lib/products.ts`

### `verifyProduct(serialNumber: string, pinCode: string): Promise<CheckResult>`
Memverifikasi produk berdasarkan serial number dan PIN.
- **Parameter:**
  - `serialNumber`: Serial produk (e.g., "NF-2026-0007")
  - `pinCode`: PIN produk
- **Return:**
  ```typescript
  {
    result: "first_scan" | "repeat_scan" | "invalid",
    message: string,
    product: Product | null
  }
  ```
- **Logic:**
  - Cari produk di database berdasarkan serial number
  - Validasi PIN cocok dengan database
  - Jika valid: increment scan_count, update timestamp
  - Jika repeat scan: set message berbeda
  - Log semua attempt di verification_logs table
- **Usage:** Core function untuk public verification portal

### `createProduct(input: ProductInput): Promise<void>`
Menambah satu produk baru ke database.
- **Parameter:** ProductInput object dengan serial, PIN, nama, batch
- **Effect:** Insert ke products table
- **Usage:** Digunakan di admin form "Tambah Produk"

### `importProducts(inputs: ProductInput[]): Promise<void>`
Import bulk produk dari CSV.
- **Parameter:** Array of ProductInput
- **Effect:** UPSERT ke products table (update jika serial sudah ada)
- **Usage:** Digunakan di admin CSV import feature

### `getProducts(): Promise<Product[]>`
Retrieve semua produk dari database.
- **Return:** Array of Product objects
- **Order:** Sorted by created_at descending (newest first)
- **Usage:** Digunakan di admin dashboard untuk display product list

### `getDashboardStats(): Promise<DashboardStats>`
Hitung statistik untuk admin dashboard.
- **Return:**
  ```typescript
  {
    totalProducts: number,
    totalScans: number,
    suspiciousCount: number,
    suspicious: Product[],
    products: Product[]
  }
  ```
- **Logic:** 
  - totalScans = sum of all scan_count
  - suspicious = products dengan scan_count > 1 (repeat scans yang banyak)
- **Usage:** Menampilkan overview statistik di admin dashboard

### `saveCustomerLead(input: CustomerLeadInput): Promise<CustomerLead>`
Menyimpan data customer yang claim ebook.
- **Parameter:** CustomerLeadInput dengan nama, WhatsApp, kota, target ikan
- **Effect:** Insert ke customer_leads table
- **Return:** CustomerLead object yang baru dibuat
- **Usage:** Digunakan di Ebook claim form setelah verifikasi produk

### `getLeadsDashboardStats(): Promise<LeadsDashboardStats>`
Hitung statistik customer leads untuk admin dashboard.
- **Return:**
  ```typescript
  {
    scansToday: number,
    scansThisMonth: number,
    topProduct: string | null,
    topCity: string | null,
    resellerCount: number,
    tokoPancingCount: number,
    pemancingMasCount: number,
    pemancingLeleCount: number
  }
  ```
- **Logic:** Query customer_leads dan authenticator_codes tables
- **Usage:** Display marketing analytics di admin

### `deleteProduct(productId: string): Promise<void>`
Menghapus produk dari database.
- **Parameter:** Product ID (UUID)
- **Effect:** DELETE dari products table
- **Usage:** Digunakan admin untuk remove suspicious codes

### `blockProduct(productId: string): Promise<void>`
Memblock produk (set status ke 'blocked').
- **Parameter:** Product ID
- **Effect:** UPDATE products table set status='blocked'
- **Usage:** Admin dapat block produk tanpa menghapus

---

## Authenticator Functions

**File:** `lib/authenticator.ts`

### `generateAuthenticatorCodes(input: AuthenticatorGenerateInput): Promise<AuthenticatorCode[]>`
Generate QR codes untuk produk authentication.
- **Parameter:**
  - `product_name`: Nama produk
  - `variant`: Varian produk
  - `batch`: Batch code
  - `quantity`: Jumlah kode (1-5000)
  - `prefix`: Prefix untuk kode (e.g., "NF" → "NF-XXXXXXXX")
- **Return:** Array of AuthenticatorCode yang dibuat
- **Logic:**
  - Generate unique codes dengan crypto.randomBytes
  - Alphabet: ABCDEFGHJKLMNPQRSTUVWXYZ23456789 (no I, L, O, 0, 1)
  - Format: PREFIX-8CHARS (e.g., "NF-ABC2JK5L")
  - Build QR URL: https://cek.nusafishing.com/cek/NF-ABC2JK5L
- **Usage:** Admin generate QR codes untuk print di packaging

### `getAuthenticatorCodes(filters?: {product?: string, batch?: string, status?: string}): Promise<AuthenticatorCode[]>`
Retrieve authenticator codes dengan optional filtering.
- **Parameter:** Optional filters untuk product_name, batch, status
- **Return:** Array of AuthenticatorCode
- **Order:** Sorted by created_at descending
- **Usage:** Admin view generated codes history

### `checkAuthenticatorCode(uniqueCode: string): Promise<AuthenticatorCheckResult>`
Verify QR code when scanned by user.
- **Parameter:** Unique code dari QR (encoded)
- **Return:**
  ```typescript
  {
    result: "valid_first" | "valid_repeat" | "invalid",
    message: string,
    code: AuthenticatorCode | null
  }
  ```
- **Logic:**
  - Decode dan uppercase code
  - Lookup di authenticator_codes table
  - Log semua attempts di authenticator_logs
  - Update scan_count dan last_scanned_at
- **Usage:** Backend untuk public check portal

### `getPublicBaseUrl(): string`
Get base URL untuk public check portal.
- **Return:** Base URL (default: "https://cek.nusafishing.com")
- **Fallback:** Dari NEXT_PUBLIC_PUBLIC_CHECK_BASE_URL atau NEXT_PUBLIC_APP_URL
- **Usage:** Build full check URLs

### `buildCheckUrl(uniqueCode: string): string`
Build full URL untuk QR code.
- **Parameter:** Unique code
- **Return:** Full URL (e.g., "https://cek.nusafishing.com/cek/NF-ABC2JK5L")
- **Usage:** Generate QR code URLs

### `normalizePrefix(prefix: string): string`
Normalize prefix untuk authenticator code generation.
- **Logic:**
  - Trim, uppercase
  - Remove special chars, replace dengan dash
  - Max 24 chars
  - Remove leading/trailing dashes
- **Example:** "nf 2024" → "NF-2024"
- **Usage:** Validate user input sebelum generate codes

---

## Admin Setup Functions

**File:** `lib/admin-setup.ts`

### `createAdminUser(username: string, password: string, email?: string): Promise<{success: boolean, data?: any, error?: string}>`
Create admin user dengan hashed password.
- **Parameter:** Username, password, optional email
- **Effect:** Insert ke admin_users table dengan bcrypt-hashed password
- **Usage:** Setup multiple admin users (untuk future enhancement)

### `getAdminUsers(): Promise<{success: boolean, data?: AdminUser[], error?: string}>`
Retrieve semua admin users.
- **Return:** List admin users (tanpa password_hash)
- **Usage:** Manage admin accounts

### `deleteAdminUser(id: string): Promise<{success: boolean, error?: string}>`
Delete admin user.
- **Parameter:** Admin user ID
- **Usage:** Revoke admin access

### `updateAdminPassword(id: string, newPassword: string): Promise<{success: boolean, error?: string}>`
Update password admin user.
- **Parameter:** Admin user ID, new password
- **Effect:** Hash password dengan bcrypt sebelum update
- **Usage:** Change password untuk admin user

---

## Server Actions

**File:** `app/actions.ts`

### `checkProductAction(_prevState: CheckResult | null, formData: FormData): Promise<CheckResult>`
Server action untuk form submit di public check portal.
- **Parameter:** FormData dengan serial_number dan pin_code
- **Return:** CheckResult object
- **Validation:** Check both fields required
- **Usage:** useActionState hook di public check form

### `loginAction(_prevState: FormState, formData: FormData): Promise<FormState>`
Server action untuk admin login.
- **Parameter:** FormData dengan password
- **Effect:** Jika valid, redirect ke /admin
- **Return:** Error message jika password salah
- **Usage:** useFormState hook di login form

### `logoutAction(): Promise<void>`
Server action untuk admin logout.
- **Effect:** Delete session cookie, redirect ke /admin/login
- **Usage:** Logout button di admin dashboard

### `addProductAction(_prevState: FormState, formData: FormData): Promise<FormState>`
Server action untuk tambah produk single.
- **Parameter:** FormData dengan serial, PIN, nama, batch, tanggal, catatan
- **Validation:** serial, PIN, nama, batch wajib diisi
- **Effect:** Create product + revalidate /admin cache
- **Usage:** Add product form

### `importCsvAction(_prevState: FormState, formData: FormData): Promise<FormState>`
Server action untuk import CSV products.
- **Parameter:** CSV string dengan header: serial_number, pin_code, product_name, batch_code, production_date, expired_date, status, note
- **Logic:** Parse CSV dengan quote handling, validate required fields
- **Effect:** Import products + revalidate cache
- **Usage:** CSV import feature

### `generateAuthenticatorCodesAction(_prevState: FormState, formData: FormData): Promise<FormState>`
Server action untuk generate QR codes.
- **Parameter:** FormData dengan product_name, variant, batch, quantity (1-5000), prefix
- **Validation:** All required fields, quantity 1-5000
- **Effect:** Generate codes + revalidate /admin/authenticator
- **Usage:** QR generator form

### `saveCustomerLeadAction(_prevState: FormState, formData: FormData): Promise<FormState>`
Server action untuk save ebook lead.
- **Parameter:** FormData dengan product_code, nama, WhatsApp, kota, target ikan
- **Validation:** All fields required, WhatsApp format validation (10-15 digits)
- **Effect:** Save ke customer_leads table
- **Usage:** Ebook claim form setelah verifikasi

### `deleteSuspiciousProductAction(_prevState: FormState, formData: FormData): Promise<FormState>`
Server action untuk delete suspicious product.
- **Parameter:** FormData dengan product_id
- **Effect:** Delete product + revalidate /admin
- **Usage:** Delete button di suspicious codes table

### `blockSuspiciousProductAction(_prevState: FormState, formData: FormData): Promise<FormState>`
Server action untuk block suspicious product.
- **Parameter:** FormData dengan product_id
- **Effect:** Update product status ke 'blocked' + revalidate
- **Usage:** Block button di suspicious codes table

---

## Utility Functions

**File:** `lib/format.ts`

### `formatDateTime(value?: string | null): string`
Format ISO date string to readable format.
- **Format:** "29 Mei 2026, 22:53"
- **Usage:** Display timestamp di verification results

### `formatDate(value?: string | null): string`
Format ISO date string to short format.
- **Format:** "29 Mei 2026"
- **Usage:** Display production/expiry dates

### `toCsvValue(value: unknown): string`
Format value untuk CSV export.
- **Logic:** Handle quotes dan commas
- **Usage:** Export data ke CSV

---

## Types

**File:** `lib/types.ts`

### Product
```typescript
type Product = {
  id: string;
  serial_number: string;
  pin_code: string;
  product_name: string;
  batch_code: string;
  production_date: string | null;
  expired_date: string | null;
  status: string; // "active", "blocked"
  scan_count: number;
  first_scan_at: string | null;
  last_scan_at: string | null;
  first_scan_ip: string | null;
  last_scan_ip: string | null;
  note: string | null;
}
```

### CustomerLead
```typescript
type CustomerLead = {
  id: string;
  product_code: string;
  product_name: string;
  batch_code: string;
  customer_name: string;
  whatsapp: string;
  city: string;
  target_fish: string; // "Reseller", "Toko Pancing", "Ikan Mas", "Lele"
  scanned_at: string;
  created_at: string;
}
```

### AuthenticatorCode
```typescript
type AuthenticatorCode = {
  id: string;
  product_name: string;
  variant: string;
  batch: string;
  unique_code: string; // "NF-ABC2JK5L"
  qr_url: string;
  status: string; // "active"
  scan_count: number;
  first_scanned_at: string | null;
  last_scanned_at: string | null;
  production_date: string | null;
  note: string | null;
  created_at: string;
}
```

---

## Database Tables

### products
- `id` (UUID, PK)
- `serial_number` (TEXT, UNIQUE)
- `pin_code` (TEXT)
- `product_name` (TEXT)
- `batch_code` (TEXT)
- `production_date` (DATE)
- `expired_date` (DATE)
- `status` (TEXT, default 'active')
- `scan_count` (INTEGER, default 0)
- `first_scan_at` (TIMESTAMPTZ)
- `last_scan_at` (TIMESTAMPTZ)
- `first_scan_ip` (TEXT)
- `last_scan_ip` (TEXT)
- `note` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### verification_logs
- `id` (UUID, PK)
- `serial_number` (TEXT)
- `pin_input` (TEXT)
- `result` (TEXT: 'first_scan', 'repeat_scan', 'invalid')
- `scanned_at` (TIMESTAMPTZ)
- `ip_address` (TEXT)
- `user_agent` (TEXT)

### customer_leads
- `id` (UUID, PK)
- `product_code` (TEXT)
- `product_name` (TEXT)
- `batch_code` (TEXT)
- `customer_name` (TEXT)
- `whatsapp` (TEXT)
- `city` (TEXT)
- `target_fish` (TEXT)
- `scanned_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

### authenticator_codes
- `id` (UUID, PK)
- `product_name` (TEXT)
- `variant` (TEXT)
- `batch` (TEXT)
- `unique_code` (TEXT, UNIQUE)
- `qr_url` (TEXT)
- `status` (TEXT, default 'active')
- `scan_count` (INTEGER, default 0)
- `first_scanned_at` (TIMESTAMPTZ)
- `last_scanned_at` (TIMESTAMPTZ)
- `production_date` (DATE)
- `note` (TEXT)
- `created_at` (TIMESTAMPTZ)

---

## Flow Diagrams

### Public Verification Flow
```
User Input Serial + PIN
         ↓
checkProductAction() [server action]
         ↓
verifyProduct() [lib/products.ts]
         ↓
Query products table
         ↓
Validate PIN
         ↓
Update scan_count, timestamps
         ↓
Log to verification_logs
         ↓
Return CheckResult {result, message, product}
         ↓
Display result to user
         ↓
If first_scan: Show Ebook Claim Form
         ↓
saveCustomerLeadAction()
         ↓
Save to customer_leads table
```

### Admin Login Flow
```
Admin Input Password
         ↓
loginAction() [server action]
         ↓
loginAdmin() [lib/auth.ts]
         ↓
Verify password (compare with env/hardcoded)
         ↓
If valid: Create HTTP-only session cookie (8 hours)
         ↓
Redirect to /admin
         ↓
Middleware checks isAdminLoggedIn()
         ↓
If valid: Allow access to /admin pages
```

### QR Code Generation Flow
```
Admin Input: product name, variant, batch, quantity, prefix
         ↓
generateAuthenticatorCodesAction()
         ↓
generateAuthenticatorCodes() [lib/authenticator.ts]
         ↓
Generate unique codes with crypto.randomBytes
         ↓
Build QR URLs: https://cek.nusafishing.com/cek/CODE
         ↓
Insert to authenticator_codes table
         ↓
Return array of codes
         ↓
Admin can export/print QR codes
```

---

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase public key
- `SUPABASE_JWT_SECRET` or `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `ADMIN_PASSWORD`: Admin login password (optional, defaults to 'tukgumer123')
- `NEXT_PUBLIC_APP_URL`: Base URL untuk public check portal (optional)

---

## Error Handling

- Semua database operations di-wrap dalam try-catch
- Error messages di-return ke user via FormState.message
- Console.error untuk server-side logging
- 404 errors untuk invalid products
- Validation errors untuk invalid inputs

---

## Security

- Passwords hashed dengan bcrypt (10 salt rounds untuk future admin_users)
- Admin password dibandingkan dengan environment variable atau hardcoded fallback
- Session cookies: HttpOnly, SameSite=Lax, Secure in production
- All database queries parameterized (Supabase prevents SQL injection)
- PIN codes stored plain text (by design untuk verification simplicity)
- IP addresses logged untuk fraud detection

---

## Last Updated
- 30 Mei 2026
- Version: 1.0.0 Production Ready

