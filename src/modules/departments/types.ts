import { inferRouterOutputs, inferRouterInputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export type DepartmentsRouterOutputs = inferRouterOutputs<AppRouter>['departments'];
export type DepartmentsRouterInputs = inferRouterInputs<AppRouter>['departments'];

export type GetAllDepartmentsOutput = DepartmentsRouterOutputs['getAll'];
export type GetAllDepartmentsInput = DepartmentsRouterInputs['getAll'];

export type GetDepartmentByIdOutput = DepartmentsRouterOutputs['getById'];
export type GetDepartmentByIdInput = DepartmentsRouterInputs['getById'];

export type CreateDepartmentOutput = DepartmentsRouterOutputs['create'];
export type CreateDepartmentInput = DepartmentsRouterInputs['create'];

export type UpdateDepartmentOutput = DepartmentsRouterOutputs['update'];
export type UpdateDepartmentInput = DepartmentsRouterInputs['update'];

export type DeleteDepartmentOutput = DepartmentsRouterOutputs['delete'];
export type DeleteDepartmentInput = DepartmentsRouterInputs['delete'];

export type GetDepartmentStatsOutput = DepartmentsRouterOutputs['getStats'];
export type GetDepartmentStatsInput = DepartmentsRouterInputs['getStats'];

export type GetOfficerCreationEnabledOutput = DepartmentsRouterOutputs['getOfficerCreationEnabled'];
export type GetOfficerCreationEnabledInput = DepartmentsRouterInputs['getOfficerCreationEnabled'];

export type CanCreateOfficerOutput = DepartmentsRouterOutputs['canCreateOfficer'];
export type CanCreateOfficerInput = DepartmentsRouterInputs['canCreateOfficer'];

// Department type
export type DepartmentType = GetAllDepartmentsOutput['docs'][0];
export type DepartmentStatsType = GetDepartmentStatsOutput; 