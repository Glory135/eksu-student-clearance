'use client';
import { useState } from 'react';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery, useInfiniteQuery } from '@tanstack/react-query';
import useGetUser from './use-get-user';
import { RejectionReasonEnum } from '@/modules/documents/types';

export function useDocuments() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const trpc = useTRPC();
  const { user, isAuthenticated, isLoading: isUserLoading } = useGetUser();

  // Infinite Queries
  const getAllDocumentsInfinite = useInfiniteQuery({
    ...trpc.documents.getAllInfinite.infiniteQueryOptions({
      limit: 15,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const getDocumentsByStudentInfinite = useInfiniteQuery({
    ...trpc.documents.getByStudentInfinite.infiniteQueryOptions({
      studentId: user?.id || '',
      limit: 15,
    }),
    enabled: isAuthenticated && !isUserLoading && !!user?.id,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const getDocumentsByDepartmentInfinite = useInfiniteQuery({
    ...trpc.documents.getByDepartmentInfinite.infiniteQueryOptions({
      departmentId: user?.departmentId || '',
      limit: 15,
    }),
    enabled: isAuthenticated && !isUserLoading && !!user?.departmentId,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  // Legacy Queries (for backward compatibility)
  const getAllDocuments = useQuery(trpc.documents.getAll.queryOptions({
    limit: 50,
  }));

  const getDocumentById = trpc.documents.getById.useQuery;

  const getDocumentsByStudent = trpc.documents.getByStudent.useQuery;

  const getDocumentsByDepartment = trpc.documents.getByDepartment.useQuery;

  const getDocumentStats = useQuery(trpc.documents.getStats.queryOptions({
    departmentId: user?.departmentId || "",
    studentId: user?.id,
  }, {
    enabled: isAuthenticated && !isUserLoading,
  }));

  // Mutations
  const uploadDocument = useMutation(trpc.documents.upload.mutationOptions({
    onSuccess: () => {
      setUploadError('');
      // Invalidate and refetch documents
      getAllDocumentsInfinite.refetch();
      getDocumentsByStudentInfinite.refetch();
      getDocumentsByDepartmentInfinite.refetch();
      getDocumentStats.refetch();
    },
    onError: (error) => {
      setUploadError(`Upload failed: ${error.message}`);
    },
  }));

  const reviewDocument = useMutation(trpc.documents.review.mutationOptions({
    onSuccess: () => {
      // Invalidate and refetch documents
      getAllDocumentsInfinite.refetch();
      getDocumentsByStudentInfinite.refetch();
      getDocumentsByDepartmentInfinite.refetch();
      getDocumentStats.refetch();
    },
    onError: (error) => {
      console.error('Review failed:', error.message);
    },
  }));

  const deleteDocument = useMutation(trpc.documents.delete.mutationOptions({
    onSuccess: () => {
      // Invalidate and refetch documents
      getAllDocumentsInfinite.refetch();
      getDocumentsByStudentInfinite.refetch();
      getDocumentsByDepartmentInfinite.refetch();
      getDocumentStats.refetch();
    },
    onError: (error) => {
      console.error('Delete failed:', error.message);
    },
  }));

  // Upload helper
  const handleUpload = async (
    file: File,
    studentId: string,
    departmentId: string,
    requirementId: string
  ) => {
    if (!isAuthenticated) {
      setUploadError('You must be logged in to upload documents');
      return;
    }

    // Verify user has permission to upload
    if (user?.role === 'student' && user.id !== studentId) {
      setUploadError('You can only upload documents for yourself');
      return;
    }

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
    if (!isAuthenticated) {
      console.error('You must be logged in to review documents');
      return;
    }

    // Verify user has permission to review
    if (!['officer', 'student-affairs', 'admin'].includes(user?.role || '')) {
      console.error('You do not have permission to review documents');
      return;
    }

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

  // Delete helper
  const handleDelete = async (documentId: string) => {
    if (!isAuthenticated) {
      console.error('You must be logged in to delete documents');
      return;
    }

    // Verify user has permission to delete
    if (user?.role !== 'admin') {
      console.error('Only administrators can delete documents');
      return;
    }

    try {
      await deleteDocument.mutateAsync({
        id: documentId,
      });
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Helper to get all documents from infinite query
  const getAllDocumentsData = () => {
    return getAllDocumentsInfinite.data?.pages.flatMap(page => page.items) || [];
  };

  // Helper to get student documents from infinite query
  const getStudentDocumentsData = () => {
    return getDocumentsByStudentInfinite.data?.pages.flatMap(page => page.items) || [];
  };

  // Helper to get department documents from infinite query
  const getDepartmentDocumentsData = () => {
    return getDocumentsByDepartmentInfinite.data?.pages.flatMap(page => page.items) || [];
  };

  return {
    // State
    isUploading,
    uploadError,
    isUserLoading,
    isAuthenticated,
    
    // Infinite Queries
    getAllDocumentsInfinite,
    getDocumentsByStudentInfinite,
    getDocumentsByDepartmentInfinite,
    
    // Legacy Queries
    documents: getAllDocuments.data?.docs || [],
    documentStats: getDocumentStats.data,
    isLoading: getAllDocuments.isLoading || isUserLoading,
    isStatsLoading: getDocumentStats.isLoading,
    
    // Query functions
    getDocumentById,
    getDocumentsByStudent,
    getDocumentsByDepartment,
    
    // Data helpers
    allDocuments: getAllDocumentsData(),
    studentDocuments: getStudentDocumentsData(),
    departmentDocuments: getDepartmentDocumentsData(),
    
    // Mutations
    uploadDocument: handleUpload,
    reviewDocument: handleReview,
    deleteDocument: handleDelete,
    
    // Utilities
    clearUploadError: () => setUploadError(''),
    refetch: getAllDocumentsInfinite.refetch,
  };
} 