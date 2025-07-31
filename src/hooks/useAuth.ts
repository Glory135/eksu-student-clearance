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
    onSuccess: () => {
      setSuccess('Password set successfully! You can now login.');
      setError('');
      // Redirect to dashboard after successful verification
      setTimeout(() => {
        router.push('/dashboard');
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


  const hasSetPassword = useQuery(trpc.auth.hasSetPassword.queryOptions(
    { userId: user.id || '' },
    {
      enabled: !!user.id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  ));

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return {
    // State
    isLoading: isUserLoading || sendMagicLink.isPending || verifyMagicLink.isPending ||
      sendPasswordReset.isPending || resetPassword.isPending,
    error,
    success,

    // User data
    user,
    hasSetPassword: hasSetPassword.data?.hasSetPassword || false,
    isUserLoading,

    // Mutations
    sendMagicLink: sendMagicLink.mutate,
    verifyMagicLink: verifyMagicLink.mutate,
    sendPasswordReset: sendPasswordReset.mutate,
    resetPassword: resetPassword.mutate,

    // Utilities
    clearMessages,
  };
} 