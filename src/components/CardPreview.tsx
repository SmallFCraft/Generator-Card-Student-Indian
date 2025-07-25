"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { StudentData, CardTemplate, TextPosition } from "@/types/card";
import { toast } from "sonner";
import { CardPreviewSkeleton } from "@/components/loading-states";

interface CardPreviewProps {
  studentData: StudentData;
  cardTemplate: CardTemplate;
  isGenerated?: boolean; // New prop to track if card has been generated
}

export const CardPreview = ({ studentData, cardTemplate, isGenerated = false }: CardPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [templateLoaded, setTemplateLoaded] = useState(false);
  const [templateImage, setTemplateImage] = useState<HTMLImageElement | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load template image from API or demo image
  useEffect(() => {
    if (!isClient || !cardTemplate) return;

    const img = new Image();
    img.onload = () => {
      setTemplateImage(img);
      setTemplateLoaded(true);
    };
    img.onerror = () => {
      toast.error("Failed to load card template");
    };

    // Use demo image if not generated yet, otherwise use actual template
    if (isGenerated) {
      // Load actual template from secure API route
      img.src = `/api/template/${cardTemplate.id}`;
    } else {
      // Load demo image from secure API route
      img.src = `/api/demo/${cardTemplate.id}`;
    }
  }, [isClient, cardTemplate, isGenerated]);

  // Helper function to draw text with proper positioning and styling
  const drawText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    position: TextPosition
  ) => {
    ctx.save();

    // Set font properties
    const fontWeight = position.fontWeight || 'normal';
    const fontSize = position.fontSize || 20;
    const fontFamily = position.fontFamily || 'Arial';
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

    // Set text color
    ctx.fillStyle = position.color || '#000000';

    // Set text alignment
    ctx.textAlign = (position.textAlign || 'left') as CanvasTextAlign;

    // Handle text wrapping if maxWidth is specified
    if (position.maxWidth) {
      const words = text.split(' ');
      let line = '';
      let y = position.y;
      const lineHeight = fontSize * 1.2;

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > position.maxWidth && i > 0) {
          ctx.fillText(line, position.x, y);
          line = words[i] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, position.x, y);
    } else {
      ctx.fillText(text, position.x, position.y);
    }

    ctx.restore();
  };

  const drawCard = useCallback(async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx || !templateImage || !cardTemplate) return;

    // Set canvas size to match template dimensions
    canvas.width = cardTemplate.dimensions.width;
    canvas.height = cardTemplate.dimensions.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw template background
    ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);

    // Only draw text and photo if card has been generated
    if (isGenerated) {
      // Draw text fields based on template configuration
      cardTemplate.formFields.forEach((field) => {
        if (field.id === 'photo') return; // Skip photo field

        const value = studentData[field.id];
        const position = cardTemplate.textPositions[field.id];

        if (value && position) {
          drawText(ctx, value, position);
        }
      });

      // Draw student photo if provided
      if (studentData.photo && cardTemplate.photoPosition) {
        try {
          const photoImg = new Image();
          photoImg.onload = () => {
            const { x, y, width, height, borderRadius } = cardTemplate.photoPosition;

            // Draw photo with optional rounded corners
            ctx.save();
            ctx.beginPath();

            if (borderRadius && typeof ctx.roundRect === 'function') {
              ctx.roundRect(x, y, width, height, borderRadius);
            } else {
              ctx.rect(x, y, width, height);
            }

            ctx.clip();
            ctx.drawImage(photoImg, x, y, width, height);
            ctx.restore();
          };
          photoImg.src = studentData.photo;
        } catch (error) {
          console.error("Error drawing photo:", error);
        }
      }
    }
  }, [studentData, templateImage, cardTemplate, isGenerated]);

  // Draw card when data changes
  useEffect(() => {
    if (isClient && templateLoaded && templateImage && canvasRef.current) {
      drawCard();
    }
  }, [studentData, templateLoaded, templateImage, isClient, drawCard]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error("Canvas not ready for download");
      return;
    }

    try {
      // Create download link
      const link = document.createElement('a');
      link.download = `student-card-${studentData.name || 'unnamed'}.png`;
      link.href = canvas.toDataURL('image/png');
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Card downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download card");
      console.error("Download error:", error);
    }
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!templateLoaded) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <canvas
          ref={canvasRef}
          className="w-full h-auto max-w-full"
          style={{ maxHeight: '500px' }}
        />
      </div>
      
      {studentData.name && (
        <div className="text-center">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Download Card
          </button>
        </div>
      )}
      
      {!templateLoaded && <CardPreviewSkeleton />}

      {templateLoaded && !Object.values(studentData).some(value => value && value !== '') && (
        <div className="text-center text-gray-500 py-8">
          <p>Fill in student information to see preview</p>
        </div>
      )}
    </div>
  );
};
