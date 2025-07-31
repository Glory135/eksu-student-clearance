export interface PasswordResetEmailData {
    studentName: string;
    studentEmail: string;
    resetLink: string;
    requestedAt: string;
}

export function generatePasswordResetEmailHTML(data: PasswordResetEmailData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - EKSU Clearance System</title>
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
        .info-box {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
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
        .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
        }
        .security-note {
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 15px;
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
            <div class="title">Password Reset Request</div>
            <div class="subtitle">EKSU Clearance System</div>
        </div>

        <div class="content">
            <div class="greeting">
                Hello <strong>${data.studentName}</strong>,
            </div>

            <p>We received a request to reset your password for the EKSU Clearance System account associated with <strong>${data.studentEmail}</strong>.</p>

            <div class="info-box">
                <p><strong>Request Details:</strong></p>
                <ul>
                    <li>Requested at: ${data.requestedAt}</li>
                    <li>Email: ${data.studentEmail}</li>
                    <li>Student: ${data.studentName}</li>
                </ul>
            </div>

            <p>If you made this request, click the button below to reset your password:</p>

            <div style="text-align: center;">
                <a href="${data.resetLink}" class="cta-button">
                    Reset Password
                </a>
            </div>

            <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons. If you don't reset your password within this time, you'll need to request a new password reset.
            </div>

            <div class="security-note">
                <strong>🔒 Security Note:</strong>
                <ul>
                    <li>If you didn't request this password reset, please ignore this email</li>
                    <li>Your password will not be changed unless you click the link above</li>
                    <li>For security, this link can only be used once</li>
                </ul>
            </div>

            <p>After resetting your password, you can login to the clearance system using your email address and new password.</p>
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

export function generatePasswordResetEmailText(data: PasswordResetEmailData): string {
    return `
Password Reset Request - EKSU Clearance System

Hello ${data.studentName},

We received a request to reset your password for the EKSU Clearance System account associated with ${data.studentEmail}.

Request Details:
- Requested at: ${data.requestedAt}
- Email: ${data.studentEmail}
- Student: ${data.studentName}

If you made this request, click the link below to reset your password:

Reset Password: ${data.resetLink}

⚠️ Important: This link will expire in 1 hour for security reasons. If you don't reset your password within this time, you'll need to request a new password reset.

🔒 Security Note:
- If you didn't request this password reset, please ignore this email
- Your password will not be changed unless you click the link above
- For security, this link can only be used once

After resetting your password, you can login to the clearance system using your email address and new password.

---
EKSU Student Clearance System
Ekiti State University, Ado-Ekiti, Nigeria

Need Help?
Email: support@eksu-clearance.com
Phone: +234 XXX XXX XXXX

This is an automated message. Please do not reply to this email.
  `;
} 