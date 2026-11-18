import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// jsPDF's built-in font has no peso sign, so amounts print as "PHP 1,234".
const php = (n) => `PHP ${Math.round(Number(n) || 0).toLocaleString('en-PH')}`
const liters = (ml) => `${((Number(ml) || 0) / 1000).toFixed(2)} L`

export function downloadAnalyticsPdf(data, period) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const brown = [122, 85, 57]
  const k = data.kpis

  doc.setFillColor(44, 33, 24)
  doc.rect(0, 0, W, 90, 'F')
  doc.setTextColor(232, 191, 116)
  doc.setFont('helvetica', 'bold').setFontSize(24).text('PrinTour', 40, 45)
  doc.setTextColor(246, 239, 230).setFont('helvetica', 'normal').setFontSize(12)
  doc.text(`Business report: ${period}`, 40, 66)
  doc.setFontSize(9).text(`Generated ${new Date().toLocaleString('en-PH')}`, W - 40, 66, { align: 'right' })

  let y = 115
  const section = (title, head, body) => {
    if (!body.length) return
    if (y > 700) { doc.addPage(); y = 50 }
    doc.setTextColor(44, 33, 24).setFont('helvetica', 'bold').setFontSize(13).text(title, 40, y)
    autoTable(doc, {
      startY: y + 8, head: [head], body, margin: { left: 40, right: 40 },
      headStyles: { fillColor: brown }, styles: { fontSize: 9, cellPadding: 5 }, alternateRowStyles: { fillColor: [251, 247, 242] },
    })
    y = doc.lastAutoTable.finalY + 24
  }

  section('Key figures', ['Measure', 'Value'], [
    ['Total sales', php(k.total_sales)],
    ['Total orders', String(k.total_orders)],
    ['Average order value', php(k.average_order_value)],
    ['Ink consumed', liters(k.ink_consumed_ml)],
    ['Open issues', String(k.open_issues)],
    ['Tips pending approval', String(k.pending_tips)],
  ])

  const months = data.monthly_sales || []
  if (months.length) {
    doc.setTextColor(44, 33, 24).setFont('helvetica', 'bold').setFontSize(13).text('Monthly sales', 40, y)
    const max = Math.max(...months.map((m) => Number(m.total)), 1)
    const bw = Math.min(40, (W - 120) / months.length - 8)
    months.forEach((m, i) => {
      const h = (Number(m.total) / max) * 90
      const x = 50 + i * (bw + 8)
      doc.setFillColor(...brown).rect(x, y + 120 - h, bw, h, 'F')
      doc.setTextColor(107, 90, 76).setFontSize(7).text(m.month.slice(2), x + bw / 2, y + 132, { align: 'center' })
    })
    y += 150
    section('Monthly sales table', ['Month', 'Orders', 'Sales'], months.map((m) => [m.month, String(m.orders), php(m.total)]))
  }

  section('Sales by printing type', ['Type', 'Orders', 'Sales'], (data.sales_by_type || []).map((r) => [r.printing_type, String(r.orders), php(r.total)]))
  section('Ink used by printer', ['Printer', 'Ink used'], (data.ink_by_printer || []).map((r) => [r.name, liters(r.ml)]))
  section('Ink used by type', ['Ink', 'Ink used'], (data.ink_by_type || []).map((r) => [`${r.color} ${r.brand}`, liters(r.ml)]))
  section('Printers needing attention', ['Printer', 'Reason'], [
    ...(data.maintenance_due || []).map((p) => [p.name, `Maintenance due ${p.next_maintenance_at}`]),
    ...(data.printers_with_problems || []).map((p) => [p.name, `${p.open_issues_count} open issues`]),
  ])
  section('Frequently replaced parts', ['Part', 'Replaced'], (data.frequently_replaced_parts || []).map((p) => [p.name, String(p.replaced)]))
  section('Most reported issues', ['Issue', 'Reports'], (data.most_reported_issues || []).map((i) => [i.title, String(i.reports)]))

  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i).setFontSize(8).setTextColor(138, 123, 109)
    doc.text(`PrinTour report  |  Page ${i} of ${pages}`, W / 2, 820, { align: 'center' })
  }

  const slug = period.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  doc.save(`printour-report-${slug}.pdf`)
}