import { jsPDF } from 'jspdf';

const csvCell = (value) => {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function exportCSV(filename, headers, rows) {
  const lines = [headers, ...rows].map((row) => row.map(csvCell).join(','));
  const csv = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const MARGIN = 14;
const PAGE_W = 210;
const PAGE_H = 297;
const ROW_H = 7.4;

function fit(doc, text, width) {
  const value = text === null || text === undefined ? '' : String(text);
  if (doc.getTextWidth(value) <= width) return value;
  let out = value;
  while (out.length > 1 && doc.getTextWidth(out + '...') > width) {
    out = out.slice(0, -1);
  }
  return out + '...';
}

export function exportPDF({ filename, title, subtitle, summary = [], headers, rows }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const usable = PAGE_W - MARGIN * 2;
  const totalWeight = headers.reduce((sum, h) => sum + (h.weight || 1), 0);
  const widths = headers.map((h) => (usable * (h.weight || 1)) / totalWeight);

  const drawTableHeader = (y) => {
    doc.setFillColor(17, 20, 24);
    doc.rect(MARGIN, y, usable, ROW_H, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    let x = MARGIN + 2;
    headers.forEach((h, i) => {
      doc.text(fit(doc, h.label, widths[i] - 4), x, y + 4.9);
      x += widths[i];
    });
    return y + ROW_H;
  };

  let y = 20;
  doc.setTextColor(17, 20, 24);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, MARGIN, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  if (subtitle) {
    doc.text(subtitle, MARGIN, y);
    y += 5.5;
  }
  summary.forEach((line) => {
    doc.text(line, MARGIN, y);
    y += 4.6;
  });
  y += 4;

  doc.setFontSize(8);
  doc.setTextColor(17, 20, 24);

  if (!rows.length) {
    doc.setFont('helvetica', 'italic');
    doc.text('No records to export.', MARGIN, y + 4);
  } else {
    y = drawTableHeader(y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    rows.forEach((row, rowIndex) => {
      if (y + ROW_H > PAGE_H - MARGIN) {
        doc.addPage();
        y = MARGIN + 6;
        y = drawTableHeader(y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(17, 20, 24);
      }
      if (rowIndex % 2 === 1) {
        doc.setFillColor(245, 246, 248);
        doc.rect(MARGIN, y, usable, ROW_H, 'F');
      }
      let x = MARGIN + 2;
      row.forEach((cell, i) => {
        doc.text(fit(doc, cell, widths[i] - 4), x, y + 4.9);
        x += widths[i];
      });
      y += ROW_H;
    });
  }

  doc.setFontSize(7.5);
  doc.setTextColor(140, 145, 152);
  doc.text('AutoLog Pro - vehicle maintenance records', MARGIN, PAGE_H - 8);

  doc.save(filename);
}