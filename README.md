# EKSU Student Clearance System

A digital clearance system for Ekiti State University that streamlines the graduation clearance process for students, clearance officers, and administrators.

## 🚀 Features

- **Multi-role Support**: Dedicated interfaces for students, clearance officers, and administrators
- **Document Management**: Secure upload, review, and approval of clearance documents
- **Real-time Tracking**: Monitor clearance progress across all departments
- **Mobile-First Design**: Responsive interface optimized for all devices
- **Secure Authentication**: Role-based access control with Payload CMS
- **Email Notifications**: Automated updates for document status changes

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: ShadCN UI, Tailwind CSS, Lucide Icons
- **Backend**: Payload CMS (Headless CMS)
- **Database**: MongoDB
- **File Storage**: Cloudinary
- **Email**: Resend
- **Deployment**: Vercel

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── (app)/             # Main application routes
│   │   ├── dashboard/     # Dashboard pages
│   │   └── api/          # API routes
│   └── (payload)/        # Payload CMS admin
├── components/            # React components
│   ├── common/           # Reusable UI components
│   │   ├── StatusBadge.tsx
│   │   ├── StatsCard.tsx
│   │   ├── DocumentCard.tsx
│   │   └── ProgressCard.tsx
│   ├── forms/            # Form components
│   │   └── FileUpload.tsx
│   ├── layout/           # Layout components
│   │   └── DashboardLayout.tsx
│   ├── dashboards/       # Dashboard components
│   │   ├── StudentDashboard.tsx
│   │   ├── OfficerDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   └── Login.tsx
│   ├── ui/               # ShadCN UI components
│   └── DocumentViewer.tsx
├── lib/                  # Utility libraries
│   ├── api-client.ts     # API client for Payload
│   ├── utils.ts          # General utilities
│   └── ImageWithFallback.tsx
├── modules/              # Payload CMS modules
├── trpc/                 # tRPC configuration
└── payload.config.ts     # Payload CMS configuration
```

## 🎨 Design System

The project follows a comprehensive design system documented in `docs/ui.md`:

- **Color Palette**: Primary blues, semantic colors for status
- **Typography**: System fonts with consistent sizing
- **Spacing**: 8px grid system
- **Components**: Reusable patterns for cards, forms, and layouts
- **Accessibility**: WCAG compliant with proper focus management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- MongoDB database
- Cloudinary account (for file storage)
- Resend account (for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eksu-student-clearance
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # Payload CMS
   PAYLOAD_SECRET=your_payload_secret
   
   # File Storage
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   
   # Email
   RESEND_API_KEY=your_resend_api_key
   
   # App
   NEXT_PUBLIC_PAYLOAD_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Access the application**
   - Main app: http://localhost:3000
   - Payload admin: http://localhost:3000/admin

## 👥 User Roles

### Students
- Upload required clearance documents
- Track clearance progress across departments
- Receive email notifications for status updates
- View document review feedback

### Clearance Officers
- Review documents for their department
- Approve or reject documents with notes
- Manage department-specific requirements
- View pending document queue

### Administrators
- Manage user accounts and roles
- Bulk import students via Excel
- Monitor system-wide statistics
- Configure clearance requirements
- Manage departments and officers

## 📋 Clearance Process

1. **Student Registration**: Admin creates student accounts
2. **Document Upload**: Students upload required documents
3. **Department Review**: Officers review documents for their department
4. **Approval/Rejection**: Officers approve or reject with feedback
5. **Progress Tracking**: Students monitor overall clearance status
6. **Completion**: Final clearance certificate generation

## 🔧 Development

### Component Development

The project uses a modular component architecture:

- **Common Components**: Reusable UI elements (`src/components/common/`)
- **Form Components**: Specialized form elements (`src/components/forms/`)
- **Layout Components**: Page structure components (`src/components/layout/`)
- **Dashboard Components**: Role-specific dashboards (`src/components/dashboards/`)

### API Integration

The `src/lib/api-client.ts` provides a unified interface for Payload CMS:

```typescript
import { apiClient } from '@/lib/api-client';

// Authentication
await apiClient.signInWithOtp(email);
await apiClient.signInWithPassword(email, password);

// Documents
await apiClient.getUserDocuments();
await apiClient.uploadDocument(file, type, department);
await apiClient.reviewDocument(id, action, notes);
```

### Styling

The project uses Tailwind CSS with custom design tokens:

- **Colors**: Semantic color system with primary, secondary, and status colors
- **Spacing**: Consistent 8px grid system
- **Typography**: System fonts with predefined sizes
- **Components**: ShadCN UI components with custom variants

## 🚀 Deployment

### Vercel Deployment

1. **Connect repository to Vercel**
2. **Configure environment variables** in Vercel dashboard
3. **Deploy**: Vercel will automatically build and deploy

### Environment Variables for Production

```env
# Database
MONGODB_URI=your_production_mongodb_uri

# Payload CMS
PAYLOAD_SECRET=your_production_secret

# File Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Email
RESEND_API_KEY=your_resend_api_key

# App
NEXT_PUBLIC_PAYLOAD_URL=https://your-domain.com
```

## 📚 Documentation

- **PRD**: `docs/prd.md` - Product Requirements Document
- **UI Guide**: `docs/ui.md` - Design system and component patterns
- **API**: `docs/api.md` - API documentation (when available)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `docs/` folder

---

**EKSU Student Clearance System** - Streamlining graduation clearance for Ekiti State University.
