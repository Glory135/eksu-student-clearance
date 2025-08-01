import { initTRPC } from '@trpc/server';
import { cache } from 'react';
import { getPayload } from 'payload';
import config from '../payload.config';
import superjson from 'superjson';
import { headers } from 'next/headers';
import type { User } from '@/payload-types';

// Context factory with Payload CMS and authentication
export const createTRPCContext = cache(async () => {
  const payload = await getPayload({ config });
  
  // Get headers for authentication
  const headersList = await headers();
  
  // Get authenticated user from Payload
  let user: User | null = null;
  try {
    const session = await payload.auth({ headers: headersList });
    user = session.user as User || null;
  } catch (error) {
    // User is not authenticated
    user = null;
  }
  
  return { 
    payload, // Payload CMS instance
    user, // Authenticated user or null
  };
});

// Initialize tRPC with superjson transformer
const t = initTRPC.create({
  transformer: superjson, // Handles Date, BigInt, etc.
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

// Base procedure with Payload middleware and authentication
export const baseProcedure = t.procedure.use(async ({ next }) => {
  const payload = await getPayload({ config });
  
  // Get headers for authentication
  const headersList = await headers();
  
  // Get authenticated user from Payload
  let user: User | null = null;
  try {
    const session = await payload.auth({ headers: headersList });
    user = session.user as User || null;
  } catch (error) {
    // User is not authenticated
    user = null;
  }
  
  return next({ ctx: { payload, user } });
});