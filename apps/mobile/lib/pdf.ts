import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type Payment = {
  business_name?: string;
  amount: number;
  method: string;
  status: string;
  paid_at: string | null;
  created_at: string;
};

type ReportData = {
  partnerName: string;
  monthLabel: string;
  totalCollection: number;
  totalCommission: number;
  paymentCount: number;
  payments: Payment[];
};

function escapeHtml(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatTL(n: number): string {
  return n.toLocaleString('tr-TR');
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR');
}

function methodLabel(method: string): string {
  switch (method) {
    case 'cash': return 'Nakit';
    case 'bank': return 'Havale';
    case 'iyzico': return 'iyzico';
    default: return method;
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'completed': return 'Tamamlandı';
    case 'pending': return 'Beklemede';
    case 'failed': return 'Başarısız';
    case 'refunded': return 'İade';
    default: return status;
  }
}

function buildHtml(data: ReportData): string {
  const rows = data.payments
    .map(
      (p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escapeHtml(p.business_name || 'İşletme')}</td>
      <td>${formatDate(p.paid_at || p.created_at)}</td>
      <td>${methodLabel(p.method)}</td>
      <td>${statusLabel(p.status)}</td>
      <td class="amount">${formatTL(Number(p.amount))} TL</td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 32px; color: #111827; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0066FF; padding-bottom: 16px; }
    .brand { font-size: 28px; font-weight: 700; color: #0066FF; }
    .meta { font-size: 13px; color: #6B7280; text-align: right; }
    h1 { font-size: 22px; margin: 24px 0 8px; }
    .partner { color: #6B7280; font-size: 14px; }
    .summary { display: flex; gap: 12px; margin: 24px 0; }
    .stat { flex: 1; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; }
    .stat-label { font-size: 12px; color: #6B7280; }
    .stat-value { font-size: 20px; font-weight: 700; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
    th { background: #0066FF; color: #fff; text-align: left; padding: 10px 8px; }
    td { padding: 8px; border-bottom: 1px solid #E5E7EB; }
    .amount { text-align: right; font-weight: 600; color: #0066FF; }
    .footer { margin-top: 32px; text-align: center; color: #9CA3AF; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">Şarjup</div>
    <div class="meta">
      Aylık Rapor<br/>
      ${escapeHtml(data.monthLabel)}
    </div>
  </div>

  <h1>Tahsilat Raporu</h1>
  <div class="partner">${escapeHtml(data.partnerName)}</div>

  <div class="summary">
    <div class="stat">
      <div class="stat-label">Toplam Tahsilat</div>
      <div class="stat-value">${formatTL(data.totalCollection)} TL</div>
    </div>
    <div class="stat">
      <div class="stat-label">Komisyon</div>
      <div class="stat-value" style="color:#10B981">${formatTL(Math.round(data.totalCommission))} TL</div>
    </div>
    <div class="stat">
      <div class="stat-label">Ödeme Sayısı</div>
      <div class="stat-value">${data.paymentCount}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>İşletme</th>
        <th>Tarih</th>
        <th>Yöntem</th>
        <th>Durum</th>
        <th style="text-align:right">Tutar</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="6" style="text-align:center;padding:24px;color:#9CA3AF">Bu ayda ödeme yok</td></tr>'}
    </tbody>
  </table>

  <div class="footer">
    Bu rapor Şarjup partner mobil uygulaması tarafından oluşturulmuştur.<br/>
    ${new Date().toLocaleString('tr-TR')}
  </div>
</body>
</html>
  `;
}

export async function generateAndSharePDF(data: ReportData): Promise<void> {
  const html = buildHtml(data);
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Aylık Rapor',
      UTI: 'com.adobe.pdf',
    });
  } else {
    alert('Paylaşım bu cihazda desteklenmiyor');
  }
}