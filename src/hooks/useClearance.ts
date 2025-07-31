'use client';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import useGetUser from './use-get-user';

export function useClearance() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const trpc = useTRPC()
  const { user } = useGetUser()


  // Queries
  const getStudentClearance = useQuery(trpc.clearance.getStudentClearance.queryOptions({
    studentId: user.id,
  }));

  const getAllClearanceProgress = useQuery(trpc.clearance.getAllClearanceProgress.queryOptions({
    limit: 50,
  }));

  const getClearanceStats = useQuery(trpc.clearance.getClearanceStats.queryOptions({
    departmentId: user.department?.id || "",
  }));

  const getClearanceTimeline = useQuery(trpc.clearance.getClearanceTimeline.queryOptions({
    studentId: user.id,
  }));

  // Mutations
  const updateClearanceStatus = useMutation(trpc.clearance.updateClearanceStatus.mutationOptions({
    onSuccess: () => {
      setUpdateError('');
      // Invalidate and refetch clearance data
      getAllClearanceProgress.refetch();
      getClearanceStats.refetch();
    },
    onError: (error) => {
      setUpdateError(`Failed to update clearance status: ${error.message}`);
    },
  }));

  const markClearanceCompleted = useMutation(trpc.clearance.markClearanceCompleted.mutationOptions({
    onSuccess: () => {
      setUpdateError('');
      getAllClearanceProgress.refetch();
      getClearanceStats.refetch();
    },
    onError: (error) => {
      setUpdateError(`Failed to mark clearance completed: ${error.message}`);
    },
  }));

  const logClearanceAction = useMutation(trpc.clearance.logClearanceAction.mutationOptions({
    onError: (error) => {
      console.error('Failed to log clearance action:', error);
    },
  }));

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
    metadata?: Record<string, unknown>
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