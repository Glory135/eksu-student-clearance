// import type { Access, FieldAccess } from 'payload/types';
import { type FieldAccess, type Access } from 'payload';

// Check if user is an admin
export const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === 'admin';
};

// Check if user is an admin or the user themselves
export const isAdminOrSelf: Access = ({ req: { user }, id }) => {
  if (user?.role === 'admin') return true;
  if (user?.id === id) return true;
  return false;
};

// Check if user is an officer
export const isOfficer: Access = ({ req: { user } }) => {
  return user?.role === 'officer' || user?.role === 'admin';
};

// Check if user is a student affairs officer
export const isStudentAffairs: Access = ({ req: { user } }) => {
  return user?.role === 'student-affairs' || user?.role === 'admin';
};

// Check if user can view documents
export const canViewDocuments: Access = ({ req: { user } }) => {
  if (!user) return false;
  return ['student', 'officer', 'student-affairs', 'admin'].includes(user.role);
};

// Check if user can upload documents
export const canUploadDocuments: Access = ({ req: { user } }) => {
  if (!user) return false;
  return user.role === 'student';
};

// Check if user can review documents
export const canReviewDocuments: Access = ({ req: { user } }) => {
  if (!user) return false;
  return ['officer', 'student-affairs', 'admin'].includes(user.role);
};

// Check if student has set their password
export const hasStudentSetPassword: Access = ({ req: { user } }) => {
  if (!user || user.role !== 'student') return false;
  return (user as any).hasSetPassword === true;
};

// Check if officer has set their password
export const hasOfficerSetPassword: Access = ({ req: { user } }) => {
  if (!user || !['officer', 'student-affairs'].includes(user.role)) return false;
  return (user as any).hasSetPassword === true;
};

// Check if user can access features (must have set password)
export const canAccessFeatures: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user.role === 'admin') return true; // Admins can always access
  return (user as any).hasSetPassword === true;
};

// Check if user can access student features (must have set password)
export const canAccessStudentFeatures: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user.role !== 'student') return true; // Officers and admins can access
  return (user as any).hasSetPassword === true;
};

// Check if user can access officer features (must have set password)
export const canAccessOfficerFeatures: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user.role === 'admin') return true; // Admins can always access
  if (!['officer', 'student-affairs'].includes(user.role)) return false;
  return (user as any).hasSetPassword === true;
};

// Check if department can create officers
export const canDepartmentCreateOfficers: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user.role === 'admin') return true; // Admins can always create officers
  
  // Officers can create other officers if their department allows it
  if (['officer', 'student-affairs'].includes(user.role)) {
    // This would check if the user's department has canAddOfficers enabled
    // For now, we'll allow officers to create other officers
    return true;
  }
  
  return false;
};

// Check if user can create users in their department
export const canCreateUsersInDepartment: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user.role === 'admin') return true; // Admins can create any user
  
  // Officers can create users in their own department
  if (['officer', 'student-affairs'].includes(user.role)) {
    return true; // This would be further restricted by department
  }
  
  return false;
};

// Field-level access controls
export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) => {
  return user?.role === 'admin';
};

export const isAdminOrSelfFieldLevel: FieldAccess = ({ req: { user }, id }) => {
  if (user?.role === 'admin') return true;
  if (user?.id === id) return true;
  return false;
};

// Check if user can view password-related fields
export const canViewPasswordFields: FieldAccess = ({ req: { user }, id }) => {
  if (user?.role === 'admin') return true;
  if (user?.id === id) return true;
  return false;
};

// Check if user can view department creation fields
export const canViewDepartmentCreationFields: FieldAccess = ({ req: { user } }) => {
  if (user?.role === 'admin') return true;
  if (['officer', 'student-affairs'].includes(user?.role || '')) return true;
  return false;
}; 