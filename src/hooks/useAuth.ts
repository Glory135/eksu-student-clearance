'use client';
import { useState } from 'react';
import { useTRPC } from '@/trpc/client';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import useGetUser from './use-get-user';

export function useAuth() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const trpc = useTRPC()

  const { user, isLoading: isUserLoading } = useGetUser()

  // Login mutation
  const login = useMutation(trpc.auth.login.mutationOptions({
    onSuccess: (data) => {
      setSuccess('Login successful! Redirecting...');
      setError('');
      // Redirect based on user role
      setTimeout(() => {
        if (data.user.role === 'student') {
          router.push('/dashboard/student');
        } else if (data.user.role === 'officer') {
          router.push('/dashboard/officer');
        } else if (data.user.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard');
        }
      }, 1000);
    },
    onError: (error) => {
      setError(`Login failed: ${error.message}`);
      setSuccess('');
    },
  }));

  // Logout mutation
  const logout = useMutation(trpc.auth.logout.mutationOptions({
    onSuccess: () => {
      setSuccess('Logged out successfully');
      setError('');
      // Redirect to login page
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    },
    onError: (error) => {
      setError(`Logout failed: ${error.message}`);
      setSuccess('');
    },
  }));

  const sendMagicLink = useMutation(trpc.auth.sendMagicLink.mutationOptions({
    onSuccess: () => {
      setSuccess('Magic link sent to your email! Please check your inbox.');
      setError('');
    },
    onError: (error) => {
      setError(`Failed to send magic link: ${error.message}`);
      setSuccess('');
    },
  }));

  const verifyMagicLink = useMutation(trpc.auth.verifyMagicLink.mutationOptions({
    onSuccess: (data) => {
      setSuccess('Password set successfully! You can now login.');
      setError('');
      // Redirect to dashboard after successful verification
      setTimeout(() => {
        if (data.user.role === 'student') {
          router.push('/dashboard/student');
        } else if (data.user.role === 'officer') {
          router.push('/dashboard/officer');
        } else if (data.user.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard');
        }
      }, 2000);
    },
    onError: (error) => {
      setError(`Failed to verify magic link: ${error.message}`);
      setSuccess('');
    },
  }));

  const sendPasswordReset = useMutation(trpc.auth.sendPasswordReset.mutationOptions({
    onSuccess: () => {
      setSuccess('Password reset email sent! Please check your inbox.');
      setError('');
    },
    onError: (error) => {
      setError(`Failed to send password reset: ${error.message}`);
      setSuccess('');
    },
  }));

  const resetPassword = useMutation(trpc.auth.resetPassword.mutationOptions({
    onSuccess: () => {
      setSuccess('Password reset successfully! You can now login.');
      setError('');
      // Redirect to login after successful reset
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    },
    onError: (error) => {
      setError(`Failed to reset password: ${error.message}`);
      setSuccess('');
    },
  }));

  // Verify token query
  const verifyToken = useQuery(trpc.auth.verifyToken.queryOptions(
    { token: '' }, // This will be set when needed
    {
      enabled: false, // Don't run automatically
    }
  ));

  const hasSetPassword = useQuery(trpc.auth.hasSetPassword.queryOptions(
    { userId: user?.id || '' },
    {
      enabled: !!user?.id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  ));

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return {
    // State
    isLoading: isUserLoading || login.isPending || logout.isPending || 
      sendMagicLink.isPending || verifyMagicLink.isPending ||
      sendPasswordReset.isPending || resetPassword.isPending,
    error,
    success,

    // User data
    user,
    hasSetPassword: hasSetPassword.data?.hasSetPassword || false,
    isUserLoading,

    // Mutations
    login: login.mutate,
    logout: logout.mutate,
    sendMagicLink: sendMagicLink.mutate,
    verifyMagicLink: verifyMagicLink.mutate,
    sendPasswordReset: sendPasswordReset.mutate,
    resetPassword: resetPassword.mutate,

    // Queries
    verifyToken: verifyToken.refetch,

    // Utilities
    clearMessages,
  };
} 