import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  Upload, 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText, 
  AlertTriangle,
  Eye,
  Download,
  RefreshCw,
  ChevronRight,
  Calendar,
  User,
  BookOpen,
  CreditCard,
  Building,
  FileCheck,
  Loader2
} from "lucide-react";
import { useDocuments, useClearance, useDepartments } from '@/hooks';

interface StudentDashboardProps {
  onViewDocument: () => void;
  userData?: any;
}

export function StudentDashboard({ onViewDocument, userData }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Use tRPC hooks
  const { 
    documents, 
    uploadDocument, 
    isLoading: isDocumentsLoading, 
    uploadError,
    isUploading,
    clearUploadError
  } = useDocuments();

  const { 
    clearance: studentClearance, 
    isLoading: isClearanceLoading 
  } = useClearance();

  const { departments } = useDepartments();

  // Get student's documents
  const studentDocuments = documents.filter(doc => doc.student?.id === userData?.id);

  // Calculate progress
  const calculateProgress = () => {
    if (!studentClearance?.statistics) return 0;
    const { totalRequirements, completedDocuments } = studentClearance.statistics;
    return totalRequirements > 0 ? (completedDocuments / totalRequirements) * 100 : 0;
  };

  const getDepartmentStatus = (department: string) => {
    const deptDocuments = studentDocuments.filter(doc => doc.department?.name === department);
    if (deptDocuments.length === 0) return 'not-started';
    
    const hasApproved = deptDocuments.some(doc => doc.status === 'approved');
    const hasRejected = deptDocuments.some(doc => doc.status === 'rejected');
    const hasPending = deptDocuments.some(doc => doc.status === 'pending');
    
    if (hasApproved) return 'completed';
    if (hasRejected) return 'rejected';
    if (hasPending) return 'in-progress';
    return 'not-started';
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    clearUploadError();
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedDepartment || !selectedDocumentType || !userData) {
      return;
    }

    try {
      await uploadDocument(
        selectedFile,
        userData.id,
        selectedDepartment,
        selectedDocumentType
      );
      
      // Reset form
      setSelectedFile(null);
      setSelectedDepartment('');
      setSelectedDocumentType('');
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'default',
      pending: 'secondary',
      rejected: 'destructive',
      'under-review': 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isDocumentsLoading || isClearanceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Welcome back, {userData?.name || 'Student'}!</h1>
            <p className="text-muted-foreground mt-1">
              Track your clearance progress and upload required documents
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {userData?.matricNo || 'EKSU/2020/0001'}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(calculateProgress())}%</div>
            <Progress value={calculateProgress()} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {studentClearance?.statistics?.completedDocuments || 0} of {studentClearance?.statistics?.totalRequirements || 0} documents completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Uploaded</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentDocuments.length}</div>
            <p className="text-xs text-muted-foreground">
              Total documents uploaded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clearance Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentClearance?.statistics?.isCompleted ? 'Completed' : 'In Progress'}
            </div>
            <p className="text-xs text-muted-foreground">
              {studentClearance?.statistics?.isCompleted ? 'All clearances completed' : 'Some documents pending'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">My Documents</TabsTrigger>
          <TabsTrigger value="upload">Upload Document</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Department Status */}
          <Card>
            <CardHeader>
              <CardTitle>Department Clearance Status</CardTitle>
              <CardDescription>
                Track your clearance progress across different departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.map((dept) => {
                  const status = getDepartmentStatus(dept.name);
                  return (
                    <div key={dept.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{dept.name}</p>
                          <p className="text-sm text-muted-foreground">{dept.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(status)}
                        {getStatusBadge(status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>
                Your recently uploaded documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentDocuments.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.fileName}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.department?.name} • {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(doc.status)}
                      {getStatusBadge(doc.status)}
                    </div>
                  </div>
                ))}
                {studentDocuments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents uploaded yet</p>
                    <p className="text-sm">Upload your first document to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Documents</CardTitle>
              <CardDescription>
                All your uploaded documents and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.fileName}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.department?.name} • {doc.requirement?.name} • {formatDate(doc.uploadedAt)}
                        </p>
                        {doc.reviewNotes && (
                          <p className="text-sm text-orange-600 mt-1">
                            Note: {doc.reviewNotes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(doc.status)}
                      {getStatusBadge(doc.status)}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {studentDocuments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents uploaded yet</p>
                    <p className="text-sm">Upload your first document to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Upload required documents for your clearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Error */}
              {uploadError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}

              {/* Department Selection */}
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
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

              {/* Document Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="document-type">Document Type</Label>
                <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transcript">Academic Transcript</SelectItem>
                    <SelectItem value="payment_receipt">Payment Receipt</SelectItem>
                    <SelectItem value="library_clearance">Library Clearance</SelectItem>
                    <SelectItem value="department_clearance">Department Clearance</SelectItem>
                    <SelectItem value="student_affairs">Student Affairs Clearance</SelectItem>
                    <SelectItem value="bursary_clearance">Bursary Clearance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file">Document File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {selectedFile ? (
                    <div className="space-y-2">
                      <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, DOC, DOCX, JPG, PNG (max 10MB)
                      </p>
                      <input
                        type="file"
                        id="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file);
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('file')?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleFileUpload}
                disabled={!selectedFile || !selectedDepartment || !selectedDocumentType || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Clearance Progress</CardTitle>
              <CardDescription>
                Detailed progress of your clearance across all departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {studentClearance?.requirements?.map((req) => {
                  const doc = studentDocuments.find(d => d.requirement?.id === req.id);
                  const status = doc?.status || 'not-started';
                  
                  return (
                    <div key={req.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{req.name}</p>
                          <p className="text-sm text-muted-foreground">{req.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(status)}
                          {getStatusBadge(status)}
                        </div>
                      </div>
                      {doc && (
                        <div className="text-sm text-muted-foreground">
                          Uploaded: {formatDate(doc.uploadedAt)}
                          {doc.reviewNotes && (
                            <span className="ml-2 text-orange-600">
                              • Note: {doc.reviewNotes}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}