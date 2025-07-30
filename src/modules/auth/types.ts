import { inferRouterOutputs, inferRouterInputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export type AuthRouterOutputs = inferRouterOutputs<AppRouter>['auth'];
export type AuthRouterInputs = inferRouterInputs<AppRouter>['auth'];

export type SendMagicLinkOutput = AuthRouterOutputs['sendMagicLink'];
export type SendMagicLinkInput = AuthRouterInputs['sendMagicLink'];

export type VerifyMagicLinkOutput = AuthRouterOutputs['verifyMagicLink'];
export type VerifyMagicLinkInput = AuthRouterInputs['verifyMagicLink'];

export type SendPasswordResetOutput = AuthRouterOutputs['sendPasswordReset'];
export type SendPasswordResetInput = AuthRouterInputs['sendPasswordReset'];

export type ResetPasswordOutput = AuthRouterOutputs['resetPassword'];
export type ResetPasswordInput = AuthRouterInputs['resetPassword'];

export type GetCurrentUserOutput = AuthRouterOutputs['getCurrentUser'];
export type GetCurrentUserInput = AuthRouterInputs['getCurrentUser'];

export type HasSetPasswordOutput = AuthRouterOutputs['hasSetPassword'];
export type HasSetPasswordInput = AuthRouterInputs['hasSetPassword']; 