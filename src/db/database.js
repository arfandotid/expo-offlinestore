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

  // Buat tabel products sesuai PRD
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

  console.log('[SQLite] Database initialized and table `products` is ready.');
}
