// 🎯 FIRST NAME SELECTOR FINDER - Paste this into SheerID Console

console.log('🔍 Finding First Name field selector...');

// Find all input fields
const inputs = Array.from(document.querySelectorAll('input')).filter(inp => inp.offsetParent !== null);

// Find First Name candidates
const firstNameFields = inputs.filter(input => {
  const searchText = (
    (input.id || '') + ' ' +
    (input.name || '') + ' ' +
    (input.placeholder || '') + ' ' +
    (input.className || '') + ' ' +
    (input.getAttribute('aria-label') || '') + ' ' +
    (input.autocomplete || '')
  ).toLowerCase();
  
  return searchText.includes('first') || 
         searchText.includes('given') || 
         searchText.includes('fname') ||
         input.autocomplete === 'given-name';
});

console.log('🎯 First Name field candidates:');
firstNameFields.forEach((input, index) => {
  const selector = input.id ? `#${input.id}` : 
                   input.name ? `input[name="${input.name}"]` :
                   input.autocomplete ? `input[autocomplete="${input.autocomplete}"]` :
                   input.className ? `input.${input.className.split(' ')[0]}` :
                   `input[placeholder="${input.placeholder}"]`;
  
  console.log(`${index + 1}. SELECTOR: ${selector}`);
  console.log(`   ID: ${input.id || 'none'}`);
  console.log(`   Name: ${input.name || 'none'}`);
  console.log(`   Autocomplete: ${input.autocomplete || 'none'}`);
  console.log(`   Placeholder: ${input.placeholder || 'none'}`);
  console.log(`   Class: ${input.className || 'none'}`);
  console.log(`   Element:`, input);
  console.log('---');
});

// Test filling the first candidate
if (firstNameFields.length > 0) {
  const testField = firstNameFields[0];
  const originalValue = testField.value;
  
  console.log('🧪 Testing fill with first candidate...');
  testField.value = 'TEST_FIRST_NAME';
  testField.dispatchEvent(new Event('input', { bubbles: true }));
  
  setTimeout(() => {
    if (testField.value === 'TEST_FIRST_NAME') {
      console.log('✅ SUCCESS! First Name field can be filled');
      console.log('🎯 USE THIS SELECTOR:', 
        testField.id ? `#${testField.id}` : 
        testField.name ? `input[name="${testField.name}"]` :
        testField.autocomplete ? `input[autocomplete="${testField.autocomplete}"]` :
        `input[placeholder="${testField.placeholder}"]`
      );
    } else {
      console.log('❌ Fill test failed');
    }
    
    // Restore original value
    testField.value = originalValue;
    testField.dispatchEvent(new Event('input', { bubbles: true }));
  }, 1000);
}

if (firstNameFields.length === 0) {
  console.log('❌ No First Name field found. All input fields:');
  inputs.forEach((input, index) => {
    console.log(`${index + 1}. ${input.id || input.name || input.placeholder || 'no-identifier'}:`, input);
  });
}
