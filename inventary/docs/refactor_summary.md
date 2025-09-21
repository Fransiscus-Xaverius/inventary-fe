# Refactor Summary (September 21, 2025)

## Goal
Merapikan struktur logic, mengurangi duplikasi, dan memisahkan concern antara UI, business logic, dan konfigurasi.

## Perubahan Utama

### 1. Banner Module
- Dipisahkan konstanta & schema dari `AddEditBannerModal.jsx` ke folder modular:
  - `pages/MasterBanner/banner/constants.js`
  - `pages/MasterBanner/banner/schema.js`
  - `pages/MasterBanner/banner/useBannerImage.js`
- `AddEditBannerModal.jsx` kini fokus pada:
  - Data fetch (detail banner jika edit)
  - Form handling + submit
  - Render UI
- Image handling (validasi ratio, resolusi, ukuran, preview) diekstrak ke custom hook `useBannerImage`.

### 2. API Abstraction
- Ditambahkan `src/utils/apiClient.js` berbasis Axios.
- Otomatis menambahkan header Authorization jika token tersedia.
- Terpusat pada `baseURL` dari `VITE_BACKEND_URL` (fallback ke `http://localhost:8080`).

### 3. Refactor Register Page
- Mengganti penggunaan `fetch` manual dengan `apiClient.post()`.
- Menambahkan error handling lebih robust (`err.response?.data?.message`).
- Tetap mempertahankan alur login setelah registrasi.

## Struktur Baru (Ringkas)
```
src/
  pages/
    MasterBanner/
      AddEditBannerModal.jsx
      banner/
        constants.js
        schema.js
        useBannerImage.js
  utils/
    apiClient.js
```

## Manfaat
- File modal banner lebih ringkas dan mudah dirawat.
- Validasi dan aturan file upload bisa digunakan ulang jika nanti ada modul image lain.
- API call menjadi konsisten dan mudah di-extend (misal: refresh token, global error logger).

## Rekomendasi Refactor Lanjutan
1. Product Module:
   - Pecah `AddEditProductForm.jsx` (722 lines) menjadi bagian-bagian:
     - `components/fields/` (Input kelompok: general info, pricing, metadata)
     - `hooks/useProductFormState.js` (state/transform khusus produk)
     - `hooks/useMarketplaceFields.js`, `useOfflineFields.js` untuk field array
     - `hooks/useImageUpload.js` (mirip banner)
   - Normalisasi transform data sebelum submit (mapper input ⇄ API shape).

2. useApiRequest Hook:
   - Tambah dukungan otomatis cancel token saat unmount.
   - Integrasi dengan `apiClient` agar base config konsisten.
   - Opsional: pisahkan antara `useGet` dan `useMutation` untuk kejelasan API.

3. Auth & Session:
   - Buat `authService.js` (login, register, refresh, logout) pakai `apiClient`.
   - Simpan expiry & schedule refresh token otomatis.

4. Notification System:
   - Konsolidasikan tipe notifikasi di file terpisah (`constants/notifications.js`).
   - Tambah adaptor supaya bisa swap notistack ke sistem lain jika dibutuhkan.

5. Error Handling Global:
   - Tambahkan interceptor response di `apiClient` untuk pola error umum (401 -> logout/refresh, 500 -> generic message).

6. Form Validation Konsistensi:
   - Samakan pendekatan: semua schema di folder `validation/` per modul.
   - Tambah util translator error agar UI tidak tergantung library tertentu (Joi → plain object).

7. Folder Architecture Future-proofing:
   - Potensi reorganisasi ke pattern feature-based penuh:
     ```
     src/features/
       products/
         components/
         hooks/
         api/
         validation/
       banners/
       auth/
     ```

8. Testing Awal:
   - Tambah unit test untuk `useBannerImage` (ratio, resolusi, file size rejection).
   - Snapshot test untuk `AddEditBannerModal` open vs edit mode.

## Cara Pakai apiClient
```js
import apiClient from '@/utils/apiClient';

apiClient.get('/api/example');
apiClient.post('/api/items', { name: 'Item' });
```

## Next Steps (Disarankan)
| Prioritas | Task | Estimasi |
|-----------|------|----------|
| Tinggi | Pecah AddEditProductForm | 1-2 hari |
| Sedang | Refactor useApiRequest | 0.5 hari |
| Sedang | Tambah authService | 0.5 hari |
| Rendah | Testing awal hooks | 0.5 hari |

---
Dibuat otomatis oleh tooling refactor untuk dokumentasi internal.
