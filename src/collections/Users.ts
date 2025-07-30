import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrSelf } from '../access/Users';
import { emailService } from '../lib/emailService';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    verify: {
      generateEmailHTML: ({ token, user }: { token: string; user: any }) => {
        const isStudent = user.role === 'student';
        const isOfficer = ['officer', 'student-affairs'].includes(user.role);
        
        if (isStudent) {
          return `
            <h1>Welcome to EKSU Clearance System</h1>
            <p>Hello ${user.name},</p>
            <p>Your account has been created by the administrator. Please click the link below to verify your email and set your password:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}">Set Your Password</a>
            <p>This link will expire in 24 hours. If you didn't create this account, please ignore this email.</p>
            <p>After setting your password, you can login with your email and password.</p>
          `;
        } else if (isOfficer) {
          return `
            <h1>Welcome to EKSU Clearance System</h1>
            <p>Hello ${user.name},</p>
            <p>Your officer account has been created. Please click the link below to verify your email and set your password:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}">Set Your Password</a>
            <p>This link will expire in 24 hours. If you didn't create this account, please ignore this email.</p>
            <p>After setting your password, you can login with your email and password.</p>
          `;
        } else {
          return `
            <h1>Welcome to EKSU Clearance System</h1>
            <p>Hello ${user.name},</p>
            <p>Your admin account has been created. Please click the link below to verify your email and set your password:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}">Set Your Password</a>
            <p>This link will expire in 24 hours. If you didn't create this account, please ignore this email.</p>
            <p>After setting your password, you can login with your email and password.</p>
          `;
        }
      },
    },
    forgotPassword: {
      generateEmailHTML: ({ token, user }: { token: string; user: any }) => {
        return `
          <h1>Password Reset Request</h1>
          <p>Hello ${user.name},</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}">Reset Password</a>
          <p>If you didn't request this, please ignore this email.</p>
        `;
      },
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'department'],
  },
  access: {
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'Student', value: 'student' },
        { label: 'Clearance Officer', value: 'officer' },
        { label: 'Student Affairs Officer', value: 'student-affairs' },
        { label: 'Super Admin', value: 'admin' },
      ],
      defaultValue: 'student',
    },
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      required: false,
      admin: {
        condition: (data) => data.role === 'student' || data.role === 'officer' || data.role === 'student-affairs',
      },
    },
    {
      name: 'matricNo',
      type: 'text',
      required: false,
      admin: {
        condition: (data) => data.role === 'student',
      },
    },
    {
      name: 'phone',
      type: 'text',
      required: false,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Suspended', value: 'suspended' },
      ],
      defaultValue: 'active',
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'lastLogin',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'clearanceStatus',
      type: 'select',
      required: false,
      options: [
        { label: 'Not Started', value: 'not-started' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'On Hold', value: 'on-hold' },
      ],
      defaultValue: 'not-started',
      admin: {
        condition: (data) => data.role === 'student',
      },
    },
    {
      name: 'hasSetPassword',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      admin: {
        description: 'Whether the user has set their password',
        readOnly: true,
      },
    },
    {
      name: 'passwordSetAt',
      type: 'date',
      admin: {
        description: 'When the password was first set',
        readOnly: true,
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who created this account',
        readOnly: true,
      },
    },
    {
      name: 'createdByDepartment',
      type: 'relationship',
      relationTo: 'departments',
      admin: {
        description: 'Department that created this account (for officers)',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        // Update last login on authentication
        if (req.user && operation === 'update') {
          data.lastLogin = new Date().toISOString();
        }
        
        // Track when password is set for all users
        if (data.password && !data.hasSetPassword) {
          data.hasSetPassword = true;
          data.passwordSetAt = new Date().toISOString();
        }
        
        // Track who created the account
        if (operation === 'create' && req.user) {
          data.createdBy = req.user.id;
          if (req.user.department) {
            data.createdByDepartment = req.user.department;
          }
        }
        
        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Send welcome email for new users
        if (operation === 'create') {
          try {
            // Get department name
            let departmentName = 'Unknown Department';
            if (doc.department) {
              const department = await req.payload.findByID({
                collection: 'departments',
                id: doc.department,
              });
              departmentName = department.name;
            }

            // Send appropriate welcome email based on role
            if (doc.role === 'student') {
              // Send student welcome email
              await emailService.sendWelcomeEmail({
                studentName: doc.name,
                studentEmail: doc.email,
                matricNo: doc.matricNo || 'N/A',
                department: departmentName,
                magicLink: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${doc.id}`, // This would be the actual token
              });
            } else if (['officer', 'student-affairs'].includes(doc.role)) {
              // Send officer welcome email
              await emailService.sendOfficerWelcomeEmail({
                officerName: doc.name,
                officerEmail: doc.email,
                department: departmentName,
                role: doc.role as 'officer' | 'student-affairs',
                magicLink: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${doc.id}`, // This would be the actual token
              });
            }
          } catch (error) {
            console.error('Failed to send welcome email:', error);
          }
        }
      },
    ],
  },
}; 