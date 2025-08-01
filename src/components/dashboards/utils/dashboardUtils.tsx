import React from 'react';
import { Badge } from "../../ui/badge";
import { CheckCircle, Clock, XCircle, FileText } from "lucide-react";

/**
 * Get the appropriate icon for a given status
 */
export function getStatusIcon(status: string) {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'in-progress':
      return <Clock className="h-4 w-4 text-blue-600" />;
    case 'not-started':
      return <FileText className="h-4 w-4 text-gray-600" />;
    default:
      return <FileText className="h-4 w-4 text-gray-600" />;
  }
}

/**
 * Get the appropriate badge for a given status
 */
export function getStatusBadge(status: string) {
  const variants = {
    approved: 'default',
    pending: 'secondary',
    rejected: 'destructive',
    'under-review': 'outline',
    completed: 'default',
    'in-progress': 'secondary',
    'not-started': 'outline'
  } as const;

  return (
    <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
      {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </Badge>
  );
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format a date string with time
 */
export function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(completed: number, total: number): number {
  return total > 0 ? (completed / total) * 100 : 0;
}

/**
 * Get department status based on documents
 */
export function getDepartmentStatus(documents: any[], departmentName: string): string {
  const deptDocuments = documents.filter(doc => doc.department?.name === departmentName);
  if (deptDocuments.length === 0) return 'not-started';
  
  const hasApproved = deptDocuments.some(doc => doc.status === 'approved');
  const hasRejected = deptDocuments.some(doc => doc.status === 'rejected');
  const hasPending = deptDocuments.some(doc => doc.status === 'pending');
  
  if (hasApproved) return 'completed';
  if (hasRejected) return 'rejected';
  if (hasPending) return 'in-progress';
  return 'not-started';
}

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate file type
 */
export function isValidFileType(file: File, acceptedTypes: string): boolean {
  const acceptedExtensions = acceptedTypes.split(',').map(type => 
    type.trim().toLowerCase().replace('.', '')
  );
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  return fileExtension ? acceptedExtensions.includes(fileExtension) : false;
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
} 