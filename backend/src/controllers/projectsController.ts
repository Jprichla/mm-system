import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { projectSchema } from '../utils/validators';

export async function listarProjetos(req: Request, res: Response): Promise<void> {
  const page = Number(req.query.page ?? 1);
  const pageSize = Math.min(Number(req.query.pageSize ?? 20), 100);
  const search = String(req.query.search ?? '').trim();

  const where: Prisma.ProjectWhereInput = {
    deletedAt: null,
    ...(req.user?.role === 'cliente' ? { companyId: req.user.companyId ?? '__SEM_EMPRESA__' } : {}),
    ...(req.user?.role === 'usuario' ? { createdById: req.user.id } : {}),
    ...(search
      ? {
          OR: [
            { code: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [total, dados] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      include: { company: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  res.json({
    dados,
    paginacao: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function detalharProjeto(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const projeto = await prisma.project.findFirst({
    where: { id, deletedAt: null },
    include: { company: true, documents: { where: { deletedAt: null } } },
  });

  if (!projeto) {
    res.status(404).json({ mensagem: 'Projeto não encontrado.' });
    return;
  }

  if (req.user?.role === 'cliente' && projeto.companyId !== req.user.companyId) {
    res.status(403).json({ mensagem: 'Acesso negado ao projeto solicitado.' });
    return;
  }

  if (req.user?.role === 'usuario' && projeto.createdById !== req.user.id) {
    res.status(403).json({ mensagem: 'Acesso negado ao projeto solicitado.' });
    return;
  }

  res.json({ dados: projeto });
}

export async function criarProjeto(req: Request, res: Response): Promise<void> {
  const dados = projectSchema.parse(req.body);
  const projeto = await prisma.project.create({
    data: {
      ...dados,
      createdById: req.user?.id,
      companyId: req.user?.role === 'cliente' ? req.user.companyId : dados.companyId,
    },
  });

  res.status(201).json({ mensagem: 'Projeto criado com sucesso.', dados: projeto });
}

export async function atualizarProjeto(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const dados = projectSchema.partial().parse(req.body);

  const projetoAtual = await prisma.project.findUnique({ where: { id } });
  if (!projetoAtual || projetoAtual.deletedAt) {
    res.status(404).json({ mensagem: 'Projeto não encontrado.' });
    return;
  }

  if (req.user?.role === 'cliente' && projetoAtual.companyId !== req.user.companyId) {
    res.status(403).json({ mensagem: 'Acesso negado para atualizar este projeto.' });
    return;
  }

  const projeto = await prisma.project.update({
    where: { id },
    data: dados,
  });

  res.json({ mensagem: 'Projeto atualizado com sucesso.', dados: projeto });
}

export async function removerProjeto(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);

  const projetoAtual = await prisma.project.findUnique({ where: { id } });
  if (!projetoAtual || projetoAtual.deletedAt) {
    res.status(404).json({ mensagem: 'Projeto não encontrado.' });
    return;
  }

  if (req.user?.role === 'cliente' && projetoAtual.companyId !== req.user.companyId) {
    res.status(403).json({ mensagem: 'Acesso negado para excluir este projeto.' });
    return;
  }

  await prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
  res.json({ mensagem: 'Projeto removido (soft delete) com sucesso.' });
}
