import { getDatabase } from './database';

/**
 * Repository fungsi untuk manipulasi tabel products
 */
export const productRepository = {
  /**
   * Mengambil semua produk
   */
  getAllProducts() {
    const db = getDatabase();
    return db.getAllSync('SELECT * FROM products ORDER BY id DESC;');
  },

  /**
   * Menambah produk baru
   */
  createProduct({ nama, kategori, harga, foto, barcode }) {
    const db = getDatabase();
    const result = db.runSync(
      'INSERT INTO products (nama, kategori, harga, foto, barcode) VALUES (?, ?, ?, ?, ?);',
      [nama, kategori || '', harga, foto || null, barcode || null]
    );
    return result.lastInsertRowId;
  },

  /**
   * Mengambil produk berdasarkan ID
   */
  getProductById(id) {
    const db = getDatabase();
    return db.getFirstSync('SELECT * FROM products WHERE id = ?;', [id]);
  },

  /**
   * Mencari produk berdasarkan Barcode
   */
  getProductByBarcode(barcode) {
    const db = getDatabase();
    return db.getFirstSync('SELECT * FROM products WHERE barcode = ?;', [barcode]);
  },

  /**
   * Menghapus produk berdasarkan ID
   */
  deleteProduct(id) {
    const db = getDatabase();
    const result = db.runSync('DELETE FROM products WHERE id = ?;', [id]);
    return result.changes > 0;
  }
};
