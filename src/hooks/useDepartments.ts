'use client';
import { useState } from 'react';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import useGetUser from './use-get-user';

export function useDepartments() {
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const trpc = useTRPC()
  const { user } = useGetUser()


  // Queries
  const getAllDepartments = useQuery(trpc.departments.getAll.queryOptions({
    limit: 50,
  }));

  const getDepartmentById = useQuery(trpc.departments.getById.queryOptions({
    id: user.department?.id || "",
  }));

  const getDepartmentStats = useQuery(trpc.departments.getStats.queryOptions({
    id: user.department?.id || "",
  }));

  const getOfficerCreationEnabled = useQuery(trpc.departments.getOfficerCreationEnabled.queryOptions());

  const canCreateOfficer = useQuery(trpc.departments.canCreateOfficer.queryOptions({
    departmentId: user.department?.id || "",
  }));

  // Mutations
  const createDepartment = useMutation(trpc.departments.create.mutationOptions({
    onSuccess: () => {
      setCreateError('');
      // Invalidate and refetch departments
      getAllDepartments.refetch();
    },
    onError: (error) => {
      setCreateError(`Failed to create department: ${error.message}`);
    },
  }));

  const updateDepartment = useMutation(trpc.departments.update.mutationOptions({
    onSuccess: () => {
      // Invalidate and refetch departments
      getAllDepartments.refetch();
    },
  }));

  const deleteDepartment = useMutation(trpc.departments.delete.mutationOptions({
    onSuccess: () => {
      // Invalidate and refetch departments
      getAllDepartments.refetch();
    },
  }));

  // Create department helper
  const handleCreateDepartment = async (departmentData: {
    name: string;
    code: string;
    description?: string;
    status?: 'active' | 'inactive' | 'under-review';
    clearanceOrder?: number;
    canAddOfficers?: boolean;
    officerCreationLimit?: number;
  }) => {
    setIsCreating(true);
    setCreateError('');

    try {
      await createDepartment.mutateAsync(departmentData);
    } catch (error) {
      console.error('Create department error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Update department helper
  const handleUpdateDepartment = async (
    id: string,
    updateData: {
      name?: string;
      code?: string;
      description?: string;
      status?: 'active' | 'inactive' | 'under-review';
      clearanceOrder?: number;
      canAddOfficers?: boolean;
      officerCreationLimit?: number;
      officer?: string;
      studentAffairsOfficer?: string;
    }
  ) => {
    try {
      await updateDepartment.mutateAsync({
        id,
        ...updateData,
      });
    } catch (error) {
      console.error('Update department error:', error);
    }
  };

  return {
    // State
    isCreating,
    createError,

    // Queries
    departments: getAllDepartments.data?.docs || [],
    officerCreationEnabled: getOfficerCreationEnabled.data?.docs || [],
    isLoading: getAllDepartments.isLoading,
    isOfficerCreationLoading: getOfficerCreationEnabled.isLoading,

    // Query functions
    getDepartmentById,
    getDepartmentStats,
    canCreateOfficer,

    // Mutations
    createDepartment: handleCreateDepartment,
    updateDepartment: handleUpdateDepartment,
    deleteDepartment: deleteDepartment.mutate,

    // Utilities
    clearCreateError: () => setCreateError(''),
    refetch: getAllDepartments.refetch,
  };
} 