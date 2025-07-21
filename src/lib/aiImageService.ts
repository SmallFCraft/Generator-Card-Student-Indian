// AI Image Generation Service - Sử dụng Gemini 2.5 Flash và các AI khác để tạo ảnh

interface AIImageOptions {
  width?: number;
  height?: number;
  gender?: 'male' | 'female' | 'random';
  style?: 'realistic' | 'professional' | 'casual' | 'portrait';
  quality?: 'standard' | 'hd';
}

interface AIImageResponse {
  success: boolean;
  imageUrl?: string;
  base64?: string;
  error?: string;
  provider?: string;
}

export class AIImageService {
  private static instance: AIImageService;
  private readonly GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  private readonly OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  private readonly STABILITY_API_KEY = process.env.NEXT_PUBLIC_STABILITY_API_KEY;

  public static getInstance(): AIImageService {
    if (!AIImageService.instance) {
      AIImageService.instance = new AIImageService();
    }
    return AIImageService.instance;
  }

  /**
   * Tạo ảnh sinh viên Ấn Độ bằng AI
   */
  public async generateIndianStudentPhoto(
    name: string, 
    options: AIImageOptions = {}
  ): Promise<AIImageResponse> {
    const {
      width = 512,
      height = 512,
      gender = 'random',
      style = 'professional',
      quality = 'hd'
    } = options;

    // Xác định giới tính từ tên nếu random
    const actualGender = gender === 'random' ? this.detectGenderFromName(name) : gender;
    
    // Tạo prompt chi tiết
    const prompt = this.createDetailedPrompt(name, actualGender, style);

    // Thử các AI providers theo thứ tự ưu tiên (loại bỏ DiceBear)
    const providers = [
      () => this.generateWithGemini(prompt, { width, height, quality }),
      () => this.generateWithDALLE(prompt, { width, height, quality }),
      () => this.generateWithStabilityAI(prompt, { width, height, quality })
    ];

    for (const provider of providers) {
      try {
        const result = await provider();
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.warn('AI provider failed:', error);
      }
    }

    return {
      success: false,
      error: 'All AI image generation providers failed'
    };
  }



  /**
   * Tạo ảnh bằng Gemini 2.5 Pro với text-to-image prompt generation
   */
  private async generateWithGemini(
    prompt: string,
    options: { width: number; height: number; quality: string }
  ): Promise<AIImageResponse> {
    if (!this.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    try {
      console.log('🤖 Using Gemini 2.5 Pro to generate enhanced prompt for image generation');

      // Sử dụng Gemini 2.5 Pro để tạo prompt chi tiết hơn cho AI image generation
      const enhancedPromptRequest = {
        contents: [{
          parts: [{
            text: `Create a detailed, professional prompt for AI image generation based on this request: "${prompt}"

Requirements:
- Focus on creating a realistic Indian university student photo
- Include specific details about lighting, composition, and style
- Mention authentic Indian features and appearance
- Keep the prompt under 200 words
- Make it suitable for professional AI image generators like DALL-E or Midjourney

Return ONLY the enhanced prompt, no explanations.`
          }]
        }],
        generationConfig: {
          temperature: 2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 300, // Giảm tokens để tránh MAX_TOKENS error
          candidateCount: 1
        }
      };

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${this.GEMINI_API_KEY}`;

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enhancedPromptRequest)
      });

      if (!response.ok) {
        throw new Error(`Gemini API failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const enhancedPrompt = data.candidates[0].content.parts[0].text.trim();
        console.log('✅ Enhanced prompt generated:', enhancedPrompt);

        // Tạm thời return enhanced prompt để sử dụng với DALL-E hoặc Stability AI
        // Vì Gemini chưa hỗ trợ image generation trực tiếp
        throw new Error(`Enhanced prompt ready: ${enhancedPrompt}`);
      }

      throw new Error('Invalid response from Gemini API');

    } catch (error) {
      console.error('❌ Gemini prompt enhancement failed:', error);
      throw error;
    }
  }

  /**
   * Tạo ảnh bằng DALL-E 3
   */
  private async generateWithDALLE(
    prompt: string,
    options: { width: number; height: number; quality: string }
  ): Promise<AIImageResponse> {
    if (!this.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: `${options.width}x${options.height}`,
        quality: options.quality,
        response_format: "url"
      })
    });

    if (!response.ok) {
      throw new Error(`DALL-E API failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.data && data.data[0] && data.data[0].url) {
      return {
        success: true,
        imageUrl: data.data[0].url,
        provider: 'DALL-E 3'
      };
    }

    throw new Error('Invalid response from DALL-E API');
  }

  /**
   * Tạo ảnh bằng Stability AI
   */
  private async generateWithStabilityAI(
    prompt: string,
    options: { width: number; height: number; quality: string }
  ): Promise<AIImageResponse> {
    if (!this.STABILITY_API_KEY) {
      throw new Error('Stability AI API key not configured');
    }

    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.STABILITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: options.height,
        width: options.width,
        steps: 30,
        samples: 1,
      })
    });

    if (!response.ok) {
      throw new Error(`Stability AI failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.artifacts && data.artifacts[0] && data.artifacts[0].base64) {
      return {
        success: true,
        base64: `data:image/png;base64,${data.artifacts[0].base64}`,
        provider: 'Stability AI'
      };
    }

    throw new Error('Invalid response from Stability AI');
  }

  /**
   * Tạo prompt chi tiết cho AI
   */
  private createDetailedPrompt(name: string, gender: string, style: string): string {
    const firstName = name.split(' ')[0];
    
    const basePrompt = `Professional headshot portrait of a young Indian ${gender} university student named ${firstName}.`;
    
    const styleDescriptions = {
      professional: "wearing formal attire, clean background, professional lighting, confident expression",
      casual: "wearing casual clothes, natural lighting, friendly smile, relaxed pose",
      portrait: "artistic portrait style, soft lighting, thoughtful expression",
      realistic: "photorealistic, natural skin texture, authentic Indian features"
    };

    const additionalDetails = [
      "high quality, detailed facial features",
      "authentic Indian appearance",
      "clear, sharp focus",
      "good lighting and composition",
      "university student age (18-25 years old)",
      "friendly and approachable expression"
    ];

    return `${basePrompt} ${styleDescriptions[style as keyof typeof styleDescriptions]}. ${additionalDetails.join(', ')}.`;
  }

  /**
   * Đoán giới tính từ tên
   */
  private detectGenderFromName(name: string): 'male' | 'female' {
    const firstName = name.toLowerCase().split(' ')[0];
    
    const femaleNames = [
      'ananya', 'diya', 'aadhya', 'kavya', 'arya', 'navya', 'kiara', 'myra', 'anika', 'saanvi',
      'priya', 'riya', 'shreya', 'pooja', 'neha', 'simran', 'divya', 'anjali', 'preeti', 'sunita',
      'aditi', 'avni', 'ishika', 'tanvi', 'isha', 'nisha', 'meera', 'sita', 'geeta', 'rita'
    ];

    const isFemaleName = femaleNames.some(femaleName => 
      firstName.includes(femaleName) || femaleName.includes(firstName)
    );

    return isFemaleName ? 'female' : 'male';
  }

  /**
   * Convert URL to base64
   */
  public async convertUrlToBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to convert to base64'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting URL to base64:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiImageService = AIImageService.getInstance();

// Export utility functions
export const generateAIStudentPhoto = (name: string, options?: AIImageOptions) =>
  aiImageService.generateIndianStudentPhoto(name, options);
