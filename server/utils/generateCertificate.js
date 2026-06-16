const PDFKit = require('pdfkit');
const QRCode = require('qrcode');

/**
 * Generates a Volunteer Appreciation Certificate as a PDF Buffer.
 * A4 landscape, orange double-line frame, NayePankh branding.
 * @returns {Promise<Buffer>}
 */
async function generateCertificate(data) {
  const {
    fullName,
    volunteerId,
    startDate,
    certificateDate = new Date(),
    totalHours,
    totalEvents,
    causeAreas = [],
    verifyBaseUrl = process.env.FRONTEND_URL,
  } = data;

  const ORANGE = '#F97316';
  const CREAM = '#FFF7ED';

  const doc = new PDFKit({ size: 'A4', layout: 'landscape', margin: 0 });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));
  const done = new Promise((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  const W = doc.page.width;
  const H = doc.page.height;

  // Background
  doc.rect(0, 0, W, H).fill(CREAM);

  // Double-line orange frame
  doc.lineWidth(3).strokeColor(ORANGE).rect(24, 24, W - 48, H - 48).stroke();
  doc.lineWidth(1).strokeColor(ORANGE).rect(34, 34, W - 68, H - 68).stroke();

  // Title
  doc.fillColor('#1C1917').font('Helvetica-Bold').fontSize(14)
    .text('NAYEPANKH FOUNDATION', 0, 70, { align: 'center' });
  doc.fillColor(ORANGE).fontSize(30)
    .text('VOLUNTEER APPRECIATION CERTIFICATE', 0, 100, { align: 'center' });

  // Body
  const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const body = `This is to certify that ${fullName} has volunteered with NayePankh Foundation from ${fmt(startDate)} to ${fmt(certificateDate)}, contributing ${totalHours} hours across ${totalEvents} events in the domain of ${causeAreas.join(', ') || 'community service'}. We appreciate your dedication to uplifting the underprivileged.`;
  doc.fillColor('#1C1917').font('Helvetica').fontSize(14)
    .text(body, 100, 170, { align: 'center', width: W - 200, lineGap: 6 });

  // Signatures
  const sigY = H - 130;
  doc.fontSize(11).fillColor('#1C1917');
  doc.text('_____________________', 120, sigY);
  doc.text('Coordinator Signature', 120, sigY + 16);
  doc.text('_____________________', W - 280, sigY);
  doc.text('Prashant Shukla', W - 280, sigY + 16);
  doc.fontSize(9).fillColor('#78716C').text('Founder & President', W - 280, sigY + 30);

  // Footer
  doc.fontSize(8).fillColor('#78716C')
    .text('NayePankh Foundation | UP Govt. Registered NGO | 80G & 12A Certified | contact@nayepankh.com',
      0, H - 60, { align: 'center' });

  // Volunteer ID bottom-right
  doc.fontSize(8).fillColor('#78716C').text(volunteerId || '', W - 160, H - 48, { width: 120, align: 'right' });

  // QR code bottom-left
  try {
    const qrData = await QRCode.toDataURL(`${verifyBaseUrl}/verify-certificate?id=${encodeURIComponent(volunteerId || '')}`);
    const qrBuffer = Buffer.from(qrData.split(',')[1], 'base64');
    doc.image(qrBuffer, 50, H - 110, { width: 60, height: 60 });
  } catch (_) {
    /* QR optional */
  }

  doc.end();
  return done;
}

module.exports = { generateCertificate };
