'use client';
import { useState } from 'react';
import { trpc } from '@/trpc/client';

export function useDocuments() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Queries
  const getAllDocuments = trpc.documents.getAll.useQuery(
    { limit: 50 },
    {
      staleTime: 30 * 1000, // 30 seconds
    }
  );

  const getDocumentById = trpc.documents.getById.useQuery;

  const getDocumentsByStudent = trpc.documents.getByStudent.useQuery;

  const getDocumentsByDepartment = trpc.documents.getByDepartment.useQuery;

  const getDocumentStats = trpc.documents.getStats.useQuery(
    {},
    {
      staleTime: 60 * 1000, // 1 minute
    }
  );

  // Mutations
  const uploadDocument = trpc.documents.upload.useMutation({
    onSuccess: () => {
      setUploadError('');
      // Invalidate and refetch documents
      getAllDocuments.refetch();
    },
    onError: (error) => {
      setUploadError(`Upload failed: ${error.message}`);
    },
  });

  const reviewDocument = trpc.documents.review.useMutation({
    onSuccess: () => {
      // Invalidate and refetch documents
      getAllDocuments.refetch();
      getDocumentStats.refetch();
    },
  });

  const deleteDocument = trpc.documents.delete.useMutation({
    onSuccess: () => {
      // Invalidate and refetch documents
      getAllDocuments.refetch();
      getDocumentStats.refetch();
    },
  });

  // Upload helper
  const handleUpload = async (
    file: File,
    studentId: string,
    departmentId: string,
    requirementId: string
  ) => {
    setIsUploading(true);
    setUploadError('');

    try {
      await uploadDocument.mutateAsync({
        fileName: file.name,
        student: studentId,
        department: departmentId,
        requirement: requirementId,
        file: 'temp-file-id', // This would be the actual file ID from media upload
        fileSize: file.size,
        fileType: file.type,
      });
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Review helper
  const handleReview = async (
    documentId: string,
    status: 'approved' | 'rejected' | 'under-review',
    reviewNotes?: string,
    rejectionReason?: string
  ) => {
    try {
      await reviewDocument.mutateAsync({
        id: documentId,
        status,
        reviewNotes,
        rejectionReason,
      });
    } catch (error) {
      console.error('Review error:', error);
    }
  };

  return {
    // State
    isUploading,
    uploadError,
    
    // Queries
    documents: getAllDocuments.data?.docs || [],
    documentStats: getDocumentStats.data,
    isLoading: getAllDocuments.isLoading,
    isStatsLoading: getDocumentStats.isLoading,
    
    // Query functions
    getDocumentById,
    getDocumentsByStudent,
    getDocumentsByDepartment,
    
    // Mutations
    uploadDocument: handleUpload,
    reviewDocument: handleReview,
    deleteDocument: deleteDocument.mutate,
    
    // Utilities
    clearUploadError: () => setUploadError(''),
    refetch: getAllDocuments.refetch,
  };
} 