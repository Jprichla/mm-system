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
    ...(req.user?.role === 'cliente' || req.user?.role === 'usuario'
      ? { members: { some: { userId: req.user.id } } }
      : {}),
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

  if (req.user?.role === 'cliente' || req.user?.role === 'usuario') {
    const ehMembro = await prisma.projectMember.findFirst({
      where: { projectId: id, userId: req.user.id },
      select: { id: true },
    });

    if (!ehMembro) {
      res.status(403).json({ mensagem: 'Acesso negado ao projeto solicitado.' });
      return;
    }
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

  // Quem cria o projeto já vira membro automaticamente
  if (req.user?.id) {
    await prisma.projectMember.create({
      data: { projectId: projeto.id, userId: req.user.id },
    }).catch(() => null);
  }

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

  await prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
  res.json({ mensagem: 'Projeto removido (soft delete) com sucesso.' });
}

export async function listarMembrosProjeto(req: Request, res: Response): Promise<void> {
  const projectId = String(req.params.id);

  const projeto = await prisma.project.findFirst({ where: { id: projectId, deletedAt: null } });
  if (!projeto) {
    res.status(404).json({ mensagem: 'Projeto não encontrado.' });
    return;
  }

  const membros = await prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, deletedAt: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  res.json({ dados: membros.filter((m: (typeof membros)[number]) => !m.user.deletedAt) });
}

export async function adicionarMembroProjeto(req: Request, res: Response): Promise<void> {
  const projectId = String(req.params.id);
  const { userId } = req.body as { userId?: string };

  if (!userId) {
    res.status(400).json({ mensagem: 'Informe o usuário a ser adicionado.' });
    return;
  }

  const [projeto, usuario] = await Promise.all([
    prisma.project.findFirst({ where: { id: projectId, deletedAt: null } }),
    prisma.user.findFirst({ where: { id: userId, deletedAt: null } }),
  ]);

  if (!projeto) {
    res.status(404).json({ mensagem: 'Projeto não encontrado.' });
    return;
  }

  if (!usuario) {
    res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    return;
  }

  const jaMembro = await prisma.projectMember.findFirst({ where: { projectId, userId } });
  if (jaMembro) {
    res.status(400).json({ mensagem: 'Usuário já está vinculado a este projeto.' });
    return;
  }

  const membro = await prisma.projectMember.create({
    data: { projectId, userId },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  res.status(201).json({ mensagem: 'Usuário adicionado ao projeto com sucesso.', dados: membro });
}

export async function removerMembroProjeto(req: Request, res: Response): Promise<void> {
  const projectId = String(req.params.id);
  const userId = String(req.params.userId);

  const membro = await prisma.projectMember.findFirst({ where: { projectId, userId } });
  if (!membro) {
    res.status(404).json({ mensagem: 'Vínculo não encontrado.' });
    return;
  }

  await prisma.projectMember.delete({ where: { id: membro.id } });
  res.json({ mensagem: 'Usuário removido do projeto com sucesso.' });
}
