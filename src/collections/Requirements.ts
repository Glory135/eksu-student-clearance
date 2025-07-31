import type { CollectionConfig } from 'payload';
import { isAdmin } from '../access/Users';

export const Requirements: CollectionConfig = {
  slug: 'requirements',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'department', 'documentType', 'isRequired', 'status'],
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
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique code for this requirement (e.g., TRANSCRIPT, PAYMENT_RECEIPT)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
      admin: {
        description: 'Detailed description of what this document should contain',
      },
    },
    {
      name: 'departments',
      type: 'relationship',
      relationTo: 'departments',
      required: true,
      hasMany: true,
    },
    {
      name: 'documentType',
      type: 'select',
      required: true,
      options: [
        { label: 'Academic Transcript', value: 'transcript' },
        { label: 'Payment Receipt', value: 'payment-receipt' },
        { label: 'Library Clearance', value: 'library-clearance' },
        { label: 'Student ID Card', value: 'student-id' },
        { label: 'Medical Certificate', value: 'medical-certificate' },
        { label: 'Character Reference', value: 'character-reference' },
        { label: 'Project Report', value: 'project-report' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'isRequired',
      type: 'checkbox',
      required: true,
      defaultValue: true,
      admin: {
        description: 'Whether this document is mandatory for clearance',
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
      name: 'fileTypes',
      type: 'select',
      hasMany: true,
      required: true,
      options: [
        { label: 'PDF', value: 'pdf' },
        { label: 'DOCX', value: 'docx' },
        { label: 'JPG', value: 'jpg' },
        { label: 'PNG', value: 'png' },
        { label: 'JPEG', value: 'jpeg' },
      ],
      defaultValue: ['pdf', 'docx'],
    },
    {
      name: 'maxFileSize',
      type: 'number',
      required: true,
      defaultValue: 10,
      admin: {
        description: 'Maximum file size in MB',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 1,
      admin: {
        description: 'Order in which this requirement should appear',
      },
    },
    {
      name: 'instructions',
      type: 'richText',
      required: false,
      admin: {
        description: 'Detailed instructions for students on how to obtain this document',
      },
    },
    {
      name: 'sampleDocument',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Sample document to show students what is expected',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Ensure code is uppercase
        if (data.code) {
          data.code = data.code.toUpperCase();
        }
        return data;
      },
    ],
  },
}; 