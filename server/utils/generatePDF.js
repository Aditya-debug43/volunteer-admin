const PDFKit = require('pdfkit');

/**
 * Generic tabular report PDF generator.
 * @param {Object} opts { title, columns:[{header,key,width}], rows:[obj], summary?:string }
 * @returns {Promise<Buffer>}
 */
function generateTablePDF({ title, subtitle, columns, rows, summary }) {
  const doc = new PDFKit({ size: 'A4', layout: 'landscape', margin: 36 });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));
  const done = new Promise((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  const ORANGE = '#F97316';
  doc.fillColor(ORANGE).font('Helvetica-Bold').fontSize(18).text(title);
  if (subtitle) doc.fillColor('#78716C').font('Helvetica').fontSize(10).text(subtitle);
  if (summary) doc.fillColor('#1C1917').fontSize(10).text(summary);
  doc.moveDown(0.5);

  const startX = doc.x;
  let y = doc.y;
  const rowHeight = 20;

  // Header row
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#fff');
  let x = startX;
  doc.rect(startX, y, columns.reduce((s, c) => s + c.width, 0), rowHeight).fill(ORANGE);
  columns.forEach((col) => {
    doc.fillColor('#fff').text(col.header, x + 4, y + 6, { width: col.width - 8, ellipsis: true });
    x += col.width;
  });
  y += rowHeight;

  // Data rows
  doc.font('Helvetica').fontSize(8).fillColor('#1C1917');
  rows.forEach((row, i) => {
    if (y > doc.page.height - 50) {
      doc.addPage({ layout: 'landscape' });
      y = 40;
    }
    if (i % 2 === 0) {
      doc.rect(startX, y, columns.reduce((s, c) => s + c.width, 0), rowHeight).fill('#FFF7ED');
    }
    x = startX;
    columns.forEach((col) => {
      const val = row[col.key] == null ? '' : String(row[col.key]);
      doc.fillColor('#1C1917').text(val, x + 4, y + 6, { width: col.width - 8, ellipsis: true });
      x += col.width;
    });
    y += rowHeight;
  });

  doc.end();
  return done;
}

module.exports = { generateTablePDF };
