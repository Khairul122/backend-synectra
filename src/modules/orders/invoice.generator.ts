import PDFDocument from 'pdfkit';
import { Order } from '../../types/order.types';
import { Payment } from '../../types/payment.types';

type InvoiceOrder = Order & { payments?: Payment[] };

const PAGE_LEFT = 50;
const PAGE_RIGHT = 545;
const PAGE_WIDTH = PAGE_RIGHT - PAGE_LEFT;

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

const PAYMENT_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  verified:             { bg: '#D1FAE5', text: '#065F46' },
  pending_verification: { bg: '#FEF3C7', text: '#92400E' },
  rejected:             { bg: '#FEE2E2', text: '#991B1B' },
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

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

function drawHeader(doc: PDFKit.PDFDocument, order: InvoiceOrder): number {
  doc.fontSize(24).font('Helvetica-Bold').fillColor('#0D0D0D')
    .text('SYNECTRA', PAGE_LEFT, 50, { continued: true });
  doc.font('Helvetica').fillColor('#9CA3AF').text('  •  ', { continued: true });
  doc.font('Helvetica-Bold').fillColor('#6B7280').text('INVOICE');

  doc.fontSize(8).font('Helvetica-Bold').fillColor('#9CA3AF')
    .text('NOMOR INVOICE', 350, 52, { width: PAGE_RIGHT - 350, align: 'right' });
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#0D0D0D')
    .text(buildInvoiceNumber(order), 350, 64, { width: PAGE_RIGHT - 350, align: 'right' });

  const lineY = 95;
  doc.moveTo(PAGE_LEFT, lineY).lineTo(PAGE_RIGHT, lineY).lineWidth(3).strokeColor('#0D0D0D').stroke();
  return lineY + 25;
}

function drawMetadata(doc: PDFKit.PDFDocument, order: InvoiceOrder, y: number): number {
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#0D0D0D').text('Tanggal', PAGE_LEFT, y);
  doc.font('Helvetica').fillColor('#374151').text(`: ${formatDate(order.createdAt)}`, PAGE_LEFT + 90, y);

  doc.font('Helvetica-Bold').fillColor('#0D0D0D').text('Status Order', PAGE_LEFT, y + 16);
  doc.font('Helvetica-Oblique').fillColor('#374151').text(`: ${order.status}`, PAGE_LEFT + 90, y + 16);

  const rightWidth = 245;
  const rightX = PAGE_RIGHT - rightWidth;
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#9CA3AF')
    .text('DITAGIHKAN KEPADA', rightX, y, { width: rightWidth, align: 'right' });
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#0D0D0D')
    .text(order.clientName ?? '-', rightX, y + 13, { width: rightWidth, align: 'right' });
  doc.fontSize(10).font('Helvetica').fillColor('#6B7280')
    .text(order.clientEmail ?? '-', rightX, y + 32, { width: rightWidth, align: 'right' });

  return y + 60;
}

function drawDetailRow(doc: PDFKit.PDFDocument, label: string, value: string, y: number, uppercase = false): number {
  const labelWidth = 90;
  const valueX = PAGE_LEFT + labelWidth;
  const valueWidth = PAGE_RIGHT - valueX;
  const textToDraw = `: ${uppercase ? value.toUpperCase() : value}`;

  doc.fontSize(10).font('Helvetica-Bold').fillColor('#0D0D0D').text(label, PAGE_LEFT, y, { width: labelWidth });
  doc.fontSize(10).font('Helvetica').fillColor('#374151')
    .text(textToDraw, valueX, y, { width: valueWidth });

  const textHeight = doc.fontSize(10).font('Helvetica').heightOfString(textToDraw, { width: valueWidth });
  return y + Math.max(16, textHeight + 4);
}

function drawOrderDetails(doc: PDFKit.PDFDocument, order: InvoiceOrder, y: number): number {
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#0D0D0D').text('Detail Pesanan', PAGE_LEFT, y);
  doc.moveTo(PAGE_LEFT, y + 18).lineTo(PAGE_RIGHT, y + 18).lineWidth(1).strokeColor('#E5E7EB').stroke();

  let rowY = y + 28;
  rowY = drawDetailRow(doc, 'Judul', order.title, rowY, true);
  if (order.serviceCategory) rowY = drawDetailRow(doc, 'Kategori', order.serviceCategory, rowY);
  if (order.description) rowY = drawDetailRow(doc, 'Deskripsi', order.description, rowY);
  rowY = drawDetailRow(doc, 'Deadline', formatDate(order.deadline), rowY);

  return rowY + 14;
}

function drawPaymentStatusPill(doc: PDFKit.PDFDocument, status: string, x: number, y: number): void {
  const colors = PAYMENT_STATUS_COLORS[status] ?? { bg: '#F3F4F6', text: '#374151' };
  const label = PAYMENT_STATUS_LABELS[status] ?? status;
  doc.fontSize(8).font('Helvetica-Bold');
  const textWidth = doc.widthOfString(label);
  const pillWidth = textWidth + 16;
  doc.roundedRect(x, y - 3, pillWidth, 16, 8).fill(colors.bg);
  doc.fillColor(colors.text).text(label, x + 8, y, { lineBreak: false });
}

function drawPaymentsTable(doc: PDFKit.PDFDocument, payments: Payment[], y: number): number {
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#0D0D0D').text('Riwayat Pembayaran', PAGE_LEFT, y);
  doc.moveTo(PAGE_LEFT, y + 18).lineTo(PAGE_RIGHT, y + 18).lineWidth(1).strokeColor('#E5E7EB').stroke();

  const tableTop = y + 30;
  const col = { type: PAGE_LEFT, amount: PAGE_LEFT + 150, status: PAGE_LEFT + 290, date: PAGE_LEFT + 400 };
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#0D0D0D');
  doc.text('Jenis', col.type, tableTop);
  doc.text('Jumlah', col.amount, tableTop);
  doc.text('Status', col.status, tableTop);
  doc.text('Tanggal', col.date, tableTop, { width: PAGE_RIGHT - col.date, align: 'right' });
  doc.moveTo(PAGE_LEFT, tableTop + 16).lineTo(PAGE_RIGHT, tableTop + 16).lineWidth(2).strokeColor('#0D0D0D').stroke();

  let rowY = tableTop + 24;
  if (payments.length === 0) {
    doc.font('Helvetica').fontSize(9).fillColor('#6B7280').text('Belum ada pembayaran.', col.type, rowY);
    rowY += 20;
  } else {
    for (const payment of payments) {
      doc.font('Helvetica').fontSize(9).fillColor('#0D0D0D');
      doc.text(PAYMENT_TYPE_LABELS[payment.paymentType] ?? payment.paymentType, col.type, rowY);
      doc.text(formatCurrency(payment.amount), col.amount, rowY);
      drawPaymentStatusPill(doc, payment.status, col.status, rowY - 1);
      doc.fillColor('#6B7280').text(formatDate(payment.verifiedAt ?? payment.createdAt), col.date, rowY, { width: PAGE_RIGHT - col.date, align: 'right' });
      rowY += 22;
    }
  }
  return rowY + 14;
}

function drawTotals(doc: PDFKit.PDFDocument, order: InvoiceOrder, totalPaid: number, remaining: number, y: number): number {
  const boxWidth = 280;
  const boxX = PAGE_RIGHT - boxWidth;
  const labelWidth = boxWidth * 0.6;
  const valueWidth = boxWidth - labelWidth;

  doc.fontSize(10).font('Helvetica').fillColor('#6B7280').text('Total Order', boxX, y, { width: labelWidth });
  doc.font('Helvetica-Bold').fillColor('#0D0D0D').text(formatCurrency(order.totalPrice), boxX + labelWidth, y, { width: valueWidth, align: 'right' });

  const row2Y = y + 22;
  doc.font('Helvetica').fillColor('#6B7280').text('Total Dibayar', boxX, row2Y, { width: labelWidth });
  doc.font('Helvetica-Bold').fillColor('#0D0D0D').text(formatCurrency(totalPaid), boxX + labelWidth, row2Y, { width: valueWidth, align: 'right' });
  doc.moveTo(boxX, row2Y + 18).lineTo(PAGE_RIGHT, row2Y + 18).lineWidth(1).strokeColor('#E5E7EB').stroke();

  const row3Y = row2Y + 28;
  doc.rect(boxX, row3Y - 6, boxWidth, 28).fill('#F9FAFB');
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#0D0D0D').text('SISA PEMBAYARAN', boxX + 8, row3Y, { width: labelWidth - 8 });
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#0D0D0D').text(formatCurrency(remaining), boxX, row3Y - 2, { width: boxWidth - 8, align: 'right' });

  return row3Y + 40;
}

async function drawFooter(doc: PDFKit.PDFDocument, signatureUrl: string | null | undefined, y: number): Promise<void> {
  const footerY = Math.max(y, 680);

  doc.fontSize(8).font('Helvetica-Oblique').fillColor('#9CA3AF').text('Catatan:', PAGE_LEFT, footerY);
  doc.text(
    'Invoice ini merupakan dokumen resmi digital dari SYNECTRA. Segala bentuk kecurangan akan diproses secara hukum.',
    PAGE_LEFT, footerY + 12, { width: 280 },
  );

  const sigWidth = 180;
  const sigX = PAGE_RIGHT - sigWidth;
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#9CA3AF')
    .text('AUTHORIZED SIGNATURE', sigX, footerY, { width: sigWidth, align: 'center' });

  if (signatureUrl) {
    const imageBuffer = await fetchImageBuffer(signatureUrl);
    if (imageBuffer) {
      doc.image(imageBuffer, sigX + (sigWidth - 120) / 2, footerY + 12, { width: 120, height: 50 });
    }
  }

  const lineY = footerY + 66;
  doc.moveTo(sigX, lineY).lineTo(PAGE_RIGHT, lineY).lineWidth(2).strokeColor('#0D0D0D').stroke();
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#0D0D0D')
    .text('SYNECTRA ADMINISTRATION', sigX, lineY + 6, { width: sigWidth, align: 'center' });
}

/**
 * Generate dokumen invoice PDF untuk satu order beserta riwayat pembayarannya.
 */
export function buildInvoicePdf(order: InvoiceOrder, signatureUrl?: string | null): Promise<Buffer> {
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

    let y = drawHeader(doc, order);
    y = drawMetadata(doc, order, y);
    y = drawOrderDetails(doc, order, y);
    y = drawPaymentsTable(doc, payments, y);
    y = drawTotals(doc, order, totalPaid, remaining, y);

    drawFooter(doc, signatureUrl, y)
      .then(() => doc.end())
      .catch(reject);
  });
}
