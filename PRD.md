# Product Requirements Document (PRD) - POS Offline V1

## 1. Ringkasan Produk

**Nama Aplikasi:** POS Offline Sederhana (V1)
**Platform:** Android / iOS (React Native - Expo)
**Bahasa:** JavaScript (JSX) - _Tidak menggunakan TSX/TypeScript_
**Konektivitas:** 100% Offline (Local Storage)
**Tujuan:** Menyediakan sistem kasir dasar untuk mencatat barang dan memproses penjualan tanpa memerlukan koneksi internet, dengan alur yang disederhanakan untuk versi pertama.

## 2. Spesifikasi Teknologi Inti

- **Framework:** React Native (Expo dengan template JavaScript/JSX).
- **Styling:** React Native StyleSheet API (Clean, modular, & lightweight design system).
- **Navigation:** Expo Router (File-based routing di dalam folder `app/`).
- **Database:** SQLite (`expo-sqlite`).
- **Hardware Access:** `expo-camera` (untuk scan barcode via kamera HP dan foto bukti QRIS), `expo-image-picker` (untuk upload foto produk lokal).
- **Ekspor Struk:** `expo-print` (untuk generate PDF) dan `expo-sharing` (untuk share PDF ke WhatsApp).

---

## 3. Skema Database (SQLite)

Tabel sangat minimalis, membuang kolom stok sesuai kebutuhan V1.

**Tabel: `products`**

- `id` (INTEGER, Primary Key, Auto Increment)
- `nama` (TEXT)
- `kategori` (TEXT)
- `harga` (REAL / INTEGER)
- `foto` (TEXT - menyimpan local URI path gambar)
- `barcode` (TEXT - menyimpan angka/kode unik barcode)

_(Catatan: V1 tidak memerlukan manajemen stok, sehingga tabel fokus pada master data barang saja)_

---

## 4. Fase Eksekusi Pengerjaan (Untuk AI Agent)

Instruksikan AI Agent untuk mengerjakan per fase guna menghindari _context window overload_.

### Fase 1: Inisialisasi Proyek & Setup Database

**Fokus:** Membangun fondasi aplikasi berbasis JSX, navigasi Expo Router, dan koneksi ke SQLite.
**Tugas:**

1. Inisialisasi proyek Expo baru (wajib menggunakan template JavaScript/JSX kosong, bukan TypeScript).
2. Setup Expo Router untuk navigasi berbasis file (`app/` directory) dengan Bottom Tabs ("Penjualan" dan "Kelola Barang").
3. Instalasi dan konfigurasi `expo-sqlite`.
4. Buat file konfigurasi database yang mengeksekusi pembuatan tabel `products` saat aplikasi pertama kali dimuat.
5. Bangun sistem styling terstruktur menggunakan StyleSheet API bawaan React Native.

### Fase 2: Modul Kelola Barang (CRUD Produk) Tanpa Stok

**Fokus:** Menambahkan dan melihat daftar barang.
**Tugas:**

1. **Layar Daftar Barang:** Tampilkan list barang dari tabel `products` (Nama, Harga, dan Thumbnail foto). Sediakan tombol "Tambah Barang".
2. **Layar Tambah/Edit Barang:** Buat form dengan field: Nama, Kategori, Harga. _(Tidak ada field stok)._
3. **Fitur Barcode (Kamera HP):** Tambahkan tombol "Scan Barcode". Gunakan `expo-camera` untuk membuka kamera HP, membaca barcode, dan mengisi field `barcode` secara otomatis.
4. **Fitur Foto:** Tambahkan area untuk memilih gambar dari galeri lokal (`expo-image-picker`) dan simpan URI-nya ke dalam database.
5. **Logika Simpan:** Eksekusi query `INSERT` ke SQLite dan kembali ke layar Daftar Barang.

### Fase 3: Modul Penjualan - Katalog & Keranjang

**Fokus:** Tampilan kasir dan manipulasi keranjang belanja.
**Tugas:**

1. **Layar Kasir (Katalog):** Tampilkan daftar barang (Foto, Nama, Harga).
2. **Fitur Scan Kasir (Kamera HP):** Sediakan tombol "Scan Barcode" menggunakan kamera HP di layar kasir untuk mencari produk berdasarkan barcode dan menambahkannya langsung ke keranjang.
3. **State Keranjang:** Buat state lokal untuk menyimpan item yang dipilih beserta kuantitas (`qty`).
4. **Interaksi Keranjang:**
   - Tap pada item di katalog otomatis memasukkan item ke keranjang (qty = 1).
   - Di dalam UI keranjang, `qty` bisa diubah menggunakan tombol `+` / `-`, atau diklik pada angka qty untuk diketik manual via keyboard.

### Fase 4: Modul Pembayaran (Checkout) & Bukti QRIS

**Fokus:** Proses pembayaran Tunai & QRIS dengan fitur kamera untuk foto bukti.
**Tugas:**

1. **Layar Pembayaran:** Muncul dari keranjang saat checkout, menampilkan Total Tagihan.
2. **Opsi Pembayaran:** Tab/Tombol "Tunai" dan "QRIS".
3. **Sistem Tunai:**
   - Field input manual nominal uang pelanggan.
   - Saran Uang Cepat (Misal: Uang Pas, 10.000, 20.000, 50.000, 100.000 menyesuaikan total tagihan).
   - Teks kalkulasi "Kembalian".
4. **Sistem QRIS:**
   - Menampilkan gambar statis QRIS toko (diload dari asset).
   - **Kamera Bukti Transfer:** Sediakan tombol "Ambil Foto Bukti" setelah pelanggan scan. Gunakan `expo-camera` untuk memotret layar HP pelanggan (bukti sukses transfer).
5. **Tombol Konfirmasi:** Tombol "Selesaikan Transaksi" hanya aktif jika Tunai mencukupi, atau jika metode QRIS telah memiliki minimal 1 foto bukti transfer.

### Fase 5: Ekspor PDF & Finalisasi Transaksi

**Fokus:** Layar Sukses, export struk ke PDF, dan bagikan ke WhatsApp.
**Tugas:**

1. **Layar Sukses:** Tampilkan pesan "Transaksi Berhasil" (dan kembalian jika menggunakan tunai).
2. **Cetak / Bagikan Struk:**
   - Buat tombol "Bagikan Struk (PDF)".
   - Jika dipencet, gunakan `expo-print` untuk merender rincian struk (daftar barang, jumlah, harga, total, metode bayar) menjadi file PDF menggunakan format HTML sederhana (print to PDF).
   - Setelah PDF terbuat, gunakan `expo-sharing` untuk memunculkan menu _share_ OS native, sehingga kasir bisa mengirim file PDF tersebut via WhatsApp secara manual ke nomor pelanggan.
3. **Selesai:** Tombol "Selesai" untuk mengosongkan state keranjang dan mengembalikan UI ke Layar Kasir utama (siap untuk order baru).
