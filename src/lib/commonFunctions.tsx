import { GraduationCap, Shield, User, Users } from "lucide-react";
import { USER_ROLES } from "./constatnts";
import { USER_ROLE_TYPE } from "./types";

export const getRoleLabel = (role?: USER_ROLE_TYPE) => {
  switch (role) {
    case USER_ROLES.student:
      return USER_ROLES.student;
    case USER_ROLES.officer:
      return 'Clearance Officer';
    case USER_ROLES.admin:
      return 'System Administrator';
    default:
      return null;
  }
};

export const getRoleIcon = (role?: USER_ROLE_TYPE) => {
  switch (role) {
    case USER_ROLES.student:
      return <GraduationCap className="h-4 w-4" />;
    case USER_ROLES.officer:
      return <Shield className="h-4 w-4" />;
    case USER_ROLES.admin:
      return <Users className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};