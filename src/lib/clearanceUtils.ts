import type { Payload } from 'payload';

export interface ClearanceRecordData {
  student: string;
  department: string;
  recordType: 'document-upload' | 'document-review' | 'document-approval' | 'document-rejection' | 'department-clearance' | 'final-clearance' | 'system-action';
  status: 'success' | 'pending' | 'failed' | 'cancelled';
  actionBy?: string;
  document?: string;
  requirement?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export async function createClearanceRecord(
  payload: Payload,
  data: ClearanceRecordData
) {
  try {
    const record = await payload.create({
      collection: 'clearance-records',
      data: {
        ...data,
        createdAt: new Date().toISOString(),
      },
    });
    return record;
  } catch (error) {
    console.error('Failed to create clearance record:', error);
    throw error;
  }
}

export async function logDocumentUpload(
  payload: Payload,
  studentId: string,
  departmentId: string,
  documentId: string,
  requirementId: string,
  actionBy?: string
) {
  return createClearanceRecord(payload, {
    student: studentId,
    department: departmentId,
    recordType: 'document-upload',
    status: 'success',
    actionBy,
    document: documentId,
    requirement: requirementId,
    description: 'Document uploaded successfully',
  });
}

export async function logDocumentReview(
  payload: Payload,
  studentId: string,
  departmentId: string,
  documentId: string,
  requirementId: string,
  action: 'approve' | 'reject',
  actionBy: string,
  notes?: string
) {
  return createClearanceRecord(payload, {
    student: studentId,
    department: departmentId,
    recordType: action === 'approve' ? 'document-approval' : 'document-rejection',
    status: 'success',
    actionBy,
    document: documentId,
    requirement: requirementId,
    description: `Document ${action}d${notes ? `: ${notes}` : ''}`,
  });
}

export async function logDepartmentClearance(
  payload: Payload,
  studentId: string,
  departmentId: string,
  actionBy: string
) {
  return createClearanceRecord(payload, {
    student: studentId,
    department: departmentId,
    recordType: 'department-clearance',
    status: 'success',
    actionBy,
    description: 'Department clearance completed',
  });
}

export async function logFinalClearance(
  payload: Payload,
  studentId: string,
  actionBy: string
) {
  return createClearanceRecord(payload, {
    student: studentId,
    department: 'final', // Special department for final clearance
    recordType: 'final-clearance',
    status: 'success',
    actionBy,
    description: 'Final clearance completed',
  });
}

export async function getStudentClearanceHistory(
  payload: Payload,
  studentId: string
) {
  try {
    const records = await payload.find({
      collection: 'clearance-records',
      where: {
        student: { equals: studentId },
      },
      sort: '-createdAt',
      depth: 1,
    });
    return records;
  } catch (error) {
    console.error('Failed to get clearance history:', error);
    throw error;
  }
}

export async function getDepartmentClearanceStats(
  payload: Payload,
  departmentId: string
) {
  try {
    const records = await payload.find({
      collection: 'clearance-records',
      where: {
        department: { equals: departmentId },
        recordType: { equals: 'department-clearance' },
        status: { equals: 'success' },
      },
      limit: 1000, // Get all records for stats
    });
    
    return {
      totalClearances: records.docs.length,
      recentClearances: records.docs.filter(
        (record) => {
          const recordDate = new Date(record.createdAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return recordDate >= thirtyDaysAgo;
        }
      ).length,
    };
  } catch (error) {
    console.error('Failed to get department stats:', error);
    throw error;
  }
} 