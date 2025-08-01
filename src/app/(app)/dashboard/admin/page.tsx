'use client';

import React, { useState, useEffect } from 'react';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { DocumentViewer } from '@/components/DocumentViewer';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import useGetUser from '@/hooks/use-get-user';

export default function AdminDashboardPage() {
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const router = useRouter();
  const { user, isLoading: isUserLoading, isAuthenticated } = useGetUser();
  const { logout } = useAuth();

  useEffect(() => {
    // Redirect if user is not authenticated
    if (!isUserLoading && (!isAuthenticated || !user)) {
      router.push('/login');
      return;
    }

    // Redirect if user is not an admin
    if (user && user.role !== 'admin') {
      // Redirect to appropriate dashboard based on role
      if (user.role === 'student') {
        router.push('/dashboard/student');
      } else if (user.role === 'officer' || user.role === 'student-affairs') {
        router.push('/dashboard/officer');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, isAuthenticated, isUserLoading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleViewDocument = () => {
    setShowDocumentViewer(true);
  };

  const handleBackFromDocument = () => {
    setShowDocumentViewer(false);
  };

  // Show loading state
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or not an admin
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show document viewer if active
  if (showDocumentViewer) {
    return (
      <DocumentViewer
        onBack={handleBackFromDocument}
        userRole="admin"
        accessToken="mock-token"
      />
    );
  }

  // Show dashboard if user is authenticated and is an admin
  return (
    <DashboardLayout
      user={user}
      title="System Administration"
      subtitle="Manage the clearance system and monitor overall progress"
      onLogout={handleLogout}
      notifications={8}
    >
      <AdminDashboard
        onViewDocument={handleViewDocument}
      />
    </DashboardLayout>
  );
} 