import { Request, Response } from 'express';
import { Prisma, Role } from '@prisma/client';
import { prisma } from '../config/prisma';
import { updateUserAccessSchema } from '../utils/validators';
import { gerarHashSenha } from '../utils/password';

export async function listarUsuarios(req: Request, res: Response): Promise<void> {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 10);
  const search = String(req.query.search ?? '').trim();

  const where: Prisma.UserWhereInput = {
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [dados, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    dados,
    paginacao: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}

export async function atualizarAcessoUsuario(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const dados = updateUserAccessSchema.parse(req.body);

  const usuarioLogado = req.user;
  if (!usuarioLogado) {
    res.status(401).json({ mensagem: 'Usuário não autenticado.' });
    return;
  }

  const usuarioExistente = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, role: true },
  });

  if (!usuarioExistente) {
    res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    return;
  }

  if (usuarioLogado.id === id && usuarioExistente.role !== dados.role) {
    res.status(400).json({ mensagem: 'Não é permitido alterar seu próprio nível de acesso.' });
    return;
  }

  if (usuarioExistente.role === 'admin' && dados.role !== 'admin') {
    const totalAdminsAtivos = await prisma.user.count({
      where: { role: Role.admin, deletedAt: null },
    });

    if (totalAdminsAtivos <= 1) {
      res.status(400).json({ mensagem: 'Deve existir ao menos 1 administrador ativo no sistema.' });
      return;
    }
  }

  const atualizado = await prisma.user.update({
    where: { id },
    data: {
      role: dados.role,
      companyId: dados.companyId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyId: true,
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      updatedAt: true,
    },
  });

  res.json({ mensagem: 'Nível de acesso atualizado com sucesso.', usuario: atualizado });
}

export async function criarUsuario(req: Request, res: Response): Promise<void> {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400).json({ mensagem: 'Nome, email, senha e nível de acesso são obrigatórios.' });
    return;
  }

  const emailExistente = await prisma.user.findFirst({ where: { email, deletedAt: null } });
  if (emailExistente) {
    res.status(400).json({ mensagem: 'Já existe um usuário com este e-mail.' });
    return;
  }

  const senhaHash = await gerarHashSenha(password);

  const usuario = await prisma.user.create({
    data: {
      name,
      email,
      password: senhaHash,
      role: role as Role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  res.status(201).json({ mensagem: 'Usuário criado com sucesso.', usuario });
}
