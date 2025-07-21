import { CardTemplate, StudentData, FormFieldType } from '@/types/card';
import { getRandomAvatar } from '@/lib/avatarUtils';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Helper function to generate prompt based on card template
const generatePromptForTemplate = (cardTemplate: CardTemplate): string => {
  const requiredFields = cardTemplate.formFields.filter(field =>
    field.required && field.id !== 'photo'
  );

  const jsonFields = requiredFields.map(field => `"${field.id}": "value"`).join(',');

  // Check if this template has both department and degree fields
  const hasDepartmentAndDegree = requiredFields.some(f => f.id === 'department') &&
                                 requiredFields.some(f => f.id === 'degree');

  let prompt = `Generate ONE Indian student data object. Return only a single JSON object: {${jsonFields}}`;

  if (hasDepartmentAndDegree) {
    prompt += ` Ensure degree matches department: Engineering departments should have B.Tech/M.Tech/PhD, Science departments should have B.Sc/M.Sc/PhD.`;
  }

  return prompt;
};

// Shorter prompt for MAX_TOKENS fallback
const generateShortPrompt = (cardTemplate: CardTemplate): string => {
  const requiredFields = cardTemplate.formFields.filter(field =>
    field.required && field.id !== 'photo'
  );

  const jsonFields = requiredFields.map(field => `"${field.id}":""`).join(',');

  return `Generate realistic Indian student data. Return single JSON: {${jsonFields}}`;
};

export const generateStudentData = async (cardTemplate: CardTemplate, useShortPrompt = false): Promise<StudentData> => {
  console.log('generateStudentData called for:', cardTemplate.university.name);

  if (!GEMINI_API_KEY) {
    console.warn("Gemini API key not configured. Using fallback data generation.");
    return generateFallbackData(cardTemplate);
  }

  // Auto-use short prompt for templates with many fields to avoid MAX_TOKENS
  const requiredFieldsCount = cardTemplate.formFields.filter(field => field.required && field.id !== 'photo').length;
  const shouldUseShortPrompt = useShortPrompt || requiredFieldsCount > 6;

  const prompt = shouldUseShortPrompt ? generateShortPrompt(cardTemplate) : generatePromptForTemplate(cardTemplate);

  console.log(`Using ${shouldUseShortPrompt ? 'short' : 'normal'} prompt for ${cardTemplate.university.name} (${requiredFieldsCount} fields)`);
  console.log('Prompt:', prompt);


  try {
    console.log('Making request to Gemini API...');

    const requestBody = {
      systemInstruction: {
        parts: [{
          text: "You must return exactly ONE JSON object. Do not return arrays or multiple objects. Return only a single JSON object with the requested fields."
        }]
      },
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 1.2,
        topK: 20,
        topP: 0.9,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      });
      throw new Error(`Gemini API request failed: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    // Log the response for debugging
    console.log('Gemini API Response:', JSON.stringify(data, null, 2));

    // Check for various error conditions in the response
    if (data.error) {
      console.error('Gemini API returned error:', data.error);
      throw new Error(`Gemini API error: ${data.error.message || 'Unknown error'}`);
    }

    if (!data.candidates) {
      console.error('No candidates field in response:', data);
      throw new Error('No candidates field returned from Gemini API');
    }

    if (!Array.isArray(data.candidates)) {
      console.error('Candidates is not an array:', data.candidates);
      throw new Error('Invalid candidates format from Gemini API');
    }

    if (data.candidates.length === 0) {
      console.error('Empty candidates array:', data);
      throw new Error('No candidates returned from Gemini API - possibly blocked by safety filters');
    }

    const candidate = data.candidates[0];
    console.log('First candidate:', JSON.stringify(candidate, null, 2));

    // Check if the candidate was blocked or incomplete
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      console.error('Candidate blocked or incomplete:', candidate.finishReason);

      // Handle MAX_TOKENS specifically - try to use partial content if available
      if (candidate.finishReason === 'MAX_TOKENS' && candidate.content?.parts?.[0]?.text) {
        console.warn('Response truncated due to MAX_TOKENS, attempting to parse partial content');
        // Continue with partial content - don't throw error yet
      } else {
        throw new Error(`Content generation blocked: ${candidate.finishReason}`);
      }
    }

    if (!candidate.content) {
      console.error('No content in candidate:', candidate);
      throw new Error('No content in candidate from Gemini API');
    }

    if (!candidate.content.parts || !Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
      console.error('Invalid content parts:', candidate.content);
      throw new Error('Invalid content parts structure from Gemini API');
    }

    const generatedText = candidate.content.parts[0].text;

    if (!generatedText || typeof generatedText !== 'string') {
      console.error('Invalid generated text:', generatedText);
      throw new Error('Invalid text content from Gemini API');
    }

    console.log('Generated text:', generatedText);

    // Extract JSON from the response - handle partial content
    // First try to find a single object
    let jsonMatch = generatedText.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);

    if (!jsonMatch) {
      // Fallback: try to find any JSON structure
      jsonMatch = generatedText.match(/\{[\s\S]*?\}/);
    }

    if (!jsonMatch) {
      console.error('No JSON found in response:', generatedText);
      throw new Error('No valid JSON found in Gemini response');
    }

    let parsedData;
    try {
      const jsonString = jsonMatch[0];
      parsedData = JSON.parse(jsonString);

      // If we got an array, take the first object
      if (Array.isArray(parsedData)) {
        console.warn('AI returned array instead of single object, taking first item');
        parsedData = parsedData[0];
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Raw JSON:', jsonMatch[0]);

      // Try to fix incomplete JSON for MAX_TOKENS case
      let jsonString = jsonMatch[0];
      if (!jsonString.endsWith('}')) {
        // Try to close incomplete JSON
        const openBraces = (jsonString.match(/\{/g) || []).length;
        const closeBraces = (jsonString.match(/\}/g) || []).length;
        const missingBraces = openBraces - closeBraces;

        // Remove trailing comma if exists
        jsonString = jsonString.replace(/,\s*$/, '');

        // Add missing closing braces
        for (let i = 0; i < missingBraces; i++) {
          jsonString += '}';
        }

        try {
          parsedData = JSON.parse(jsonString);
          console.log('Successfully parsed fixed JSON:', parsedData);
        } catch (fixError) {
          console.error('Failed to fix JSON:', fixError);
          throw new Error('Failed to parse JSON from Gemini response');
        }
      } else {
        throw new Error('Failed to parse JSON from Gemini response');
      }
    }
    
    // Validate the generated data based on template requirements
    const requiredFields = cardTemplate.formFields.filter(field =>
      field.required && field.id !== 'photo'
    );

    // Check for missing fields and fill with fallback data if needed
    let hasMissingFields = false;
    for (const field of requiredFields) {
      if (!parsedData[field.id]) {
        console.warn(`Generated data is missing required field: ${field.id}, using fallback`);
        hasMissingFields = true;
      }
    }

    // If we have missing fields (likely due to MAX_TOKENS), merge with fallback data
    if (hasMissingFields) {
      const fallbackData = generateFallbackData(cardTemplate);
      parsedData = { ...fallbackData, ...parsedData }; // Prefer AI data where available
    }

    // Validate and fix specific field formats
    validateAndFixFieldData(parsedData, cardTemplate);

    // Add random avatar if photo field exists
    await addRandomAvatarIfNeeded(parsedData, cardTemplate);

    return parsedData;

  } catch (error) {
    console.error('Error generating student data:', error);

    // If MAX_TOKENS error and we haven't tried the shortest prompt yet, retry
    if (!shouldUseShortPrompt && error instanceof Error && error.message.includes('MAX_TOKENS')) {
      console.log('Retrying with shortest prompt due to MAX_TOKENS error...');
      try {
        return await generateStudentData(cardTemplate, true);
      } catch (retryError) {
        console.error('Retry with shortest prompt also failed:', retryError);
      }
    }

    // Show user-friendly error message for MAX_TOKENS
    if (error instanceof Error && error.message.includes('MAX_TOKENS')) {
      console.warn('AI response was truncated due to length limits. Using generated fallback data.');
    }

    // Fallback: generate random data if API fails
    const fallbackData = await generateFallbackDataWithAvatar(cardTemplate);
    return fallbackData;
  }
};

// Helper function to add random avatar if photo field exists
const addRandomAvatarIfNeeded = async (data: StudentData, cardTemplate: CardTemplate) => {
  // Check if template has photo field
  const hasPhotoField = cardTemplate.formFields.some(field => field.id === 'photo');

  if (hasPhotoField && !data.photo) {
    try {
      console.log('Adding random avatar...');
      const randomAvatar = await getRandomAvatar();

      if (randomAvatar) {
        data.photo = randomAvatar;
        console.log('Random avatar added successfully');
      } else {
        console.warn('No random avatar available');
      }
    } catch (error) {
      console.error('Error adding random avatar:', error);
      // Don't throw error, just continue without photo
    }
  }
};

// Helper function to validate and fix field data
const validateAndFixFieldData = (data: StudentData, cardTemplate: CardTemplate) => {
  cardTemplate.formFields.forEach(field => {
    const value = data[field.id];

    switch (field.id) {
      case 'mobileNumber':
        if (value) {
          const mobileRegex = /^\+91\s?[6-9]\d{9}$/;
          if (!mobileRegex.test(value)) {
            const digits = value.replace(/\D/g, '');
            if (digits.length >= 10) {
              const lastTen = digits.slice(-10);
              if (['6', '7', '8', '9'].includes(lastTen[0])) {
                data[field.id] = `+91 ${lastTen}`;
              } else {
                data[field.id] = `+91 ${Math.floor(Math.random() * 4) + 6}${lastTen.slice(1)}`;
              }
            } else {
              const firstDigit = Math.floor(Math.random() * 4) + 6;
              const remainingDigits = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
              data[field.id] = `+91 ${firstDigit}${remainingDigits}`;
            }
          }
        }
        break;

      case 'batchYear':
        if (value && field.options) {
          const validOptions = field.options.map(opt => opt.value);
          if (!validOptions.includes(value)) {
            data[field.id] = validOptions[Math.floor(Math.random() * validOptions.length)];
          }
        }
        break;

      case 'department':
        if (value && field.options) {
          const validOptions = field.options.map(opt => opt.value);
          if (!validOptions.includes(value)) {
            data[field.id] = validOptions[Math.floor(Math.random() * validOptions.length)];
          }
        }
        break;

      case 'degree':
        if (value && field.options) {
          const validOptions = field.options.map(opt => opt.value);
          if (!validOptions.includes(value)) {
            // Get department to determine appropriate degree
            const department = data['department'];
            let appropriateDegrees = validOptions;

            if (department) {
              if (department.includes('Engineering')) {
                appropriateDegrees = validOptions.filter(deg => ['B.Tech', 'M.Tech', 'PhD'].includes(deg));
              } else if (['Mathematics', 'Physics', 'Chemistry'].includes(department)) {
                appropriateDegrees = validOptions.filter(deg => ['B.Sc', 'M.Sc', 'PhD'].includes(deg));
              } else if (department.includes('Business') || department.includes('Management')) {
                appropriateDegrees = validOptions.filter(deg => ['MBA', 'MS'].includes(deg));
              }
            }

            data[field.id] = appropriateDegrees[Math.floor(Math.random() * appropriateDegrees.length)];
          }
        }
        break;
    }
  });

  // Final validation: ensure degree-department compatibility
  const department = data['department'];
  const degree = data['degree'];

  if (department && degree) {
    let isCompatible = true;

    if (department.includes('Engineering') && !['B.Tech', 'M.Tech', 'PhD'].includes(degree)) {
      isCompatible = false;
    } else if (['Mathematics', 'Physics', 'Chemistry'].includes(department) &&
               !['B.Sc', 'M.Sc', 'PhD'].includes(degree)) {
      isCompatible = false;
    } else if ((department.includes('Business') || department.includes('Management')) &&
               !['MBA', 'MS'].includes(degree)) {
      isCompatible = false;
    }

    if (!isCompatible) {
      // Fix degree to match department
      if (department.includes('Engineering')) {
        data['degree'] = ['B.Tech', 'M.Tech', 'PhD'][Math.floor(Math.random() * 3)];
      } else if (['Mathematics', 'Physics', 'Chemistry'].includes(department)) {
        data['degree'] = ['B.Sc', 'M.Sc', 'PhD'][Math.floor(Math.random() * 3)];
      } else {
        data['degree'] = ['B.Tech', 'M.Tech'][Math.floor(Math.random() * 2)]; // Default to engineering
      }
      console.log(`Fixed degree-department mismatch: ${department} -> ${data['degree']}`);
    }
  }
};

export const generateFallbackData = (cardTemplate: CardTemplate): StudentData => {
  const indianNames = [
    "Aarav Sharma", "Vivaan Patel", "Aditya Kumar", "Vihaan Singh", "Arjun Gupta",
    "Sai Reddy", "Reyansh Agarwal", "Ayaan Khan", "Krishna Yadav", "Ishaan Joshi",
    "Ananya Sharma", "Diya Patel", "Aadhya Kumar", "Kavya Singh", "Arya Gupta",
    "Navya Reddy", "Kiara Agarwal", "Myra Khan", "Anika Yadav", "Saanvi Joshi"
  ];

  const fatherNames = [
    "Rajesh Sharma", "Suresh Patel", "Ramesh Kumar", "Mahesh Singh", "Dinesh Gupta",
    "Venkat Reddy", "Prakash Agarwal", "Ashok Khan", "Ravi Yadav", "Amit Joshi",
    "Vikram Sharma", "Sanjay Patel", "Anil Kumar", "Deepak Singh", "Manoj Gupte"
  ];

  // Generate data based on template fields
  const fallbackData: StudentData = {};

  // First pass: generate all fields except degree
  cardTemplate.formFields.forEach(field => {
    if (field.id === 'photo') {
      fallbackData[field.id] = null;
      return;
    }

    if (field.id === 'degree') {
      return; // Skip degree in first pass
    }

    switch (field.id) {
      case 'name':
        fallbackData[field.id] = indianNames[Math.floor(Math.random() * indianNames.length)];
        break;

      case 'fatherName':
        fallbackData[field.id] = fatherNames[Math.floor(Math.random() * fatherNames.length)];
        break;

      case 'mobileNumber':
        const firstDigit = Math.floor(Math.random() * 4) + 6; // 6, 7, 8, or 9
        const remainingDigits = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
        fallbackData[field.id] = `+91 ${firstDigit}${remainingDigits}`;
        break;

      case 'batchYear':
      case 'department':
        if (field.options && field.options.length > 0) {
          fallbackData[field.id] = field.options[Math.floor(Math.random() * field.options.length)].value;
        }
        break;

      case 'dateOfBirth':
        // Generate date for someone 18-25 years old
        const age = Math.floor(Math.random() * 8) + 18; // 18-25 years old
        const birthYear = new Date().getFullYear() - age;
        const birthMonth = Math.floor(Math.random() * 12) + 1;
        const birthDay = Math.floor(Math.random() * 28) + 1;
        fallbackData[field.id] = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
        break;

      case 'enrollmentNo':
        // Generate random enrollment number
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        let enrollmentNo = '';
        for (let i = 0; i < 2; i++) {
          enrollmentNo += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        for (let i = 0; i < 8; i++) {
          enrollmentNo += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        fallbackData[field.id] = enrollmentNo;
        break;

      case 'address':
        const addresses = [
          "123 MG Road, Bangalore, Karnataka",
          "456 Park Street, Kolkata, West Bengal",
          "789 Connaught Place, New Delhi",
          "321 Marine Drive, Mumbai, Maharashtra",
          "654 Anna Salai, Chennai, Tamil Nadu"
        ];
        fallbackData[field.id] = addresses[Math.floor(Math.random() * addresses.length)];
        break;

      case 'dateOfIssue':
        // Generate recent date (within last year)
        const issueDate = new Date();
        issueDate.setDate(issueDate.getDate() - Math.floor(Math.random() * 365));
        fallbackData[field.id] = issueDate.toISOString().split('T')[0];
        break;

      case 'validUntil':
        // Generate date 3-4 years from now
        const validDate = new Date();
        validDate.setFullYear(validDate.getFullYear() + 3 + Math.floor(Math.random() * 2));
        fallbackData[field.id] = validDate.toISOString().split('T')[0];
        break;

      default:
        // For any other field, generate a placeholder
        fallbackData[field.id] = `Sample ${field.label}`;
        break;
    }
  });

  // Second pass: generate degree based on department
  const degreeField = cardTemplate.formFields.find(field => field.id === 'degree');
  if (degreeField && degreeField.options && degreeField.options.length > 0) {
    const department = fallbackData['department'];
    let appropriateDegrees = degreeField.options.map(opt => opt.value);

    if (department) {
      if (department.includes('Engineering')) {
        appropriateDegrees = appropriateDegrees.filter(deg => ['B.Tech', 'M.Tech', 'PhD'].includes(deg));
      } else if (['Mathematics', 'Physics', 'Chemistry'].includes(department)) {
        appropriateDegrees = appropriateDegrees.filter(deg => ['B.Sc', 'M.Sc', 'PhD'].includes(deg));
      } else if (department.includes('Business') || department.includes('Management')) {
        appropriateDegrees = appropriateDegrees.filter(deg => ['MBA', 'MS'].includes(deg));
      }
    }

    if (appropriateDegrees.length > 0) {
      fallbackData['degree'] = appropriateDegrees[Math.floor(Math.random() * appropriateDegrees.length)];
    } else {
      fallbackData['degree'] = degreeField.options[0].value; // Fallback to first option
    }
  }

  return fallbackData;
};

// Generate fallback data with random avatar
export const generateFallbackDataWithAvatar = async (cardTemplate: CardTemplate): Promise<StudentData> => {
  const fallbackData = generateFallbackData(cardTemplate);

  // Add random avatar if photo field exists
  await addRandomAvatarIfNeeded(fallbackData, cardTemplate);

  return fallbackData;
};
