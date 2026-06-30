import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { categorySchema } from '../utils/validators';

export async function listarCategorias(_req: Request, res: Response): Promise<void> {
  const categorias = await prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: { namePt: 'asc' },
  });
  res.json({ dados: categorias });
}

export async function criarCategoria(req: Request, res: Response): Promise<void> {
  const dados = categorySchema.parse(req.body);
  const categoria = await prisma.category.create({ data: dados });
  res.status(201).json({ mensagem: 'Categoria criada com sucesso.', dados: categoria });
}

export async function atualizarCategoria(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const dados = categorySchema.partial().parse(req.body);

  const categoria = await prisma.category.update({
    where: { id },
    data: dados,
  });

  res.json({ mensagem: 'Categoria atualizada com sucesso.', dados: categoria });
}

export async function removerCategoria(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  await prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
  res.json({ mensagem: 'Categoria removida (soft delete) com sucesso.' });
}
