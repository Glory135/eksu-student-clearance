export interface WelcomeEmailData {
  studentName: string;
  studentEmail: string;
  matricNo: string;
  department: string;
  magicLink: string;
  adminName?: string;
}

export function generateWelcomeEmailHTML(data: WelcomeEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to EKSU Clearance System</title>
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
            <div class="subtitle">Your digital clearance journey starts here</div>
        </div>

        <div class="content">
            <div class="greeting">
                Hello <strong>${data.studentName}</strong>,
            </div>

            <p>Your account has been created in the EKSU Student Clearance System. You can now access the digital clearance platform to upload your required documents and track your clearance progress.</p>

            <div class="details">
                <div class="detail-row">
                    <span class="detail-label">Student Name:</span>
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
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${data.studentEmail}</span>
                </div>
            </div>

            <p><strong>Next Steps:</strong></p>
            <ol>
                <li>Click the button below to set your password</li>
                <li>Login to the clearance system</li>
                <li>Upload your required documents</li>
                <li>Track your clearance progress</li>
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

export function generateWelcomeEmailText(data: WelcomeEmailData): string {
  return `
Welcome to EKSU Clearance System

Hello ${data.studentName},

Your account has been created in the EKSU Student Clearance System. You can now access the digital clearance platform to upload your required documents and track your clearance progress.

Student Details:
- Name: ${data.studentName}
- Matric Number: ${data.matricNo}
- Department: ${data.department}
- Email: ${data.studentEmail}

Next Steps:
1. Click the link below to set your password
2. Login to the clearance system
3. Upload your required documents
4. Track your clearance progress

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