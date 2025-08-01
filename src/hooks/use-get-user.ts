"use client"

import { Department, User } from "@/payload-types"
import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"

const useGetUser = () => {
  const trpc = useTRPC()
  const session = useQuery(trpc.auth.session.queryOptions())

  const user = session?.data?.user as User;
  const department = session?.data?.user?.department as Department;

  return {
    user: user ? {
      id: user.id,
      name: `${user.lastName} ${user.firstName}`,
      email: user.email,
      role: user.role,
      department: department?.name || '',
      departmentId: department?.id || '',
      matricNo: user.matricNo,
      hasSetPassword: user.hasSetPassword,
      status: user.status,
    } : null,
    isLoading: session?.isLoading as boolean,
    isError: session?.isError as boolean,
    error: session?.error,
    isAuthenticated: !!user
  }
}

export default useGetUser

export type UserType = ReturnType<typeof useGetUser>['user']