'use client';
import { useState } from 'react';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import useGetUser from './use-get-user';
import { RejectionReasonEnum } from '@/modules/documents/types';

export function useDocuments() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const trpc = useTRPC()
  const { user } = useGetUser()

  // Queries
  const getAllDocuments = useQuery(trpc.documents.getAll.queryOptions({
    limit: 50,
  }));

  const getDocumentById = trpc.documents.getById.useQuery;

  const getDocumentsByStudent = trpc.documents.getByStudent.useQuery;

  const getDocumentsByDepartment = trpc.documents.getByDepartment.useQuery;

  const getDocumentStats = useQuery(trpc.documents.getStats.queryOptions({
    departmentId: user.department?.id || "",
    studentId: user.id,
  }));

  // Mutations
  const uploadDocument = useMutation(trpc.documents.upload.mutationOptions({
    onSuccess: () => {
      setUploadError('');
      // Invalidate and refetch documents
      getAllDocuments.refetch();
    },
    onError: (error) => {
      setUploadError(`Upload failed: ${error.message}`);
    },
  }));

  const reviewDocument = useMutation(trpc.documents.review.mutationOptions({
    onSuccess: () => {
      // Invalidate and refetch documents
      getAllDocuments.refetch();
      getDocumentStats.refetch();
    },
  }));

  const deleteDocument = useMutation(trpc.documents.delete.mutationOptions({
    onSuccess: () => {
      // Invalidate and refetch documents
      getAllDocuments.refetch();
      getDocumentStats.refetch();
    },
  }));

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
    rejectionReason?: RejectionReasonEnum,
    customRejectionReason?: string
  ) => {
    try {
      await reviewDocument.mutateAsync({
        id: documentId,
        status,
        reviewNotes,
        rejectionReason,
        customRejectionReason,
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