# EKSU Student Clearance System

A digital clearance system for Ekiti State University that allows students to upload documents and clearance officers to verify them securely and efficiently.

## Features

- **Role-based Authentication**: Students, Officers, and Admins with different access levels
- **Magic Link Authentication**: Secure password setup for new users
- **Document Upload & Management**: Students can upload required documents
- **Clearance Review**: Officers can approve/reject documents with notes
- **Progress Tracking**: Real-time clearance status updates
- **Email Notifications**: Automated email updates for document status changes
- **Mobile-first Design**: Responsive design for all devices

## Authentication Flow

### Student Authentication
1. **Account Creation**: Admin creates student account via Excel upload or manual entry
2. **Welcome Email**: Student receives magic link email to set password
3. **First Login**: Student clicks magic link and sets password
4. **Regular Login**: Student uses email/password for subsequent logins
5. **Password Reset**: Students can request password reset via email

### Officer/Admin Authentication
1. **Account Creation**: Admin creates officer/admin account
2. **Welcome Email**: Officer receives magic link email to set password
3. **Regular Login**: Officers/admins use email/password authentication
4. **Password Reset**: Officers can request password reset via email

### Security Features
- JWT-based token generation for magic links and password resets
- Secure cookie-based session management
- Password requirements (minimum 8 characters)
- Token expiration (24 hours for magic links, 1 hour for password resets)
- No public registration - all accounts created by admin

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Payload CMS, tRPC
- **Database**: MongoDB
- **Authentication**: Custom JWT-based system
- **Email**: Resend
- **File Storage**: Cloudinary
- **UI**: ShadCN UI, Tailwind CSS
- **State Management**: TanStack Query

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Resend API key (for email functionality)
- Cloudinary account (for file storage)

### Environment Variables
```env
# Database
DATABASE_URI=mongodb://localhost:27017/eksu-clearance

# Payload
PAYLOAD_SECRET=your-secret-key
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_ADDRESS=noreply@yourdomain.com

# JWT (optional, falls back to PAYLOAD_SECRET)
JWT_SECRET=your-jwt-secret

# Cloudinary (for file storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd eksu-student-clearance
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Run the development server
```bash
pnpm dev
```

5. Access the application
- App: http://localhost:3000
- Admin Panel: http://localhost:3000/admin

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (app)/             # Main application routes
│   │   ├── login/         # Login page
│   │   ├── verify-email/  # Email verification page
│   │   ├── reset-password/ # Password reset page
│   │   └── dashboard/     # Dashboard routes
│   └── (payload)/         # Payload CMS admin routes
├── components/            # React components
│   ├── ui/               # ShadCN UI components
│   ├── common/           # Common components
│   ├── dashboards/       # Dashboard-specific components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── modules/              # Feature modules
│   ├── auth/            # Authentication module
│   ├── clearance/       # Clearance module
│   ├── documents/       # Documents module
│   └── users/           # Users module
├── collections/          # Payload CMS collections
├── email-templates/      # Email templates
└── trpc/                # tRPC configuration and routers
```

## API Endpoints

### Authentication
- `POST /api/trpc/auth.login` - User login
- `POST /api/trpc/auth.logout` - User logout
- `POST /api/trpc/auth.sendMagicLink` - Send magic link for password setup
- `POST /api/trpc/auth.verifyMagicLink` - Verify magic link and set password
- `POST /api/trpc/auth.sendPasswordReset` - Send password reset email
- `POST /api/trpc/auth.resetPassword` - Reset password with token
- `GET /api/trpc/auth.session` - Get current session
- `GET /api/trpc/auth.hasSetPassword` - Check if user has set password

### Documents
- `GET /api/trpc/documents.getDocuments` - Get user documents
- `POST /api/trpc/documents.uploadDocument` - Upload document
- `PUT /api/trpc/documents.updateDocument` - Update document
- `DELETE /api/trpc/documents.deleteDocument` - Delete document

### Clearance
- `GET /api/trpc/clearance.getClearanceStatus` - Get clearance status
- `POST /api/trpc/clearance.reviewDocument` - Review document (officer only)

## User Roles

### Student
- Upload required documents
- View clearance progress
- Receive email notifications
- Access student dashboard

### Clearance Officer
- Review documents for their department
- Approve/reject documents with notes
- Manage department requirements
- Access officer dashboard

### Student Affairs Officer
- Special clearance level
- Final approval for some documents
- Access officer dashboard with extended permissions

### Super Admin
- Manage all user accounts
- Bulk import students via Excel
- Set system-wide requirements
- Assign officers to departments
- Access admin dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the repository.
