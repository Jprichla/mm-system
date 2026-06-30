import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { materialSchema, variantSchema } from '../utils/validators';
import { validarCodigoMaterialPai, validarCodigoVariante } from '../utils/codeValidation';

export async function listarMateriais(req: Request, res: Response): Promise<void> {
  const page = Number(req.query.page ?? 1);
  const pageSize = Math.min(Number(req.query.pageSize ?? 20), 100);
  const search = String(req.query.search ?? '').trim();
  const categoryId = req.query.categoryId ? String(req.query.categoryId) : undefined;

  const where: Prisma.MaterialWhereInput = {
    deletedAt: null,
    ...(categoryId ? { categoryId } : {}),
    ...(search
      ? {
          OR: [
            { code: { contains: search, mode: 'insensitive' } },
            { namePt: { contains: search, mode: 'insensitive' } },
            { nameEn: { contains: search, mode: 'insensitive' } },
            { nameEs: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [total, dados] = await Promise.all([
    prisma.material.count({ where }),
    prisma.material.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        variants: { where: { deletedAt: null } },
      },
    }),
  ]);

  res.json({
    dados,
    paginacao: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

export async function detalharMaterial(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const material = await prisma.material.findFirst({
    where: { id, deletedAt: null },
    include: { category: true, variants: { where: { deletedAt: null } } },
  });

  if (!material) {
    res.status(404).json({ mensagem: 'Material não encontrado.' });
    return;
  }

  res.json({ dados: material });
}

export async function criarMaterial(req: Request, res: Response): Promise<void> {
  const dados = materialSchema.parse(req.body);
  const warning = validarCodigoMaterialPai(dados.code);

  const material = await prisma.material.create({
    data: {
      ...dados,
      codeWarning: warning,
      createdById: req.user?.id,
    },
  });

  res.status(201).json({ mensagem: 'Material criado com sucesso.', dados: material, warning });
}

export async function atualizarMaterial(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const dados = materialSchema.partial().parse(req.body);
  const warning = dados.code ? validarCodigoMaterialPai(dados.code) : undefined;

  const material = await prisma.material.update({
    where: { id },
    data: {
      ...dados,
      ...(warning !== undefined ? { codeWarning: warning } : {}),
    },
  });

  res.json({ mensagem: 'Material atualizado com sucesso.', dados: material, warning });
}

export async function removerMaterial(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);

  const referencias = await prisma.documentItem.count({
    where: {
      variant: {
        materialId: id,
      },
    },
  });

  if (referencias > 0) {
    res.status(409).json({
      mensagem: 'Não é possível excluir material com referências em documentos. Operação de segurança aplicada.',
    });
    return;
  }

  await prisma.material.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  res.json({ mensagem: 'Material removido (soft delete) com sucesso.' });
}

export async function listarVariantes(req: Request, res: Response): Promise<void> {
  const materialId = String(req.params.materialId);
  const dados = await prisma.materialVariant.findMany({
    where: { materialId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ dados });
}

export async function criarVariante(req: Request, res: Response): Promise<void> {
  const materialId = String(req.params.materialId);
  const dados = variantSchema.parse(req.body);
  const warning = validarCodigoVariante(dados.code);

  const variante = await prisma.materialVariant.create({
    data: {
      ...dados,
      materialId,
      codeWarning: warning,
    },
  });

  res.status(201).json({ mensagem: 'Variante criada com sucesso.', dados: variante, warning });
}

export async function atualizarVariante(req: Request, res: Response): Promise<void> {
  const variantId = String(req.params.variantId);
  const dados = variantSchema.partial().parse(req.body);
  const warning = dados.code ? validarCodigoVariante(dados.code) : undefined;

  const variante = await prisma.materialVariant.update({
    where: { id: variantId },
    data: {
      ...dados,
      ...(warning !== undefined ? { codeWarning: warning } : {}),
    },
  });

  res.json({ mensagem: 'Variante atualizada com sucesso.', dados: variante, warning });
}

export async function removerVariante(req: Request, res: Response): Promise<void> {
  const variantId = String(req.params.variantId);

  const referencias = await prisma.documentItem.count({ where: { variantId } });
  if (referencias > 0) {
    res.status(409).json({
      mensagem: 'Não é possível excluir variante com referências em documentos.',
    });
    return;
  }

  await prisma.materialVariant.update({
    where: { id: variantId },
    data: { deletedAt: new Date() },
  });

  res.json({ mensagem: 'Variante removida (soft delete) com sucesso.' });
}
