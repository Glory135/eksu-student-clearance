'use client';

import React, { useState, useEffect } from 'react';
import { LoginPage } from '../../../components/dashboards/Login';
import { useRouter } from 'next/navigation';
import { USER_ROLES } from '@/lib/constatnts';
import { USER_ROLE_TYPE, UserInterface } from '@/lib/types';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<UserInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('payload_token');
    if (token) {
      // In a real app, validate the token with the server
      // For now, we'll use mock data
      const mockUser: UserInterface = {
        id: 'demo-user',
        name: 'John Doe',
        email: 'john.doe@student.eksu.edu.ng',
        role: USER_ROLES.student,
        department: 'Computer Science',
        matricNo: 'EKSU/2020/0001',
      };
      setCurrentUser(mockUser);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (role: string, userData?: UserInterface) => {
    if (userData) {
      setCurrentUser(userData);
    } else {
      // Create mock user based on role
      const mockUser: UserInterface = {
        id: `demo-${role}`,
        name: role === USER_ROLES.student ? 'John Doe' : role === USER_ROLES.officer ? 'Dr. Sarah Johnson' : 'System Admin',
        email: role === USER_ROLES.student ? 'john.doe@student.eksu.edu.ng' : role === USER_ROLES.officer ? 's.johnson@eksu.edu.ng' : 'admin@eksu.edu.ng',
        role: role as USER_ROLE_TYPE,
        department: role === USER_ROLES.student ? 'Computer Science' : role === USER_ROLES.officer ? 'Computer Science' : 'Administration',
        matricNo: role === USER_ROLES.student ? 'EKSU/2020/0001' : undefined,
      };
      setCurrentUser(mockUser);
    }

    // Redirect to appropriate dashboard
    setTimeout(() => {
      switch (role) {
        case USER_ROLES.student:
          router.push('/dashboard/student');
          break;
        case USER_ROLES.officer:
          router.push('/dashboard/officer');
          break;
        case USER_ROLES.admin:
          router.push('/dashboard/admin');
          break;
      }
    }, 100);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if no user
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // This should not be reached as we redirect after login
  return null;
} 