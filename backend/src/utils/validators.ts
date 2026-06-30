import { Role, ProjectStatus, DocumentType } from '@prisma/client';
import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres.'),
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres.'),
  role: z.nativeEnum(Role).optional(),
  companyId: z.string().uuid('companyId inválido.').optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'Senha é obrigatória.'),
});

export const updateUserAccessSchema = z.object({
  role: z.nativeEnum(Role),
  companyId: z.string().uuid('companyId inválido.').optional().nullable(),
});

export const categorySchema = z.object({
  namePt: z.string().min(2),
  nameEn: z.string().optional().nullable(),
  nameEs: z.string().optional().nullable(),
});

export const materialSchema = z.object({
  code: z.string().min(2),
  namePt: z.string().min(2),
  nameEn: z.string().optional().nullable(),
  nameEs: z.string().optional().nullable(),
  descriptionPt: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  descriptionEs: z.string().optional().nullable(),
  categoryId: z.string().uuid(),
});

export const variantSchema = z.object({
  code: z.string().min(2),
  namePt: z.string().min(2),
  nameEn: z.string().optional().nullable(),
  nameEs: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
});

export const projectSchema = z.object({
  code: z.string().min(3),
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(ProjectStatus).optional(),
  companyId: z.string().uuid().optional().nullable(),
});

export const documentSchema = z.object({
  code: z.string().min(2),
  title: z.string().min(2),
  type: z.nativeEnum(DocumentType),
  revision: z.string().optional(),
});

export const typicalDetailSchema = z.object({
  code: z.string().min(2),
  namePt: z.string().min(2),
  nameEn: z.string().optional().nullable(),
  nameEs: z.string().optional().nullable(),
  descriptionPt: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  descriptionEs: z.string().optional().nullable(),
});

export const typicalDetailComponentSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().positive().or(z.string().transform(Number)),
});

export const documentItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().positive().or(z.string().transform(Number)),
  unitPrice: z.number().positive().optional().nullable().or(z.string().transform(Number).optional()),
  totalPrice: z.number().positive().optional().nullable().or(z.string().transform(Number).optional()),
});
