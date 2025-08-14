// Email Service for sending notifications
import axios from 'axios';

const EMAIL_API_URL = 'http://localhost:5000/api/email';

export const emailService = {
  // Send test completion notification to student
  async sendTestCompletionEmail(studentData, testResults) {
    try {
      const response = await axios.post(`${EMAIL_API_URL}/test-completion`, {
        to: studentData.email,
        studentName: studentData.name,
        score: testResults.score,
        percentile: testResults.percentile,
        status: testResults.status,
        totalQuestions: testResults.totalQuestions,
        correctAnswers: testResults.correctAnswers,
        timeTaken: testResults.timeTaken,
        certificateUrl: testResults.certificateUrl
      });
      return response.data;
    } catch (error) {
      console.error('Error sending test completion email:', error);
      throw error;
    }
  },

  // Send welcome email to new students
  async sendWelcomeEmail(studentData) {
    try {
      const response = await axios.post(`${EMAIL_API_URL}/welcome`, {
        to: studentData.email,
        studentName: studentData.name,
        testInstructions: {
          duration: '30 minutes',
          questions: '40 questions',
          passingScore: '60%',
          fee: '₹295 (₹250 + GST)'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  },

  // Send payment confirmation email
  async sendPaymentConfirmationEmail(studentData, paymentDetails) {
    try {
      const response = await axios.post(`${EMAIL_API_URL}/payment-confirmation`, {
        to: studentData.email,
        studentName: studentData.name,
        amount: paymentDetails.amount,
        transactionId: paymentDetails.transactionId,
        paymentDate: paymentDetails.paymentDate,
        testAccessUrl: '/student/test-init'
      });
      return response.data;
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
      throw error;
    }
  },

  // Send reminder email for incomplete tests
  async sendTestReminderEmail(studentData) {
    try {
      const response = await axios.post(`${EMAIL_API_URL}/test-reminder`, {
        to: studentData.email,
        studentName: studentData.name,
        daysSinceRegistration: studentData.daysSinceRegistration,
        testAccessUrl: '/student/test-init'
      });
      return response.data;
    } catch (error) {
      console.error('Error sending test reminder email:', error);
      throw error;
    }
  },

  // Send admin notification for new registrations
  async sendAdminNotification(subject, message, adminEmails = []) {
    try {
      const response = await axios.post(`${EMAIL_API_URL}/admin-notification`, {
        to: adminEmails,
        subject,
        message,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error sending admin notification:', error);
      throw error;
    }
  },

  // Send certificate email
  async sendCertificateEmail(studentData, certificateData) {
    try {
      const response = await axios.post(`${EMAIL_API_URL}/certificate`, {
        to: studentData.email,
        studentName: studentData.name,
        certificateUrl: certificateData.url,
        score: certificateData.score,
        percentile: certificateData.percentile,
        issueDate: certificateData.issueDate,
        certificateId: certificateData.certificateId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending certificate email:', error);
      throw error;
    }
  },

  // Send security violation alert to admin
  async sendSecurityAlert(studentData, violationDetails) {
    try {
      const response = await axios.post(`${EMAIL_API_URL}/security-alert`, {
        to: 'admin@onlyinternship.in',
        studentName: studentData.name,
        studentEmail: studentData.email,
        violationType: violationDetails.type,
        violationCount: violationDetails.count,
        testId: violationDetails.testId,
        timestamp: violationDetails.timestamp
      });
      return response.data;
    } catch (error) {
      console.error('Error sending security alert:', error);
      throw error;
    }
  }
};

export default emailService; 