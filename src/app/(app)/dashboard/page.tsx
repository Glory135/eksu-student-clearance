'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import useGetUser from '@/hooks/use-get-user';
import { LoginPage } from '@/components/dashboards/Login';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading, isAuthenticated } = useGetUser();
  const { logout } = useAuth();

  useEffect(() => {
    // If user is authenticated, redirect to appropriate dashboard
    if (isAuthenticated && user) {
      const role = user.role;
      switch (role) {
        case 'student':
          router.push('/dashboard/student');
          break;
        case 'officer':
        case 'student-affairs':
          router.push('/dashboard/officer');
          break;
        case 'admin':
          router.push('/dashboard/admin');
          break;
        default:
          router.push('/dashboard/student');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleLogin = (role: string, userData?: any) => {
    // The login will be handled by the useAuth hook
    // This function is kept for compatibility with the LoginPage component
    console.log('Login handled by useAuth hook');
  };

  // Show loading state
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if no user is authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    </div>
  );
} 