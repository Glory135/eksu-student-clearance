import { inferRouterOutputs, inferRouterInputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export type DocumentsRouterOutputs = inferRouterOutputs<AppRouter>['documents'];
export type DocumentsRouterInputs = inferRouterInputs<AppRouter>['documents'];

export type GetAllDocumentsOutput = DocumentsRouterOutputs['getAll'];
export type GetAllDocumentsInput = DocumentsRouterInputs['getAll'];

export type GetDocumentByIdOutput = DocumentsRouterOutputs['getById'];
export type GetDocumentByIdInput = DocumentsRouterInputs['getById'];

export type UploadDocumentOutput = DocumentsRouterOutputs['upload'];
export type UploadDocumentInput = DocumentsRouterInputs['upload'];

export type ReviewDocumentOutput = DocumentsRouterOutputs['review'];
export type ReviewDocumentInput = DocumentsRouterInputs['review'];

export type DeleteDocumentOutput = DocumentsRouterOutputs['delete'];
export type DeleteDocumentInput = DocumentsRouterInputs['delete'];

export type GetDocumentsByStudentOutput = DocumentsRouterOutputs['getByStudent'];
export type GetDocumentsByStudentInput = DocumentsRouterInputs['getByStudent'];

export type GetDocumentsByDepartmentOutput = DocumentsRouterOutputs['getByDepartment'];
export type GetDocumentsByDepartmentInput = DocumentsRouterInputs['getByDepartment'];

export type GetDocumentStatsOutput = DocumentsRouterOutputs['getStats'];
export type GetDocumentStatsInput = DocumentsRouterInputs['getStats'];

// Document types
export type DocumentType = GetAllDocumentsOutput['docs'][0];
export type DocumentStatsType = GetDocumentStatsOutput; 