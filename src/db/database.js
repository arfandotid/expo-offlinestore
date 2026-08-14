import * as SQLite from 'expo-sqlite';

let dbInstance = null;

/**
 * Mendapatkan koneksi database SQLite yang sinkron dan aktif
 */
export function getDatabase() {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('offline_pos.db');
  }
  return dbInstance;
}

/**
 * Inisialisasi skema tabel database offline sesuai spesifikasi PRD V1
 */
export function initDatabase() {
  const db = getDatabase();

  // 1. Tabel master produk
  db.execSync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      kategori TEXT,
      harga REAL NOT NULL,
      foto TEXT,
      barcode TEXT
    );
  `);

  // 2. Tabel header transaksi (Fase 5 & 6)
  db.execSync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tanggal TEXT NOT NULL,
      total_tagihan REAL NOT NULL,
      metode_bayar TEXT NOT NULL,
      nominal_bayar REAL NOT NULL,
      kembalian REAL NOT NULL,
      bukti_qris TEXT
    );
  `);

  // 3. Tabel detail item belanja (Fase 5 & 6)
  db.execSync(`
    CREATE TABLE IF NOT EXISTS transaction_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id INTEGER NOT NULL,
      product_id INTEGER,
      nama_produk TEXT NOT NULL,
      harga_satuan REAL NOT NULL,
      qty INTEGER NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id)
    );
  `);

  console.log('[SQLite] Database initialized: `products`, `transactions`, and `transaction_items` ready.');
}
