import type { CollectionConfig } from 'payload';
import { isAdmin } from '../access/Users';

export const Images: CollectionConfig = {
  slug: 'images',
  access: {
    create: () => true, // Allow authenticated users to upload
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  upload: {
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: [
      'image/*',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    formatOptions: {
      format: 'webp',
      options: {
        quality: 80,
      },
    },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'fileType',
      type: 'select',
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Document', value: 'document' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Set uploaded by user
        if (req.user) {
          data.uploadedBy = req.user.id;
        }
        // Determine file type based on MIME type
        if (data.mimeType) {
          if (data.mimeType.startsWith('image/')) {
            data.fileType = 'image';
          } else if (data.mimeType.includes('pdf') || data.mimeType.includes('document')) {
            data.fileType = 'document';
          } else {
            data.fileType = 'other';
          }
        }
        return data;
      },
    ],
  },
};
