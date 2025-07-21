"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { StudentData } from "./StudentCardGenerator";

interface StudentFormProps {
  studentData: StudentData;
  setStudentData: (data: StudentData | ((prev: StudentData) => StudentData)) => void;
}

export const StudentForm = ({ studentData, setStudentData }: StudentFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof StudentData, value: string) => {
    setStudentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setStudentData(prev => ({
        ...prev,
        photo: result
      }));
      toast.success("Photo uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setStudentData(prev => ({
      ...prev,
      photo: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateMobileNumber = (value: string) => {
    // Remove any non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as +91 followed by 10 digits
    if (cleaned.length <= 10) {
      return cleaned;
    }
    return cleaned.slice(0, 10);
  };

  const formatMobileNumber = (value: string) => {
    const cleaned = validateMobileNumber(value);
    if (cleaned.length === 10) {
      return `+91 ${cleaned}`;
    }
    return cleaned;
  };

  const generateBatchYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      const startYear = currentYear - i;
      const endYear = startYear + 4;
      years.push(`${startYear}-${endYear}`);
    }
    return years;
  };

  return (
    <div className="space-y-4">
      {/* Student Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Student Name *</Label>
        <Input
          id="name"
          placeholder="Enter student's full name"
          value={studentData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          required
        />
      </div>

      {/* Father's Name */}
      <div className="space-y-2">
        <Label htmlFor="fatherName">Father&apos;s Name *</Label>
        <Input
          id="fatherName"
          placeholder="Enter father's full name"
          value={studentData.fatherName}
          onChange={(e) => handleInputChange('fatherName', e.target.value)}
          required
        />
      </div>

      {/* Mobile Number */}
      <div className="space-y-2">
        <Label htmlFor="mobile">Mobile Number *</Label>
        <Input
          id="mobile"
          placeholder="Enter 10-digit mobile number"
          value={studentData.mobileNumber}
          onChange={(e) => {
            const formatted = formatMobileNumber(e.target.value);
            handleInputChange('mobileNumber', formatted);
          }}
          maxLength={14} // +91 + space + 10 digits
          required
        />
        <p className="text-xs text-gray-500">Format: +91 XXXXXXXXXX</p>
      </div>

      {/* Batch Year */}
      <div className="space-y-2">
        <Label htmlFor="batch">Batch Year *</Label>
        <select
          id="batch"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={studentData.batchYear}
          onChange={(e) => handleInputChange('batchYear', e.target.value)}
          required
        >
          <option value="">Select batch year</option>
          {generateBatchYears().map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Photo Upload */}
      <div className="space-y-2">
        <Label>Student Photo (3:4 ratio recommended)</Label>
        
        {!studentData.photo ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG up to 5MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="mt-2"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </Button>
          </div>
        ) : (
          <div className="relative">
            <img
              src={studentData.photo}
              alt="Student photo"
              className="w-32 h-40 object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={removePhoto}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
