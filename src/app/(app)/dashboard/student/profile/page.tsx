'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Building,
  Calendar,
  Edit,
  Save,
  X,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { USER_ROLES } from '@/lib/constatnts';
import { UserInterface } from '@/lib/types';


export default function StudentProfilePage() {
  const [currentUser, setCurrentUser] = useState<UserInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Mock student profile data
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@student.eksu.edu.ng',
    matricNo: 'EKSU/2020/0001',
    department: 'Computer Science',
    college: 'College of Natural Sciences',
    level: '400 Level',
    phone: '+234 801 234 5678',
    address: '123 Student Street, Ado-Ekiti, Ekiti State',
    dateOfBirth: '1999-05-15',
    gender: 'Male',
    nationality: 'Nigerian',
    stateOfOrigin: 'Ekiti State',
    localGovernment: 'Ado-Ekiti',
    guardianName: 'Mr. Michael Doe',
    guardianPhone: '+234 802 345 6789',
    guardianAddress: '456 Guardian Street, Ado-Ekiti, Ekiti State'
  });

  const [clearanceProgress] = useState({
    completed: 3,
    total: 5,
    percentage: 60,
    departments: {
      department: 'approved',
      library: 'pending',
      bursary: 'approved',
      student_affairs: 'approved',
      registry: 'not_started'
    }
  });

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('payload_token');
    if (true) {
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
      router.push('/dashboard');
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('payload_token');
    router.push('/dashboard');
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      setError('Failed to update profile. Please try again.');
    }
  };

  // const getDepartmentStatus = (department: string) => {
  //   return clearanceProgress.departments[department] || 'not_started';
  // };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <DashboardLayout
      user={currentUser}
      title="Profile"
      subtitle="View and manage your personal information"
      onLogout={handleLogout}
      notifications={3}
    >
      <div className="space-y-6">
        {/* Success Alert */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Student Profile</CardTitle>
                <CardDescription>
                  Your personal and academic information
                </CardDescription>
              </div>
              <Button
                variant={isEditing ? "outline" : "default"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    {isEditing ? (
                      <Input 
                        value={profile.name} 
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm bg-muted p-2 rounded">{profile.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Email</Label>
                    {isEditing ? (
                      <Input 
                        value={profile.email} 
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        type="email"
                      />
                    ) : (
                      <p className="text-sm bg-muted p-2 rounded">{profile.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    {isEditing ? (
                      <Input 
                        value={profile.phone} 
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm bg-muted p-2 rounded">{profile.phone}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    {isEditing ? (
                      <Input 
                        value={profile.dateOfBirth} 
                        onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})}
                        type="date"
                      />
                    ) : (
                      <p className="text-sm bg-muted p-2 rounded">{profile.dateOfBirth}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Address</Label>
                    {isEditing ? (
                      <Input 
                        value={profile.address} 
                        onChange={(e) => setProfile({...profile, address: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm bg-muted p-2 rounded">{profile.address}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Academic Information
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Matric Number</Label>
                    <p className="text-sm bg-muted p-2 rounded">{profile.matricNo}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <p className="text-sm bg-muted p-2 rounded">{profile.department}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>College</Label>
                    <p className="text-sm bg-muted p-2 rounded">{profile.college}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Level</Label>
                    <p className="text-sm bg-muted p-2 rounded">{profile.level}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Guardian Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Guardian Name</Label>
                  {isEditing ? (
                    <Input 
                      value={profile.guardianName} 
                      onChange={(e) => setProfile({...profile, guardianName: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm bg-muted p-2 rounded">{profile.guardianName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Guardian Phone</Label>
                  {isEditing ? (
                    <Input 
                      value={profile.guardianPhone} 
                      onChange={(e) => setProfile({...profile, guardianPhone: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm bg-muted p-2 rounded">{profile.guardianPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clearance Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Clearance Progress</CardTitle>
            <CardDescription>
              Track your clearance status across all departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Overview */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Overall Progress</p>
                  <p className="text-2xl font-bold">{clearanceProgress.percentage}%</p>
                </div>
                <div className="w-32">
                  <Progress value={clearanceProgress.percentage} />
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-lg font-semibold">
                    {clearanceProgress.completed}/{clearanceProgress.total}
                  </p>
                </div>
              </div>

              {/* Department Status */}
              <div className="space-y-3">
                {Object.entries(clearanceProgress.departments).map(([dept, status]) => (
                  <div key={dept} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(status)}
                      <div>
                        <h4 className="font-medium capitalize">{dept.replace('_', ' ')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {status === 'approved' ? 'Document approved' : 
                           status === 'pending' ? 'Under review' : 
                           status === 'rejected' ? 'Document rejected' : 
                           'No documents uploaded'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(status)}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 