import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import type { Sort, Where } from 'payload';

export const departmentsRouter = createTRPCRouter({
  // Get all departments
  getAll: baseProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        page: z.number().default(1),
        sort: z.string().optional(),
        status: z.enum(['active', 'inactive', 'under-review']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Where = {};
      let sort: Sort = 'name';

      // Status filter
      if (input.status) {
        where.status = { equals: input.status };
      }

      // Sort logic
      if (input.sort === 'clearance-order') {
        sort = 'clearanceOrder';
      } else if (input.sort === 'student-count') {
        sort = '-studentCount';
      }

      const departments = await ctx.payload.find({
        collection: 'departments',
        depth: 1,
        where,
        sort,
        page: input.page,
        limit: input.limit,
      });

      return {
        ...departments,
        docs: departments.docs.map((dept) => ({
          ...dept,
          officer: dept.officer as any,
          studentAffairsOfficer: dept.studentAffairsOfficer as any,
        })),
      };
    }),

  // Get department by ID
  getById: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const department = await ctx.payload.findByID({
        collection: 'departments',
        id: input.id,
        depth: 2,
      });

      return {
        ...department,
        officer: department.officer as any,
        studentAffairsOfficer: department.studentAffairsOfficer as any,
        createdOfficers: department.createdOfficers as any[],
      };
    }),

  // Create department
  create: baseProcedure
    .input(
      z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        description: z.string().optional(),
        status: z.enum(['active', 'inactive', 'under-review']).default('active'),
        clearanceOrder: z.number().default(1),
        canAddOfficers: z.boolean().default(false),
        officerCreationLimit: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const department = await ctx.payload.create({
        collection: 'departments',
        data: input,
      });

      return {
        ...department,
        officer: department.officer as any,
        studentAffairsOfficer: department.studentAffairsOfficer as any,
      };
    }),

  // Update department
  update: baseProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        code: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.enum(['active', 'inactive', 'under-review']).optional(),
        clearanceOrder: z.number().optional(),
        canAddOfficers: z.boolean().optional(),
        officerCreationLimit: z.number().optional(),
        officer: z.string().optional(),
        studentAffairsOfficer: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      const department = await ctx.payload.update({
        collection: 'departments',
        id,
        data,
      });

      return {
        ...department,
        officer: department.officer as any,
        studentAffairsOfficer: department.studentAffairsOfficer as any,
      };
    }),

  // Delete department
  delete: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.payload.delete({
        collection: 'departments',
        id: input.id,
      });

      return {
        success: true,
        message: 'Department deleted successfully',
      };
    }),

  // Get department statistics
  getStats: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const department = await ctx.payload.findByID({
        collection: 'departments',
        id: input.id,
      });

      // Get students in this department
      const students = await ctx.payload.find({
        collection: 'users',
        where: {
          role: { equals: 'student' },
          department: { equals: input.id },
        },
        limit: 0, // Get all students
      });

      // Get documents for this department
      const documents = await ctx.payload.find({
        collection: 'documents',
        where: {
          department: { equals: input.id },
        },
        limit: 0, // Get all documents
      });

      // Calculate statistics
      const totalStudents = students.totalDocs;
      const totalDocuments = documents.totalDocs;
      const pendingDocuments = documents.docs.filter(
        (doc) => doc.status === 'pending'
      ).length;
      const approvedDocuments = documents.docs.filter(
        (doc) => doc.status === 'approved'
      ).length;
      const rejectedDocuments = documents.docs.filter(
        (doc) => doc.status === 'rejected'
      ).length;

      return {
        department: {
          id: department.id,
          name: department.name,
          code: department.code,
        },
        statistics: {
          totalStudents,
          totalDocuments,
          pendingDocuments,
          approvedDocuments,
          rejectedDocuments,
          completionRate: totalDocuments > 0 ? (approvedDocuments / totalDocuments) * 100 : 0,
        },
      };
    }),

  // Get departments that can create officers
  getOfficerCreationEnabled: baseProcedure
    .query(async ({ ctx }) => {
      const departments = await ctx.payload.find({
        collection: 'departments',
        where: {
          canAddOfficers: { equals: true },
        },
        depth: 1,
      });

      return {
        ...departments,
        docs: departments.docs.map((dept) => ({
          ...dept,
          officer: dept.officer as any,
          studentAffairsOfficer: dept.studentAffairsOfficer as any,
        })),
      };
    }),

  // Check if department can create more officers
  canCreateOfficer: baseProcedure
    .input(
      z.object({
        departmentId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const department = await ctx.payload.findByID({
        collection: 'departments',
        id: input.departmentId,
      });

      if (!department.canAddOfficers) {
        return {
          canCreate: false,
          reason: 'Department not enabled for officer creation',
        };
      }

      // Check officer limit
      if (department.officerCreationLimit && department.officerCreationLimit > 0) {
        const createdOfficers = department.createdOfficers || [];
        if (createdOfficers.length >= department.officerCreationLimit) {
          return {
            canCreate: false,
            reason: 'Officer creation limit reached',
            currentCount: createdOfficers.length,
            limit: department.officerCreationLimit,
          };
        }
      }

      return {
        canCreate: true,
        currentCount: department.createdOfficers?.length || 0,
        limit: department.officerCreationLimit || 0,
      };
    }),
}); 