// Debug helper for SheerID form - Paste this into browser console

console.log('🔍 DEBUG: Analyzing SheerID form fields...');

// Function to get all form fields
function analyzeFormFields() {
  const inputs = document.querySelectorAll('input, select, textarea');
  const results = [];
  
  inputs.forEach((input, index) => {
    const info = {
      index: index,
      tagName: input.tagName,
      type: input.type || 'text',
      name: input.name || '',
      id: input.id || '',
      placeholder: input.placeholder || '',
      autocomplete: input.autocomplete || '',
      className: input.className || '',
      ariaLabel: input.getAttribute('aria-label') || '',
      value: input.value || '',
      visible: input.offsetParent !== null
    };
    
    if (info.visible) {
      results.push(info);
    }
  });
  
  return results;
}

// Analyze all fields
const fields = analyzeFormFields();

console.log('📋 All visible form fields:');
console.table(fields);

// Find specific fields
console.log('\n🎯 Looking for specific fields:');

// School field
const schoolFields = fields.filter(f => 
  f.name.toLowerCase().includes('school') ||
  f.id.toLowerCase().includes('school') ||
  f.id.toLowerCase().includes('college') ||
  f.placeholder.toLowerCase().includes('school') ||
  f.autocomplete === 'organization'
);
console.log('🏫 School fields:', schoolFields);

// First name (SheerID specific)
const firstNameFields = fields.filter(f => 
  f.id === 'sid-first-name' ||
  f.autocomplete === 'given-name' ||
  f.name.toLowerCase().includes('first') ||
  f.placeholder.toLowerCase().includes('first')
);
console.log('👤 First name fields:', firstNameFields);

// Last name (SheerID specific)  
const lastNameFields = fields.filter(f => 
  f.id === 'sid-last-name' ||
  f.autocomplete === 'family-name' ||
  f.name.toLowerCase().includes('last') ||
  f.placeholder.toLowerCase().includes('last')
);
console.log('👥 Last name fields:', lastNameFields);

// Email
const emailFields = fields.filter(f => 
  f.autocomplete === 'email' ||
  f.type === 'email' ||
  f.name.toLowerCase().includes('email')
);
console.log('📧 Email fields:', emailFields);

// Date fields (SheerID specific)
const dateFields = fields.filter(f => 
  f.autocomplete === 'bday-day' ||
  f.autocomplete === 'bday-year' ||
  f.name.toLowerCase().includes('birth') ||
  f.name.toLowerCase().includes('date') ||
  f.name.toLowerCase().includes('month') ||
  f.name.toLowerCase().includes('day') ||
  f.name.toLowerCase().includes('year') ||
  f.type === 'date'
);
console.log('📅 Date fields:', dateFields);

// Look for dropdown elements
console.log('\n🔽 Looking for dropdown elements:');
const dropdownElements = document.querySelectorAll('[class*="dropdown"], [class*="list"], [class*="item"], [role="option"], [role="listbox"]');
dropdownElements.forEach((el, index) => {
  if (el.offsetParent !== null) {
    console.log(`Dropdown ${index}:`, {
      text: el.textContent?.substring(0, 50),
      classes: el.className,
      id: el.id,
      role: el.role,
      visible: el.offsetParent !== null
    });
  }
});

// Look for college name items specifically
console.log('\n🎓 Looking for college name items:');
const collegeItems = document.querySelectorAll('[class*="college"], [class*="school"], [id*="college"], [id*="school"]');
collegeItems.forEach((el, index) => {
  if (el.offsetParent !== null) {
    console.log(`College item ${index}:`, {
      text: el.textContent?.substring(0, 50),
      classes: el.className,
      id: el.id,
      tagName: el.tagName,
      visible: el.offsetParent !== null
    });
  }
});

// Look for month dropdown items specifically
console.log('\n📅 Looking for month dropdown items:');
const monthItems = document.querySelectorAll('[class*="birthdate_month"], [class*="month-item"], [id*="month-item"]');
monthItems.forEach((el, index) => {
  if (el.offsetParent !== null) {
    console.log(`Month item ${index}:`, {
      text: el.textContent?.substring(0, 30),
      classes: el.className,
      id: el.id,
      tagName: el.tagName,
      visible: el.offsetParent !== null
    });
  }
});

console.log('\n✅ Analysis complete! Check the tables above for field information.');
