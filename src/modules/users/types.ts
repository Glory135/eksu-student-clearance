import { inferRouterOutputs, inferRouterInputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export type UsersRouterOutputs = inferRouterOutputs<AppRouter>['users'];
export type UsersRouterInputs = inferRouterInputs<AppRouter>['users'];

export type GetAllUsersOutput = UsersRouterOutputs['getAll'];
export type GetAllUsersInput = UsersRouterInputs['getAll'];

export type GetUserByIdOutput = UsersRouterOutputs['getById'];
export type GetUserByIdInput = UsersRouterInputs['getById'];

export type CreateStudentOutput = UsersRouterOutputs['createStudent'];
export type CreateStudentInput = UsersRouterInputs['createStudent'];

export type CreateOfficerOutput = UsersRouterOutputs['createOfficer'];
export type CreateOfficerInput = UsersRouterInputs['createOfficer'];

export type UpdateUserOutput = UsersRouterOutputs['update'];
export type UpdateUserInput = UsersRouterInputs['update'];

export type DeleteUserOutput = UsersRouterOutputs['delete'];
export type DeleteUserInput = UsersRouterInputs['delete'];

export type BulkCreateStudentsOutput = UsersRouterOutputs['bulkCreateStudents'];
export type BulkCreateStudentsInput = UsersRouterInputs['bulkCreateStudents'];

export type GetUserStatsOutput = UsersRouterOutputs['getStats'];
export type GetUserStatsInput = UsersRouterInputs['getStats'];

export type CanAccessFeaturesOutput = UsersRouterOutputs['canAccessFeatures'];
export type CanAccessFeaturesInput = UsersRouterInputs['canAccessFeatures'];

// User types
export type UserType = GetAllUsersOutput['docs'][0];
export type UserStatsType = GetUserStatsOutput; 