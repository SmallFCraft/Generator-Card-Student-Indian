"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { StudentData } from "./StudentCardGenerator";
import { toast } from "sonner";

interface CardPreviewProps {
  studentData: StudentData;
  onDownload: () => void;
}

export const CardPreview = ({ studentData }: CardPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [templateLoaded, setTemplateLoaded] = useState(false);
  const [templateImage, setTemplateImage] = useState<HTMLImageElement | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load template image
  useEffect(() => {
    if (!isClient) return;

    const img = new Image();
    img.onload = () => {
      setTemplateImage(img);
      setTemplateLoaded(true);
    };
    img.onerror = () => {
      toast.error("Failed to load card template");
    };
    img.src = "/card-student.png";
  }, [isClient]);

  const drawCard = useCallback(async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx || !templateImage) return;

    // Set canvas size to match template
    canvas.width = templateImage.width;
    canvas.height = templateImage.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw template
    ctx.drawImage(templateImage, 0, 0);

    // Set text properties
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';

    // Draw student name
    if (studentData.name) {
      ctx.font = '20px Arial';
      ctx.fillText(studentData.name, 200, 215);
    }

    // Draw father's name
    if (studentData.fatherName) {
      ctx.font = '20px Arial';
      ctx.fillText(`${studentData.fatherName}`, 200, 276);
    }

    // Draw mobile number
    if (studentData.mobileNumber) {
      ctx.font = '20px Arial';
      ctx.fillText(`${studentData.mobileNumber}`, 200, 308);
    }

    // Draw batch year
    if (studentData.batchYear) {
      ctx.font = '20px Arial';
      ctx.fillText(`${studentData.batchYear}`, 200, 340);
    }

    // Draw student photo
    if (studentData.photo) {
      try {
        const photoImg = new Image();
        photoImg.onload = () => {
          // Position photo on the right side (adjust coordinates based on template)
          const photoX = canvas.width - 180; // 180px from right edge
          const photoY = 155; // 150px from top
          const photoWidth = 160; // 3:4 ratio width
          const photoHeight = 205; // 3:4 ratio height

          // Draw photo with rounded corners (fallback for older browsers)
          ctx.save();
          ctx.beginPath();

          // Check if roundRect is available, otherwise use regular rect
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(photoX, photoY, photoWidth, photoHeight, 8);
          } else {
            // Fallback for older browsers
            ctx.rect(photoX, photoY, photoWidth, photoHeight);
          }

          ctx.clip();
          ctx.drawImage(photoImg, photoX, photoY, photoWidth, photoHeight);
          ctx.restore();
        };
        photoImg.src = studentData.photo;
      } catch (error) {
        console.error("Error drawing photo:", error);
      }
    }
  }, [studentData, templateImage]);

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
      
      {!studentData.name && (
        <div className="text-center text-gray-500 py-8">
          <p>Fill in student information to see preview</p>
        </div>
      )}
    </div>
  );
};
