import type { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      email: string;
      role: Role;
      companyId?: string | null;
    }

    interface Request {
      user?: UserPayload;
      auditBefore?: unknown;
    }
  }
}

export {};
