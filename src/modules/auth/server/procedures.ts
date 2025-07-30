import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { emailService } from '@/lib/emailService';

export const authRouter = createTRPCRouter({
  // Send magic link for password setup
  sendMagicLink: baseProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Find user by email
        const user = await ctx.payload.find({
          collection: 'users',
          where: {
            email: { equals: input.email },
          },
          limit: 1,
        });

        if (!user.docs.length) {
          throw new Error('User not found');
        }

        const userDoc = user.docs[0];

        // Generate magic link token (this would be handled by Payload's auth)
        const token = 'temp-token'; // TODO: Implement proper token generation

        // Send appropriate welcome email based on role
        if (userDoc.role === 'student') {
          await emailService.sendWelcomeEmail({
            studentName: userDoc.name,
            studentEmail: userDoc.email,
            matricNo: userDoc.matricNo || 'N/A',
            department: 'Unknown Department', // TODO: Get department name
            magicLink: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`,
          });
        } else if (['officer', 'student-affairs'].includes(userDoc.role)) {
          await emailService.sendOfficerWelcomeEmail({
            officerName: userDoc.name,
            officerEmail: userDoc.email,
            department: 'Unknown Department', // TODO: Get department name
            role: userDoc.role as 'officer' | 'student-affairs',
            magicLink: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`,
          });
        }

        return {
          success: true,
          message: 'Magic link sent successfully',
        };
      } catch (error) {
        throw new Error('Failed to send magic link');
      }
    }),

  // Verify magic link and set password
  verifyMagicLink: baseProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Implement proper token verification
        // For now, we'll simulate the process
        
        // Find user by token (this would be decoded from the token)
        const user = await ctx.payload.find({
          collection: 'users',
          where: {
            // This would be based on token verification
            email: { equals: 'temp@example.com' },
          },
          limit: 1,
        });

        if (!user.docs.length) {
          throw new Error('Invalid token');
        }

        const userDoc = user.docs[0];

        // Update user with new password and mark as having set password
        await ctx.payload.update({
          collection: 'users',
          id: userDoc.id,
          data: {
            password: input.password,
            hasSetPassword: true,
            passwordSetAt: new Date().toISOString(),
          },
        });

        return {
          success: true,
          message: 'Password set successfully',
          user: {
            id: userDoc.id,
            name: userDoc.name,
            email: userDoc.email,
            role: userDoc.role,
          },
        };
      } catch (error) {
        throw new Error('Failed to verify magic link');
      }
    }),

  // Send password reset email
  sendPasswordReset: baseProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Find user by email
        const user = await ctx.payload.find({
          collection: 'users',
          where: {
            email: { equals: input.email },
          },
          limit: 1,
        });

        if (!user.docs.length) {
          throw new Error('User not found');
        }

        const userDoc = user.docs[0];

        // Generate reset token (this would be handled by Payload's auth)
        const resetToken = 'temp-reset-token'; // TODO: Implement proper token generation

        // Send password reset email
        await emailService.sendPasswordResetEmail({
          studentName: userDoc.name,
          studentEmail: userDoc.email,
          resetLink: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`,
          requestedAt: new Date().toISOString(),
        });

        return {
          success: true,
          message: 'Password reset email sent successfully',
        };
      } catch (error) {
        throw new Error('Failed to send password reset email');
      }
    }),

  // Reset password with token
  resetPassword: baseProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Implement proper token verification
        // For now, we'll simulate the process
        
        // Find user by token (this would be decoded from the token)
        const user = await ctx.payload.find({
          collection: 'users',
          where: {
            // This would be based on token verification
            email: { equals: 'temp@example.com' },
          },
          limit: 1,
        });

        if (!user.docs.length) {
          throw new Error('Invalid token');
        }

        const userDoc = user.docs[0];

        // Update user with new password
        await ctx.payload.update({
          collection: 'users',
          id: userDoc.id,
          data: {
            password: input.password,
          },
        });

        return {
          success: true,
          message: 'Password reset successfully',
        };
      } catch (error) {
        throw new Error('Failed to reset password');
      }
    }),

  // Get current user
  getCurrentUser: baseProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      // TODO: Implement proper user session handling
      // For now, return a mock user
      return {
        id: 'user_123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student',
        hasSetPassword: true,
      };
    }),

  // Check if user has set password
  hasSetPassword: baseProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.payload.findByID({
          collection: 'users',
          id: input.userId,
        });

        return {
          hasSetPassword: user.hasSetPassword || false,
        };
      } catch (error) {
        return {
          hasSetPassword: false,
        };
      }
    }),
}); 