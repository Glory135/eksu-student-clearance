import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  Users, 
  UserPlus, 
  FileSpreadsheet, 
  BarChart3, 
  Shield, 
  Settings,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Building,
  BookOpen,
  GraduationCap,
  Mail,
  TrendingUp,
  Calendar,
  Loader2,
  User
} from "lucide-react";
import { useUsers, useDepartments, useClearance } from '@/hooks';

interface AdminDashboardProps {
  onViewDocument: () => void;
}

export function AdminDashboard({ onViewDocument }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Use tRPC hooks
  const { 
    users, 
    userStats, 
    createStudent, 
    createOfficer, 
    updateUser, 
    deleteUser,
    isLoading: isUsersLoading 
  } = useUsers();

  const { 
    departments, 
    createDepartment, 
    updateDepartment, 
    deleteDepartment,
    isLoading: isDepartmentsLoading 
  } = useDepartments();

  const { 
    clearanceStats, 
    isLoading: isClearanceLoading 
  } = useClearance();

  // Filter users by search term
  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.matricNo && user.matricNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get users by role
  const students = users.filter(user => user.role === 'student');
  const officers = users.filter(user => ['officer', 'student-affairs'].includes(user.role));
  const admins = users.filter(user => user.role === 'admin');

  // Calculate statistics
  const systemStats = {
    totalStudents: userStats?.students || 0,
    activeOfficers: userStats?.officers || 0,
    completedClearances: clearanceStats?.completed || 0,
    pendingClearances: clearanceStats?.notStarted || 0,
    departments: departments.length,
    averageCompletionTime: 5.2 // This would come from clearance stats
  };

  const handleCreateStudent = async (studentData: {
    name: string;
    email: string;
    matricNo: string;
    department: string;
    phone?: string;
  }) => {
    setIsCreatingUser(true);
    try {
      await createStudent(studentData);
    } catch (error) {
      console.error('Failed to create student:', error);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleCreateOfficer = async (officerData: {
    name: string;
    email: string;
    role: 'officer' | 'student-affairs';
    department: string;
    phone?: string;
  }) => {
    setIsCreatingUser(true);
    try {
      await createOfficer(officerData);
    } catch (error) {
      console.error('Failed to create officer:', error);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleCreateDepartment = async (departmentData: {
    name: string;
    code: string;
    description?: string;
    canAddOfficers?: boolean;
    officerCreationLimit?: number;
  }) => {
    try {
      await createDepartment(departmentData);
    } catch (error) {
      console.error('Failed to create department:', error);
    }
  };

  if (isUsersLoading || isDepartmentsLoading || isClearanceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading system data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">System Administration</h1>
            <p className="text-muted-foreground mt-1">
              EKSU Clearance System Dashboard
            </p>
          </div>
          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new student or officer account
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="user-name">Name</Label>
                      <Input id="user-name" placeholder="Enter full name" />
                    </div>
                    <div>
                      <Label htmlFor="user-email">Email</Label>
                      <Input id="user-email" type="email" placeholder="Enter email" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="user-role">Role</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="officer">Officer</SelectItem>
                          <SelectItem value="student-affairs">Student Affairs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="user-department">Department</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Cancel</Button>
                    <Button disabled={isCreatingUser}>
                      {isCreatingUser ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create User'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Building className="h-4 w-4 mr-2" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Department</DialogTitle>
                  <DialogDescription>
                    Create a new department for clearance processing
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dept-name">Department Name</Label>
                    <Input id="dept-name" placeholder="Enter department name" />
                  </div>
                  <div>
                    <Label htmlFor="dept-code">Department Code</Label>
                    <Input id="dept-code" placeholder="Enter department code" />
                  </div>
                  <div>
                    <Label htmlFor="dept-description">Description</Label>
                    <Input id="dept-description" placeholder="Enter description" />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Create Department</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Active student accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Officers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.activeOfficers}</div>
            <p className="text-xs text-muted-foreground">
              Department officers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Clearances</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.completedClearances}</div>
            <p className="text-xs text-muted-foreground">
              Students fully cleared
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.departments}</div>
            <p className="text-xs text-muted-foreground">
              Active departments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="clearance">Clearance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Clearance Flow */}
          <Card>
            <CardHeader>
              <CardTitle>Clearance Flow Statistics</CardTitle>
              <CardDescription>
                Progress across different clearance stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.map((dept) => {
                  const deptStats = {
                    students: students.filter(s => s.department?.id === dept.id).length,
                    completed: Math.floor(Math.random() * 100), // This would come from real stats
                    pending: Math.floor(Math.random() * 20)
                  };
                  
                  return (
                    <div key={dept.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{dept.name}</p>
                          <p className="text-sm text-muted-foreground">{dept.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm font-medium">{deptStats.students}</p>
                          <p className="text-xs text-muted-foreground">Students</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-green-600">{deptStats.completed}</p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-yellow-600">{deptStats.pending}</p>
                          <p className="text-xs text-muted-foreground">Pending</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest system activities and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <UserPlus className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">New student registered</p>
                    <p className="text-xs text-muted-foreground">John Doe (EKSU/2020/0001)</p>
                  </div>
                  <span className="text-xs text-muted-foreground ml-auto">2 hours ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Clearance completed</p>
                    <p className="text-xs text-muted-foreground">Jane Smith (Computer Science)</p>
                  </div>
                  <span className="text-xs text-muted-foreground ml-auto">4 hours ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Upload className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Document uploaded</p>
                    <p className="text-xs text-muted-foreground">Academic transcript by Mike Johnson</p>
                  </div>
                  <span className="text-xs text-muted-foreground ml-auto">6 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage all system users
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.matricNo && (
                          <p className="text-xs text-muted-foreground">{user.matricNo}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                        {user.role}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No users found</p>
                    <p className="text-sm">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Management</CardTitle>
              <CardDescription>
                Manage system departments and their settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{dept.name}</p>
                        <p className="text-sm text-muted-foreground">{dept.code}</p>
                        {dept.description && (
                          <p className="text-xs text-muted-foreground">{dept.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={dept.status === 'active' ? 'default' : 'secondary'}>
                        {dept.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clearance Tab */}
        <TabsContent value="clearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Clearance Statistics</CardTitle>
              <CardDescription>
                Overall clearance progress and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {clearanceStats?.completionRate?.toFixed(1) || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {clearanceStats?.totalStudents || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {clearanceStats?.completed || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {clearanceStats?.inProgress || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}