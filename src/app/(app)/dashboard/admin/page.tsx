'use client';

import React, { useState, useEffect } from 'react';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { DocumentViewer } from '@/components/DocumentViewer';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import { USER_ROLES } from '@/lib/constatnts';
import { UserInterface } from '@/lib/types';



export default function AdminDashboardPage() {
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
        id: 'demo-admin',
        name: 'System Admin',
        email: 'admin@eksu.edu.ng',
        role: USER_ROLES.admin,
        department: 'Administration',
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
          <p className="mt-2 text-muted-foreground">Loading admin dashboard...</p>
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

  // Show dashboard if user is authenticated
  if (currentUser) {
    return (
      <DashboardLayout
        user={currentUser}
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

  // This should not be reached
  return null;
} 