import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrSelf } from '../access/Users';

export const ClearanceRecords: CollectionConfig = {
  slug: 'clearance-records',
  admin: {
    useAsTitle: 'recordType',
    defaultColumns: ['student', 'department', 'recordType', 'status', 'createdAt'],
  },
  access: {
    create: () => true, // System creates records automatically
    read: isAdminOrSelf,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      required: true,
    },
    {
      name: 'recordType',
      type: 'select',
      required: true,
      options: [
        { label: 'Document Upload', value: 'document-upload' },
        { label: 'Document Review', value: 'document-review' },
        { label: 'Document Approval', value: 'document-approval' },
        { label: 'Document Rejection', value: 'document-rejection' },
        { label: 'Department Clearance', value: 'department-clearance' },
        { label: 'Final Clearance', value: 'final-clearance' },
        { label: 'System Action', value: 'system-action' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Pending', value: 'pending' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'success',
    },
    {
      name: 'actionBy',
      type: 'relationship',
      relationTo: 'users',
      required: false,
    },
    {
      name: 'document',
      type: 'relationship',
      relationTo: 'documents',
      required: false,
    },
    {
      name: 'requirement',
      type: 'relationship',
      relationTo: 'requirements',
      required: false,
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
      admin: {
        description: 'Human-readable description of the action taken',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      required: false,
      admin: {
        description: 'Additional data about the action (for system use)',
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'createdAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Set creation timestamp
        if (!data.createdAt) {
          data.createdAt = new Date().toISOString();
        }

        // Set action by user
        if (req.user && !data.actionBy) {
          data.actionBy = req.user.id;
        }

        // Set IP address and user agent
        if (req.headers) {
          data.ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || "Unknown";
          data.userAgent = req.headers.get('user-agent') || "Unknown";
        }

        return data;
      },
    ],
  },
}; 