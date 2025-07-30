'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Eye,
  Edit,
  Search,
  Plus,
  Users,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { USER_ROLES } from '@/lib/constatnts';
import { UserInterface } from '@/lib/types';



export default function AdminStudentsPage() {
  const [currentUser, setCurrentUser] = useState<UserInterface | null>(null);
  const [students, setStudents] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const router = useRouter();

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('payload_token');
    if (true) {
      const mockUser: UserInterface = {
        id: 'demo-admin',
        name: 'System Admin',
        email: 'admin@eksu.edu.ng',
        role: USER_ROLES.admin,
        department: 'Administration',
      };
      setCurrentUser(mockUser);
      loadStudents();
    } else {
      // router.push('/dashboard');
    }
    setIsLoading(false);
  }, [router]);

  const loadStudents = async () => {
    // Mock students data
    const mockStudents = [
      {
        id: '1',
        name: 'John Doe',
        matricNo: 'EKSU/2020/0001',
        department: 'Computer Science',
        email: 'john.doe@student.eksu.edu.ng',
        level: '400 Level',
        status: 'active',
        clearanceProgress: 80,
        lastActive: '2024-01-15'
      },
      {
        id: '2',
        name: 'Jane Smith',
        matricNo: 'EKSU/2020/0002',
        department: 'Mathematics',
        email: 'jane.smith@student.eksu.edu.ng',
        level: '400 Level',
        status: 'active',
        clearanceProgress: 60,
        lastActive: '2024-01-14'
      },
      {
        id: '3',
        name: 'Mike Johnson',
        matricNo: 'EKSU/2020/0003',
        department: 'Physics',
        email: 'mike.johnson@student.eksu.edu.ng',
        level: '400 Level',
        status: 'inactive',
        clearanceProgress: 20,
        lastActive: '2024-01-10'
      },
      {
        id: '4',
        name: 'Alice Brown',
        matricNo: 'EKSU/2020/0004',
        department: 'Computer Science',
        email: 'alice.brown@student.eksu.edu.ng',
        level: '400 Level',
        status: 'active',
        clearanceProgress: 100,
        lastActive: '2024-01-16'
      },
      {
        id: '5',
        name: 'Bob Wilson',
        matricNo: 'EKSU/2020/0005',
        department: 'Chemistry',
        email: 'bob.wilson@student.eksu.edu.ng',
        level: '400 Level',
        status: 'active',
        clearanceProgress: 40,
        lastActive: '2024-01-13'
      }
    ];
    setStudents(mockStudents);
  };

  const handleLogout = () => {
    localStorage.removeItem('payload_token');
    router.push('/dashboard');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProgressBadge = (progress: number) => {
    if (progress === 100) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Complete</Badge>;
    } else if (progress >= 60) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Progress</Badge>;
    } else {
      return <Badge variant="outline">Started</Badge>;
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.matricNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = selectedDepartment === 'all' || student.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading students...</p>
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
      title="Students Management"
      subtitle="Manage student accounts and monitor clearance progress"
      onLogout={handleLogout}
      notifications={8}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Students ({filteredStudents.length})</h2>
            <p className="text-muted-foreground">Manage student accounts and clearance status</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
            <CardDescription>
              View and manage student accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No students found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{student.name}</h4>
                          <Badge variant="outline">{student.matricNo}</Badge>
                          {getStatusBadge(student.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {student.department} • {student.level} • {student.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            Progress: {student.clearanceProgress}%
                          </span>
                          {getProgressBadge(student.clearanceProgress)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-xl font-semibold">{students.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Students</p>
                  <p className="text-xl font-semibold">
                    {students.filter(s => s.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-xl font-semibold">
                    {students.filter(s => s.clearanceProgress > 0 && s.clearanceProgress < 100).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-xl font-semibold">
                    {students.filter(s => s.clearanceProgress === 100).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 