"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Camera, Shuffle, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { StudentData } from "./StudentCardGenerator";
import { aiImageService } from "@/lib/aiImageService";
import { photoService, getPhotoByStudentName } from "@/lib/photoService";

interface PhotoGenerationOptionsProps {
  studentData: StudentData;
  setStudentData: (data: StudentData | ((prev: StudentData) => StudentData)) => void;
}

type PhotoMethod = 'ai' | 'stock' | 'random';
type AIStyle = 'professional' | 'casual' | 'portrait' | 'realistic';

export const PhotoGenerationOptions = ({ studentData, setStudentData }: PhotoGenerationOptionsProps) => {
  const [photoMethod, setPhotoMethod] = useState<PhotoMethod>('ai');
  const [aiStyle, setAIStyle] = useState<AIStyle>('professional');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePhoto = async () => {
    if (!studentData.name && photoMethod !== 'random') {
      toast.error("Vui lòng nhập tên sinh viên trước!");
      return;
    }

    setIsGenerating(true);
    
    try {
      let photo: string;
      let successMessage: string;

      switch (photoMethod) {
        case 'ai':
          toast.loading("🎨 Đang tạo ảnh bằng AI...");
          const aiResult = await aiImageService.generateIndianStudentPhoto(studentData.name, {
            width: 512,
            height: 512,
            style: aiStyle,
            quality: 'hd'
          });

          if (aiResult.success) {
            photo = aiResult.base64 || aiResult.imageUrl!;
            successMessage = `✨ Đã tạo ảnh AI thành công với ${aiResult.provider}!`;
          } else {
            throw new Error(aiResult.error || 'AI generation failed');
          }
          break;

        case 'stock':
          toast.loading("📸 Đang lấy ảnh stock phù hợp...");
          photo = await getPhotoByStudentName(studentData.name, { width: 400, height: 400 });
          successMessage = "📸 Đã lấy ảnh stock phù hợp với tên!";
          break;

        case 'random':
          toast.loading("🎲 Đang lấy ảnh ngẫu nhiên...");
          photo = await photoService.getRandomPhoto({ width: 400, height: 400 });
          successMessage = "🎲 Đã lấy ảnh ngẫu nhiên!";
          break;

        default:
          throw new Error('Invalid photo method');
      }

      // Convert to base64 if needed
      if (!photo.startsWith('data:')) {
        photo = await photoService.convertUrlToBase64(photo);
      }

      setStudentData(prev => ({
        ...prev,
        photo: photo
      }));

      toast.dismiss();
      toast.success(successMessage);

    } catch (error) {
      toast.dismiss();
      console.error("Error generating photo:", error);

      // Fallback to stock photos
      try {
        toast.loading("🔄 Đang thử phương pháp dự phòng...");

        // Thử stock photo trước
        let fallbackPhoto: string;
        if (studentData.name && photoMethod === 'ai') {
          try {
            fallbackPhoto = await getPhotoByStudentName(studentData.name, { width: 400, height: 400 });
            toast.dismiss();
            toast.success("📸 Đã sử dụng ảnh stock phù hợp với tên!");
          } catch {
            fallbackPhoto = await photoService.getRandomPhoto({ width: 400, height: 400 });
            toast.dismiss();
            toast.success("🎲 Đã sử dụng ảnh ngẫu nhiên!");
          }
        } else {
          fallbackPhoto = await photoService.getRandomPhoto({ width: 400, height: 400 });
          toast.dismiss();
          toast.success("🔄 Đã sử dụng ảnh dự phòng!");
        }

        const base64Photo = await photoService.convertUrlToBase64(fallbackPhoto);

        setStudentData(prev => ({
          ...prev,
          photo: base64Photo
        }));

      } catch (fallbackError) {
        toast.dismiss();
        toast.error("❌ Không thể tạo ảnh. Vui lòng thử lại hoặc upload ảnh thủ công!");
        console.error("All fallback methods failed:", fallbackError);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Tùy chọn tạo ảnh
        </CardTitle>
        <CardDescription>
          Chọn phương pháp tạo ảnh cho sinh viên
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Phương pháp tạo ảnh</Label>
          <div className="mt-2 space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="ai"
                name="photoMethod"
                value="ai"
                checked={photoMethod === 'ai'}
                onChange={(e) => setPhotoMethod(e.target.value as PhotoMethod)}
                className="h-4 w-4 text-purple-600"
              />
              <Label htmlFor="ai" className="flex items-center gap-2 cursor-pointer">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>AI Generated (Khuyến nghị)</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">NEW</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="stock"
                name="photoMethod"
                value="stock"
                checked={photoMethod === 'stock'}
                onChange={(e) => setPhotoMethod(e.target.value as PhotoMethod)}
                className="h-4 w-4 text-blue-600"
              />
              <Label htmlFor="stock" className="flex items-center gap-2 cursor-pointer">
                <Camera className="h-4 w-4 text-blue-500" />
                Ảnh stock (theo tên)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="random"
                name="photoMethod"
                value="random"
                checked={photoMethod === 'random'}
                onChange={(e) => setPhotoMethod(e.target.value as PhotoMethod)}
                className="h-4 w-4 text-green-600"
              />
              <Label htmlFor="random" className="flex items-center gap-2 cursor-pointer">
                <Shuffle className="h-4 w-4 text-green-500" />
                Ảnh ngẫu nhiên
              </Label>
            </div>
          </div>
        </div>

        {photoMethod === 'ai' && (
          <div>
            <Label htmlFor="ai-style" className="text-sm font-medium">Phong cách AI</Label>
            <select
              value={aiStyle}
              onChange={(e) => setAIStyle(e.target.value as AIStyle)}
              className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="professional">👔 Professional - Chuyên nghiệp</option>
              <option value="casual">👕 Casual - Thoải mái</option>
              <option value="portrait">🎨 Portrait - Chân dung</option>
              <option value="realistic">📷 Realistic - Thực tế</option>
            </select>
          </div>
        )}

        <Button 
          onClick={handleGeneratePhoto}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Đang tạo ảnh...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {photoMethod === 'ai' && <Sparkles className="h-4 w-4" />}
              {photoMethod === 'stock' && <Camera className="h-4 w-4" />}
              {photoMethod === 'random' && <Shuffle className="h-4 w-4" />}
              Tạo ảnh {photoMethod === 'ai' ? 'bằng AI' : photoMethod === 'stock' ? 'stock' : 'ngẫu nhiên'}
            </div>
          )}
        </Button>

        {photoMethod === 'ai' && (
          <div className="text-xs text-gray-500 bg-purple-50 p-3 rounded-lg">
            <p className="font-medium text-purple-700 mb-1">💡 Về tính năng AI:</p>
            <ul className="space-y-1">
              <li>• Sử dụng Gemini 2.5 Pro, DALL-E 3, hoặc Stability AI</li>
              <li>• Tạo ảnh chân thực dựa trên tên sinh viên</li>
              <li>• Chất lượng cao, phù hợp với sinh viên Ấn Độ</li>
              <li>• Cần API key để sử dụng (xem .env.example)</li>
              <li>• Có thể mất 10-30 giây để tạo</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
