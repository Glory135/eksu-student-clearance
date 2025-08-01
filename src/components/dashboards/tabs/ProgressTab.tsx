import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { getStatusIcon, getStatusBadge, formatDate } from '../utils/dashboardUtils';

interface Requirement {
  id: string;
  name: string;
  description: string;
}

interface Document {
  id: string;
  status: string;
  uploadedAt: string;
  reviewNotes?: string;
  requirement?: {
    id: string;
  };
}

interface ProgressTabProps {
  requirements: Requirement[];
  documents: Document[];
  title?: string;
  description?: string;
}

export function ProgressTab({ 
  requirements, 
  documents, 
  title = "Clearance Progress",
  description = "Detailed progress of your clearance across all departments"
}: ProgressTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {requirements.map((req) => {
            const doc = documents.find(d => d.requirement?.id === req.id);
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
          
          {requirements.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No requirements found</p>
              <p className="text-sm">Requirements will appear here when available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 