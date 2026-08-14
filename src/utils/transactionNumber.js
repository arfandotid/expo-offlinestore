/**
 * Format nomor transaksi menjadi TRX-{YYYYMMDD}-{id}
 * Contoh: TRX-20260814-00042
 */
export function formatTransactionNo(id, timestamp) {
  const date = timestamp ? new Date(timestamp) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const number = String(Number(id) || 0).padStart(5, '0');
  return `TRX-${year}${month}${day}-${number}`;
}
