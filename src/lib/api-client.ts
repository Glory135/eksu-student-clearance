// API Client for Payload CMS
// This replaces the Supabase client with Payload-compatible functions

import { USER_ROLES } from "./constatnts";
import { UserInterface } from "./types";

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || '/api';
  }

  // Authentication
  async signInWithOtp(email: string): Promise<{ error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send magic link');
      }

      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Authentication failed' };
    }
  }

  async signInWithPassword(email: string, password: string): Promise<{ data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Authentication failed' };
    }
  }

  // UserInterface Profile
  async getProfile(): Promise<{ user: UserInterface; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      return { user: data.user };
    } catch (error) {
      return { user: this.getMockUser(), error: error instanceof Error ? error.message : 'Failed to fetch profile' };
    }
  }

  // Documents
  async getUserDocuments(): Promise<{ documents: Document[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/documents`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      return { documents: data.docs || [] };
    } catch (error) {
      // Return mock data for development
      return { documents: this.getMockDocuments() };
    }
  }

  async getPendingDocuments(department: string): Promise<{ documents: Document[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/documents?where[department][equals]=${department}&where[status][equals]=pending`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending documents');
      }

      const data = await response.json();
      return { documents: data.docs || [] };
    } catch (error) {
      // Return mock data for development
      return { documents: this.getMockPendingDocuments(department) };
    }
  }

  async uploadDocument(file: File, documentType: string, department: string): Promise<{ error?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      formData.append('department', department);

      const response = await fetch(`${this.baseUrl}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Upload failed' };
    }
  }

  async reviewDocument(documentId: string, action: 'approve' | 'reject', notes: string): Promise<{ error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/documents/${documentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewNotes: notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to review document');
      }

      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Review failed' };
    }
  }

  // Helper methods
  private getToken(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('payload_token') || '';
    }
    return '';
  }

  private getMockUser(): UserInterface {
    return {
      id: 'mock-user-id',
      name: 'John Doe',
      email: 'john.doe@student.eksu.edu.ng',
      role: USER_ROLES.student,
      department: 'Computer Science',
      matricNo: 'EKSU/2020/0001',
    };
  }

  private getMockDocuments(): Document[] {
    return [
      {
        id: '1',
        fileName: 'academic_transcript.pdf',
        documentType: 'transcript',
        department: 'Computer Science',
        status: 'approved',
        uploadedAt: '2024-01-15T10:30:00Z',
        downloadUrl: '#',
      },
      {
        id: '2',
        fileName: 'payment_receipt.pdf',
        documentType: 'payment_receipt',
        department: 'Bursary',
        status: 'pending',
        uploadedAt: '2024-01-16T14:20:00Z',
        downloadUrl: '#',
      },
      {
        id: '3',
        fileName: 'library_clearance.pdf',
        documentType: 'library_clearance',
        department: 'Library',
        status: 'rejected',
        uploadedAt: '2024-01-14T09:15:00Z',
        reviewNotes: 'Document is unclear. Please upload a clearer version.',
        downloadUrl: '#',
      },
    ];
  }

  private getMockPendingDocuments(department: string): Document[] {
    return [
      {
        id: '1',
        fileName: 'academic_transcript.pdf',
        documentType: 'transcript',
        department,
        status: 'pending',
        uploadedAt: '2024-01-15T10:30:00Z',
        student: {
          name: 'John Doe',
          matricNo: 'EKSU/2020/0001',
        },
        downloadUrl: '#',
      },
      {
        id: '2',
        fileName: 'payment_receipt.pdf',
        documentType: 'payment_receipt',
        department,
        status: 'pending',
        uploadedAt: '2024-01-16T14:20:00Z',
        student: {
          name: 'Jane Smith',
          matricNo: 'EKSU/2020/0002',
        },
        downloadUrl: '#',
      },
    ];
  }
}

export const apiClient = new ApiClient(); 