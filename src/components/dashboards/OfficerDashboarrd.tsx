import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Alert, AlertDescription } from "../ui/alert";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText, 
  Eye,
  Download,
  Search,
  Filter,
  Users,
  FileCheck,
  AlertTriangle,
  Calendar,
  ChevronRight,
  MessageSquare,
  Settings,
  Plus,
  Loader2,
  Building,
  User,
  RefreshCw
} from "lucide-react";
import { useDocuments, useDepartments, useUsers } from '@/hooks';
import { RejectionReasonEnum } from '@/modules/documents/types';

interface OfficerDashboardProps {
  onViewDocument: () => void;
  userData?: any;
}

export function OfficerDashboard({ onViewDocument, userData }: OfficerDashboardProps) {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Use tRPC hooks with infinite queries
  const { 
    departmentDocuments,
    getDocumentsByDepartmentInfinite,
    reviewDocument, 
    isLoading: isDocumentsLoading,
    documentStats
  } = useDocuments();

  const { departments } = useDepartments();
  const { userStats } = useUsers();

  // Get officer's department
  const officerDepartment = departments.find(dept => dept.id === userData?.department);

  // Get documents by status
  const getDocumentsByStatus = (status: string) => {
    return departmentDocuments.filter(doc => doc.status === status);
  };

  const pendingDocuments = getDocumentsByStatus('pending');
  const approvedDocuments = getDocumentsByStatus('approved');
  const rejectedDocuments = getDocumentsByStatus('rejected');
  const underReviewDocuments = getDocumentsByStatus('under-review');

  // Filter documents by search term
  const filteredDocuments = pendingDocuments.filter(doc =>
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.student?.matricNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReview = async (documentId: string, action: 'approved' | 'rejected' | 'under-review', notes: string, rejectionReason?: RejectionReasonEnum) => {
    try {
      await reviewDocument(documentId, action, notes, rejectionReason);
      
      // Clear form
      setSelectedDocument(null);
      setReviewAction('');
      setReviewNotes('');
      setRejectionReason('');
    } catch (error) {
      console.error('Review failed:', error);
    }
  };

  const quickApprove = async (documentId: string) => {
    await handleReview(documentId, 'approved', 'Document approved');
  };

  const quickReject = async (documentId: string) => {
    await handleReview(documentId, 'rejected', 'Document rejected', RejectionReasonEnum.NOT_CLEAR);
  };

  const handleLoadMore = () => {
    if (getDocumentsByDepartmentInfinite.hasNextPage) {
      getDocumentsByDepartmentInfinite.fetchNextPage();
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    } as const;

    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'outline'}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const officerInfo = userData || {
    name: "Loading...",
    department: "...",
    role: "Clearance Officer",
    email: "..."
  };

  const stats = {
    pending: pendingDocuments.length,
    approved: approvedDocuments.length,
    rejected: rejectedDocuments.length,
    underReview: underReviewDocuments.length,
    total: departmentDocuments.length
  };

  if (isDocumentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading documents...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Officer Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {officerInfo.name} • {officerInfo.department}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {officerDepartment?.name || 'Department'}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Documents awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              Documents approved today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">
              Documents rejected today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All documents in department
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="under-review">Under Review</TabsTrigger>
        </TabsList>

        {/* Pending Documents */}
        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Documents</CardTitle>
                  <CardDescription>
                    Documents awaiting your review and approval
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending documents</p>
                    <p className="text-sm">All documents have been reviewed</p>
                  </div>
                ) : (
                  <>
                    {filteredDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.fileName}</p>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>{doc.student?.name}</span>
                              <span>•</span>
                              <span>{doc.student?.matricNo}</span>
                              <span>•</span>
                              <span>{formatDate(doc.uploadedAt)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {doc.requirement?.name} • {doc.department?.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDocument(doc)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => quickApprove(doc.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => quickReject(doc.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Load More Button */}
                    {getDocumentsByDepartmentInfinite.hasNextPage && (
                      <div className="flex justify-center pt-4">
                        <Button
                          onClick={handleLoadMore}
                          disabled={getDocumentsByDepartmentInfinite.isFetchingNextPage}
                          variant="outline"
                        >
                          {getDocumentsByDepartmentInfinite.isFetchingNextPage ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Load More
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approved Documents */}
        <TabsContent value="approved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Approved Documents</CardTitle>
              <CardDescription>
                Documents you have approved
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvedDocuments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No approved documents</p>
                    <p className="text-sm">Approved documents will appear here</p>
                  </div>
                ) : (
                  approvedDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">{doc.fileName}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{doc.student?.name}</span>
                            <span>•</span>
                            <span>{doc.student?.matricNo}</span>
                            <span>•</span>
                            <span>{formatDate(doc.reviewedAt || doc.uploadedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="default">Approved</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rejected Documents */}
        <TabsContent value="rejected" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Documents</CardTitle>
              <CardDescription>
                Documents you have rejected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rejectedDocuments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No rejected documents</p>
                    <p className="text-sm">Rejected documents will appear here</p>
                  </div>
                ) : (
                  rejectedDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium">{doc.fileName}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{doc.student?.name}</span>
                            <span>•</span>
                            <span>{doc.student?.matricNo}</span>
                            <span>•</span>
                            <span>{formatDate(doc.reviewedAt || doc.uploadedAt)}</span>
                          </div>
                          {doc.reviewNotes && (
                            <p className="text-sm text-red-600 mt-1">
                              Reason: {doc.reviewNotes}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="destructive">Rejected</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Under Review Documents */}
        <TabsContent value="under-review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Under Review</CardTitle>
              <CardDescription>
                Documents currently under review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {underReviewDocuments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents under review</p>
                    <p className="text-sm">Documents under review will appear here</p>
                  </div>
                ) : (
                  underReviewDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium">{doc.fileName}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{doc.student?.name}</span>
                            <span>•</span>
                            <span>{doc.student?.matricNo}</span>
                            <span>•</span>
                            <span>{formatDate(doc.reviewedAt || doc.uploadedAt)}</span>
                          </div>
                          {doc.reviewNotes && (
                            <p className="text-sm text-yellow-600 mt-1">
                              Note: {doc.reviewNotes}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary">Under Review</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Document</DialogTitle>
            <DialogDescription>
              Review and approve or reject the selected document
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-6">
              {/* Document Info */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Document</Label>
                  <p className="text-sm text-muted-foreground">{selectedDocument.fileName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Student</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedDocument.student?.name} ({selectedDocument.student?.matricNo})
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Department</Label>
                  <p className="text-sm text-muted-foreground">{selectedDocument.department?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Requirement</Label>
                  <p className="text-sm text-muted-foreground">{selectedDocument.requirement?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Uploaded</Label>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedDocument.uploadedAt)}</p>
                </div>
              </div>

              {/* Review Action */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Review Action</Label>
                  <Select value={reviewAction} onValueChange={setReviewAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">Approve</SelectItem>
                      <SelectItem value="reject">Reject</SelectItem>
                      <SelectItem value="under-review">Mark Under Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {reviewAction === 'reject' && (
                  <div>
                    <Label className="text-sm font-medium">Rejection Reason</Label>
                    <Select value={rejectionReason} onValueChange={setRejectionReason}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-clear">Document not clear</SelectItem>
                        <SelectItem value="wrong-type">Wrong document type</SelectItem>
                        <SelectItem value="expired">Document expired</SelectItem>
                        <SelectItem value="incomplete">Document incomplete</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Review Notes</Label>
                  <Textarea
                    placeholder="Add review notes..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDocument(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleReview(
                    selectedDocument.id,
                    reviewAction as 'approved' | 'rejected' | 'under-review',
                    reviewNotes,
                    rejectionReason as RejectionReasonEnum
                  )}
                  disabled={!reviewAction}
                >
                  Submit Review
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}