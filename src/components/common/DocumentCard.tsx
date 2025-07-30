import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { StatusBadge } from './StatusBadge';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  User,
  Building,
} from 'lucide-react';
import { USER_ROLE_TYPE } from '@/lib/types';
import { USER_ROLES } from '@/lib/constatnts';

interface DocumentCardProps {
  document: {
    id: string;
    fileName: string;
    documentType: string;
    department: string;
    status: 'pending' | 'approved' | 'rejected' | 'processing';
    uploadedAt: string;
    student?: {
      name: string;
      matricNo: string;
    };
    reviewNotes?: string;
    downloadUrl?: string;
  };
  userRole: USER_ROLE_TYPE;
  onView?: (documentId: string) => void;
  onDownload?: (documentId: string) => void;
  onReview?: (documentId: string, action: 'approve' | 'reject') => void;
  className?: string;
}

export function DocumentCard({ 
  document, 
  userRole, 
  onView, 
  onDownload, 
  onReview,
  className = '' 
}: DocumentCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDocumentTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'transcript': 'Academic Transcript',
      'payment_receipt': 'Payment Receipt',
      'library_clearance': 'Library Clearance',
      'department_clearance': 'Department Clearance',
      'student_affairs': 'Student Affairs Clearance',
      'bursary_clearance': 'Bursary Clearance'
    };
    return typeMap[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base font-medium">
                {document.fileName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {getDocumentTypeLabel(document.documentType)}
              </p>
            </div>
          </div>
          <StatusBadge status={document.status} size="sm" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Document Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Department:</span>
            <span className="font-medium">{document.department}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Uploaded:</span>
            <span className="font-medium">{formatDate(document.uploadedAt)}</span>
          </div>
          
          {document.student && (
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Student:</span>
              <span className="font-medium">{document.student.name}</span>
              <Badge variant="outline" className="text-xs">
                {document.student.matricNo}
              </Badge>
            </div>
          )}
        </div>

        {/* Review Notes */}
        {document.reviewNotes && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Review Notes:</strong> {document.reviewNotes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-2">
            {onView && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onView(document.id)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            )}
            
            {onDownload && document.downloadUrl && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDownload(document.id)}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            )}
          </div>

          {/* Officer/Admin Review Actions */}
          {(userRole === USER_ROLES.officer || userRole === USER_ROLES.admin) && document.status === 'pending' && onReview && (
            <div className="flex space-x-2">
              <Button 
                size="sm"
                onClick={() => onReview(document.id, 'approve')}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onReview(document.id, 'reject')}
              >
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 