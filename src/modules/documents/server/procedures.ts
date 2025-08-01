import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { DocumentNotificationData, emailService } from '@/lib/emailService';
import type { Sort, Where } from 'payload';
import { RejectionReasonEnum } from '../types';
import { TRPCError } from '@trpc/server';
import type { Department, Media, Requirement, User } from '@/payload-types';

export const documentsRouter = createTRPCRouter({
  // Get all documents with infinite pagination
  getAllInfinite: baseProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(15),
        cursor: z.string().optional(),
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

      // Cursor-based pagination
      if (input.cursor) {
        where.uploadedAt = { less_than: input.cursor };
      }

      const documents = await ctx.payload.find({
        collection: 'documents',
        depth: 2,
        where,
        sort,
        limit: input.limit + 1, // Get one extra to check if there are more
      });

      let nextCursor: string | undefined = undefined;
      const docs = documents.docs.slice(0, input.limit);
      
      if (documents.docs.length > input.limit) {
        const nextItem = documents.docs[input.limit];
        nextCursor = nextItem.uploadedAt;
      }

      return {
        items: docs.map((doc) => ({
          ...doc,
          student: doc.student as User,
          department: doc.department as Department,
          requirement: doc.requirement as Requirement,
          file: doc.file as Media,
          reviewedBy: doc.reviewedBy as User,
        })),
        nextCursor,
        hasMore: documents.docs.length > input.limit,
      };
    }),

  // Get all documents with filtering (legacy for backward compatibility)
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
          student: doc.student as User,
          department: doc.department as Department,
          requirement: doc.requirement as Requirement,
          file: doc.file as Media,
          reviewedBy: doc.reviewedBy as User,
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
        student: document.student as User,
        department: document.department as Department,
        requirement: document.requirement as Requirement,
        file: document.file as Media,
        reviewedBy: document.reviewedBy as User,
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
      // Verify user is authenticated
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to upload documents',
        });
      }

      // Verify user is a student or has permission to upload for others
      if (ctx.user.role === 'student' && ctx.user.id !== input.student) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only upload documents for yourself',
        });
      }

      // Verify the student exists and belongs to the specified department
      const student = await ctx.payload.findByID({
        collection: 'users',
        id: input.student,
      });

      if (!student) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Student not found',
        });
      }

      if (student.role !== 'student') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Specified user is not a student',
        });
      }

      // Verify department exists
      const department = await ctx.payload.findByID({
        collection: 'departments',
        id: input.department,
      });

      if (!department) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Department not found',
        });
      }

      // Verify requirement exists
      const requirement = await ctx.payload.findByID({
        collection: 'requirements',
        id: input.requirement,
      });

      if (!requirement) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Requirement not found',
        });
      }

      // Verify file exists
      const file = await ctx.payload.findByID({
        collection: 'media',
        id: input.file,
      });

      if (!file) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found',
        });
      }

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
      const studentData = await ctx.payload.findByID({
        collection: 'users',
        id: input.student,
      });

      const departmentData = await ctx.payload.findByID({
        collection: 'departments',
        id: input.department,
      });

      // Notify officer about new document
      if (departmentData.officer) {
        const officer = await ctx.payload.findByID({
          collection: 'users',
          id: departmentData.officer as string,
        });

        if (officer?.email) {
          await emailService.sendOfficerNotification(
            officer.email,
            `${studentData.firstName} ${studentData.lastName}`,
            document.fileName,
            departmentData.name
          );
        }
      }

      return {
        ...document,
        student: document.student as User,
        department: document.department as Department,
        requirement: document.requirement as Requirement,
        file: document.file as Media,
      };
    }),

  // Review document
  review: baseProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['approved', 'rejected', 'under-review']),
        reviewNotes: z.string().optional(),
        rejectionReason: z.enum(Object.values(RejectionReasonEnum)).optional(),
        customRejectionReason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user is authenticated
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to review documents',
        });
      }

      // Verify user has permission to review documents
      if (!['officer', 'student-affairs', 'admin'].includes(ctx.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to review documents',
        });
      }

      // Get the document to review
      const existingDocument = await ctx.payload.findByID({
        collection: 'documents',
        id: input.id,
      });

      if (!existingDocument) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Document not found',
        });
      }

      // Verify user can review this document (same department or admin)
      if (ctx.user.role !== 'admin') {
        const userDepartment = await ctx.payload.findByID({
          collection: 'departments',
          id: ctx.user.department as string,
        });

        if (!userDepartment || userDepartment.id !== existingDocument.department) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only review documents from your department',
          });
        }
      }

      const { id, ...data } = input;
      
      const document = await ctx.payload.update({
        collection: 'documents',
        id,
        data: {
          ...data,
          reviewedAt: new Date().toISOString(),
          reviewedBy: ctx.user.id, // Use the authenticated user's ID
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
      const notificationData: DocumentNotificationData = {
        studentName: `${student.firstName} ${student.lastName}`,
        studentEmail: student.email,
        documentName: document.fileName,
        department: department.name,
        requirement: requirement.name,
        status: document.status as 'approved' | 'rejected' | 'under-review',
        reviewNotes: document.reviewNotes as string,
        rejectionReason: document.rejectionReason as string,
        reviewedBy: reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : "Unknown",
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
        student: document.student as User,
        department: document.department as Department,
        requirement: document.requirement as Requirement,
        file: document.file as Media,
        reviewedBy: document.reviewedBy as User,
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
      // Verify user is authenticated
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to delete documents',
        });
      }

      // Verify user has permission to delete documents
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only administrators can delete documents',
        });
      }

      await ctx.payload.delete({
        collection: 'documents',
        id: input.id,
      });

      return {
        success: true,
        message: 'Document deleted successfully',
      };
    }),

  // Get documents by student with infinite pagination
  getByStudentInfinite: baseProcedure
    .input(
      z.object({
        studentId: z.string(),
        limit: z.number().min(1).max(50).default(15),
        cursor: z.string().optional(),
        status: z.enum(['pending', 'under-review', 'approved', 'rejected', 'processing']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user is authenticated
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to view documents',
        });
      }

      // Verify user has permission to view these documents
      if (ctx.user.role === 'student' && ctx.user.id !== input.studentId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view your own documents',
        });
      }

      const where: Where = {
        student: { equals: input.studentId },
      };

      if (input.status) {
        where.status = { equals: input.status };
      }

      // Cursor-based pagination
      if (input.cursor) {
        where.uploadedAt = { less_than: input.cursor };
      }

      const documents = await ctx.payload.find({
        collection: 'documents',
        depth: 2,
        where,
        sort: '-uploadedAt',
        limit: input.limit + 1, // Get one extra to check if there are more
      });

      let nextCursor: string | undefined = undefined;
      const docs = documents.docs.slice(0, input.limit);
      
      if (documents.docs.length > input.limit) {
        const nextItem = documents.docs[input.limit];
        nextCursor = nextItem.uploadedAt;
      }

      return {
        items: docs.map((doc) => ({
          ...doc,
          student: doc.student as User,
          department: doc.department as Department,
          requirement: doc.requirement as Requirement,
          file: doc.file as Media,
          reviewedBy: doc.reviewedBy as User,
        })),
        nextCursor,
        hasMore: documents.docs.length > input.limit,
      };
    }),

  // Get documents by student (legacy for backward compatibility)
  getByStudent: baseProcedure
    .input(
      z.object({
        studentId: z.string(),
        status: z.enum(['pending', 'under-review', 'approved', 'rejected', 'processing']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user is authenticated
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to view documents',
        });
      }

      // Verify user has permission to view these documents
      if (ctx.user.role === 'student' && ctx.user.id !== input.studentId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view your own documents',
        });
      }

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
          student: doc.student as User,
          department: doc.department as Department,
          requirement: doc.requirement as Requirement,
          file: doc.file as Media,
          reviewedBy: doc.reviewedBy as User,
        })),
      };
    }),

  // Get documents by department with infinite pagination
  getByDepartmentInfinite: baseProcedure
    .input(
      z.object({
        departmentId: z.string(),
        limit: z.number().min(1).max(50).default(15),
        cursor: z.string().optional(),
        status: z.enum(['pending', 'under-review', 'approved', 'rejected', 'processing']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user is authenticated
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to view documents',
        });
      }

      // Verify user has permission to view these documents
      if (ctx.user.role === 'student') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Students cannot view department documents',
        });
      }

      // Verify user belongs to the department or is admin
      if (ctx.user.role !== 'admin' && ctx.user.department !== input.departmentId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view documents from your department',
        });
      }

      const where: Where = {
        department: { equals: input.departmentId },
      };

      if (input.status) {
        where.status = { equals: input.status };
      }

      // Cursor-based pagination
      if (input.cursor) {
        where.uploadedAt = { less_than: input.cursor };
      }

      const documents = await ctx.payload.find({
        collection: 'documents',
        depth: 2,
        where,
        sort: '-uploadedAt',
        limit: input.limit + 1, // Get one extra to check if there are more
      });

      let nextCursor: string | undefined = undefined;
      const docs = documents.docs.slice(0, input.limit);
      
      if (documents.docs.length > input.limit) {
        const nextItem = documents.docs[input.limit];
        nextCursor = nextItem.uploadedAt;
      }

      return {
        items: docs.map((doc) => ({
          ...doc,
          student: doc.student as User,
          department: doc.department as Department,
          requirement: doc.requirement as Requirement,
          file: doc.file as Media,
          reviewedBy: doc.reviewedBy as User,
        })),
        nextCursor,
        hasMore: documents.docs.length > input.limit,
      };
    }),

  // Get documents by department (legacy for backward compatibility)
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
      // Verify user is authenticated
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to view documents',
        });
      }

      // Verify user has permission to view these documents
      if (ctx.user.role === 'student') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Students cannot view department documents',
        });
      }

      // Verify user belongs to the department or is admin
      if (ctx.user.role !== 'admin' && ctx.user.department !== input.departmentId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view documents from your department',
        });
      }

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
          student: doc.student as User,
          department: doc.department as Department,
          requirement: doc.requirement as Requirement,
          file: doc.file as Media,
          reviewedBy: doc.reviewedBy as User,
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
      // Verify user is authenticated
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to view statistics',
        });
      }

      // Verify user has permission to view these statistics
      if (ctx.user.role === 'student') {
        // Students can only view their own stats
        if (input.studentId && input.studentId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only view your own statistics',
          });
        }
        // Force studentId to be the current user's ID
        input.studentId = ctx.user.id;
      } else if (ctx.user.role !== 'admin') {
        // Officers can only view stats for their department
        if (input.departmentId && input.departmentId !== ctx.user.department) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only view statistics for your department',
          });
        }
        // Force departmentId to be the current user's department
        input.departmentId = ctx.user.department as string;
      }

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