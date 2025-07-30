import { initTRPC } from '@trpc/server';
import { cache } from 'react';
import { getPayload } from 'payload';
import config from '../payload.config';
import superjson from 'superjson';

// Context factory with Payload CMS
export const createTRPCContext = cache(async () => {
  const payload = await getPayload({ config });
  
  return { 
    payload, // Payload CMS instance
    userId: 'user_123', // TODO: Add proper auth logic
  };
});

// Initialize tRPC with superjson transformer
const t = initTRPC.create({
  transformer: superjson, // Handles Date, BigInt, etc.
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

// Base procedure with Payload middleware
export const baseProcedure = t.procedure.use(async ({ next }) => {
  const payload = await getPayload({ config });
  return next({ ctx: { payload } });
});