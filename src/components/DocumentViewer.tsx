import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  ArrowLeft,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  User,
  MessageSquare,
  History,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Share2,
  Loader2
} from "lucide-react";
import { apiClient } from '../lib/api-client';
import { toast } from 'sonner';
import { USER_ROLES } from '@/lib/constatnts';

interface DocumentViewerProps {
  onBack: () => void;
  userRole: string;
  accessToken: string;
}

interface Document {
  id: string;
  fileName: string;
  documentType: string;
  department: string;
  status: string;
  uploadedAt: string;
  reviewNotes?: string;
  downloadUrl?: string;
  student?: any;
}

export function DocumentViewer({ onBack, userRole, accessToken }: DocumentViewerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState(0);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      let result;
      
      // For officers, get pending reviews
      if (userRole === USER_ROLES.officer || userRole === USER_ROLES.admin) {
        result = await apiClient.getPendingDocuments('computer_science'); // Default department
      } else {
        result = await apiClient.getUserDocuments();
      }

      if (result.error) {
        toast.error('Failed to load documents');
      } else {
        setDocuments(result.documents || []);
      }
    } catch (error) {
      console.error('Documents fetch error:', error);
      toast.error('Error loading documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewAction || !documents[selectedDocument]) {
      toast.error('Please select an action');
      return;
    }

    setReviewLoading(true);
    try {
      const document = documents[selectedDocument];
      const result = await apiClient.reviewDocument(
        document.id,
        reviewAction as 'approve' | 'reject',
        reviewNotes
      );

      if (result.error) {
        toast.error(`Review failed: ${result.error}`);
      } else {
        toast.success(`Document ${reviewAction} successfully`);
        setReviewAction('');
        setReviewNotes('');
        await fetchDocuments(); // Refresh documents
      }
    } catch (error) {
      console.error('Review error:', error);
      toast.error('Review submission failed');
    } finally {
      setReviewLoading(false);
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
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card p-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Document Viewer</h1>
              <p className="text-sm text-muted-foreground">No documents available</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Documents Found</h3>
            <p className="text-muted-foreground mb-4">
              {userRole === USER_ROLES.student
                ? 'You haven\'t uploaded any documents yet.'
                : 'No documents are available for review.'}
            </p>
            <Button onClick={onBack}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  const currentDocument = documents[selectedDocument];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Document Viewer</h1>
              <p className="text-sm text-muted-foreground">
                {documents.length} document{documents.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Document List */}
        <div className="w-80 border-r bg-muted/30">
          <div className="p-4 border-b">
            <h3 className="font-medium mb-3">Documents</h3>
            <div className="space-y-2">
              {documents.map((doc, index) => (
                <div
                  key={doc.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    index === selectedDocument
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-muted'
                  }`}
                  onClick={() => setSelectedDocument(index)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">
                      {doc.fileName}
                    </span>
                    {getStatusBadge(doc.status)}
                  </div>
                  <p className="text-xs opacity-75">
                    {doc.documentType} • {doc.department}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="flex-1 flex flex-col">
          {/* Document Info */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">{currentDocument.fileName}</h2>
                <p className="text-muted-foreground">
                  {currentDocument.documentType} • {currentDocument.department}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm">{zoomLevel}%</span>
                <Button variant="outline" size="sm">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Document Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Uploaded: {new Date(currentDocument.uploadedAt).toLocaleDateString()}</span>
              </div>
              {currentDocument.student && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Student: {currentDocument.student.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Document Content */}
          <div className="flex-1 p-6">
            <div className="bg-muted rounded-lg p-8 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Document Preview</h3>
              <p className="text-muted-foreground mb-4">
                Document preview will be displayed here
              </p>
              <Button>
                <Eye className="h-4 w-4 mr-2" />
                View Full Document
              </Button>
            </div>
          </div>

          {/* Review Section (for officers/admins) */}
          {(userRole === USER_ROLES.officer || userRole === USER_ROLES.admin) && (
            <div className="border-t p-6">
              <h3 className="font-medium mb-4">Review Document</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="review-action">Action</Label>
                  <Select value={reviewAction} onValueChange={setReviewAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">Approve</SelectItem>
                      <SelectItem value="reject">Reject</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="review-notes">Review Notes</Label>
                  <Textarea
                    id="review-notes"
                    placeholder="Add review notes..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleReviewSubmit}
                  disabled={!reviewAction || reviewLoading}
                  className="w-full"
                >
                  {reviewLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Submit Review
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}