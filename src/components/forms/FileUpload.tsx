import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  selectedFile?: File | null;
  isLoading?: boolean;
  error?: string;
  acceptedTypes?: string;
  maxSize?: number; // in MB
  className?: string;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  isLoading = false,
  error,
  acceptedTypes = '.pdf,.docx,.doc,.jpg,.jpeg,.png',
  maxSize = 10,
  className = ''
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return;
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const acceptedExtensions = acceptedTypes
      .split(',')
      .map(type => type.trim().replace('.', '').toLowerCase());

    if (fileExtension && acceptedExtensions.includes(fileExtension)) {
      onFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️';
      default:
        return '📎';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes}
          onChange={handleFileInput}
          disabled={isLoading}
        />

        {!selectedFile ? (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">Upload Document</p>
              <p className="text-sm text-muted-foreground mt-1">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Accepted formats: PDF, DOCX, DOC, JPG, PNG (Max {maxSize}MB)
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Choose File'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-3xl">{getFileIcon(selectedFile.name)}</span>
              <div className="text-left">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <FileText className="h-4 w-4 mr-1" />
                Change File
              </Button>
              {onFileRemove && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onFileRemove}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Display */}
      {selectedFile && !error && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            File selected successfully. Ready to upload.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 