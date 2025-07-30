'use client';
import { useState } from 'react';
import { trpc } from '@/trpc/client';

export function useClearance() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Queries
  const getStudentClearance = trpc.clearance.getStudentClearance.useQuery;

  const getAllClearanceProgress = trpc.clearance.getAllClearanceProgress.useQuery(
    { limit: 50 },
    {
      staleTime: 60 * 1000, // 1 minute
    }
  );

  const getClearanceStats = trpc.clearance.getClearanceStats.useQuery(
    {},
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const getClearanceTimeline = trpc.clearance.getClearanceTimeline.useQuery;

  // Mutations
  const updateClearanceStatus = trpc.clearance.updateClearanceStatus.useMutation({
    onSuccess: () => {
      setUpdateError('');
      // Invalidate and refetch clearance data
      getAllClearanceProgress.refetch();
      getClearanceStats.refetch();
    },
    onError: (error) => {
      setUpdateError(`Failed to update clearance status: ${error.message}`);
    },
  });

  const markClearanceCompleted = trpc.clearance.markClearanceCompleted.useMutation({
    onSuccess: () => {
      setUpdateError('');
      // Invalidate and refetch clearance data
      getAllClearanceProgress.refetch();
      getClearanceStats.refetch();
    },
    onError: (error) => {
      setUpdateError(`Failed to mark clearance completed: ${error.message}`);
    },
  });

  const logClearanceAction = trpc.clearance.logClearanceAction.useMutation({
    onSuccess: () => {
      // Logging doesn't need to invalidate queries
    },
    onError: (error) => {
      console.error('Failed to log clearance action:', error);
    },
  });

  // Update status helper
  const handleUpdateStatus = async (
    studentId: string,
    status: 'not-started' | 'in-progress' | 'completed' | 'on-hold'
  ) => {
    setIsUpdating(true);
    setUpdateError('');

    try {
      await updateClearanceStatus.mutateAsync({
        studentId,
        status,
      });
    } catch (error) {
      console.error('Update status error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Mark completed helper
  const handleMarkCompleted = async (studentId: string) => {
    setIsUpdating(true);
    setUpdateError('');

    try {
      await markClearanceCompleted.mutateAsync({
        studentId,
      });
    } catch (error) {
      console.error('Mark completed error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Log action helper
  const handleLogAction = async (
    action: string,
    studentId: string,
    departmentId: string,
    documentId?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      await logClearanceAction.mutateAsync({
        action,
        studentId,
        documentId,
        departmentId,
        metadata,
      });
    } catch (error) {
      console.error('Log action error:', error);
    }
  };

  return {
    // State
    isUpdating,
    updateError,
    
    // Queries
    clearanceProgress: getAllClearanceProgress.data?.students || [],
    clearanceStats: getClearanceStats.data,
    isLoading: getAllClearanceProgress.isLoading,
    isStatsLoading: getClearanceStats.isLoading,
    
    // Query functions
    getStudentClearance,
    getClearanceTimeline,
    
    // Mutations
    updateClearanceStatus: handleUpdateStatus,
    markClearanceCompleted: handleMarkCompleted,
    logClearanceAction: handleLogAction,
    
    // Utilities
    clearUpdateError: () => setUpdateError(''),
    refetch: getAllClearanceProgress.refetch,
  };
} 