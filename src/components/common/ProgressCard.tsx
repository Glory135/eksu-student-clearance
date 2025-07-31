import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { StatusBadge } from './StatusBadge';
import { 
  Building, 
  ChevronRight
} from 'lucide-react';

interface DepartmentProgress {
  name: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  completionRate: number;
  requiredDocuments: number;
  completedDocuments: number;
  lastUpdated?: string;
}

interface ProgressCardProps {
  title: string;
  overallProgress: number;
  departments: DepartmentProgress[];
  onDepartmentClick?: (departmentName: string) => void;
  className?: string;
}

export function ProgressCard({ 
  title, 
  overallProgress, 
  departments, 
  onDepartmentClick,
  className = '' 
}: ProgressCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="outline" className="text-sm">
            {overallProgress}% Complete
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <Progress 
            value={overallProgress} 
            className={`h-3 ${getProgressColor(overallProgress)}`}
          />
        </div>

        {/* Department Progress */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">
            Department Status
          </h4>
          <div className="space-y-3">
            {departments.map((dept, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-colors ${
                  onDepartmentClick 
                    ? 'cursor-pointer hover:bg-muted/50' 
                    : ''
                }`}
                onClick={() => onDepartmentClick?.(dept.name)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{dept.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={dept.status} size="sm" />
                    {onDepartmentClick && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Documents: {dept.completedDocuments}/{dept.requiredDocuments}</span>
                    <span>{dept.completionRate}%</span>
                  </div>
                  <Progress 
                    value={dept.completionRate} 
                    className={`h-2 ${getProgressColor(dept.completionRate)}`}
                  />
                </div>

                {dept.lastUpdated && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated: {formatDate(dept.lastUpdated)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Summary */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {departments.filter(d => d.status === 'approved').length}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {departments.filter(d => d.status === 'pending').length}
            </div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {departments.filter(d => d.status === 'rejected').length}
            </div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 