const PDFDocument = require('pdfkit');

const exportService = {
  exportToCSV(data, filename) {
    if (!data || data.length === 0) return Buffer.from('No data');
    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    return Buffer.from(csv, 'utf8');
  },

  exportToPDF(data, title) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      doc.fontSize(18).text(title || 'Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Generated: ${new Date().toISOString()}`, { align: 'right' });
      doc.moveDown();

      if (!data || data.length === 0) {
        doc.text('No data available');
        doc.end();
        return;
      }

      const headers = Object.keys(data[0]);
      const colWidth = Math.min(500 / headers.length, 120);
      const tableTop = doc.y;
      let x = 30;

      doc.fontSize(9).font('Helvetica-Bold');
      headers.forEach(h => {
        doc.text(h, x, tableTop, { width: colWidth, ellipsis: true });
        x += colWidth;
      });

      doc.moveTo(30, tableTop + 15).lineTo(30 + colWidth * headers.length, tableTop + 15).stroke();

      let y = tableTop + 20;
      doc.font('Helvetica').fontSize(8);
      data.forEach((row, idx) => {
        if (y > 750) {
          doc.addPage();
          y = 30;
        }
        x = 30;
        headers.forEach(h => {
          const val = row[h] !== null && row[h] !== undefined ? String(row[h]) : '';
          doc.text(val.substring(0, 20), x, y, { width: colWidth, ellipsis: true });
          x += colWidth;
        });
        y += 15;
      });

      doc.end();
    });
  },

  exportToExcel(data, filename) {
    return exportService.exportToCSV(data, filename);
  }
};

module.exports = exportService;
