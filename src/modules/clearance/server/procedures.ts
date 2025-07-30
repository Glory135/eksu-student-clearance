import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { emailService } from '@/lib/emailService';
import type { Sort, Where } from 'payload';

export const clearanceRouter = createTRPCRouter({
  // Get clearance status for a student
  getStudentClearance: baseProcedure
    .input(
      z.object({
        studentId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get student
      const student = await ctx.payload.findByID({
        collection: 'users',
        id: input.studentId,
        depth: 2,
      });

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
          name: student.name,
          email: student.email,
          matricNo: student.matricNo,
          department: student.department as any,
          clearanceStatus: student.clearanceStatus,
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

  // Get clearance progress for all students
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
      // Get student
      const student = await ctx.payload.findByID({
        collection: 'users',
        id: input.studentId,
        depth: 2,
      });

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
        throw new Error('Cannot mark clearance as completed. Not all documents are approved.');
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
        studentName: student.name,
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
          user: record.user,
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
      const record = await ctx.payload.create({
        collection: 'clearance-records',
        data: {
          action: input.action,
          student: input.studentId,
          document: input.documentId,
          department: input.departmentId,
          timestamp: new Date().toISOString(),
          metadata: input.metadata || {},
          user: 'current-user-id', // TODO: Get from auth context
          ipAddress: '127.0.0.1', // TODO: Get from request
          userAgent: 'Unknown', // TODO: Get from request
        },
      });

      return {
        ...record,
        user: record.user as any,
        document: record.document as any,
        student: record.student as any,
        department: record.department as any,
      };
    }),
}); 