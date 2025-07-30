import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { emailService } from '@/lib/emailService';
import type { Sort, Where } from 'payload';

export const usersRouter = createTRPCRouter({
  // Get all users with filtering
  getAll: baseProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        page: z.number().default(1),
        role: z.enum(['student', 'officer', 'student-affairs', 'admin']).optional(),
        department: z.string().optional(),
        status: z.enum(['active', 'inactive', 'suspended']).optional(),
        search: z.string().optional(),
        sort: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Where = {};
      let sort: Sort = '-createdAt';

      // Role filter
      if (input.role) {
        where.role = { equals: input.role };
      }

      // Department filter
      if (input.department) {
        where.department = { equals: input.department };
      }

      // Status filter
      if (input.status) {
        where.status = { equals: input.status };
      }

      // Search filter
      if (input.search) {
        where.or = [
          { name: { like: input.search } },
          { email: { like: input.search } },
          { matricNo: { like: input.search } },
        ];
      }

      // Sort logic
      if (input.sort === 'name') {
        sort = 'name';
      } else if (input.sort === 'email') {
        sort = 'email';
      } else if (input.sort === 'lastLogin') {
        sort = '-lastLogin';
      }

      const users = await ctx.payload.find({
        collection: 'users',
        depth: 1,
        where,
        sort,
        page: input.page,
        limit: input.limit,
      });

      return {
        ...users,
        docs: users.docs.map((user) => ({
          ...user,
          department: user.department as any,
          profileImage: user.profileImage as any,
        })),
      };
    }),

  // Get user by ID
  getById: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.payload.findByID({
        collection: 'users',
        id: input.id,
        depth: 2,
      });

      return {
        ...user,
        department: user.department as any,
        profileImage: user.profileImage as any,
        createdBy: user.createdBy as any,
        createdByDepartment: user.createdByDepartment as any,
      };
    }),

  // Create student
  createStudent: baseProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        matricNo: z.string().min(1),
        department: z.string(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get department name for email
      const department = await ctx.payload.findByID({
        collection: 'departments',
        id: input.department,
      });

      const user = await ctx.payload.create({
        collection: 'users',
        data: {
          ...input,
          role: 'student',
          status: 'active',
          clearanceStatus: 'not-started',
          hasSetPassword: false,
        },
      });

      // Send welcome email
      await emailService.sendWelcomeEmail({
        studentName: user.name,
        studentEmail: user.email,
        matricNo: user.matricNo as string,
        department: department.name,
        magicLink: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${user.id}`,
      });

      return {
        ...user,
        department: user.department as any,
      };
    }),

  // Create officer
  createOfficer: baseProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        role: z.enum(['officer', 'student-affairs']),
        department: z.string(),
        phone: z.string().optional(),
        createdByDepartment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get department name for email
      const department = await ctx.payload.findByID({
        collection: 'departments',
        id: input.department,
      });

      const user = await ctx.payload.create({
        collection: 'users',
        data: {
          ...input,
          status: 'active',
          hasSetPassword: false,
        },
      });

      // Send officer welcome email
      await emailService.sendOfficerWelcomeEmail({
        officerName: user.name,
        officerEmail: user.email,
        department: department.name,
        role: user.role as 'officer' | 'student-affairs',
        magicLink: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${user.id}`,
      });

      // Update department's created officers list
      if (input.createdByDepartment) {
        await ctx.payload.update({
          collection: 'departments',
          id: input.createdByDepartment,
          data: {
            createdOfficers: {
              relationTo: 'users',
              value: user.id,
            },
          },
        });
      }

      return {
        ...user,
        department: user.department as any,
      };
    }),

  // Update user
  update: baseProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        status: z.enum(['active', 'inactive', 'suspended']).optional(),
        department: z.string().optional(),
        matricNo: z.string().optional(),
        clearanceStatus: z.enum(['not-started', 'in-progress', 'completed', 'on-hold']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      const user = await ctx.payload.update({
        collection: 'users',
        id,
        data,
      });

      return {
        ...user,
        department: user.department as any,
        profileImage: user.profileImage as any,
      };
    }),

  // Delete user
  delete: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.payload.delete({
        collection: 'users',
        id: input.id,
      });

      return {
        success: true,
        message: 'User deleted successfully',
      };
    }),

  // Bulk create students
  bulkCreateStudents: baseProcedure
    .input(
      z.object({
        students: z.array(
          z.object({
            name: z.string().min(1),
            email: z.string().email(),
            matricNo: z.string().min(1),
            department: z.string(),
            phone: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const results = [];
      let successCount = 0;
      let errorCount = 0;

      for (const studentData of input.students) {
        try {
          // Get department name
          const department = await ctx.payload.findByID({
            collection: 'departments',
            id: studentData.department,
          });

          const user = await ctx.payload.create({
            collection: 'users',
            data: {
              ...studentData,
              role: 'student',
              status: 'active',
              clearanceStatus: 'not-started',
              hasSetPassword: false,
            },
          });

          // Send welcome email
          await emailService.sendWelcomeEmail({
            studentName: user.name,
            studentEmail: user.email,
            matricNo: user.matricNo as string,
            department: department.name,
            magicLink: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${user.id}`,
          });

          results.push({ success: true, user });
          successCount++;
        } catch (error) {
          results.push({ 
            success: false, 
            error: (error as Error).message, 
            data: studentData 
          });
          errorCount++;
        }
      }

      return {
        results,
        summary: {
          total: input.students.length,
          success: successCount,
          error: errorCount,
        },
      };
    }),

  // Get user statistics
  getStats: baseProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      // Get all users
      const allUsers = await ctx.payload.find({
        collection: 'users',
        limit: 0,
      });

      // Get students
      const students = await ctx.payload.find({
        collection: 'users',
        where: {
          role: { equals: 'student' },
        },
        limit: 0,
      });

      // Get officers
      const officers = await ctx.payload.find({
        collection: 'users',
        where: {
          role: { in: ['officer', 'student-affairs'] },
        },
        limit: 0,
      });

      // Get users who haven't set password
      const usersWithoutPassword = await ctx.payload.find({
        collection: 'users',
        where: {
          hasSetPassword: { equals: false },
        },
        limit: 0,
      });

      return {
        total: allUsers.totalDocs,
        students: students.totalDocs,
        officers: officers.totalDocs,
        admins: allUsers.totalDocs - students.totalDocs - officers.totalDocs,
        usersWithoutPassword: usersWithoutPassword.totalDocs,
        clearanceStats: {
          notStarted: students.docs.filter(u => u.clearanceStatus === 'not-started').length,
          inProgress: students.docs.filter(u => u.clearanceStatus === 'in-progress').length,
          completed: students.docs.filter(u => u.clearanceStatus === 'completed').length,
          onHold: students.docs.filter(u => u.clearanceStatus === 'on-hold').length,
        },
      };
    }),

  // Check if user can access features
  canAccessFeatures: baseProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.payload.findByID({
        collection: 'users',
        id: input.userId,
      });

      if (user.role === 'admin') {
        return { canAccess: true };
      }

      return {
        canAccess: user.hasSetPassword === true,
        hasSetPassword: user.hasSetPassword || false,
      };
    }),
}); 