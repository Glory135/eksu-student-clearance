
export type USER_ROLE_TYPE = 'student' | "officer" | "admin"

export interface UserInterface {
  id: string;
  name: string;
  email: string;
  role: USER_ROLE_TYPE;
  department?: string;
  matricNo?: string;
}

export interface Document {
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
  fileUrl?: string;
}

export interface DepartmentProgress {
  name: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  completionRate: number;
  requiredDocuments: number;
  completedDocuments: number;
  lastUpdated?: string;
}