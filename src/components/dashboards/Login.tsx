import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Alert, AlertDescription } from "../ui/alert";
import { Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { Logo } from '../common/Logo';
import { USER_ROLES } from '@/lib/constatnts';
import { USER_ROLE_TYPE } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

interface LoginPageProps {
  onLogin: (role: string, userData?: any) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState(USER_ROLES.student);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const {
    sendMagicLink,
    verifyMagicLink,
    sendPasswordReset,
    resetPassword,
    isLoading,
    error,
    success,
    user,
    hasSetPassword,
    clearMessages
  } = useAuth();

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    await sendMagicLink({ email });
  };

  const handleVerifyMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      return;
    }

    await verifyMagicLink({ token, password: newPassword });
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    // For now, we'll use demo login since we need to implement proper email/password auth
    handleDemoLogin(activeTab as USER_ROLE_TYPE);
  };

  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    await sendPasswordReset({ email });
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      return;
    }

    await resetPassword({ token, password: newPassword });
  };

  const handleDemoLogin = (role: USER_ROLE_TYPE) => {
    // Create mock user data for demo
    const mockUsers = {
      student: {
        id: 'demo-student',
        name: 'John Doe',
        email: 'john.doe@student.eksu.edu.ng',
        role: USER_ROLES.student,
        department: 'Computer Science',
        matricNo: 'EKSU/2020/0001'
      },
      officer: {
        id: 'demo-officer',
        name: 'Dr. Sarah Johnson',
        email: 's.johnson@eksu.edu.ng',
        role: USER_ROLES.officer,
        department: 'Computer Science'
      },
      admin: {
        id: 'demo-admin',
        name: 'System Administrator',
        email: 'admin@eksu.edu.ng',
        role: USER_ROLES.admin,
        department: 'Administration'
      }
    };

    onLogin(role, mockUsers[role as keyof typeof mockUsers]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>
            Sign in to your EKSU Clearance account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Success/Error Messages */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as USER_ROLE_TYPE)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value={USER_ROLES.student}>Student</TabsTrigger>
              <TabsTrigger value={USER_ROLES.officer}>Officer</TabsTrigger>
              <TabsTrigger value={USER_ROLES.admin}>Admin</TabsTrigger>
            </TabsList>

            {/* Student Login */}
            <TabsContent value={USER_ROLES.student} className="space-y-4">
              <form onSubmit={handleSendMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="student-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Magic Link'}
                </Button>
              </form>

              {/* Magic Link Verification */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or verify magic link
                    </span>
                  </div>
                </div>

                <form onSubmit={handleVerifyMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="token">Magic Link Token</Label>
                    <Input
                      id="token"
                      placeholder="Enter token from email"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Set Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Setting Password...' : 'Set Password'}
                  </Button>
                </form>
              </div>

              {/* Demo Login */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or demo login
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => handleDemoLogin(USER_ROLES.student)}
                className="w-full"
              >
                Demo Student Login
              </Button>
            </TabsContent>

            {/* Officer Login */}
            <TabsContent value={USER_ROLES.officer} className="space-y-4">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="officer-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="officer-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="officer-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="officer-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              {/* Password Reset */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Forgot password?
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSendPasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email Address</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" variant="outline" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
              </div>

              {/* Demo Login */}
              <Button
                variant="outline"
                onClick={() => handleDemoLogin(USER_ROLES.officer)}
                className="w-full"
              >
                Demo Officer Login
              </Button>
            </TabsContent>

            {/* Admin Login */}
            <TabsContent value={USER_ROLES.admin} className="space-y-4">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              {/* Demo Login */}
              <Button
                variant="outline"
                onClick={() => handleDemoLogin(USER_ROLES.admin)}
                className="w-full"
              >
                Demo Admin Login
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}