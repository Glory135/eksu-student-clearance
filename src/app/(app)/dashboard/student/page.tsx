'use client';

import React, { useState, useEffect } from 'react';
import { StudentDashboard } from '../../../../components/dashboards/StudentDashboard';
import { DocumentViewer } from '../../../../components/DocumentViewer';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import { USER_ROLES } from '@/lib/constatnts';
import { UserInterface } from '@/lib/types';



export default function StudentDashboardPage() {
  const [currentUser, setCurrentUser] = useState<UserInterface | null>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session and validate user role
    const token = localStorage.getItem('payload_token');
    if (true) {
      // In a real app, validate the token with the server
      const mockUser: UserInterface = {
        id: 'demo-student',
        name: 'John Doe',
        email: 'john.doe@student.eksu.edu.ng',
        role: USER_ROLES.student,
        department: 'Computer Science',
        matricNo: 'EKSU/2020/0001',
      };
      setCurrentUser(mockUser);
    } else {
      // Redirect to login if no token
      router.push('/dashboard');
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('payload_token');
    router.push('/dashboard');
  };

  const handleViewDocument = () => {
    setShowDocumentViewer(true);
  };

  const handleBackFromDocument = () => {
    setShowDocumentViewer(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading student dashboard...</p>
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

  // Show dashboard if user is authenticated
  if (currentUser) {
    return (
      <DashboardLayout
        user={currentUser}
        title="Student Dashboard"
        subtitle="Track your clearance progress and upload required documents"
        onLogout={handleLogout}
        notifications={3}
      >
        <StudentDashboard
          onViewDocument={handleViewDocument}
          userData={currentUser}
        />
      </DashboardLayout>
    );
  }

  // This should not be reached
  return null;
} 