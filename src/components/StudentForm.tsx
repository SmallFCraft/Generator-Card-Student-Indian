"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { StudentData, CardTemplate, FormField, FormFieldType, ValidationResult } from "@/types/card";

interface StudentFormProps {
  studentData: StudentData;
  setStudentData: (data: StudentData | ((prev: StudentData) => StudentData)) => void;
  cardTemplate: CardTemplate;
}

export const StudentForm = ({ studentData, setStudentData, cardTemplate }: StudentFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (fieldId: string, value: string) => {
    setStudentData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  // Validate a single field
  const validateField = (field: FormField, value: string): string | null => {
    if (field.required && (!value || value.trim() === '')) {
      return `${field.label} is required`;
    }

    if (value && field.validation) {
      const { pattern, minLength, maxLength, min, max } = field.validation;

      if (pattern && !new RegExp(pattern).test(value)) {
        return `${field.label} format is invalid`;
      }

      if (minLength && value.length < minLength) {
        return `${field.label} must be at least ${minLength} characters`;
      }

      if (maxLength && value.length > maxLength) {
        return `${field.label} must be no more than ${maxLength} characters`;
      }

      if (field.type === FormFieldType.DATE) {
        const dateValue = new Date(value);
        if (min && dateValue < new Date(min)) {
          return `${field.label} must be after ${min}`;
        }
        if (max && dateValue > new Date(max)) {
          return `${field.label} must be before ${max}`;
        }
      }
    }

    return null;
  };

  // Validate all form fields
  const validateForm = (): ValidationResult => {
    const errors: Record<string, string> = {};
    let isValid = true;

    cardTemplate.formFields.forEach(field => {
      if (field.id === 'photo') return; // Skip photo validation here

      const value = studentData[field.id] || '';
      const error = validateField(field, value);

      if (error) {
        errors[field.id] = error;
        isValid = false;
      }
    });

    return { isValid, errors };
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

  const handleRemovePhoto = () => {
    setStudentData(prev => ({
      ...prev,
      photo: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Photo removed');
  };

  // Render different input types based on field configuration
  const renderFormField = (field: FormField) => {
    const value = studentData[field.id] || '';
    const error = validateField(field, value);

    switch (field.type) {
      case FormFieldType.SELECT:
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && '*'}
            </Label>
            <Select value={value} onValueChange={(newValue) => handleInputChange(field.id, newValue)}>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );

      case FormFieldType.FILE:
        return (
          <div key={field.id} className="space-y-2">
            <Label>{field.label}</Label>

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
                  className="absolute -top-2 -right-2"
                  onClick={handleRemovePhoto}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && '*'}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              required={field.required}
              min={field.validation?.min}
              max={field.validation?.max}
              minLength={field.validation?.minLength}
              maxLength={field.validation?.maxLength}
              pattern={field.validation?.pattern}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {cardTemplate.formFields.map((field) => renderFormField(field))}
    </div>
  );
};
