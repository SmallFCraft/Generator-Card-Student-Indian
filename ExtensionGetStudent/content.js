// Content script - giao tiếp với trang web
console.log('🔍 DEBUG: Student Card Auto Verifier content script loaded on:', window.location.href);
console.log('🔍 DEBUG: Document ready state:', document.readyState);
console.log('🔍 DEBUG: Content script timestamp:', new Date().toISOString());

// Biến lưu trữ thông tin student - sử dụng window object để tránh redeclaration
window.currentStudentInfo = window.currentStudentInfo || null;

// Lắng nghe message từ web page
window.addEventListener('message', (event) => {
  // Chỉ nhận message từ cùng origin
  if (event.source !== window) return;
  
  // Xử lý extract thông tin (chỉ lưu, không verify)
  if (event.data.type === 'STUDENT_CARD_EXTRACT') {
    console.log('🔍 DEBUG: Extracting student info from card:', event.data.studentInfo);
    window.currentStudentInfo = event.data.studentInfo;
    
    // Gửi thông tin đến background để lưu
    chrome.runtime.sendMessage({
      action: 'saveStudentInfo',
      studentInfo: window.currentStudentInfo
    }, (response) => {
      console.log('🔍 DEBUG: Info saved to extension:', response);
      console.log('🔍 DEBUG: Saved data:', window.currentStudentInfo);
      
      // Gửi kết quả về cho web page
      window.postMessage({
        type: 'INFO_EXTRACTED',
        success: response?.success || false
      }, '*');
    });
  }
  
  // Nhận dữ liệu student card từ website (legacy - auto verify)
  if (event.data.type === 'STUDENT_CARD_DATA') {
    console.log('Nhận được thông tin student card từ website:', event.data.studentInfo);
    window.currentStudentInfo = event.data.studentInfo;
    
    // Lưu vào storage để popup sử dụng
    chrome.runtime.sendMessage({
      action: 'saveStudentInfo',
      studentInfo: window.currentStudentInfo
    });
  }
  
  if (event.data.type === 'START_STUDENT_VERIFICATION') {
    console.log('Nhận được yêu cầu bắt đầu xác minh từ web page');
    
    // Gửi message đến background script
    chrome.runtime.sendMessage({
      action: 'startVerification',
      studentInfo: window.currentStudentInfo
    }, (response) => {
      console.log('Response từ background:', response);
      
      // Gửi kết quả về cho web page
      window.postMessage({
        type: 'VERIFICATION_STARTED',
        success: response?.success || false
      }, '*');
    });
  }
});

// Lắng nghe message từ popup extension để extract thông tin
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('🔍 DEBUG: Content script received message:', request);
  
  if (request.action === 'extractStudentInfo') {
    console.log('🔍 DEBUG: Popup yêu cầu extract student info từ website');
    console.log('🔍 DEBUG: Current URL:', window.location.href);
    console.log('🔍 DEBUG: Document ready state:', document.readyState);
    
    try {
      // Kiểm tra xem có student card trên trang không
      const universityName = document.getElementById('university-name')?.textContent?.trim() || '';
      const studentName = document.getElementById('student-name')?.textContent?.trim() || '';
      
      console.log('🔍 DEBUG: Found elements:', {
        universityName,
        studentName,
        universityElement: !!document.getElementById('university-name'),
        studentElement: !!document.getElementById('student-name'),
        allElements: {
          'university-name': !!document.getElementById('university-name'),
          'student-name': !!document.getElementById('student-name'),
          'student-dob': !!document.getElementById('student-dob'),
          'student-department': !!document.getElementById('student-department')
        }
      });
      
      if (!universityName || !studentName) {
        console.log('🔍 DEBUG: No student card found - missing elements');
        console.log('🔍 DEBUG: Available elements with IDs:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
        sendResponse({ 
          success: false, 
          error: 'No student card found on this page' 
        });
        return true; // Keep message channel open
      }
      
      // Extract thông tin từ student card
      const studentDob = document.getElementById('student-dob')?.textContent?.trim() || '';
      const studentDepartment = document.getElementById('student-department')?.textContent?.trim() || '';
      
      // Format date cho input type="date" (YYYY-MM-DD)
      let formattedDob = '';
      if (studentDob) {
        try {
          // Nếu đã đúng format YYYY-MM-DD thì giữ nguyên
          if (/^\d{4}-\d{2}-\d{2}$/.test(studentDob)) {
            formattedDob = studentDob;
          } else {
            // Thử parse và format lại
            const dobDate = new Date(studentDob);
            if (!isNaN(dobDate.getTime())) {
              formattedDob = dobDate.toISOString().split('T')[0];
            }
          }
        } catch (error) {
          console.log('🔍 DEBUG: Could not format date:', studentDob, error);
        }
      }
      
      // Tách họ và tên
      const nameParts = studentName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Tạo email với format: tên+họ+4 số ngẫu nhiên+@student.edu.in
      const randomNumbers = Math.floor(1000 + Math.random() * 9000); // 4 số ngẫu nhiên từ 1000-9999
      const emailPrefix = firstName.toLowerCase() + lastName.toLowerCase().replace(/\s+/g, '') + randomNumbers;
      const email = `${emailPrefix}@student.edu.in`;
      
      const studentInfo = {
        school: universityName,
        firstName: firstName,
        lastName: lastName,
        email: email,
        dateOfBirth: formattedDob,
        department: studentDepartment,
        extractedAt: new Date().toISOString(),
        source: 'student-card-generator'
      };
      
      console.log('🔍 DEBUG: Extracted student info for popup:', studentInfo);
      
      sendResponse({ 
        success: true, 
        studentInfo: studentInfo 
      });
      
      return true; // Keep message channel open

    } catch (error) {
      console.error('🔍 DEBUG: Error extracting student info:', error);
      sendResponse({ 
        success: false, 
        error: error.message 
      });
      return true; // Keep message channel open
    }
  }
  
  return true; // Keep message channel open for async response
});

// Helper function để tạo email domain từ tên trường
function getEmailDomainFromUniversity(universityName) {
  const domainMap = {
    'Indian Institute of Technology Bombay': 'iitb.ac.in',
    'Indian Institute of Technology Delhi': 'iitd.ac.in',
    'Indian Institute of Science Bangalore': 'iisc.ac.in',
    'Indian Institute of Technology Madras': 'iitm.ac.in',
    'Indian Institute of Technology Kanpur': 'iitk.ac.in',
    'Indian Institute of Technology Kharagpur': 'iitkgp.ac.in',
    'University of Delhi': 'du.ac.in',
    'Jawaharlal Nehru University': 'jnu.ac.in',
    'Indian Institute of Management Ahmedabad': 'iima.ac.in',
    'Banaras Hindu University': 'bhu.ac.in',
    'Manipal Academy of Higher Education': 'manipal.edu',
    'Indian Institute of Science Bangalore': 'iisc.ac.in'
  };
  
  return domainMap[universityName] || 'student.edu.in';
}

// Hàm helper cho web page sử dụng
window.studentCardVerifier = {
  start: function() {
    window.postMessage({
      type: 'START_STUDENT_VERIFICATION'
    }, '*');
  },
  
  // Hàm mới để gửi data cùng lúc
  startWithData: function(studentInfo) {
    // Gửi data trước
    window.postMessage({
      type: 'STUDENT_CARD_DATA',
      studentInfo: studentInfo
    }, '*');
    
    // Sau đó start verification
    setTimeout(() => {
      window.postMessage({
        type: 'START_STUDENT_VERIFICATION'
      }, '*');
    }, 100);
  }
};
