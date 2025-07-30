import { Resend } from 'resend';
import { generateWelcomeEmailHTML, generateWelcomeEmailText } from '../email-templates/welcome-email';
import { generatePasswordResetEmailHTML, generatePasswordResetEmailText } from '../email-templates/password-reset';
import { 
  generateDocumentApprovedEmailHTML, 
  generateDocumentRejectedEmailHTML, 
  generateDocumentUnderReviewEmailHTML 
} from '../email-templates/document-notifications';
import { generateClearanceCompletedEmailHTML, generateClearanceCompletedEmailText } from '../email-templates/clearance-completion';
import { generateOfficerWelcomeEmailHTML, generateOfficerWelcomeEmailText } from '../email-templates/officer-welcome-email';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface WelcomeEmailData {
  studentName: string;
  studentEmail: string;
  matricNo: string;
  department: string;
  magicLink: string;
  adminName?: string;
}

export interface OfficerWelcomeEmailData {
  officerName: string;
  officerEmail: string;
  department: string;
  role: 'officer' | 'student-affairs';
  magicLink: string;
  adminName?: string;
}

export interface PasswordResetEmailData {
  studentName: string;
  studentEmail: string;
  resetLink: string;
  requestedAt: string;
}

export interface DocumentNotificationData {
  studentName: string;
  studentEmail: string;
  documentName: string;
  department: string;
  requirement: string;
  status: 'approved' | 'rejected' | 'under-review';
  reviewNotes?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt: string;
  loginUrl: string;
}

export interface ClearanceCompletionData {
  studentName: string;
  studentEmail: string;
  matricNo: string;
  department: string;
  completionDate: string;
  totalDocuments: number;
  completedDocuments: number;
  loginUrl: string;
}

export class EmailService {
  private static instance: EmailService;
  private resend: Resend;

  private constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    try {
      const html = generateWelcomeEmailHTML(data);
      const text = generateWelcomeEmailText(data);

      await this.resend.emails.send({
        from: process.env.RESEND_FROM_ADDRESS || 'noreply@eksu-clearance.com',
        to: data.studentEmail,
        subject: 'Welcome to EKSU Clearance System - Set Your Password',
        html,
        text,
      });

      console.log(`Welcome email sent to ${data.studentEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  async sendOfficerWelcomeEmail(data: OfficerWelcomeEmailData): Promise<boolean> {
    try {
      const html = generateOfficerWelcomeEmailHTML(data);
      const text = generateOfficerWelcomeEmailText(data);

      await this.resend.emails.send({
        from: process.env.RESEND_FROM_ADDRESS || 'noreply@eksu-clearance.com',
        to: data.officerEmail,
        subject: 'Welcome to EKSU Clearance System - Officer Account Setup',
        html,
        text,
      });

      console.log(`Officer welcome email sent to ${data.officerEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send officer welcome email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
    try {
      const html = generatePasswordResetEmailHTML(data);
      const text = generatePasswordResetEmailText(data);

      await this.resend.emails.send({
        from: process.env.RESEND_FROM_ADDRESS || 'noreply@eksu-clearance.com',
        to: data.studentEmail,
        subject: 'Password Reset Request - EKSU Clearance System',
        html,
        text,
      });

      console.log(`Password reset email sent to ${data.studentEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  async sendDocumentApprovedEmail(data: DocumentNotificationData): Promise<boolean> {
    try {
      const html = generateDocumentApprovedEmailHTML(data);
      const text = `Document Approved - ${data.documentName} has been approved.`;

      await this.resend.emails.send({
        from: process.env.RESEND_FROM_ADDRESS || 'noreply@eksu-clearance.com',
        to: data.studentEmail,
        subject: `Document Approved - ${data.documentName}`,
        html,
        text,
      });

      console.log(`Document approved email sent to ${data.studentEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send document approved email:', error);
      return false;
    }
  }

  async sendDocumentRejectedEmail(data: DocumentNotificationData): Promise<boolean> {
    try {
      const html = generateDocumentRejectedEmailHTML(data);
      const text = `Document Rejected - ${data.documentName} has been rejected. Please re-upload.`;

      await this.resend.emails.send({
        from: process.env.RESEND_FROM_ADDRESS || 'noreply@eksu-clearance.com',
        to: data.studentEmail,
        subject: `Document Rejected - ${data.documentName}`,
        html,
        text,
      });

      console.log(`Document rejected email sent to ${data.studentEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send document rejected email:', error);
      return false;
    }
  }

  async sendDocumentUnderReviewEmail(data: DocumentNotificationData): Promise<boolean> {
    try {
      const html = generateDocumentUnderReviewEmailHTML(data);
      const text = `Document Under Review - ${data.documentName} is being reviewed.`;

      await this.resend.emails.send({
        from: process.env.RESEND_FROM_ADDRESS || 'noreply@eksu-clearance.com',
        to: data.studentEmail,
        subject: `Document Under Review - ${data.documentName}`,
        html,
        text,
      });

      console.log(`Document under review email sent to ${data.studentEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send document under review email:', error);
      return false;
    }
  }

  async sendClearanceCompletedEmail(data: ClearanceCompletionData): Promise<boolean> {
    try {
      const html = generateClearanceCompletedEmailHTML(data);
      const text = generateClearanceCompletedEmailText(data);

      await this.resend.emails.send({
        from: process.env.RESEND_FROM_ADDRESS || 'noreply@eksu-clearance.com',
        to: data.studentEmail,
        subject: '🎉 Clearance Completed - EKSU Clearance System',
        html,
        text,
      });

      console.log(`Clearance completed email sent to ${data.studentEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send clearance completed email:', error);
      return false;
    }
  }

  async sendOfficerNotification(
    officerEmail: string,
    studentName: string,
    documentName: string,
    department: string
  ): Promise<boolean> {
    try {
      const html = `
        <h2>New Document for Review</h2>
        <p>A new document has been uploaded for your review:</p>
        <ul>
          <li><strong>Student:</strong> ${studentName}</li>
          <li><strong>Document:</strong> ${documentName}</li>
          <li><strong>Department:</strong> ${department}</li>
        </ul>
        <p>Please login to the clearance system to review this document.</p>
      `;

      await this.resend.emails.send({
        from: process.env.RESEND_FROM_ADDRESS || 'noreply@eksu-clearance.com',
        to: officerEmail,
        subject: `New Document for Review - ${studentName}`,
        html,
      });

      console.log(`Officer notification sent to ${officerEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send officer notification:', error);
      return false;
    }
  }

  async sendBulkStudentImportNotification(
    adminEmail: string,
    successCount: number,
    errorCount: number,
    totalCount: number
  ): Promise<boolean> {
    try {
      const html = `
        <h2>Bulk Student Import Complete</h2>
        <p>The bulk student import has been completed:</p>
        <ul>
          <li><strong>Total Records:</strong> ${totalCount}</li>
          <li><strong>Successfully Imported:</strong> ${successCount}</li>
          <li><strong>Errors:</strong> ${errorCount}</li>
        </ul>
        <p>Welcome emails have been sent to all successfully imported students.</p>
      `;

      await this.resend.emails.send({
        from: process.env.RESEND_FROM_ADDRESS || 'noreply@eksu-clearance.com',
        to: adminEmail,
        subject: 'Bulk Student Import Complete',
        html,
      });

      console.log(`Bulk import notification sent to ${adminEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send bulk import notification:', error);
      return false;
    }
  }

  async sendBulkOfficerImportNotification(
    adminEmail: string,
    successCount: number,
    errorCount: number,
    totalCount: number
  ): Promise<boolean> {
    try {
      const html = `
        <h2>Bulk Officer Import Complete</h2>
        <p>The bulk officer import has been completed:</p>
        <ul>
          <li><strong>Total Records:</strong> ${totalCount}</li>
          <li><strong>Successfully Imported:</strong> ${successCount}</li>
          <li><strong>Errors:</strong> ${errorCount}</li>
        </ul>
        <p>Welcome emails have been sent to all successfully imported officers.</p>
      `;

      await this.resend.emails.send({
        from: process.env.RESEND_FROM_ADDRESS || 'noreply@eksu-clearance.com',
        to: adminEmail,
        subject: 'Bulk Officer Import Complete',
        html,
      });

      console.log(`Bulk officer import notification sent to ${adminEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send bulk officer import notification:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance(); 