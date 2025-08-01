import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { FileText, Eye, Loader2, RefreshCw } from "lucide-react";
import { getStatusIcon, getStatusBadge, formatDate } from '../utils/dashboardUtils';

interface Document {
  id: string;
  fileName: string;
  status: string;
  uploadedAt: string;
  department?: {
    name: string;
  };
  requirement?: {
    name: string;
  };
  reviewNotes?: string;
}

interface DocumentsTabProps {
  documents: Document[];
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  onViewDocument?: (documentId: string) => void;
  emptyStateMessage?: string;
  emptyStateDescription?: string;
}

export function DocumentsTab({
  documents,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  onViewDocument,
  emptyStateMessage = "No documents uploaded yet",
  emptyStateDescription = "Upload your first document to get started"
}: DocumentsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Documents</CardTitle>
        <CardDescription>
          All your uploaded documents and their current status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc) => (
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
                {onViewDocument && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDocument(doc.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {documents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{emptyStateMessage}</p>
              <p className="text-sm">{emptyStateDescription}</p>
            </div>
          )}

          {/* Load More Button */}
          {hasNextPage && onLoadMore && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={onLoadMore}
                disabled={isFetchingNextPage}
                variant="outline"
              >
                {isFetchingNextPage ? (
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
        </div>
      </CardContent>
    </Card>
  );
} 