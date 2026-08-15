import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { Directory, File } from 'expo-file-system';
import { formatRupiah } from '../components/ProductCard';
import { formatTransactionNo } from './transactionNumber';
import { settingsRepository } from '../db/settingsRepository';

/**
 * Format tanggal dan waktu untuk struk
 */
function formatDateTime(isoString) {
  const date = isoString ? new Date(isoString) : new Date();
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Membaca gambar logo menjadi data URI base64 untuk disematkan di HTML struk
 */
async function loadLogoDataUri(uri) {
  if (!uri) return '';
  try {
    const file = new File(uri);
    const base64 = await file.base64();
    const ext = (file.extension || 'png').replace('.', '').toLowerCase();
    const mime = ext === 'jpg' ? 'jpeg' : ext;
    return `data:image/${mime};base64,${base64}`;
  } catch (error) {
    console.error('Error loading logo for receipt:', error);
    return '';
  }
}

/**
 * Menghasilkan HTML struk transaksi thermal-style yang rapi
 */
export async function generateReceiptHtml(transaction) {
  const {
    items = [],
    totalPrice = 0,
    totalItems = 0,
    paymentMethod = 'TUNAI',
    cashReceived = 0,
    changeAmount = 0,
    timestamp = new Date().toISOString(),
  } = transaction;

  const receiptNo = formatTransactionNo(transaction.id, timestamp);

  const settings = settingsRepository.getSettings();
  const storeName = settings.app_name || 'POS TOKO OFFLINE';
  const logoDataUri = await loadLogoDataUri(settings.app_logo_uri);

  const logoHtml = logoDataUri
    ? `
            <img src="${logoDataUri}" alt="Logo" style="width: 72px; height: auto; max-height: 72px; object-fit: contain; margin-bottom: 6px;" />
          `
    : '';

  const itemsHtml = items
    .map((item) => {
      const itemSubtotal = item.product.harga * item.qty;
      return `
        <tr>
          <td style="padding: 6px 0; text-align: left; vertical-align: top;">
            <div style="font-weight: bold; font-size: 13px; color: #111;">${item.product.nama}</div>
            <div style="font-size: 11px; color: #666;">${item.qty} x ${formatRupiah(item.product.harga)}</div>
          </td>
          <td style="padding: 6px 0; text-align: right; vertical-align: top; font-weight: bold; font-size: 13px; color: #111;">
            ${formatRupiah(itemSubtotal)}
          </td>
        </tr>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Struk Pembayaran - ${receiptNo}</title>
        <style>
          * {
            box-sizing: border-box;
            font-family: 'Courier New', Courier, monospace, sans-serif;
          }
          body {
            margin: 0;
            padding: 24px 16px;
            background-color: #ffffff;
            color: #111111;
            display: flex;
            justify-content: center;
          }
          .receipt-container {
            width: 100%;
            max-width: 320px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 1.5px dashed #444;
            padding-bottom: 14px;
            margin-bottom: 14px;
          }
          .store-name {
            font-size: 18px;
            font-weight: 900;
            letter-spacing: 1px;
            margin-bottom: 4px;
          }
          .store-address {
            font-size: 11px;
            color: #555;
            line-height: 14px;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #444;
            margin-bottom: 4px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
          }
          .divider {
            border-top: 1px dashed #777;
            margin: 10px 0;
          }
          .double-divider {
            border-top: 2px solid #222;
            margin: 10px 0;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            padding: 3px 0;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            font-weight: 900;
            padding: 6px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            border-top: 1.5px dashed #444;
            padding-top: 14px;
          }
          .footer-thanks {
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 4px;
          }
          .footer-sub {
            font-size: 10px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <!-- Header Toko -->
          <div class="header">
            ${logoHtml}
            <div class="store-name">${storeName}</div>
            <div class="store-address">Solusi Kasir Praktis & 100% Offline</div>
          </div>

          <!-- Metadata Transaksi -->
          <div class="meta-row">
            <span>No. Nota:</span>
            <span style="font-weight: bold;">${receiptNo}</span>
          </div>
          <div class="meta-row">
            <span>Waktu:</span>
            <span>${formatDateTime(timestamp)}</span>
          </div>
          <div class="meta-row">
            <span>Kasir:</span>
            <span>Admin</span>
          </div>

          <div class="divider"></div>

          <!-- Daftar Produk -->
          <table class="items-table">
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="divider"></div>

          <!-- Rincian Total -->
          <div class="summary-row">
            <span>Total Item:</span>
            <span style="font-weight: bold;">${totalItems}</span>
          </div>
          <div class="summary-row">
            <span>Metode Bayar:</span>
            <span style="font-weight: bold;">${paymentMethod}</span>
          </div>

          <div class="double-divider"></div>

          <div class="total-row">
            <span>TOTAL:</span>
            <span>${formatRupiah(totalPrice)}</span>
          </div>

          ${
            paymentMethod === 'TUNAI'
              ? `
            <div class="summary-row" style="margin-top: 4px;">
              <span>Tunai Diterima:</span>
              <span>${formatRupiah(cashReceived)}</span>
            </div>
            <div class="summary-row">
              <span>Kembalian:</span>
              <span style="font-weight: bold;">${formatRupiah(changeAmount)}</span>
            </div>
          `
              : `
            <div class="summary-row" style="margin-top: 4px;">
              <span>Status QRIS:</span>
              <span style="font-weight: bold; color: #16a34a;">LUNAS (Foto Terlampir)</span>
            </div>
          `
          }

          <!-- Footer Struk -->
          <div class="footer">
            <div class="footer-thanks">TERIMA KASIH</div>
            <div class="footer-sub">Produk yang sudah dibeli tidak dapat ditukar/dikembalikan</div>
            <div class="footer-sub" style="margin-top: 6px;">*** Simpan struk ini sebagai bukti pembayaran ***</div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Merender struk menjadi file PDF dan menyimpannya di local storage
 */
export async function createReceiptPdf(transaction) {
  const html = await generateReceiptHtml(transaction);
  const file = await Print.printToFileAsync({
    html,
    width: 595, // Standar print width
    height: 842,
    base64: false,
  });
  return file.uri;
}

/**
 * Bagikan struk transaksi PDF ke WhatsApp atau menu share OS
 */
export async function shareReceiptPdf(transaction) {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Fitur berbagi tidak didukung pada perangkat ini.');
  }

  const pdfUri = await createReceiptPdf(transaction);
  await Sharing.shareAsync(pdfUri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Bagikan Struk Transaksi ke WhatsApp / Pelanggan',
    UTI: 'com.adobe.pdf',
  });
}

/**
 * Nama file PDF struk yang akan digunakan saat menyimpan/download
 */
export function getReceiptFileName(transaction) {
  const receiptNo = formatTransactionNo(transaction.id, transaction.timestamp);
  return `Struk-${receiptNo}.pdf`;
}

/**
 * Cetak struk transaksi langsung via printer / AirPrint
 */
export async function printReceiptPdf(transaction) {
  if (Platform.OS === 'web') {
    throw new Error('Fitur cetak tidak didukung pada web.');
  }

  const pdfUri = await createReceiptPdf(transaction);
  await Print.printAsync({ uri: pdfUri });
}

/**
 * Download / simpan struk PDF ke perangkat.
 * - Android: membuka folder picker (SAF) agar pengguna memilih lokasi (mis. Downloads).
 * - iOS: membuka share sheet dengan opsi "Save to Files".
 * Mengembalikan uri file yang tersimpan, atau null jika dibatalkan.
 */
export async function downloadReceiptPdf(transaction) {
  const pdfUri = await createReceiptPdf(transaction);

  if (Platform.OS === 'android') {
    let dir;
    try {
      dir = await Directory.pickDirectoryAsync();
    } catch (error) {
      // Pengguna membatalkan pemilihan folder → bukan error
      if (/cancel/i.test(error?.message || '')) {
        return null;
      }
      throw error;
    }
    if (!dir?.uri) {
      return null;
    }

    const source = new File(pdfUri);
    const dest = new File(dir, getReceiptFileName(transaction));
    source.copy(dest);
    return dest.uri;
  }

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Fitur menyimpan file tidak didukung pada perangkat ini.');
  }

  await Sharing.shareAsync(pdfUri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Simpan Struk PDF',
    UTI: 'com.adobe.pdf',
  });
  return pdfUri;
}
