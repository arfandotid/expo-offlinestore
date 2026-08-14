import { getDatabase } from './database';

/**
 * Repository fungsi untuk manipulasi tabel products (Master Data Barang)
 */
export const productRepository = {
  /**
   * Mengambil semua produk diurutkan dari yang terbaru
   */
  getAllProducts() {
    const db = getDatabase();
    return db.getAllSync('SELECT * FROM products ORDER BY id DESC;');
  },

  /**
   * Mencari produk berdasarkan Nama atau Barcode
   */
  searchProducts(query = '') {
    const db = getDatabase();
    const cleanQuery = `%${query.trim()}%`;
    return db.getAllSync(
      'SELECT * FROM products WHERE nama LIKE ? OR barcode LIKE ? OR kategori LIKE ? ORDER BY id DESC;',
      [cleanQuery, cleanQuery, cleanQuery]
    );
  },

  /**
   * Menambah produk baru ke SQLite
   */
  createProduct({ nama, kategori, harga, foto, barcode }) {
    const db = getDatabase();
    const result = db.runSync(
      'INSERT INTO products (nama, kategori, harga, foto, barcode) VALUES (?, ?, ?, ?, ?);',
      [
        nama.trim(),
        kategori ? kategori.trim() : 'Umum',
        Number(harga),
        foto || null,
        barcode ? barcode.trim() : null
      ]
    );
    return result.lastInsertRowId;
  },

  /**
   * Memperbarui data produk yang ada
   */
  updateProduct(id, { nama, kategori, harga, foto, barcode }) {
    const db = getDatabase();
    const result = db.runSync(
      'UPDATE products SET nama = ?, kategori = ?, harga = ?, foto = ?, barcode = ? WHERE id = ?;',
      [
        nama.trim(),
        kategori ? kategori.trim() : 'Umum',
        Number(harga),
        foto || null,
        barcode ? barcode.trim() : null,
        id
      ]
    );
    return result.changes > 0;
  },

  /**
   * Mengambil produk berdasarkan ID
   */
  getProductById(id) {
    const db = getDatabase();
    return db.getFirstSync('SELECT * FROM products WHERE id = ?;', [id]);
  },

  /**
   * Mencari produk berdasarkan Barcode persis
   */
  getProductByBarcode(barcode) {
    if (!barcode) return null;
    const db = getDatabase();
    return db.getFirstSync('SELECT * FROM products WHERE barcode = ?;', [barcode.trim()]);
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
