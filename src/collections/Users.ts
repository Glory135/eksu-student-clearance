import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrSelf } from '../access/Users';
import { emailService } from '../lib/emailService';
import { User } from '@/payload-types';
import { generateMagicLinkToken } from '../modules/auth/utils';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // Disable default verify and forgotPassword since we're handling them custom
    verify: false,
    forgotPassword: false,
  },
  admin: {
    useAsTitle: 'lastName',
    defaultColumns: ['lastName', 'firstName', 'middleName', 'email', 'role', 'department'],
  },
  access: {
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'middleName',
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
      relationTo: 'images',
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

            // Generate magic link token
            const token = generateMagicLinkToken(doc);

            // Send appropriate welcome email based on role
            if (doc.role === 'student') {
              // Send student welcome email
              await emailService.sendWelcomeEmail({
                studentName: `${doc.lastName} ${doc.firstName}`,
                studentEmail: doc.email,
                matricNo: doc.matricNo || 'N/A',
                department: departmentName,
                magicLink: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`,
              });
            } else if (['officer', 'student-affairs'].includes(doc.role)) {
              // Send officer welcome email
              await emailService.sendOfficerWelcomeEmail({
                officerName: `${doc.lastName} ${doc.firstName}`,
                officerEmail: doc.email,
                department: departmentName,
                role: doc.role as 'officer' | 'student-affairs',
                magicLink: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`,
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