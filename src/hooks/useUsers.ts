'use client';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import useGetUser from './use-get-user';

export function useUsers() {
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const trpc = useTRPC()
  const { user } = useGetUser()

  // Queries
  const getAllUsers = useQuery(trpc.users.getAll.queryOptions({
    limit: 50,
  }));

  const getUserById = trpc.users.getById.useQuery;

  const getUserStats = useQuery(trpc.users.getStats.queryOptions());

  const canAccessFeatures = useQuery(trpc.users.canAccessFeatures.queryOptions({
    userId: user?.id || "",
  }));

  // Mutations
  const createStudent = useMutation(trpc.users.createStudent.mutationOptions({
    onSuccess: () => {
      setCreateError('');
      // Invalidate and refetch users
      getAllUsers.refetch();
      getUserStats.refetch();
    },
    onError: (error) => {
      setCreateError(`Failed to create student: ${error.message}`);
    },
  }));

  const createOfficer = useMutation(trpc.users.createOfficer.mutationOptions({
    onSuccess: () => {
      setCreateError('');
      // Invalidate and refetch users
      getAllUsers.refetch();
      getUserStats.refetch();
    },
    onError: (error) => {
      setCreateError(`Failed to create officer: ${error.message}`);
    },
  }));

  const updateUser = useMutation(trpc.users.update.mutationOptions({
    onSuccess: () => {
      // Invalidate and refetch users
      getAllUsers.refetch();
      getUserStats.refetch();
    },
  }));

  const deleteUser = useMutation(trpc.users.delete.mutationOptions({
    onSuccess: () => {
      // Invalidate and refetch users
      getAllUsers.refetch();
      getUserStats.refetch();
    },
  }));

  const bulkCreateStudents = useMutation(trpc.users.bulkCreateStudents.mutationOptions({
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
  }));

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