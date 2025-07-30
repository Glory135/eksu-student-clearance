'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  FileText, 
  Eye, 
  Download, 
  Search, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2
} from 'lucide-react';
import {  USER_ROLES } from '@/lib/constatnts';
import { UserInterface } from '@/lib/types';

export default function StudentDocumentsPage() {
  const [currentUser, setCurrentUser] = useState<UserInterface | null>(null);
  const [documents, setDocuments] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

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
      loadDocuments();
    } else {
      router.push('/dashboard');
    }
    setIsLoading(false);
  }, [router]);

  const loadDocuments = async () => {
    // Mock documents data
    const mockDocuments = [
      {
        id: '1',
        fileName: 'academic_transcript.pdf',
        documentType: 'Academic Transcript',
        department: 'department',
        status: 'approved',
        uploadedAt: '2024-01-15',
        size: 2048576,
        reviewNotes: '',
        signedUrl: '#'
      },
      {
        id: '2',
        fileName: 'course_form.pdf',
        documentType: 'Course Form',
        department: 'department',
        status: 'pending',
        uploadedAt: '2024-01-16',
        size: 1536000,
        reviewNotes: '',
        signedUrl: '#'
      },
      {
        id: '3',
        fileName: 'library_clearance.pdf',
        documentType: 'Library Clearance',
        department: 'library',
        status: 'rejected',
        uploadedAt: '2024-01-14',
        size: 1024000,
        reviewNotes: 'Document is unclear. Please upload a clearer version.',
        signedUrl: '#'
      }
    ];
    setDocuments(mockDocuments);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedDepartment || !selectedDocumentType) {
      setError('Please select a department, document type, and file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    try {
      setUploadLoading(true);
      setError('');
      
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add new document to list
      const newDocument = {
        id: Date.now().toString(),
        fileName: file.name,
        documentType: selectedDocumentType,
        department: selectedDepartment,
        status: 'pending',
        uploadedAt: new Date().toISOString().split('T')[0],
        size: file.size,
        reviewNotes: '',
        signedUrl: '#'
      };
      
      setDocuments([newDocument, ...documents]);
      
      // Reset form
      setSelectedDepartment('');
      setSelectedDocumentType('');
      event.target.value = '';
      
    } catch (error) {
      setError('Failed to upload document. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

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
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('payload_token');
    router.push('/dashboard');
  };

  const filteredDocuments = documents.filter(doc => 
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading documents...</p>
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
      title="Documents"
      subtitle="Upload and manage your clearance documents"
      onLogout={handleLogout}
      notifications={3}
    >
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>
              Upload required documents for your clearance process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Upload Documents</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select department, document type, then choose your file
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="library">Library</SelectItem>
                      <SelectItem value="bursary">Bursary</SelectItem>
                      <SelectItem value="student_affairs">Student Affairs</SelectItem>
                      <SelectItem value="registry">Registry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transcript">Academic Transcript</SelectItem>
                      <SelectItem value="course_form">Course Form</SelectItem>
                      <SelectItem value="library_clearance">Library Clearance</SelectItem>
                      <SelectItem value="fees_receipt">Fees Receipt</SelectItem>
                      <SelectItem value="hostel_clearance">Hostel Clearance</SelectItem>
                      <SelectItem value="registration_form">Registration Form</SelectItem>
                      <SelectItem value="other">Other Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <input
                  type="file"
                  id="document-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  disabled={uploadLoading || !selectedDepartment || !selectedDocumentType}
                />
                <Button 
                  onClick={() => document.getElementById('document-upload')?.click()}
                  disabled={uploadLoading || !selectedDepartment || !selectedDocumentType}
                >
                  {uploadLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {uploadLoading ? 'Uploading...' : 'Choose File'}
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>My Documents ({filteredDocuments.length})</CardTitle>
            <CardDescription>
              All uploaded documents and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No documents found</p>
                  <p className="text-sm text-muted-foreground">Upload your first document above</p>
                </div>
              ) : (
                filteredDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(doc.status)}
                      <div>
                        <p className="font-medium">{doc.fileName}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.department} • {doc.documentType}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString()} • 
                          {(doc.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {doc.reviewNotes && (
                          <p className="text-xs text-red-600 mt-1">
                            Note: {doc.reviewNotes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(doc.status)}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {doc.signedUrl && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(doc.signedUrl, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 