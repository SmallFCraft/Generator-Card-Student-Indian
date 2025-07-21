interface GeneratedStudentData {
  name: string;
  fatherName: string;
  mobileNumber: string;
  batchYear: string;
}

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export const generateStudentData = async (): Promise<GeneratedStudentData> => {
  if (!GEMINI_API_KEY) {
    console.warn("Gemini API key not configured. Using fallback data generation.");
    const currentYear = new Date().getFullYear();
    const validBatchYears = [];

    for (let i = 0; i < 5; i++) {
      const startYear = currentYear - i;
      const endYear = startYear + 4;
      validBatchYears.push(`${startYear}-${endYear}`);
    }

    return generateFallbackData(validBatchYears);
  }

  const currentYear = new Date().getFullYear();
  const validBatchYears = [];
  
  // Generate valid batch years (students should be 18+ in 2025)
  for (let i = 0; i < 5; i++) {
    const startYear = currentYear - i;
    const endYear = startYear + 4;
    validBatchYears.push(`${startYear}-${endYear}`);
  }

  const prompt = `You are generating realistic mock data for Indian students in a university database.

Requirements:
- Name: A full Indian name (first and last), avoid repetition in each request. Vary names from different Indian regions (e.g., North, South, East, West).
- Father's Name: A full male Indian name, not similar to the student's name.
- Mobile Number: Format as +91XXXXXXXXXX (first digit must be 6, 7, 8, or 9).
- Academic Batch: Pick one from: ${validBatchYears.join(', ')}

Output format (JSON only):
{
  "name": "FirstName LastName",
  "fatherName": "FatherFirstName FatherLastName",
  "mobileNumber": "+91 XXXXXXXXXX",
  "batchYear": "YYYY-YYYY"
}

⚠️ Output only the JSON object. Do not repeat names like 'Arjun Sharma' or 'Priya Patel'. Avoid reused examples.`;


  try {
    console.log('Making request to Gemini API...');

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
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

    // Check if the candidate was blocked
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      console.error('Candidate blocked or incomplete:', candidate.finishReason);
      throw new Error(`Content generation blocked: ${candidate.finishReason}`);
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

    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', generatedText);
      throw new Error('No valid JSON found in Gemini response');
    }

    let parsedData;
    try {
      parsedData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Raw JSON:', jsonMatch[0]);
      throw new Error('Failed to parse JSON from Gemini response');
    }
    
    // Validate the generated data
    if (!parsedData.name || !parsedData.fatherName || !parsedData.mobileNumber || !parsedData.batchYear) {
      throw new Error('Generated data is missing required fields');
    }

    // Validate mobile number format
    const mobileRegex = /^\+91 [6-9]\d{9}$/;
    if (!mobileRegex.test(parsedData.mobileNumber)) {
      // Fix mobile number format if needed
      const digits = parsedData.mobileNumber.replace(/\D/g, '');
      if (digits.length >= 10) {
        const lastTen = digits.slice(-10);
        if (['6', '7', '8', '9'].includes(lastTen[0])) {
          parsedData.mobileNumber = `+91 ${lastTen}`;
        } else {
          parsedData.mobileNumber = `+91 ${Math.floor(Math.random() * 4) + 6}${lastTen.slice(1)}`;
        }
      } else {
        // Generate a random valid mobile number
        const firstDigit = Math.floor(Math.random() * 4) + 6; // 6, 7, 8, or 9
        const remainingDigits = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
        parsedData.mobileNumber = `+91 ${firstDigit}${remainingDigits}`;
      }
    }

    // Validate batch year
    if (!validBatchYears.includes(parsedData.batchYear)) {
      parsedData.batchYear = validBatchYears[Math.floor(Math.random() * validBatchYears.length)];
    }

    return parsedData;

  } catch (error) {
    console.error('Error generating student data:', error);
    
    // Fallback: generate random data if API fails
    const fallbackData = generateFallbackData(validBatchYears);
    return fallbackData;
  }
};

export const generateFallbackData = (validBatchYears: string[]): GeneratedStudentData => {
  const indianNames = [
    "Aarav Sharma", "Vivaan Patel", "Aditya Kumar", "Vihaan Singh", "Arjun Gupta",
    "Sai Reddy", "Reyansh Agarwal", "Ayaan Khan", "Krishna Yadav", "Ishaan Joshi",
    "Ananya Sharma", "Diya Patel", "Aadhya Kumar", "Kavya Singh", "Arya Gupta",
    "Navya Reddy", "Kiara Agarwal", "Myra Khan", "Anika Yadav", "Saanvi Joshi"
  ];

  const fatherNames = [
    "Rajesh Sharma", "Suresh Patel", "Ramesh Kumar", "Mahesh Singh", "Dinesh Gupta",
    "Venkat Reddy", "Prakash Agarwal", "Ashok Khan", "Ravi Yadav", "Amit Joshi",
    "Vikram Sharma", "Sanjay Patel", "Anil Kumar", "Deepak Singh", "Manoj Gupta"
  ];

  const randomName = indianNames[Math.floor(Math.random() * indianNames.length)];
  const randomFatherName = fatherNames[Math.floor(Math.random() * fatherNames.length)];
  const randomBatchYear = validBatchYears[Math.floor(Math.random() * validBatchYears.length)];
  
  // Generate random mobile number
  const firstDigit = Math.floor(Math.random() * 4) + 6; // 6, 7, 8, or 9
  const remainingDigits = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  const mobileNumber = `+91 ${firstDigit}${remainingDigits}`;

  return {
    name: randomName,
    fatherName: randomFatherName,
    mobileNumber: mobileNumber,
    batchYear: randomBatchYear
  };
};
