import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { documentSchema } from '../utils/validators';

export async function listarDocumentos(req: Request, res: Response): Promise<void> {
  const page = Number(req.query.page ?? 1);
  const pageSize = Math.min(Number(req.query.pageSize ?? 20), 100);
  const projectId = req.query.projectId ? String(req.query.projectId) : undefined;

  const where: Prisma.DocumentWhereInput = {
    deletedAt: null,
    ...(projectId ? { projectId } : {}),
  };

  const [total, dados] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.findMany({
      where,
      include: {
        project: true,
        items: {
          include: { variant: true },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  res.json({ dados, paginacao: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}

export async function detalharDocumento(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const documento = await prisma.document.findFirst({
    where: { id, deletedAt: null },
    include: {
      project: true,
      items: {
        orderBy: { lineNumber: 'asc' },
        include: { variant: true },
      },
    },
  });

  if (!documento) {
    res.status(404).json({ mensagem: 'Documento não encontrado.' });
    return;
  }

  const projeto = await prisma.project.findUnique({ where: { id: documento.projectId } });
  if (req.user?.role === 'cliente' && projeto?.companyId !== req.user.companyId) {
    res.status(403).json({ mensagem: 'Acesso negado ao documento solicitado.' });
    return;
  }

  res.json({ dados: documento });
}

export async function criarDocumento(req: Request, res: Response): Promise<void> {
  const schemaCriarDocumento = documentSchema.extend({
    projectId: z.string().uuid('projectId inválido.'),
  });

  const dados = schemaCriarDocumento.parse(req.body);

  const projeto = await prisma.project.findFirst({ where: { id: dados.projectId, deletedAt: null } });
  if (!projeto) {
    res.status(404).json({ mensagem: 'Projeto não encontrado para vínculo do documento.' });
    return;
  }

  const documento = await prisma.document.create({
    data: {
      projectId: dados.projectId,
      code: dados.code,
      title: dados.title,
      type: dados.type,
      revision: dados.revision ?? '00',
      createdById: req.user?.id,
    },
  });

  res.status(201).json({ mensagem: 'Documento criado com sucesso.', dados: documento });
}

export async function atualizarDocumento(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const dados = documentSchema.partial().parse(req.body);

  const documento = await prisma.document.update({
    where: { id },
    data: dados,
  });

  res.json({ mensagem: 'Documento atualizado com sucesso.', dados: documento });
}

export async function removerDocumento(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  await prisma.document.update({ where: { id }, data: { deletedAt: new Date() } });
  res.json({ mensagem: 'Documento removido (soft delete) com sucesso.' });
}
