'use client';
import { useState } from 'react';
import { trpc } from '@/trpc/client';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const sendMagicLink = trpc.auth.sendMagicLink.useMutation({
    onSuccess: () => {
      setSuccess('Magic link sent to your email! Please check your inbox.');
      setError('');
    },
    onError: (error) => {
      setError(`Failed to send magic link: ${error.message}`);
      setSuccess('');
    },
  });

  const verifyMagicLink = trpc.auth.verifyMagicLink.useMutation({
    onSuccess: (data) => {
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
  });

  const sendPasswordReset = trpc.auth.sendPasswordReset.useMutation({
    onSuccess: () => {
      setSuccess('Password reset email sent! Please check your inbox.');
      setError('');
    },
    onError: (error) => {
      setError(`Failed to send password reset: ${error.message}`);
      setSuccess('');
    },
  });

  const resetPassword = trpc.auth.resetPassword.useMutation({
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
  });

  const getCurrentUser = trpc.auth.getCurrentUser.useQuery(
    {},
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    }
  );

  const hasSetPassword = trpc.auth.hasSetPassword.useQuery(
    { userId: getCurrentUser.data?.id || '' },
    {
      enabled: !!getCurrentUser.data?.id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return {
    // State
    isLoading: isLoading || sendMagicLink.isLoading || verifyMagicLink.isLoading || 
               sendPasswordReset.isLoading || resetPassword.isLoading,
    error,
    success,
    
    // User data
    user: getCurrentUser.data,
    hasSetPassword: hasSetPassword.data?.hasSetPassword || false,
    isUserLoading: getCurrentUser.isLoading,
    
    // Mutations
    sendMagicLink: sendMagicLink.mutate,
    verifyMagicLink: verifyMagicLink.mutate,
    sendPasswordReset: sendPasswordReset.mutate,
    resetPassword: resetPassword.mutate,
    
    // Utilities
    clearMessages,
  };
} 