import { createTRPCRouter } from "../init";
import { demoRouter } from "@/modules/demo/server/procedures";
import { authRouter } from "@/modules/auth/server/procedures";
import { departmentsRouter } from "@/modules/departments/server/procedures";
import { usersRouter } from "@/modules/users/server/procedures";
import { documentsRouter } from "@/modules/documents/server/procedures";
import { clearanceRouter } from "@/modules/clearance/server/procedures";

export const appRouter = createTRPCRouter({
  demo: demoRouter,
  auth: authRouter,
  departments: departmentsRouter,
  users: usersRouter,
  documents: documentsRouter,
  clearance: clearanceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;