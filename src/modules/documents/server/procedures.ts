import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { DocumentNotificationData, emailService } from '@/lib/emailService';
import type { Sort, Where } from 'payload';

export const documentsRouter = createTRPCRouter({
  // Get all documents with filtering
  getAll: baseProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        page: z.number().default(1),
        status: z.enum(['pending', 'under-review', 'approved', 'rejected', 'processing']).optional(),
        department: z.string().optional(),
        student: z.string().optional(),
        requirement: z.string().optional(),
        sort: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Where = {};
      let sort: Sort = '-uploadedAt';

      // Status filter
      if (input.status) {
        where.status = { equals: input.status };
      }

      // Department filter
      if (input.department) {
        where.department = { equals: input.department };
      }

      // Student filter
      if (input.student) {
        where.student = { equals: input.student };
      }

      // Requirement filter
      if (input.requirement) {
        where.requirement = { equals: input.requirement };
      }

      // Sort logic
      if (input.sort === 'uploadedAt') {
        sort = '-uploadedAt';
      } else if (input.sort === 'reviewedAt') {
        sort = '-reviewedAt';
      } else if (input.sort === 'fileName') {
        sort = 'fileName';
      }

      const documents = await ctx.payload.find({
        collection: 'documents',
        depth: 2,
        where,
        sort,
        page: input.page,
        limit: input.limit,
      });

      return {
        ...documents,
        docs: documents.docs.map((doc) => ({
          ...doc,
          student: doc.student as any,
          department: doc.department as any,
          requirement: doc.requirement as any,
          file: doc.file as any,
          reviewedBy: doc.reviewedBy as any,
        })),
      };
    }),

  // Get document by ID
  getById: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const document = await ctx.payload.findByID({
        collection: 'documents',
        id: input.id,
        depth: 2,
      });

      return {
        ...document,
        student: document.student as any,
        department: document.department as any,
        requirement: document.requirement as any,
        file: document.file as any,
        reviewedBy: document.reviewedBy as any,
      };
    }),

  // Upload document
  upload: baseProcedure
    .input(
      z.object({
        fileName: z.string().min(1),
        student: z.string(),
        department: z.string(),
        requirement: z.string(),
        file: z.string(), // File ID from media collection
        fileSize: z.number(),
        fileType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.payload.create({
        collection: 'documents',
        data: {
          ...input,
          status: 'pending',
          uploadedAt: new Date().toISOString(),
          version: 1,
          isLatest: true,
        },
      });

      // Get related data for email notification
      const student = await ctx.payload.findByID({
        collection: 'users',
        id: input.student,
      });

      const department = await ctx.payload.findByID({
        collection: 'departments',
        id: input.department,
      });

      // Notify officer about new document
      if (department.officer) {
        const officer = await ctx.payload.findByID({
          collection: 'users',
          id: department.officer as string,
        });

        if (officer?.email) {
          await emailService.sendOfficerNotification(
            officer.email,
            student.name,
            document.fileName,
            department.name
          );
        }
      }

      return {
        ...document,
        student: document.student as any,
        department: document.department as any,
        requirement: document.requirement as any,
        file: document.file as any,
      };
    }),

  // Review document
  review: baseProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['approved', 'rejected', 'under-review']),
        reviewNotes: z.string().optional(),
        rejectionReason: z.enum(['not-clear', 'wrong-type', 'expired', 'incomplete', 'other']).optional(),
        customRejectionReason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      const document = await ctx.payload.update({
        collection: 'documents',
        id,
        data: {
          ...data,
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'current-user-id', // TODO: Get from auth context
        },
      });

      // Get related data for email notification
      const student = await ctx.payload.findByID({
        collection: 'users',
        id: document.student as string,
      });

      const department = await ctx.payload.findByID({
        collection: 'departments',
        id: document.department as string,
      });

      const requirement = await ctx.payload.findByID({
        collection: 'requirements',
        id: document.requirement as string,
      });

      const reviewer = document.reviewedBy ? await ctx.payload.findByID({
        collection: 'users',
        id: document.reviewedBy as string,
      }) : null;

      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student`;

      // Send email notification to student
      const notificationData : DocumentNotificationData = {
        studentName: student.name,
        studentEmail: student.email,
        documentName: document.fileName,
        department: department.name,
        requirement: requirement.name,
        status: document.status as 'approved' | 'rejected' | 'under-review',
        reviewNotes: document.reviewNotes as string,
        rejectionReason: document.rejectionReason as string,
        reviewedBy: reviewer?.name,
        reviewedAt: document.reviewedAt as string,
        loginUrl,
      };

      switch (document.status) {
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

      return {
        ...document,
        student: document.student as any,
        department: document.department as any,
        requirement: document.requirement as any,
        file: document.file as any,
        reviewedBy: document.reviewedBy as any,
      };
    }),

  // Delete document
  delete: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.payload.delete({
        collection: 'documents',
        id: input.id,
      });

      return {
        success: true,
        message: 'Document deleted successfully',
      };
    }),

  // Get documents by student
  getByStudent: baseProcedure
    .input(
      z.object({
        studentId: z.string(),
        status: z.enum(['pending', 'under-review', 'approved', 'rejected', 'processing']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Where = {
        student: { equals: input.studentId },
      };

      if (input.status) {
        where.status = { equals: input.status };
      }

      const documents = await ctx.payload.find({
        collection: 'documents',
        depth: 2,
        where,
        sort: '-uploadedAt',
      });

      return {
        ...documents,
        docs: documents.docs.map((doc) => ({
          ...doc,
          student: doc.student as any,
          department: doc.department as any,
          requirement: doc.requirement as any,
          file: doc.file as any,
          reviewedBy: doc.reviewedBy as any,
        })),
      };
    }),

  // Get documents by department
  getByDepartment: baseProcedure
    .input(
      z.object({
        departmentId: z.string(),
        status: z.enum(['pending', 'under-review', 'approved', 'rejected', 'processing']).optional(),
        limit: z.number().default(50),
        page: z.number().default(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Where = {
        department: { equals: input.departmentId },
      };

      if (input.status) {
        where.status = { equals: input.status };
      }

      const documents = await ctx.payload.find({
        collection: 'documents',
        depth: 2,
        where,
        sort: '-uploadedAt',
        page: input.page,
        limit: input.limit,
      });

      return {
        ...documents,
        docs: documents.docs.map((doc) => ({
          ...doc,
          student: doc.student as any,
          department: doc.department as any,
          requirement: doc.requirement as any,
          file: doc.file as any,
          reviewedBy: doc.reviewedBy as any,
        })),
      };
    }),

  // Get document statistics
  getStats: baseProcedure
    .input(
      z.object({
        departmentId: z.string().optional(),
        studentId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Where = {};

      if (input.departmentId) {
        where.department = { equals: input.departmentId };
      }

      if (input.studentId) {
        where.student = { equals: input.studentId };
      }

      const documents = await ctx.payload.find({
        collection: 'documents',
        where,
        limit: 0,
      });

      const stats = {
        total: documents.totalDocs,
        pending: documents.docs.filter(doc => doc.status === 'pending').length,
        underReview: documents.docs.filter(doc => doc.status === 'under-review').length,
        approved: documents.docs.filter(doc => doc.status === 'approved').length,
        rejected: documents.docs.filter(doc => doc.status === 'rejected').length,
        processing: documents.docs.filter(doc => doc.status === 'processing').length,
      };

      return {
        ...stats,
        approvalRate: stats.total > 0 ? (stats.approved / stats.total) * 100 : 0,
        rejectionRate: stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0,
      };
    }),
}); 