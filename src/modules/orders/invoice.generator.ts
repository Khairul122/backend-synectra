import PDFDocument from 'pdfkit';
import { Order } from '../../types/order.types';
import { Payment } from '../../types/payment.types';

type InvoiceOrder = Order & { payments?: Payment[] };

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  dp:        'Down Payment',
  termin_1:  'Termin 1',
  pelunasan: 'Pelunasan',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending_verification: 'Menunggu Verifikasi',
  verified:             'Terverifikasi',
  rejected:             'Ditolak',
};

function formatCurrency(value: number | null): string {
  return `Rp ${Number(value ?? 0).toLocaleString('id-ID')}`;
}

function formatDate(value: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function buildInvoiceNumber(order: InvoiceOrder): string {
  const period = order.createdAt.slice(0, 7).replace('-', '');
  const shortId = order.id.replace(/-/g, '').slice(0, 8).toUpperCase();
  return `INV-${period}-${shortId}`;
}

/**
 * Generate dokumen invoice PDF untuk satu order beserta riwayat pembayarannya.
 */
export function buildInvoicePdf(order: InvoiceOrder): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const payments = order.payments ?? [];
    const totalPaid = payments
      .filter((p) => p.status === 'verified')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const remaining = Number(order.totalPrice ?? 0) - totalPaid;

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('SYNECTRA', { continued: true });
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#0D0D0D').text('  •  INVOICE', { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#444444');
    doc.text(`No. Invoice : ${buildInvoiceNumber(order)}`);
    doc.text(`Tanggal     : ${formatDate(order.createdAt)}`);
    doc.text(`Status Order: ${order.status}`);
    doc.moveDown();

    // Client info
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#0D0D0D').text('Ditagihkan Kepada');
    doc.fontSize(10).font('Helvetica').fillColor('#444444');
    doc.text(order.clientName ?? '-');
    if (order.clientEmail) doc.text(order.clientEmail);
    if (order.phone) doc.text(order.phone);
    doc.moveDown();

    // Order detail
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#0D0D0D').text('Detail Pesanan');
    doc.fontSize(10).font('Helvetica').fillColor('#444444');
    doc.text(`Judul        : ${order.title}`);
    if (order.serviceCategory) doc.text(`Kategori     : ${order.serviceCategory}`);
    if (order.description) doc.text(`Deskripsi    : ${order.description}`, { width: 495 });
    doc.text(`Deadline     : ${formatDate(order.deadline)}`);
    doc.moveDown();

    // Payments table
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#0D0D0D').text('Riwayat Pembayaran');
    doc.moveDown(0.3);

    const tableTop = doc.y;
    const col = { type: 50, amount: 220, status: 350, date: 460 };
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Jenis', col.type, tableTop);
    doc.text('Jumlah', col.amount, tableTop);
    doc.text('Status', col.status, tableTop);
    doc.text('Tanggal', col.date, tableTop);
    doc.moveTo(50, tableTop + 14).lineTo(545, tableTop + 14).strokeColor('#0D0D0D').stroke();

    doc.font('Helvetica').fontSize(9);
    let rowY = tableTop + 20;
    if (payments.length === 0) {
      doc.text('Belum ada pembayaran.', col.type, rowY);
      rowY += 18;
    } else {
      for (const payment of payments) {
        doc.text(PAYMENT_TYPE_LABELS[payment.paymentType] ?? payment.paymentType, col.type, rowY);
        doc.text(formatCurrency(payment.amount), col.amount, rowY);
        doc.text(PAYMENT_STATUS_LABELS[payment.status] ?? payment.status, col.status, rowY);
        doc.text(formatDate(payment.verifiedAt ?? payment.createdAt), col.date, rowY);
        rowY += 18;
      }
    }
    doc.moveTo(50, rowY).lineTo(545, rowY).strokeColor('#0D0D0D').stroke();
    doc.moveDown();

    // Summary
    doc.y = rowY + 14;
    doc.fontSize(10).font('Helvetica');
    doc.text(`Total Order     : ${formatCurrency(order.totalPrice)}`, { align: 'right' });
    doc.text(`Total Dibayar   : ${formatCurrency(totalPaid)}`, { align: 'right' });
    doc.font('Helvetica-Bold').text(`Sisa Pembayaran : ${formatCurrency(remaining)}`, { align: 'right' });

    // Footer
    doc.fontSize(8).font('Helvetica').fillColor('#888888');
    doc.text('Dokumen ini digenerate otomatis oleh sistem Synectra.', 50, 760, { align: 'center', width: 495 });

    doc.end();
  });
}
