import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Building, FileText } from "lucide-react";
import { getStatusIcon, getStatusBadge, formatDate } from '../utils/dashboardUtils';

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Document {
  id: string;
  fileName: string;
  status: string;
  uploadedAt: string;
  department?: {
    name: string;
  };
  reviewNotes?: string;
}

interface OverviewTabProps {
  departments: Department[];
  documents: Document[];
  getDepartmentStatus: (departmentName: string) => string;
  maxRecentDocuments?: number;
}

export function OverviewTab({ 
  departments, 
  documents, 
  getDepartmentStatus, 
  maxRecentDocuments = 5 
}: OverviewTabProps) {
  const recentDocuments = documents.slice(0, maxRecentDocuments);

  return (
    <div className="space-y-6">
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
            {recentDocuments.map((doc) => (
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
            {documents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No documents uploaded yet</p>
                <p className="text-sm">Upload your first document to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 