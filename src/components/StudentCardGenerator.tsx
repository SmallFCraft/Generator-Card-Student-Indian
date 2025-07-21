"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Sparkles, Upload } from "lucide-react";
import { StudentForm } from "./StudentForm";
import { CardPreview } from "./CardPreview";
import { generateStudentData, generateFallbackData } from "@/lib/gemini";

export interface StudentData {
  name: string;
  fatherName: string;
  mobileNumber: string;
  batchYear: string;
  photo: string | null;
}

export const StudentCardGenerator = () => {
  const [studentData, setStudentData] = useState<StudentData>({
    name: "",
    fatherName: "",
    mobileNumber: "",
    batchYear: "",
    photo: null,
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    try {
      console.log("Starting auto-generation...");
      const generatedData = await generateStudentData();
      console.log("Generated data:", generatedData);

      setStudentData(prev => ({
        ...prev,
        ...generatedData
      }));
      toast.success("Student data generated successfully!");
    } catch (error) {
      console.error("Error generating data:", error);

      // Show more specific error message
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

      if (errorMessage.includes("API key")) {
        toast.error("API key not configured. Using fallback data generation.");
      } else if (errorMessage.includes("blocked")) {
        toast.error("Content was blocked by safety filters. Using fallback data.");
      } else if (errorMessage.includes("quota") || errorMessage.includes("limit")) {
        toast.error("API quota exceeded. Using fallback data generation.");
      } else {
        toast.error(`Generation failed: ${errorMessage}. Using fallback data.`);
      }

      // Always provide fallback data so the user can still use the app
      try {
        const currentYear = new Date().getFullYear();
        const validBatchYears = [];

        for (let i = 0; i < 5; i++) {
          const startYear = currentYear - i;
          const endYear = startYear + 4;
          validBatchYears.push(`${startYear}-${endYear}`);
        }

        const fallbackData = generateFallbackData(validBatchYears);

        setStudentData(prev => ({
          ...prev,
          ...fallbackData
        }));
      } catch (fallbackError) {
        console.error("Fallback generation also failed:", fallbackError);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    // This function is passed to CardPreview but the actual download
    // is handled internally by CardPreview component
    setIsDownloading(true);
    setTimeout(() => setIsDownloading(false), 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Section */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <StudentForm 
            studentData={studentData}
            setStudentData={setStudentData}
          />
          
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                onClick={handleAutoGenerate}
                disabled={isGenerating}
                className="flex-1"
                variant="outline"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "Auto Generate"}
              </Button>

              <Button
                onClick={handleDownload}
                disabled={isDownloading || !studentData.name}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? "Downloading..." : "Download Card"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Card Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <CardPreview 
            studentData={studentData}
            onDownload={handleDownload}
          />
        </CardContent>
      </Card>
    </div>
  );
};
