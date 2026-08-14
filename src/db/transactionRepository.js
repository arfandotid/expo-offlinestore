import { getDatabase } from './database';

/**
 * Repository fungsi untuk manipulasi tabel transactions & transaction_items
 */
export const transactionRepository = {
  /**
   * Menyimpan transaksi baru beserta rincian itemnya ke SQLite
   */
  saveTransaction({
    tanggal,
    total_tagihan,
    metode_bayar,
    nominal_bayar,
    kembalian,
    bukti_qris,
    items = [],
  }) {
    const db = getDatabase();

    // 1. Simpan Header Transaksi
    const headerResult = db.runSync(
      `INSERT INTO transactions (tanggal, total_tagihan, metode_bayar, nominal_bayar, kembalian, bukti_qris)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        tanggal || new Date().toISOString(),
        Number(total_tagihan),
        metode_bayar,
        Number(nominal_bayar),
        Number(kembalian),
        bukti_qris || null,
      ]
    );

    const transactionId = headerResult.lastInsertRowId;

    // 2. Simpan Setiap Detail Item Belanja
    for (const item of items) {
      const product = item.product || {};
      const productId = product.id || null;
      const namaProduk = product.nama || 'Produk';
      const hargaSatuan = Number(product.harga || 0);
      const qty = Number(item.qty || 1);
      const subtotal = hargaSatuan * qty;

      db.runSync(
        `INSERT INTO transaction_items (transaction_id, product_id, nama_produk, harga_satuan, qty, subtotal)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [transactionId, productId, namaProduk, hargaSatuan, qty, subtotal]
      );
    }

    return transactionId;
  },

  /**
   * Mengambil semua daftar transaksi (diurutkan dari yang terbaru)
   */
  getAllTransactions() {
    const db = getDatabase();
    return db.getAllSync(
      `SELECT t.*, 
              (SELECT COUNT(*) FROM transaction_items WHERE transaction_id = t.id) AS total_items,
              (SELECT SUM(qty) FROM transaction_items WHERE transaction_id = t.id) AS total_qty
       FROM transactions t
       ORDER BY t.id DESC;`
    );
  },

  /**
   * Mengambil detail lengkap satu transaksi beserta semua item belanjaannya
   */
  getTransactionDetails(transactionId) {
    const db = getDatabase();
    const transaction = db.getFirstSync(
      `SELECT * FROM transactions WHERE id = ?;`,
      [transactionId]
    );

    if (!transaction) return null;

    const items = db.getAllSync(
      `SELECT * FROM transaction_items WHERE transaction_id = ? ORDER BY id ASC;`,
      [transactionId]
    );

    return {
      ...transaction,
      items,
    };
  },

  /**
   * Menghapus transaksi dan rincian itemnya (opsional)
   */
  deleteTransaction(transactionId) {
    const db = getDatabase();
    db.runSync(`DELETE FROM transaction_items WHERE transaction_id = ?;`, [transactionId]);
    const result = db.runSync(`DELETE FROM transactions WHERE id = ?;`, [transactionId]);
    return result.changes > 0;
  },
};
