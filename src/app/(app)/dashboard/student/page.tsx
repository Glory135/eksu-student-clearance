'use client';

import React, { useState, useEffect } from 'react';
import { StudentDashboard } from '../../../../components/dashboards/StudentDashboard';
import { DocumentViewer } from '../../../../components/DocumentViewer';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import useGetUser from '@/hooks/use-get-user';

export default function StudentDashboardPage() {
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const router = useRouter();
  const { user, isLoading: isUserLoading, isAuthenticated } = useGetUser();
  const { logout } = useAuth();

  useEffect(() => {
    // Redirect if user is not authenticated or not a student
    if (!isUserLoading && (!isAuthenticated || !user)) {
      router.push('/login');
      return;
    }

    // Redirect if user is not a student
    if (user && user.role !== 'student') {
      // Redirect to appropriate dashboard based on role
      if (user.role === 'officer' || user.role === 'student-affairs') {
        router.push('/dashboard/officer');
      } else if (user.role === 'admin') {
        router.push('/dashboard/admin');
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
          <p className="mt-2 text-muted-foreground">Loading student dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or not a student
  if (!isAuthenticated || !user || user.role !== 'student') {
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
        userRole="student"
        accessToken="mock-token"
      />
    );
  }

  // Show dashboard if user is authenticated and is a student
  return (
    <DashboardLayout
      user={user}
      title="Student Dashboard"
      subtitle="Track your clearance progress and upload required documents"
      onLogout={handleLogout}
      notifications={3}
    >
      <StudentDashboard
        onViewDocument={handleViewDocument}
        userData={user}
      />
    </DashboardLayout>
  );
} 