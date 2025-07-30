'use client';
import { useState } from 'react';
import { trpc } from '@/trpc/client';

export function useUsers() {
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Queries
  const getAllUsers = trpc.users.getAll.useQuery(
    { limit: 50 },
    {
      staleTime: 60 * 1000, // 1 minute
    }
  );

  const getUserById = trpc.users.getById.useQuery;

  const getUserStats = trpc.users.getStats.useQuery(
    {},
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const canAccessFeatures = trpc.users.canAccessFeatures.useQuery;

  // Mutations
  const createStudent = trpc.users.createStudent.useMutation({
    onSuccess: () => {
      setCreateError('');
      // Invalidate and refetch users
      getAllUsers.refetch();
      getUserStats.refetch();
    },
    onError: (error) => {
      setCreateError(`Failed to create student: ${error.message}`);
    },
  });

  const createOfficer = trpc.users.createOfficer.useMutation({
    onSuccess: () => {
      setCreateError('');
      // Invalidate and refetch users
      getAllUsers.refetch();
      getUserStats.refetch();
    },
    onError: (error) => {
      setCreateError(`Failed to create officer: ${error.message}`);
    },
  });

  const updateUser = trpc.users.update.useMutation({
    onSuccess: () => {
      // Invalidate and refetch users
      getAllUsers.refetch();
      getUserStats.refetch();
    },
  });

  const deleteUser = trpc.users.delete.useMutation({
    onSuccess: () => {
      // Invalidate and refetch users
      getAllUsers.refetch();
      getUserStats.refetch();
    },
  });

  const bulkCreateStudents = trpc.users.bulkCreateStudents.useMutation({
    onSuccess: (data) => {
      setCreateError('');
      // Invalidate and refetch users
      getAllUsers.refetch();
      getUserStats.refetch();
      console.log('Bulk creation summary:', data.summary);
    },
    onError: (error) => {
      setCreateError(`Failed to create students: ${error.message}`);
    },
  });

  // Create student helper
  const handleCreateStudent = async (studentData: {
    name: string;
    email: string;
    matricNo: string;
    department: string;
    phone?: string;
  }) => {
    setIsCreating(true);
    setCreateError('');

    try {
      await createStudent.mutateAsync(studentData);
    } catch (error) {
      console.error('Create student error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Create officer helper
  const handleCreateOfficer = async (officerData: {
    name: string;
    email: string;
    role: 'officer' | 'student-affairs';
    department: string;
    phone?: string;
    createdByDepartment?: string;
  }) => {
    setIsCreating(true);
    setCreateError('');

    try {
      await createOfficer.mutateAsync(officerData);
    } catch (error) {
      console.error('Create officer error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Bulk create students helper
  const handleBulkCreateStudents = async (students: Array<{
    name: string;
    email: string;
    matricNo: string;
    department: string;
    phone?: string;
  }>) => {
    setIsCreating(true);
    setCreateError('');

    try {
      await bulkCreateStudents.mutateAsync({ students });
    } catch (error) {
      console.error('Bulk create students error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return {
    // State
    isCreating,
    createError,
    
    // Queries
    users: getAllUsers.data?.docs || [],
    userStats: getUserStats.data,
    isLoading: getAllUsers.isLoading,
    isStatsLoading: getUserStats.isLoading,
    
    // Query functions
    getUserById,
    canAccessFeatures,
    
    // Mutations
    createStudent: handleCreateStudent,
    createOfficer: handleCreateOfficer,
    updateUser: updateUser.mutate,
    deleteUser: deleteUser.mutate,
    bulkCreateStudents: handleBulkCreateStudents,
    
    // Utilities
    clearCreateError: () => setCreateError(''),
    refetch: getAllUsers.refetch,
  };
} 