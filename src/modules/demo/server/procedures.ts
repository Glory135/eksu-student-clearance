import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { z } from 'zod';

export const demoRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
});