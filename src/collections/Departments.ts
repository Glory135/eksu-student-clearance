import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrSelf } from '../access/Users';

export const Departments: CollectionConfig = {
  slug: 'departments',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'officer', 'studentCount', 'status'],
  },
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Short code for the department (e.g., CS, MAT, PHY)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
    },
    {
      name: 'officer',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      admin: {
        description: 'Primary clearance officer for this department',
      },
    },
    {
      name: 'studentAffairsOfficer',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      admin: {
        description: 'Student affairs officer for this department',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Under Review', value: 'under-review' },
      ],
      defaultValue: 'active',
    },
    {
      name: 'clearanceOrder',
      type: 'number',
      required: true,
      defaultValue: 1,
      admin: {
        description: 'Order in which this department should be cleared (1 = first)',
      },
    },
    {
      name: 'requiredDocuments',
      type: 'relationship',
      relationTo: 'requirements',
      hasMany: true,
      required: false,
    },
    {
      name: 'studentCount',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Number of students in this department',
      },
    },
    {
      name: 'completedClearances',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Number of completed clearances',
      },
    },
    {
      name: 'pendingClearances',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Number of pending clearances',
      },
    },
    {
      name: 'canAddOfficers',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      admin: {
        description: 'Whether this department can add their own officers',
      },
    },
    {
      name: 'officerCreationLimit',
      type: 'number',
      required: false,
      admin: {
        description: 'Maximum number of officers this department can create (0 = unlimited)',
        condition: (data) => data.canAddOfficers === true,
      },
    },
    {
      name: 'createdOfficers',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        readOnly: true,
        description: 'Officers created by this department',
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // Update department statistics
        if (operation === 'create' || operation === 'update') {
          // This would be implemented to update student counts and clearance stats
          // For now, we'll leave it as a placeholder
        }
      },
    ],
  },
}; 