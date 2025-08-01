import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Upload, 
  CheckCircle, 
  FileCheck,
  Loader2,
  User
} from "lucide-react";
import { useDocuments, useClearance, useDepartments } from '@/hooks';
import { OverviewTab, DocumentsTab, UploadTab, ProgressTab } from './tabs';
import { calculateProgress } from './utils/dashboardUtils';

interface StudentDashboardProps {
  onViewDocument: () => void;
  userData?: any;
}

export function StudentDashboard({ onViewDocument, userData }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Use tRPC hooks with infinite queries
  const { 
    studentDocuments,
    getDocumentsByStudentInfinite,
    uploadDocument, 
    isLoading: isDocumentsLoading, 
    uploadError,
    isUploading,
    clearUploadError
  } = useDocuments();

  const { 
    getStudentClearance,
    isLoading: isClearanceLoading 
  } = useClearance();

  // Get student clearance data
  const studentClearance = getStudentClearance.data;

  const { departments } = useDepartments();

  // Calculate progress
  const progress = calculateProgress(
    studentClearance?.statistics?.completedDocuments || 0,
    studentClearance?.statistics?.totalRequirements || 0
  );

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

  const handleFileRemove = () => {
    setSelectedFile(null);
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

  const handleLoadMore = () => {
    if (getDocumentsByStudentInfinite.hasNextPage) {
      getDocumentsByStudentInfinite.fetchNextPage();
    }
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
            <div className="text-2xl font-bold">{Math.round(progress)}%</div>
            <Progress value={progress} className="mt-2" />
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
        <TabsContent value="overview">
          <OverviewTab
            departments={departments}
            documents={studentDocuments}
            getDepartmentStatus={getDepartmentStatus}
            maxRecentDocuments={5}
          />
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <DocumentsTab
            documents={studentDocuments}
            hasNextPage={getDocumentsByStudentInfinite.hasNextPage}
            isFetchingNextPage={getDocumentsByStudentInfinite.isFetchingNextPage}
            onLoadMore={handleLoadMore}
            onViewDocument={onViewDocument}
          />
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <UploadTab
            departments={departments}
            selectedDepartment={selectedDepartment}
            selectedDocumentType={selectedDocumentType}
            selectedFile={selectedFile}
            uploadError={uploadError}
            isUploading={isUploading}
            onDepartmentChange={setSelectedDepartment}
            onDocumentTypeChange={setSelectedDocumentType}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            onUpload={handleFileUpload}
          />
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress">
          <ProgressTab
            requirements={studentClearance?.requirements || []}
            documents={studentDocuments}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}