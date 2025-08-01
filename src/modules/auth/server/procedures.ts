import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { emailService } from '@/lib/emailService';
import { headers as getHeaders } from "next/headers";
import { Department, User } from '@/payload-types';
import { TRPCError } from '@trpc/server';
import {
  generateAuthCookies,
  generateMagicLinkToken,
  generatePasswordResetToken,
  getUserFromToken,
  clearAuthCookies
} from '../utils';


export const authRouter = createTRPCRouter({
  session: baseProcedure.query(async ({ ctx }) => {
    const headers = await getHeaders();
    const session = await ctx.payload.auth({ headers });
    return session;
  }),

  login: baseProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
      })
    )
    .mutation(
      async ({ input, ctx }) => {
        try {
          const data = await ctx.payload.login({
            collection: "users",
            data: {
              email: input.email,
              password: input.password
            },
          });

          if (!data.token) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Invalid email or password"
            })
          }

          // Check if user has set password (for students)
          const user = data.user as User;
          if ((
            user.role === 'student' || user.role === "officer" || user.role === "student-affairs"
          ) && !user.hasSetPassword) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Please set your password first using the magic link sent to your email"
            })
          }

          await generateAuthCookies({
            prefix: ctx.payload.config.cookiePrefix,
            value: data.token
          })

          return data
        } catch (error) {
          if (error instanceof TRPCError) {
            throw error;
          }
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password"
          })
        }
      }
    ),

  logout: baseProcedure.mutation(async ({ ctx }) => {
    await clearAuthCookies(ctx.payload.config.cookiePrefix);
    return { success: true };
  }),

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
          depth: 1,
          collection: 'users',
          where: {
            email: { equals: input.email },
          },
          limit: 1,
        });

        if (!user.docs.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found"
          });
        }

        const userDoc = { ...(user.docs[0] as User), department: user.docs[0].department as Department };

        // Generate magic link token
        const token = generateMagicLinkToken(userDoc);

        // Send appropriate welcome email based on role
        if (userDoc.role === 'student') {
          await emailService.sendWelcomeEmail({
            studentName: `${userDoc.lastName} ${userDoc.firstName}`,
            studentEmail: userDoc.email,
            matricNo: userDoc.matricNo || 'N/A',
            department: userDoc.department?.name || 'Unknown Department',
            magicLink: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`,
          });
        } else if (['officer', 'student-affairs'].includes(userDoc.role)) {
          await emailService.sendOfficerWelcomeEmail({
            officerName: `${userDoc.lastName} ${userDoc.firstName}`,
            officerEmail: userDoc.email,
            department: userDoc.department?.name || 'Unknown Department',
            role: userDoc.role as 'officer' | 'student-affairs',
            magicLink: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`,
          });
        }

        return {
          success: true,
          message: 'Magic link sent successfully',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send magic link"
        });
      }
    }),

  // Verify magic link and set password
  verifyMagicLink: baseProcedure
    .input(
      z.object({
        token: z.string(),
        password: z
          .string()
          .min(8, "password must be at least 8 characters long.")
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ,
            "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @, $, !, %, , ?, &)."
          ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify token and get user
        const user = await getUserFromToken(input.token, ctx.payload);

        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid or expired token"
          });
        }

        // Update user with new password and mark as having set password
        const updatedUser = await ctx.payload.update({
          collection: 'users',
          id: user.id,
          data: {
            password: input.password,
            hasSetPassword: true,
            passwordSetAt: new Date().toISOString(),
          },
        });

        // Generate session token for immediate login
        const loginData = await ctx.payload.login({
          collection: "users",
          data: {
            email: user.email,
            password: input.password
          },
        });

        if (loginData.token) {
          await generateAuthCookies({
            prefix: ctx.payload.config.cookiePrefix,
            value: loginData.token
          });
        }

        return {
          success: true,
          message: 'Password set successfully',
          user: {
            id: updatedUser.id,
            name: `${updatedUser.lastName} ${updatedUser.firstName}`,
            email: updatedUser.email,
            role: updatedUser.role,
            department: updatedUser.department,
            matricNo: updatedUser.matricNo,
          },
          token: loginData.token,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify magic link"
        });
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
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found"
          });
        }

        const userDoc = user.docs[0] as User;

        // Generate reset token
        const resetToken = generatePasswordResetToken(userDoc);

        // Send password reset email
        await emailService.sendPasswordResetEmail({
          studentName: `${userDoc.lastName} ${userDoc.firstName}`,
          studentEmail: userDoc.email,
          resetLink: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`,
          requestedAt: new Date().toISOString(),
        });

        return {
          success: true,
          message: 'Password reset email sent successfully',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send password reset email"
        });
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
        // Verify token and get user
        const user = await getUserFromToken(input.token, ctx.payload);

        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid or expired token"
          });
        }

        // Update user with new password
        await ctx.payload.update({
          collection: 'users',
          id: user.id,
          data: {
            password: input.password,
          },
        });

        return {
          success: true,
          message: 'Password reset successfully',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reset password"
        });
      }
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

  // Verify token validity
  verifyToken: baseProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const user = await getUserFromToken(input.token, ctx.payload);
        return {
          valid: !!user,
          user: user ? {
            id: user.id,
            name: `${user.lastName} ${user.firstName}`,
            email: user.email,
            role: user.role,
          } : null,
        };
      } catch (error) {
        return {
          valid: false,
          user: null,
        };
      }
    }),
}); 