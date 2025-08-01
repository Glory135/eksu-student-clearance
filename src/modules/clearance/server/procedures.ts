import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { emailService } from '@/lib/emailService';
import type { Sort, Where } from 'payload';
import { TRPCError } from '@trpc/server';

export const clearanceRouter = createTRPCRouter({
  // Get clearance status for a student
  getStudentClearance: baseProcedure
    .input(
      z.object({
        studentId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user is authenticated
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to view clearance data',
        });
      }

      // Verify user has permission to view this student's clearance
      if (ctx.user.role === 'student' && ctx.user.id !== input.studentId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view your own clearance data',
        });
      }

      // Get student
      const student = await ctx.payload.findByID({
        collection: 'users',
        id: input.studentId,
        depth: 2,
      });

      if (!student) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Student not found',
        });
      }

      // Get student's documents
      const documents = await ctx.payload.find({
        collection: 'documents',
        where: {
          student: { equals: input.studentId },
        },
        depth: 2,
      });

      // Get department requirements
      const requirements = await ctx.payload.find({
        collection: 'requirements',
        where: {
          department: { equals: student.department },
        },
        depth: 1,
      });

      // Calculate completion status
      const totalRequirements = requirements.docs.length;
      const completedDocuments = documents.docs.filter(
        doc => doc.status === 'approved'
      ).length;
      const pendingDocuments = documents.docs.filter(
        doc => doc.status === 'pending'
      ).length;
      const rejectedDocuments = documents.docs.filter(
        doc => doc.status === 'rejected'
      ).length;

      const completionRate = totalRequirements > 0 
        ? (completedDocuments / totalRequirements) * 100 
        : 0;

      const isCompleted = completedDocuments === totalRequirements && totalRequirements > 0;

      return {
        student: {
          id: student.id,
          name: `${student.lastName} ${student.firstName}`,
          email: student.email,
          matricNo: student.matricNo,
          department: student.department as any,
          clearanceStatus: student.clearanceStatus || 'not-started',
        },
        statistics: {
          totalRequirements,
          completedDocuments,
          pendingDocuments,
          rejectedDocuments,
          completionRate,
          isCompleted,
        },
        documents: documents.docs.map(doc => ({
          ...doc,
          student: doc.student as any,
          department: doc.department as any,
          requirement: doc.requirement as any,
          file: doc.file as any,
          reviewedBy: doc.reviewedBy as any,
        })),
        requirements: requirements.docs,
      };
    }),

  // Get clearance progress for all students with infinite pagination
  getAllClearanceProgressInfinite: baseProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(15),
        cursor: z.string().optional(),
        department: z.string().optional(),
        status: z.enum(['not-started', 'in-progress', 'completed', 'on-hold']).optional(),
        sort: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user is authenticated
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to view clearance data',
        });
      }

      // Verify user has permission to view all clearance data
      if (ctx.user.role === 'student') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Students cannot view all clearance progress',
        });
      }

      const where: Where = {
        role: { equals: 'student' },
      };

      if (input.department) {
        where.department = { equals: input.department };
      }

      if (input.status) {
        where.clearanceStatus = { equals: input.status };
      }

      // Cursor-based pagination
      if (input.cursor) {
        where.createdAt = { less_than: input.cursor };
      }

      let sort: Sort = '-createdAt';
      if (input.sort === 'completion') {
        sort = 'clearanceStatus';
      } else if (input.sort === 'name') {
        sort = 'name';
      }

      const students = await ctx.payload.find({
        collection: 'users',
        depth: 1,
        where,
        sort,
        limit: input.limit + 1, // Get one extra to check if there are more
      });

      // Get clearance data for each student
      const clearanceData = await Promise.all(
        students.docs.slice(0, input.limit).map(async (student) => {
          const documents = await ctx.payload.find({
            collection: 'documents',
            where: {
              student: { equals: student.id },
            },
            limit: 0,
          });

          const requirements = await ctx.payload.find({
            collection: 'requirements',
            where: {
              department: { equals: student.department },
            },
            limit: 0,
          });

          const completedDocuments = documents.docs.filter(
            doc => doc.status === 'approved'
          ).length;

          const completionRate = requirements.totalDocs > 0 
            ? (completedDocuments / requirements.totalDocs) * 100 
            : 0;

          return {
            student: {
              ...student,
              department: student.department as any,
            },
            statistics: {
              totalRequirements: requirements.totalDocs,
              completedDocuments,
              completionRate,
              isCompleted: completedDocuments === requirements.totalDocs && requirements.totalDocs > 0,
            },
          };
        })
      );

      let nextCursor: string | undefined = undefined;
      if (students.docs.length > input.limit) {
        const nextItem = students.docs[input.limit];
        nextCursor = nextItem.createdAt;
      }

      return {
        items: clearanceData,
        nextCursor,
        hasMore: students.docs.length > input.limit,
      };
    }),

  // Get clearance progress for all students (legacy for backward compatibility)
  getAllClearanceProgress: baseProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        page: z.number().default(1),
        department: z.string().optional(),
        status: z.enum(['not-started', 'in-progress', 'completed', 'on-hold']).optional(),
        sort: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user is authenticated
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to view clearance data',
        });
      }

      // Verify user has permission to view all clearance data
      if (ctx.user.role === 'student') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Students cannot view all clearance progress',
        });
      }

      const where: Where = {
        role: { equals: 'student' },
      };

      if (input.department) {
        where.department = { equals: input.department };
      }

      if (input.status) {
        where.clearanceStatus = { equals: input.status };
      }

      let sort: Sort = 'name';
      if (input.sort === 'completion') {
        sort = 'clearanceStatus';
      } else if (input.sort === 'name') {
        sort = 'name';
      }

      const students = await ctx.payload.find({
        collection: 'users',
        depth: 1,
        where,
        sort,
        page: input.page,
        limit: input.limit,
      });

      // Get clearance data for each student
      const clearanceData = await Promise.all(
        students.docs.map(async (student) => {
          const documents = await ctx.payload.find({
            collection: 'documents',
            where: {
              student: { equals: student.id },
            },
            limit: 0,
          });

          const requirements = await ctx.payload.find({
            collection: 'requirements',
            where: {
              department: { equals: student.department },
            },
            limit: 0,
          });

          const completedDocuments = documents.docs.filter(
            doc => doc.status === 'approved'
          ).length;

          const completionRate = requirements.totalDocs > 0 
            ? (completedDocuments / requirements.totalDocs) * 100 
            : 0;

          return {
            student: {
              ...student,
              department: student.department as any,
            },
            statistics: {
              totalRequirements: requirements.totalDocs,
              completedDocuments,
              completionRate,
              isCompleted: completedDocuments === requirements.totalDocs && requirements.totalDocs > 0,
            },
          };
        })
      );

      return {
        students: clearanceData,
        pagination: {
          totalDocs: students.totalDocs,
          totalPages: students.totalPages,
          page: students.page,
          limit: students.limit,
        },
      };
    }),

  // Update student clearance status
  updateClearanceStatus: baseProcedure
    .input(
      z.object({
        studentId: z.string(),
        status: z.enum(['not-started', 'in-progress', 'completed', 'on-hold']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user is authenticated
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to update clearance status',
        });
      }

      // Verify user has permission to update clearance status
      if (!['officer', 'student-affairs', 'admin'].includes(ctx.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update clearance status',
        });
      }

      const student = await ctx.payload.update({
        collection: 'users',
        id: input.studentId,
        data: {
          clearanceStatus: input.status,
        },
      });

      return {
        ...student,
        department: student.department as any,
      };
    }),

  // Mark clearance as completed
  markClearanceCompleted: baseProcedure
    .input(
      z.object({
        studentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user is authenticated
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to mark clearance as completed',
        });
      }

      // Verify user has permission to mark clearance as completed
      if (!['officer', 'student-affairs', 'admin'].includes(ctx.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to mark clearance as completed',
        });
      }

      // Get student
      const student = await ctx.payload.findByID({
        collection: 'users',
        id: input.studentId,
        depth: 2,
      });

      if (!student) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Student not found',
        });
      }

      // Get student's documents
      const documents = await ctx.payload.find({
        collection: 'documents',
        where: {
          student: { equals: input.studentId },
        },
        limit: 0,
      });

      // Get department requirements
      const requirements = await ctx.payload.find({
        collection: 'requirements',
        where: {
          department: { equals: student.department },
        },
        limit: 0,
      });

      const completedDocuments = documents.docs.filter(
        doc => doc.status === 'approved'
      ).length;

      const isCompleted = completedDocuments === requirements.totalDocs && requirements.totalDocs > 0;

      if (!isCompleted) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot mark clearance as completed. Not all documents are approved.',
        });
      }

      // Update student status
      const updatedStudent = await ctx.payload.update({
        collection: 'users',
        id: input.studentId,
        data: {
          clearanceStatus: 'completed',
        },
      });

      // Send completion email
      const department = await ctx.payload.findByID({
        collection: 'departments',
        id: student.department as string,
      });

      await emailService.sendClearanceCompletedEmail({
        studentName: `${student.lastName} ${student.firstName}`,
        studentEmail: student.email,
        matricNo: student.matricNo as string,
        department: department.name,
        completionDate: new Date().toISOString(),
        totalDocuments: requirements.totalDocs,
        completedDocuments,
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student`,
      });

      return {
        ...updatedStudent,
        department: updatedStudent.department as any,
      };
    }),

  // Get clearance statistics
  getClearanceStats: baseProcedure
    .input(
      z.object({
        departmentId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user is authenticated
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to view clearance statistics',
        });
      }

      // Verify user has permission to view these statistics
      if (ctx.user.role === 'student') {
        // Students can only view their own stats
        input.departmentId = ctx.user.department as string;
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

      const where: Where = {
        role: { equals: 'student' },
      };

      if (input.departmentId) {
        where.department = { equals: input.departmentId };
      }

      const students = await ctx.payload.find({
        collection: 'users',
        where,
        limit: 0,
      });

      const stats = {
        totalStudents: students.totalDocs,
        notStarted: students.docs.filter(s => s.clearanceStatus === 'not-started').length,
        inProgress: students.docs.filter(s => s.clearanceStatus === 'in-progress').length,
        completed: students.docs.filter(s => s.clearanceStatus === 'completed').length,
        onHold: students.docs.filter(s => s.clearanceStatus === 'on-hold').length,
      };

      return {
        ...stats,
        completionRate: stats.totalStudents > 0 
          ? (stats.completed / stats.totalStudents) * 100 
          : 0,
      };
    }),

  // Get clearance timeline for a student
  getClearanceTimeline: baseProcedure
    .input(
      z.object({
        studentId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify user is authenticated
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to view clearance timeline',
        });
      }

      // Verify user has permission to view this student's timeline
      if (ctx.user.role === 'student' && ctx.user.id !== input.studentId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view your own clearance timeline',
        });
      }

      // Get clearance records
      const records = await ctx.payload.find({
        collection: 'clearance-records',
        where: {
          student: { equals: input.studentId },
        },
        sort: '-timestamp',
        depth: 2,
      });

      return {
        records: records.docs.map(record => ({
          ...record,
          user: record.actionBy,
          document: record.document,
          student: record.student,
          department: record.department,
        })),
      };
    }),

  // Log clearance action
  logClearanceAction: baseProcedure
    .input(
      z.object({
        action: z.string(),
        studentId: z.string(),
        documentId: z.string().optional(),
        departmentId: z.string(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user is authenticated
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to log clearance actions',
        });
      }

      const record = await ctx.payload.create({
        collection: 'clearance-records',
        data: {
          recordType: 'document-upload',
          status: 'success',
          actionBy: ctx.user.id,
          student: input.studentId,
          document: input.documentId,
          department: input.departmentId,
          createdAt: new Date().toISOString(),
          metadata: input.metadata || {},
          ipAddress: '127.0.0.1', // TODO: Get from request
          userAgent: 'Unknown', // TODO: Get from request
        },
      });

      return {
        ...record,
        user: record.actionBy as any,
        document: record.document as any,
        student: record.student as any,
        department: record.department as any,
      };
    }),
}); 