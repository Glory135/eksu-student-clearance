import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Alert, AlertDescription } from "../../ui/alert";
import { FileText, Upload, Loader2, AlertTriangle } from "lucide-react";

interface Department {
  id: string;
  name: string;
}

interface UploadTabProps {
  departments: Department[];
  selectedDepartment: string;
  selectedDocumentType: string;
  selectedFile: File | null;
  uploadError?: string;
  isUploading?: boolean;
  onDepartmentChange: (departmentId: string) => void;
  onDocumentTypeChange: (documentType: string) => void;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onUpload: () => void;
  documentTypes?: Array<{ value: string; label: string }>;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string;
}

export function UploadTab({
  departments,
  selectedDepartment,
  selectedDocumentType,
  selectedFile,
  uploadError,
  isUploading = false,
  onDepartmentChange,
  onDocumentTypeChange,
  onFileSelect,
  onFileRemove,
  onUpload,
  documentTypes = [
    { value: "transcript", label: "Academic Transcript" },
    { value: "payment_receipt", label: "Payment Receipt" },
    { value: "library_clearance", label: "Library Clearance" },
    { value: "department_clearance", label: "Department Clearance" },
    { value: "student_affairs", label: "Student Affairs Clearance" },
    { value: "bursary_clearance", label: "Bursary Clearance" },
  ],
  maxFileSize = 10,
  acceptedFileTypes = ".pdf,.doc,.docx,.jpg,.jpeg,.png"
}: UploadTabProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleFileClick = () => {
    document.getElementById('file-input')?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Upload required documents for your clearance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Error */}
        {uploadError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {/* Department Selection */}
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Document Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="document-type">Document Type</Label>
          <Select value={selectedDocumentType} onValueChange={onDocumentTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="file">Document File</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {selectedFile ? (
              <div className="space-y-2">
                <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onFileRemove}
                >
                  Remove File
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  {acceptedFileTypes.toUpperCase()} (max {maxFileSize}MB)
                </p>
                <input
                  type="file"
                  id="file-input"
                  className="hidden"
                  accept={acceptedFileTypes}
                  onChange={handleFileChange}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFileClick}
                >
                  Choose File
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Upload Button */}
        <Button
          onClick={onUpload}
          disabled={!selectedFile || !selectedDepartment || !selectedDocumentType || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 