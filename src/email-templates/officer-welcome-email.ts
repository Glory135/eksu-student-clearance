export interface OfficerWelcomeEmailData {
    officerName: string;
    officerEmail: string;
    department: string;
    role: 'officer' | 'student-affairs';
    magicLink: string;
    adminName?: string;
}

export function generateOfficerWelcomeEmailHTML(data: OfficerWelcomeEmailData): string {
    const roleLabel = data.role === 'officer' ? 'Clearance Officer' : 'Student Affairs Officer';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to EKSU Clearance System - Officer Account</title>
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
            color: #1e40af;
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
        .details {
            background-color: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
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
            background-color: #1e40af;
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
            background-color: #1e3a8a;
        }
        .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
        }
        .responsibilities {
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            color: #0c4a6e;
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
            <div class="title">Welcome to EKSU Clearance System</div>
            <div class="subtitle">Officer Account Setup</div>
        </div>

        <div class="content">
            <div class="greeting">
                Hello <strong>${data.officerName}</strong>,
            </div>

            <p>Your officer account has been created in the EKSU Student Clearance System. You can now access the digital clearance platform to review student documents and manage clearance processes.</p>

            <div class="details">
                <div class="detail-row">
                    <span class="detail-label">Officer Name:</span>
                    <span class="detail-value">${data.officerName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Role:</span>
                    <span class="detail-value">${roleLabel}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Department:</span>
                    <span class="detail-value">${data.department}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${data.officerEmail}</span>
                </div>
            </div>

            <div class="responsibilities">
                <p><strong>Your Responsibilities:</strong></p>
                <ul>
                    <li>Review student-uploaded documents</li>
                    <li>Approve or reject documents based on requirements</li>
                    <li>Provide feedback to students on rejected documents</li>
                    <li>Track clearance progress for your department</li>
                    <li>Generate clearance reports and statistics</li>
                    ${data.role === 'student-affairs' ? '<li>Manage student affairs clearance processes</li>' : ''}
                </ul>
            </div>

            <p><strong>Next Steps:</strong></p>
            <ol>
                <li>Click the button below to set your password</li>
                <li>Login to the clearance system</li>
                <li>Review pending documents</li>
                <li>Start processing student clearances</li>
            </ol>

            <div style="text-align: center;">
                <a href="${data.magicLink}" class="cta-button">
                    Set Your Password
                </a>
            </div>

            <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in 24 hours. If you don't set your password within this time, you'll need to contact the administrator for a new link.
            </div>

            <p>After setting your password, you can login to the system using your email address and the password you create.</p>
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

export function generateOfficerWelcomeEmailText(data: OfficerWelcomeEmailData): string {
    const roleLabel = data.role === 'officer' ? 'Clearance Officer' : 'Student Affairs Officer';

    return `
Welcome to EKSU Clearance System - Officer Account

Hello ${data.officerName},

Your officer account has been created in the EKSU Student Clearance System. You can now access the digital clearance platform to review student documents and manage clearance processes.

Officer Details:
- Name: ${data.officerName}
- Role: ${roleLabel}
- Department: ${data.department}
- Email: ${data.officerEmail}

Your Responsibilities:
- Review student-uploaded documents
- Approve or reject documents based on requirements
- Provide feedback to students on rejected documents
- Track clearance progress for your department
- Generate clearance reports and statistics
${data.role === 'student-affairs' ? '- Manage student affairs clearance processes' : ''}

Next Steps:
1. Click the link below to set your password
2. Login to the clearance system
3. Review pending documents
4. Start processing student clearances

Set Your Password: ${data.magicLink}

⚠️ Important: This link will expire in 24 hours. If you don't set your password within this time, you'll need to contact the administrator for a new link.

After setting your password, you can login to the system using your email address and the password you create.

---
EKSU Student Clearance System
Ekiti State University, Ado-Ekiti, Nigeria

Need Help?
Email: support@eksu-clearance.com
Phone: +234 XXX XXX XXXX

This is an automated message. Please do not reply to this email.
  `;
} 