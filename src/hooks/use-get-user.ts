"use client"

import { Department, User } from "@/payload-types"
import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"

const useGetUser = () => {
  const trpc = useTRPC()
  const session = useQuery(trpc.auth.session.queryOptions())

  return {
    user: {
      ...(session?.data?.user as User),
      department: (session?.data?.user?.department as Department)
    },
    isLoading: session?.isLoading as boolean,
    isError: session?.isError as boolean,
    error: session?.error
  }
}

export default useGetUser