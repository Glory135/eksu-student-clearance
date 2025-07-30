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

export function generateClearanceCompletedEmailHTML(data: ClearanceCompletionData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clearance Completed - EKSU Clearance System</title>
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
            font-size: 28px;
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
        .celebration-box {
            background: linear-gradient(135deg, #059669, #10b981);
            color: white;
            border-radius: 8px;
            padding: 30px;
            margin: 20px 0;
            text-align: center;
        }
        .student-details {
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
        .stats-box {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
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
        .next-steps {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
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
            <div class="title">🎉 Clearance Completed!</div>
            <div class="subtitle">EKSU Clearance System</div>
        </div>

        <div class="content">
            <div class="greeting">
                Congratulations <strong>${data.studentName}</strong>!
            </div>

            <div class="celebration-box">
                <h2 style="margin: 0; font-size: 24px;">🎓 Your Clearance is Complete!</h2>
                <p style="margin: 10px 0 0 0; font-size: 16px;">All required documents have been approved.</p>
            </div>

            <div class="student-details">
                <p><strong>Student Information:</strong></p>
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${data.studentName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Matric Number:</span>
                    <span class="detail-value">${data.matricNo}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Department:</span>
                    <span class="detail-value">${data.department}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Completion Date:</span>
                    <span class="detail-value">${data.completionDate}</span>
                </div>
            </div>

            <div class="stats-box">
                <p><strong>Clearance Summary:</strong></p>
                <div class="detail-row">
                    <span class="detail-label">Total Documents:</span>
                    <span class="detail-value">${data.totalDocuments}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Approved Documents:</span>
                    <span class="detail-value">${data.completedDocuments}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Completion Rate:</span>
                    <span class="detail-value">100%</span>
                </div>
            </div>

            <div class="next-steps">
                <p><strong>Next Steps:</strong></p>
                <ol>
                    <li>Download your clearance certificate from the system</li>
                    <li>Submit the certificate to your department</li>
                    <li>Complete any remaining graduation requirements</li>
                    <li>Attend your graduation ceremony</li>
                </ol>
            </div>

            <div style="text-align: center;">
                <a href="${data.loginUrl}" class="cta-button">
                    Download Certificate
                </a>
            </div>

            <p>Congratulations on completing your clearance process! You're now ready to graduate.</p>
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

export function generateClearanceCompletedEmailText(data: ClearanceCompletionData): string {
  return `
🎉 Clearance Completed! - EKSU Clearance System

Congratulations ${data.studentName}!

Your clearance process has been completed successfully! All required documents have been approved.

Student Information:
- Name: ${data.studentName}
- Matric Number: ${data.matricNo}
- Department: ${data.department}
- Completion Date: ${data.completionDate}

Clearance Summary:
- Total Documents: ${data.totalDocuments}
- Approved Documents: ${data.completedDocuments}
- Completion Rate: 100%

Next Steps:
1. Download your clearance certificate from the system
2. Submit the certificate to your department
3. Complete any remaining graduation requirements
4. Attend your graduation ceremony

Download Certificate: ${data.loginUrl}

Congratulations on completing your clearance process! You're now ready to graduate.

---
EKSU Student Clearance System
Ekiti State University, Ado-Ekiti, Nigeria

Need Help?
Email: support@eksu-clearance.com
Phone: +234 XXX XXX XXXX

This is an automated message. Please do not reply to this email.
  `;
} 