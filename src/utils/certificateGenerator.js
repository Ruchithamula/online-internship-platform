// Certificate Generator for OnlyInternship.in
import { jsPDF } from 'jspdf';

export const certificateGenerator = {
  // Generate certificate PDF for passed students
  generateCertificate(studentData, testResults) {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Set up fonts and colors
    doc.setFont('helvetica');
    
    // Background gradient effect
    this.drawBackground(doc, pageWidth, pageHeight);
    
    // Border
    doc.setDrawColor(212, 175, 55); // Gold color
    doc.setLineWidth(3);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    
    // Inner border
    doc.setLineWidth(1);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30);
    
    // Header
    this.drawHeader(doc, pageWidth);
    
    // Main content
    this.drawMainContent(doc, pageWidth, pageHeight, studentData, testResults);
    
    // Footer
    this.drawFooter(doc, pageWidth, pageHeight);
    
    // QR Code placeholder
    this.drawQRCodePlaceholder(doc, pageWidth, pageHeight);
    
    // Certificate ID
    this.drawCertificateID(doc, pageWidth, pageHeight, testResults.certificateId);
    
    return doc;
  },
  
  // Draw background with gradient effect
  drawBackground(doc, pageWidth, pageHeight) {
    // Create gradient-like effect with multiple rectangles
    for (let i = 0; i < 10; i++) {
      const alpha = 0.02 - (i * 0.002);
      doc.setFillColor(255, 248, 220); // Light gold
      doc.setGlobalAlpha(alpha);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }
    doc.setGlobalAlpha(1);
  },
  
  // Draw header section
  drawHeader(doc, pageWidth) {
    // Logo placeholder
    doc.setFillColor(212, 175, 55);
    doc.circle(50, 40, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Y', 45, 45);
    
    // Company name
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Yuga Yatra Retail (OPC) Private Limited', pageWidth / 2, 35, { align: 'center' });
    
    // Platform name
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('OnlyInternship.in', pageWidth / 2, 45, { align: 'center' });
    
    // Certificate title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(212, 175, 55);
    doc.text('CERTIFICATE OF COMPLETION', pageWidth / 2, 70, { align: 'center' });
  },
  
  // Draw main content
  drawMainContent(doc, pageWidth, pageHeight, studentData, testResults) {
    const centerX = pageWidth / 2;
    
    // This is to certify that
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that', centerX, 100, { align: 'center' });
    
    // Student name
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(212, 175, 55);
    doc.text(studentData.name.toUpperCase(), centerX, 120, { align: 'center' });
    
    // Has successfully completed
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('has successfully completed the', centerX, 140, { align: 'center' });
    
    // Test name
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(212, 175, 55);
    doc.text('Web Development Assessment Test', centerX, 155, { align: 'center' });
    
    // Test details
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`with a score of ${testResults.score}% (${testResults.correctAnswers}/${testResults.totalQuestions} correct answers)`, centerX, 170, { align: 'center' });
    doc.text(`and achieved ${testResults.percentile} percentile ranking`, centerX, 180, { align: 'center' });
    
    // Date
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`on ${currentDate}`, centerX, 195, { align: 'center' });
    
    // Performance indicators
    this.drawPerformanceIndicators(doc, centerX, 220, testResults);
  },
  
  // Draw performance indicators
  drawPerformanceIndicators(doc, centerX, y, testResults) {
    const indicators = [
      { label: 'Score', value: `${testResults.score}%`, color: testResults.score >= 60 ? '#27AE60' : '#E74C3C' },
      { label: 'Percentile', value: `P${testResults.percentile}`, color: '#D4AF37' },
      { label: 'Time Taken', value: `${testResults.timeTaken}m`, color: '#3498DB' }
    ];
    
    const spacing = 60;
    const startX = centerX - (spacing * (indicators.length - 1)) / 2;
    
    indicators.forEach((indicator, index) => {
      const x = startX + (spacing * index);
      
      // Background circle
      doc.setFillColor(248, 249, 250);
      doc.circle(x, y, 20, 'F');
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(1);
      doc.circle(x, y, 20, 'S');
      
      // Value
      doc.setTextColor(indicator.color);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(indicator.value, x, y + 3, { align: 'center' });
      
      // Label
      doc.setTextColor(44, 62, 80);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(indicator.label, x, y + 15, { align: 'center' });
    });
  },
  
  // Draw footer
  drawFooter(doc, pageWidth, pageHeight) {
    const centerX = pageWidth / 2;
    const footerY = pageHeight - 40;
    
    // Signature line
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1);
    doc.line(centerX - 50, footerY, centerX + 50, footerY);
    
    // Signature label
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Authorized Signature', centerX, footerY + 10, { align: 'center' });
    
    // Company seal placeholder
    doc.setFillColor(212, 175, 55);
    doc.circle(pageWidth - 50, footerY, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('SEAL', pageWidth - 50, footerY + 2, { align: 'center' });
  },
  
  // Draw QR code placeholder
  drawQRCodePlaceholder(doc, pageWidth, pageHeight) {
    const qrX = 30;
    const qrY = pageHeight - 60;
    
    // QR code background
    doc.setFillColor(248, 249, 250);
    doc.rect(qrX - 5, qrY - 5, 30, 30, 'F');
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1);
    doc.rect(qrX - 5, qrY - 5, 30, 30, 'S');
    
    // QR code text
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('QR Code', qrX + 10, qrY + 15, { align: 'center' });
    
    // Verification text
    doc.setFontSize(8);
    doc.text('Verify at:', qrX + 10, qrY + 25, { align: 'center' });
    doc.setFontSize(6);
    doc.text('onlyinternship.in/verify', qrX + 10, qrY + 32, { align: 'center' });
  },
  
  // Draw certificate ID
  drawCertificateID(doc, pageWidth, pageHeight, certificateId) {
    doc.setTextColor(108, 117, 125);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Certificate ID: ${certificateId}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
  },
  
  // Generate unique certificate ID
  generateCertificateId(studentId, testDate) {
    const date = new Date(testDate);
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CERT-${dateStr}-${studentId.substring(0, 4)}-${randomStr}`;
  },
  
  // Download certificate
  downloadCertificate(studentData, testResults) {
    const certificateId = this.generateCertificateId(studentData.id, testResults.completionDate);
    const doc = this.generateCertificate(studentData, { ...testResults, certificateId });
    
    const fileName = `certificate_${studentData.name.replace(/\s+/g, '_')}_${certificateId}.pdf`;
    doc.save(fileName);
    
    return {
      certificateId,
      fileName,
      downloadUrl: URL.createObjectURL(doc.output('blob'))
    };
  },
  
  // Preview certificate (returns blob URL)
  previewCertificate(studentData, testResults) {
    const certificateId = this.generateCertificateId(studentData.id, testResults.completionDate);
    const doc = this.generateCertificate(studentData, { ...testResults, certificateId });
    
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    
    return {
      certificateId,
      previewUrl: url,
      blob
    };
  }
};

export default certificateGenerator; 