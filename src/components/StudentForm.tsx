"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { StudentData, CardTemplate, FormField, FormFieldType } from "@/types/card";

interface StudentFormProps {
  studentData: StudentData;
  setStudentData: (data: StudentData | ((prev: StudentData) => StudentData)) => void;
  cardTemplate: CardTemplate;
}

// Dynamic schema generation based on card template
const createFormSchema = (cardTemplate: CardTemplate) => {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  cardTemplate.formFields.forEach(field => {
    if (field.id === 'photo') {
      schemaFields[field.id] = z.string().nullable().optional();
      return;
    }

    // Start with base string schema
    let fieldSchema: z.ZodTypeAny = z.string();

    // Apply validation rules
    if (field.validation) {
      const { pattern, minLength, maxLength } = field.validation;

      if (minLength) {
        fieldSchema = (fieldSchema as z.ZodString).min(minLength, `${field.label} must be at least ${minLength} characters`);
      }
      if (maxLength) {
        fieldSchema = (fieldSchema as z.ZodString).max(maxLength, `${field.label} must be no more than ${maxLength} characters`);
      }
      if (pattern) {
        fieldSchema = (fieldSchema as z.ZodString).regex(new RegExp(pattern), `${field.label} format is invalid`);
      }
    }

    // Handle required fields
    if (field.required) {
      fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} is required`);
    } else {
      fieldSchema = fieldSchema.optional();
    }

    schemaFields[field.id] = fieldSchema;
  });

  return z.object(schemaFields);
};

export const StudentForm = ({ studentData, setStudentData, cardTemplate }: StudentFormProps) => {
  // Create dynamic schema
  const formSchema = createFormSchema(cardTemplate);
  type FormData = z.infer<typeof formSchema>;

  // Initialize react-hook-form
  const {
    register,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: studentData as FormData
  });

  // Watch all form values
  const watchedValues = watch();

  // Ref to track the last studentData we received from parent
  const lastStudentDataRef = useRef<string>('');

  // Photo upload handler
  const handlePhotoUpload = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setValue('photo', result);
      toast.success("Photo uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  // Photo dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    onDrop: handlePhotoUpload,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        toast.error("Image size should be less than 5MB");
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        toast.error("Please select a valid image file");
      } else {
        toast.error("Invalid file. Please try again.");
      }
    }
  });

  // Extract serialized values for ESLint compliance
  const serializedWatchedValues = JSON.stringify(watchedValues);

  // Sync form data with parent component (form -> parent)
  useEffect(() => {
    setStudentData(watchedValues as StudentData);
  }, [serializedWatchedValues, setStudentData]);

  // Sync parent data changes to form (parent -> form)
  useEffect(() => {
    const currentStudentDataString = JSON.stringify(studentData);
    
    // Only update if studentData actually changed from external source
    if (currentStudentDataString !== lastStudentDataRef.current && studentData) {
      lastStudentDataRef.current = currentStudentDataString;
      
      // Reset form with new data
      reset(studentData as any);
    }
  }, [studentData, reset]);

  // Reset form when template changes
  useEffect(() => {
    const defaultData: Record<string, string | null> = {};
    cardTemplate.formFields.forEach(field => {
      defaultData[field.id] = field.defaultValue || (field.id === 'photo' ? null : '');
    });
    reset(defaultData);
  }, [cardTemplate, reset]);

  const handleRemovePhoto = () => {
    setValue('photo', null);
    toast.success('Photo removed');
  };

  // Animation variants
  const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const errorVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 }
  };

  // Render form field with animations
  const renderFormField = (field: FormField, index: number) => {
    const error = errors[field.id];
    const value = watchedValues[field.id] || '';

    return (
      <motion.div
        key={field.id}
        variants={fieldVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor={field.id}>
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </Label>

        {field.type === FormFieldType.SELECT ? (
          <Select 
            value={value as string} 
            onValueChange={(newValue) => setValue(field.id, newValue)}
            disabled={field.readonly}
          >
            <SelectTrigger className={field.readonly ? "bg-gray-50 text-gray-500" : ""}>
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
        ) : field.type === FormFieldType.FILE ? (
          <div className="space-y-2">
            {!watchedValues.photo ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className={`h-8 w-8 mx-auto mb-2 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className="text-sm text-gray-600 mb-2">
                  {isDragActive ? 'Drop the image here...' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF, WebP up to 5MB
                </p>
              </div>
            ) : (
              <div className="relative">
                <Image
                  src={(watchedValues.photo as string) || '/placeholder-image.png'}
                  alt="Student photo"
                  width={128}
                  height={160}
                  className="w-32 h-40 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={handleRemovePhoto}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Input
            id={field.id}
            type={field.type}
            placeholder={field.placeholder}
            {...register(field.id)}
            readOnly={field.readonly}
            disabled={field.readonly}
            className={field.readonly ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}
          />
        )}

        <AnimatePresence>
          {error && (
            <motion.div
              variants={errorVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex items-center gap-1 text-sm text-red-600"
            >
              <AlertCircle className="h-3 w-3" />
              {error.message}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.form 
        className="space-y-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {cardTemplate.formFields.map((field, index) => renderFormField(field, index))}
      </motion.form>

      {/* Form validation status */}
      <AnimatePresence>
        {Object.keys(errors).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-sm text-red-600 font-medium">
              Please fix the errors above to continue
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
