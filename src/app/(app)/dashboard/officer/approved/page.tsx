'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  Eye,
  Download,
  Search,
} from 'lucide-react';
import { USER_ROLES } from '@/lib/constatnts';
import { UserInterface } from '@/lib/types';

export default function OfficerApprovedPage() {
  const [currentUser, setCurrentUser] = useState<UserInterface | null>(null);
  const [approvedDocuments, setApprovedDocuments] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('payload_token');
    if (true) {
      const mockUser: UserInterface = {
        id: 'demo-officer',
        name: 'Dr. Sarah Johnson',
        email: 's.johnson@eksu.edu.ng',
        role: USER_ROLES.officer,
        department: 'Computer Science',
      };
      setCurrentUser(mockUser);
      loadApprovedDocuments();
    } else {
      router.push('/dashboard');
    }
    setIsLoading(false);
  }, [router]);

  const loadApprovedDocuments = async () => {
    // Mock approved documents data
    const mockApprovedDocuments = [
      {
        id: '1',
        student: {
          name: 'Alice Brown',
          matricNo: 'EKSU/2020/0004'
        },
        documentType: 'Academic Transcript',
        fileName: 'academic_transcript.pdf',
        approvedAt: '2024-01-15',
        approvedBy: 'Dr. Sarah Johnson',
        size: 2048576,
        signedUrl: '#'
      },
      {
        id: '2',
        student: {
          name: 'Bob Wilson',
          matricNo: 'EKSU/2020/0005'
        },
        documentType: 'Course Form',
        fileName: 'course_form.pdf',
        approvedAt: '2024-01-14',
        approvedBy: 'Dr. Sarah Johnson',
        size: 1536000,
        signedUrl: '#'
      },
      {
        id: '3',
        student: {
          name: 'Carol Davis',
          matricNo: 'EKSU/2020/0006'
        },
        documentType: 'Registration Form',
        fileName: 'registration_form.pdf',
        approvedAt: '2024-01-13',
        approvedBy: 'Dr. Sarah Johnson',
        size: 1024000,
        signedUrl: '#'
      }
    ];
    setApprovedDocuments(mockApprovedDocuments);
  };

  const handleLogout = () => {
    localStorage.removeItem('payload_token');
    router.push('/dashboard');
  };

  const filteredDocuments = approvedDocuments.filter(doc =>
    doc.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.student.matricNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.documentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading approved documents...</p>
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
      title="Approved Documents"
      subtitle="View all documents you have approved"
      onLogout={handleLogout}
      notifications={5}
    >
      <div className="space-y-6">
        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or matric number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approved Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Approved Documents ({filteredDocuments.length})</CardTitle>
            <CardDescription>
              All documents you have approved for clearance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                  <p className="text-muted-foreground">No approved documents found</p>
                  <p className="text-sm text-muted-foreground">Approved documents will appear here</p>
                </div>
              ) : (
                filteredDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{doc.student.name}</h4>
                          <Badge variant="outline">{doc.student.matricNo}</Badge>
                          <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {doc.documentType} • {doc.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Approved by {doc.approvedBy} on {new Date(doc.approvedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(doc.signedUrl, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
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