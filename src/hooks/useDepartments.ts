'use client';
import { useState } from 'react';
import { trpc } from '@/trpc/client';

export function useDepartments() {
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Queries
  const getAllDepartments = trpc.departments.getAll.useQuery(
    { limit: 50 },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const getDepartmentById = trpc.departments.getById.useQuery;

  const getDepartmentStats = trpc.departments.getStats.useQuery;

  const getOfficerCreationEnabled = trpc.departments.getOfficerCreationEnabled.useQuery(
    {},
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const canCreateOfficer = trpc.departments.canCreateOfficer.useQuery;

  // Mutations
  const createDepartment = trpc.departments.create.useMutation({
    onSuccess: () => {
      setCreateError('');
      // Invalidate and refetch departments
      getAllDepartments.refetch();
    },
    onError: (error) => {
      setCreateError(`Failed to create department: ${error.message}`);
    },
  });

  const updateDepartment = trpc.departments.update.useMutation({
    onSuccess: () => {
      // Invalidate and refetch departments
      getAllDepartments.refetch();
    },
  });

  const deleteDepartment = trpc.departments.delete.useMutation({
    onSuccess: () => {
      // Invalidate and refetch departments
      getAllDepartments.refetch();
    },
  });

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