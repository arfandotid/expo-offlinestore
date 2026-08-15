import { getDatabase } from './database';

/**
 * Nilai default pengaturan aplikasi
 */
export const DEFAULT_SETTINGS = {
  app_name: 'POS TOKO OFFLINE',
  app_logo_uri: '',
  qris_uri: '',
};

/**
 * Repository fungsi untuk manipulasi tabel settings (pengaturan aplikasi)
 */
export const settingsRepository = {
  /**
   * Mengambil seluruh pengaturan, digabung dengan nilai default
   */
  getSettings() {
    const db = getDatabase();
    const rows = db.getAllSync('SELECT key, value FROM settings;');
    const settings = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      if (row.key in settings) {
        settings[row.key] = row.value;
      }
    }
    return settings;
  },

  /**
   * Mengambil satu nilai pengaturan berdasarkan key
   */
  getSetting(key) {
    const db = getDatabase();
    const row = db.getFirstSync('SELECT value FROM settings WHERE key = ?;', [key]);
    return row?.value ?? DEFAULT_SETTINGS[key] ?? null;
  },

  /**
   * Menyimpan beberapa pengaturan sekaligus (upsert)
   */
  saveSettings(settings) {
    const db = getDatabase();
    for (const key of Object.keys(settings)) {
      db.runSync(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value;',
        [key, settings[key] === null || settings[key] === undefined ? '' : String(settings[key])]
      );
    }
    return this.getSettings();
  },

  /**
   * Menghapus satu pengaturan (misal saat logo/QRIS dihapus)
   */
  deleteSetting(key) {
    const db = getDatabase();
    db.runSync('DELETE FROM settings WHERE key = ?;', [key]);
  },
};
