import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { gerarHashSenha, compararSenha } from '../utils/password';
import { gerarToken } from '../utils/jwt';
import { loginSchema, registerSchema } from '../utils/validators';

export async function register(req: Request, res: Response): Promise<void> {
  const dados = registerSchema.parse(req.body);

  const existente = await prisma.user.findUnique({ where: { email: dados.email } });
  if (existente) {
    res.status(409).json({ mensagem: 'Já existe usuário com este e-mail.' });
    return;
  }

  const novo = await prisma.user.create({
    data: {
      name: dados.name,
      email: dados.email,
      passwordHash: await gerarHashSenha(dados.password),
      role: dados.role ?? 'usuario',
      companyId: dados.companyId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyId: true,
    },
  });

  res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso.', usuario: novo });
}

export async function login(req: Request, res: Response): Promise<void> {
  const dados = loginSchema.parse(req.body);

  const usuario = await prisma.user.findUnique({ where: { email: dados.email } });
  if (!usuario || usuario.deletedAt) {
    res.status(401).json({ mensagem: 'Credenciais inválidas.' });
    return;
  }

  const senhaValida = await compararSenha(dados.password, usuario.passwordHash);
  if (!senhaValida) {
    res.status(401).json({ mensagem: 'Credenciais inválidas.' });
    return;
  }

  const token = gerarToken({
    sub: usuario.id,
    email: usuario.email,
    role: usuario.role,
    companyId: usuario.companyId,
  });

  res.json({
    mensagem: 'Login realizado com sucesso.',
    token,
    usuario: {
      id: usuario.id,
      name: usuario.name,
      email: usuario.email,
      role: usuario.role,
      companyId: usuario.companyId,
    },
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ mensagem: 'Usuário não autenticado.' });
    return;
  }

  const usuario = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyId: true,
      createdAt: true,
    },
  });

  if (!usuario) {
    res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    return;
  }

  res.json({ usuario });
}
