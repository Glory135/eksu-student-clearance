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

export function generateDocumentApprovedEmailHTML(data: DocumentNotificationData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Approved - EKSU Clearance System</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            width: 80px;
            height: 80px;
            margin-bottom: 20px;
        }
        .title {
            color: #059669;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #6b7280;
            font-size: 16px;
        }
        .content {
            margin-bottom: 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .success-box {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .document-details {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .detail-label {
            font-weight: 600;
            color: #374151;
        }
        .detail-value {
            color: #6b7280;
        }
        .cta-button {
            display: inline-block;
            background-color: #059669;
            color: #ffffff;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
        }
        .cta-button:hover {
            background-color: #047857;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .contact-info {
            margin-top: 15px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/eksu-logo.png" alt="EKSU Logo" class="logo">
            <div class="title">✅ Document Approved</div>
            <div class="subtitle">EKSU Clearance System</div>
        </div>

        <div class="content">
            <div class="greeting">
                Hello <strong>${data.studentName}</strong>,
            </div>

            <div class="success-box">
                <p><strong>Great news!</strong> Your document has been approved by the clearance officer.</p>
            </div>

            <div class="document-details">
                <p><strong>Document Details:</strong></p>
                <div class="detail-row">
                    <span class="detail-label">Document:</span>
                    <span class="detail-value">${data.documentName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Requirement:</span>
                    <span class="detail-value">${data.requirement}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Department:</span>
                    <span class="detail-value">${data.department}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Reviewed by:</span>
                    <span class="detail-value">${data.reviewedBy || 'Clearance Officer'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Reviewed at:</span>
                    <span class="detail-value">${data.reviewedAt}</span>
                </div>
                ${data.reviewNotes ? `
                <div class="detail-row">
                    <span class="detail-label">Notes:</span>
                    <span class="detail-value">${data.reviewNotes}</span>
                </div>
                ` : ''}
            </div>

            <p>You can now continue with your clearance process. Login to the system to view your progress and upload any remaining documents.</p>

            <div style="text-align: center;">
                <a href="${data.loginUrl}" class="cta-button">
                    View Clearance Progress
                </a>
            </div>

            <p>If you have any questions about this approval, please contact your department's clearance officer.</p>
        </div>

        <div class="footer">
            <p><strong>EKSU Student Clearance System</strong></p>
            <p>Ekiti State University, Ado-Ekiti, Nigeria</p>
            
            <div class="contact-info">
                <p><strong>Need Help?</strong></p>
                <p>Email: support@eksu-clearance.com</p>
                <p>Phone: +234 XXX XXX XXXX</p>
            </div>

            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

export function generateDocumentRejectedEmailHTML(data: DocumentNotificationData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Rejected - EKSU Clearance System</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            width: 80px;
            height: 80px;
            margin-bottom: 20px;
        }
        .title {
            color: #dc2626;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #6b7280;
            font-size: 16px;
        }
        .content {
            margin-bottom: 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .rejection-box {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .document-details {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .detail-label {
            font-weight: 600;
            color: #374151;
        }
        .detail-value {
            color: #6b7280;
        }
        .cta-button {
            display: inline-block;
            background-color: #dc2626;
            color: #ffffff;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
        }
        .cta-button:hover {
            background-color: #b91c1c;
        }
        .action-required {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .contact-info {
            margin-top: 15px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/eksu-logo.png" alt="EKSU Logo" class="logo">
            <div class="title">❌ Document Rejected</div>
            <div class="subtitle">EKSU Clearance System</div>
        </div>

        <div class="content">
            <div class="greeting">
                Hello <strong>${data.studentName}</strong>,
            </div>

            <div class="rejection-box">
                <p><strong>Action Required:</strong> Your document has been rejected and needs to be re-uploaded.</p>
            </div>

            <div class="document-details">
                <p><strong>Document Details:</strong></p>
                <div class="detail-row">
                    <span class="detail-label">Document:</span>
                    <span class="detail-value">${data.documentName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Requirement:</span>
                    <span class="detail-value">${data.requirement}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Department:</span>
                    <span class="detail-value">${data.department}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Reviewed by:</span>
                    <span class="detail-value">${data.reviewedBy || 'Clearance Officer'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Reviewed at:</span>
                    <span class="detail-value">${data.reviewedAt}</span>
                </div>
                ${data.rejectionReason ? `
                <div class="detail-row">
                    <span class="detail-label">Reason:</span>
                    <span class="detail-value">${data.rejectionReason}</span>
                </div>
                ` : ''}
                ${data.reviewNotes ? `
                <div class="detail-row">
                    <span class="detail-label">Notes:</span>
                    <span class="detail-value">${data.reviewNotes}</span>
                </div>
                ` : ''}
            </div>

            <div class="action-required">
                <p><strong>Next Steps:</strong></p>
                <ol>
                    <li>Login to the clearance system</li>
                    <li>Upload a new version of the document</li>
                    <li>Ensure the document meets the requirements</li>
                    <li>Submit for review again</li>
                </ol>
            </div>

            <div style="text-align: center;">
                <a href="${data.loginUrl}" class="cta-button">
                    Upload New Document
                </a>
            </div>

            <p>If you have questions about the rejection, please contact your department's clearance officer.</p>
        </div>

        <div class="footer">
            <p><strong>EKSU Student Clearance System</strong></p>
            <p>Ekiti State University, Ado-Ekiti, Nigeria</p>
            
            <div class="contact-info">
                <p><strong>Need Help?</strong></p>
                <p>Email: support@eksu-clearance.com</p>
                <p>Phone: +234 XXX XXX XXXX</p>
            </div>

            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

export function generateDocumentUnderReviewEmailHTML(data: DocumentNotificationData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Under Review - EKSU Clearance System</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            width: 80px;
            height: 80px;
            margin-bottom: 20px;
        }
        .title {
            color: #f59e0b;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #6b7280;
            font-size: 16px;
        }
        .content {
            margin-bottom: 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .info-box {
            background-color: #fffbeb;
            border: 1px solid #fed7aa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .document-details {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .detail-label {
            font-weight: 600;
            color: #374151;
        }
        .detail-value {
            color: #6b7280;
        }
        .cta-button {
            display: inline-block;
            background-color: #f59e0b;
            color: #ffffff;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
        }
        .cta-button:hover {
            background-color: #d97706;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .contact-info {
            margin-top: 15px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/eksu-logo.png" alt="EKSU Logo" class="logo">
            <div class="title">⏳ Document Under Review</div>
            <div class="subtitle">EKSU Clearance System</div>
        </div>

        <div class="content">
            <div class="greeting">
                Hello <strong>${data.studentName}</strong>,
            </div>

            <div class="info-box">
                <p><strong>Status Update:</strong> Your document is currently being reviewed by the clearance officer.</p>
            </div>

            <div class="document-details">
                <p><strong>Document Details:</strong></p>
                <div class="detail-row">
                    <span class="detail-label">Document:</span>
                    <span class="detail-value">${data.documentName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Requirement:</span>
                    <span class="detail-value">${data.requirement}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Department:</span>
                    <span class="detail-value">${data.department}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">Under Review</span>
                </div>
            </div>

            <p>You will receive another notification once the review is complete. This usually takes 1-3 business days.</p>

            <div style="text-align: center;">
                <a href="${data.loginUrl}" class="cta-button">
                    Check Status
                </a>
            </div>

            <p>Thank you for your patience during the review process.</p>
        </div>

        <div class="footer">
            <p><strong>EKSU Student Clearance System</strong></p>
            <p>Ekiti State University, Ado-Ekiti, Nigeria</p>
            
            <div class="contact-info">
                <p><strong>Need Help?</strong></p>
                <p>Email: support@eksu-clearance.com</p>
                <p>Phone: +234 XXX XXX XXXX</p>
            </div>

            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
  `;
} 