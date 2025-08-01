import { inferRouterOutputs, inferRouterInputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export type ClearanceRouterOutputs = inferRouterOutputs<AppRouter>['clearance'];
export type ClearanceRouterInputs = inferRouterInputs<AppRouter>['clearance'];

export type GetStudentClearanceOutput = ClearanceRouterOutputs['getStudentClearance'];
export type GetStudentClearanceInput = ClearanceRouterInputs['getStudentClearance'];

export type GetAllClearanceProgressInfiniteOutput = ClearanceRouterOutputs['getAllClearanceProgressInfinite'];
export type GetAllClearanceProgressInfiniteInput = ClearanceRouterInputs['getAllClearanceProgressInfinite'];

export type GetAllClearanceProgressOutput = ClearanceRouterOutputs['getAllClearanceProgress'];
export type GetAllClearanceProgressInput = ClearanceRouterInputs['getAllClearanceProgress'];

export type UpdateClearanceStatusOutput = ClearanceRouterOutputs['updateClearanceStatus'];
export type UpdateClearanceStatusInput = ClearanceRouterInputs['updateClearanceStatus'];

export type MarkClearanceCompletedOutput = ClearanceRouterOutputs['markClearanceCompleted'];
export type MarkClearanceCompletedInput = ClearanceRouterInputs['markClearanceCompleted'];

export type GetClearanceStatsOutput = ClearanceRouterOutputs['getClearanceStats'];
export type GetClearanceStatsInput = ClearanceRouterInputs['getClearanceStats'];

export type GetClearanceTimelineOutput = ClearanceRouterOutputs['getClearanceTimeline'];
export type GetClearanceTimelineInput = ClearanceRouterInputs['getClearanceTimeline'];

export type LogClearanceActionOutput = ClearanceRouterOutputs['logClearanceAction'];
export type LogClearanceActionInput = ClearanceRouterInputs['logClearanceAction'];

// Clearance types
export type StudentClearanceType = GetStudentClearanceOutput;
export type ClearanceProgressType = GetAllClearanceProgressOutput;
export type ClearanceProgressInfiniteType = GetAllClearanceProgressInfiniteOutput;
export type ClearanceStatsType = GetClearanceStatsOutput;
export type ClearanceTimelineType = GetClearanceTimelineOutput; 