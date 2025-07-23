// Helper functions để tương tác với extension
export const ExtensionHelper = {
  // Kiểm tra extension có được cài đặt không
  isExtensionInstalled() {
    return typeof window !== 'undefined' && window.studentCardVerifier;
  },
  
  // Gửi data đến extension với validation
  sendStudentData(studentInfo) {
    if (typeof window === 'undefined') {
      console.warn('Window object not available');
      return false;
    }
    
    // Validate required fields
    const required = ['school', 'firstName', 'lastName', 'email'];
    const missing = required.filter(field => !studentInfo[field]);
    
    if (missing.length > 0) {
      console.error('Missing required fields:', missing);
      return false;
    }
    
    try {
      window.postMessage({
        type: 'STUDENT_CARD_EXTRACT',
        studentInfo: studentInfo
      }, '*');
      
      console.log('✅ Data sent to extension:', studentInfo);
      return true;
    } catch (error) {
      console.error('❌ Error sending to extension:', error);
      return false;
    }
  },
  
  // Bắt đầu verification trực tiếp
  startVerification(studentInfo) {
    if (!this.sendStudentData(studentInfo)) return false;
    
    // Gửi signal bắt đầu verification
    window.postMessage({
      type: 'START_STUDENT_VERIFICATION',
      studentInfo: studentInfo
    }, '*');
    
    return true;
  },

  // Test connection với extension
  testConnection() {
    if (typeof window === 'undefined') return false;
    
    try {
      window.postMessage({ type: 'TEST_CONNECTION' }, '*');
      return true;
    } catch (error) {
      console.error('❌ Error testing extension connection:', error);
      return false;
    }
  },

  // Format student data theo format extension mong đợi
  formatStudentData(cardData) {
    if (!cardData) return null;

    const nameParts = cardData.studentName?.split(' ') || ['Student', 'Name'];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || firstName;
    
    // Tạo email từ tên và ID
    const emailPrefix = `${firstName.toLowerCase()}.${cardData.studentId?.toLowerCase().replace(/[^a-z0-9]/gi, '') || 'student'}`;
    const email = `${emailPrefix}@student.edu.in`;

    return {
      school: cardData.university || '',
      firstName: firstName,
      lastName: lastName,
      email: email
    };
  }
};
