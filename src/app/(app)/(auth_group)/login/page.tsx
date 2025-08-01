'use client';

import { useState } from 'react';
import { LoginPage } from '@/components/dashboards/Login';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleLogin = (role: string, userData?: any) => {
    setCurrentUser(userData);
    
    // Redirect based on role
    if (role === 'student') {
      router.push('/dashboard/student');
    } else if (role === 'officer') {
      router.push('/dashboard/officer');
    } else if (role === 'admin') {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard');
    }
  };

  return <LoginPage onLogin={handleLogin} />;
} 