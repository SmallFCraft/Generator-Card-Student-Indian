// Tiện ích này được làm bởi Hung Vu : fb.com/hungvu25
// 🔍 EMERGENCY DEBUG SCRIPT - Paste vào Console của SheerID page
// (Đã loại bỏ toàn bộ log ra console)
const allInputs = Array.from(document.querySelectorAll('input')).filter(inp => inp.offsetParent !== null);

// 2. Tìm field cho First Name
const firstNameCandidates = allInputs.filter(input => {
  const text = (input.id + ' ' + input.name + ' ' + input.placeholder + ' ' + input.className + ' ' + (input.getAttribute('aria-label') || '')).toLowerCase();
  return text.includes('first') || text.includes('given') || text.includes('fname') || input.autocomplete === 'given-name';
});



// 3. Tìm field cho Last Name
const lastNameCandidates = allInputs.filter(input => {
  const text = (input.id + ' ' + input.name + ' ' + input.placeholder + ' ' + input.className + ' ' + (input.getAttribute('aria-label') || '')).toLowerCase();
  return text.includes('last') || text.includes('family') || text.includes('lname') || text.includes('surname') || input.autocomplete === 'family-name';
});



// 4. Tìm field cho Email
const emailCandidates = allInputs.filter(input => {
  const text = (input.id + ' ' + input.name + ' ' + input.placeholder + ' ' + input.className).toLowerCase();
  return text.includes('email') || input.type === 'email' || input.autocomplete === 'email';
});



// 5. Tìm field cho School
const schoolCandidates = allInputs.filter(input => {
  const text = (input.id + ' ' + input.name + ' ' + input.placeholder + ' ' + input.className).toLowerCase();
  return text.includes('school') || text.includes('college') || text.includes('university') || text.includes('institution');
});



// 6. Tìm Date fields
const dateCandidates = allInputs.filter(input => {
  const text = (input.id + ' ' + input.name + ' ' + input.placeholder + ' ' + input.className + ' ' + input.autocomplete).toLowerCase();
  return text.includes('birth') || text.includes('date') || text.includes('month') || text.includes('day') || text.includes('year') || 
         input.autocomplete.includes('bday') || input.type === 'date';
});










