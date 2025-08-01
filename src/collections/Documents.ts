import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrSelf, canAccessStudentFeatures, canAccessOfficerFeatures } from '../access/Users';
import { emailService } from '../lib/emailService';

export const Documents: CollectionConfig = {
  slug: 'documents',
  admin: {
    useAsTitle: 'fileName',
    defaultColumns: ['fileName', 'student', 'department', 'requirement', 'status', 'uploadedAt'],
  },
  access: {
    create: canAccessStudentFeatures,
    read: isAdminOrSelf,
    update: canAccessOfficerFeatures,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'fileName',
      type: 'text',
      required: true,
      admin: {
        description: 'Original filename of the uploaded document',
      },
    },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Student who uploaded the document',
      },
    },
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      required: true,
    },
    {
      name: 'requirement',
      type: 'relationship',
      relationTo: 'requirements',
      required: true,
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'The uploaded document file',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Under Review', value: 'under-review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Processing', value: 'processing' },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'uploadedAt',
      type: 'date',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'reviewedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Officer who reviewed the document',
        readOnly: true,
      },
    },
    {
      name: 'reviewNotes',
      type: 'textarea',
      admin: {
        description: 'Notes from the reviewing officer',
      },
    },
    {
      name: 'rejectionReason',
      type: 'select',
      options: [
        { label: 'Document not clear', value: 'not-clear' },
        { label: 'Wrong document type', value: 'wrong-type' },
        { label: 'Document expired', value: 'expired' },
        { label: 'Incomplete information', value: 'incomplete' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        condition: (data) => data.status === 'rejected',
      },
    },
    {
      name: 'customRejectionReason',
      type: 'textarea',
      admin: {
        condition: (data) => data.rejectionReason === 'other',
        description: 'Custom rejection reason',
      },
    },
    {
      name: 'fileSize',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'File size in bytes',
      },
    },
    {
      name: 'fileType',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'File MIME type',
      },
    },
    {
      name: 'version',
      type: 'number',
      required: true,
      defaultValue: 1,
      admin: {
        description: 'Document version (increments on re-upload)',
      },
    },
    {
      name: 'isLatest',
      type: 'checkbox',
      required: true,
      defaultValue: true,
      admin: {
        description: 'Whether this is the latest version of the document',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Set upload timestamp
        if (!data.uploadedAt) {
          data.uploadedAt = new Date().toISOString();
        }
        
        // Set review timestamp when status changes
        if (data.status && ['approved', 'rejected'].includes(data.status)) {
          data.reviewedAt = new Date().toISOString();
          if (req.user?.id) {
            data.reviewedBy = typeof req.user.id === 'string' ? req.user.id : (req.user.id as unknown as string);
          }
        }
        
        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        try {
          // Get related data for email notifications
          const student = await req.payload.findByID({
            collection: 'users',
            id: doc.student,
          });

          const department = await req.payload.findByID({
            collection: 'departments',
            id: doc.department,
          });

          const requirement = await req.payload.findByID({
            collection: 'requirements',
            id: doc.requirement,
          });

          const reviewer = doc.reviewedBy ? await req.payload.findByID({
            collection: 'users',
            id: doc.reviewedBy,
          }) : null;

          const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student`;

          if (operation === 'create') {
            // Notify officer about new document
            if (department.officer) {
              const officer = await req.payload.findByID({
                collection: 'users',
                id: department.officer as string,
              });

              if (officer?.email) {
                await emailService.sendOfficerNotification(
                  officer.email,
                  `${student.firstName} ${student.lastName}`,
                  doc.fileName,
                  department.name
                );
              }
            }
          } else if (operation === 'update' && doc.status) {
            // Notify student about status change
            const notificationData = {
              studentName: `${student.firstName} ${student.lastName}`,
              studentEmail: student.email,
              documentName: doc.fileName,
              department: department.name,
              requirement: requirement.name,
              status: doc.status as 'approved' | 'rejected' | 'under-review',
              reviewNotes: doc.reviewNotes,
              rejectionReason: doc.rejectionReason,
              reviewedBy: `${reviewer?.firstName} ${reviewer?.lastName}`,
              reviewedAt: doc.reviewedAt,
              loginUrl,
            };

            switch (doc.status) {
              case 'approved':
                await emailService.sendDocumentApprovedEmail(notificationData);
                break;
              case 'rejected':
                await emailService.sendDocumentRejectedEmail(notificationData);
                break;
              case 'under-review':
                await emailService.sendDocumentUnderReviewEmail(notificationData);
                break;
            }
          }
        } catch (error) {
          console.error('Failed to send email notifications:', error);
        }
      },
    ],
  },
}; 