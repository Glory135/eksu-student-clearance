'use client';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';
import useGetUser from './use-get-user';

export function useClearance() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const trpc = useTRPC();
  const { user, isAuthenticated, isLoading: isUserLoading } = useGetUser();

  // Infinite Queries
  const getAllClearanceProgressInfinite = useInfiniteQuery({
    ...trpc.clearance.getAllClearanceProgressInfinite.infiniteQueryOptions({
      limit: 15,
    }),
    enabled: isAuthenticated && !isUserLoading && user?.role !== 'student',
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  // Legacy Queries (for backward compatibility)
  const getStudentClearance = useQuery(trpc.clearance.getStudentClearance.queryOptions({
    studentId: user?.id || '',
  }, {
    enabled: isAuthenticated && !isUserLoading && !!user?.id,
  }));

  const getAllClearanceProgress = useQuery(trpc.clearance.getAllClearanceProgress.queryOptions({
    limit: 50,
  }, {
    enabled: isAuthenticated && !isUserLoading && user?.role !== 'student',
  }));

  const getClearanceStats = useQuery(trpc.clearance.getClearanceStats.queryOptions({
    departmentId: user?.departmentId || "",
  }, {
    enabled: isAuthenticated && !isUserLoading,
  }));

  const getClearanceTimeline = useQuery(trpc.clearance.getClearanceTimeline.queryOptions({
    studentId: user?.id || '',
  }, {
    enabled: isAuthenticated && !isUserLoading && !!user?.id,
  }));

  // Mutations
  const updateClearanceStatus = useMutation(trpc.clearance.updateClearanceStatus.mutationOptions({
    onSuccess: () => {
      setUpdateError('');
      // Invalidate and refetch clearance data
      getAllClearanceProgressInfinite.refetch();
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
      getAllClearanceProgressInfinite.refetch();
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
    if (!isAuthenticated) {
      setUpdateError('You must be logged in to update clearance status');
      return;
    }

    // Verify user has permission to update clearance status
    if (!['officer', 'student-affairs', 'admin'].includes(user?.role || '')) {
      setUpdateError('You do not have permission to update clearance status');
      return;
    }

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
    if (!isAuthenticated) {
      setUpdateError('You must be logged in to mark clearance as completed');
      return;
    }

    // Verify user has permission to mark clearance as completed
    if (!['officer', 'student-affairs', 'admin'].includes(user?.role || '')) {
      setUpdateError('You do not have permission to mark clearance as completed');
      return;
    }

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
    if (!isAuthenticated) {
      console.error('You must be logged in to log clearance actions');
      return;
    }

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

  // Helper to get all clearance progress from infinite query
  const getAllClearanceProgressData = () => {
    return getAllClearanceProgressInfinite.data?.pages.flatMap(page => page.items) || [];
  };

  return {
    // State
    isUpdating,
    updateError,
    isUserLoading,
    isAuthenticated,

    // Infinite Queries
    getAllClearanceProgressInfinite,

    // Legacy Queries
    clearanceProgress: getAllClearanceProgress.data?.students || [],
    clearanceStats: getClearanceStats.data,
    isLoading: getAllClearanceProgress.isLoading || isUserLoading,
    isStatsLoading: getClearanceStats.isLoading,

    // Query functions
    getStudentClearance,
    getClearanceTimeline,

    // Data helpers
    allClearanceProgress: getAllClearanceProgressData(),

    // Mutations
    updateClearanceStatus: handleUpdateStatus,
    markClearanceCompleted: handleMarkCompleted,
    logClearanceAction: handleLogAction,

    // Utilities
    clearUpdateError: () => setUpdateError(''),
    refetch: getAllClearanceProgressInfinite.refetch,
  };
} 