import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { documentItemSchema } from '../utils/validators';

/**
 * Listar todos os itens de um documento
 */
export const listarItens = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;

    const itens = await prisma.documentItem.findMany({
      where: { documentId: String(documentId) },
      include: {
        variant: {
          include: {
            material: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { lineNumber: 'asc' },
    });

    res.json(itens);
  } catch (erro) {
    console.error('Erro ao listar itens do documento:', erro);
    res.status(500).json({ erro: 'Erro ao listar itens do documento' });
  }
};

/**
 * Obter um item específico
 */
export const obterItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;

    const item = await prisma.documentItem.findUnique({
      where: { id: String(itemId) },
      include: {
        variant: {
          include: {
            material: {
              include: {
                category: true,
              },
            },
          },
        },
        document: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ erro: 'Item não encontrado' });
    }

    res.json(item);
  } catch (erro) {
    console.error('Erro ao obter item:', erro);
    res.status(500).json({ erro: 'Erro ao obter item' });
  }
};

/**
 * Adicionar um item a um documento
 */
export const adicionarItem = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const validado = documentItemSchema.parse(req.body);

    // Verificar se o documento existe
    const documento = await prisma.document.findFirst({
      where: { id: String(documentId), deletedAt: null },
    });

    if (!documento) {
      return res.status(404).json({ erro: 'Documento não encontrado' });
    }

    // Verificar se a variante existe
    const variante = await prisma.materialVariant.findFirst({
      where: { id: validado.variantId, deletedAt: null },
    });

    if (!variante) {
      return res.status(404).json({ erro: 'Variante de material não encontrada' });
    }

    // Obter o próximo lineNumber
    const ultimoItem = await prisma.documentItem.findFirst({
      where: { documentId: String(documentId) },
      orderBy: { lineNumber: 'desc' },
    });

    const proximoLineNumber = ultimoItem ? ultimoItem.lineNumber + 1 : 1;

    const item = await prisma.documentItem.create({
      data: {
        documentId: String(documentId),
        variantId: validado.variantId,
        quantity: validado.quantity,
        unitPrice: validado.unitPrice || null,
        totalPrice: validado.totalPrice || null,
        lineNumber: proximoLineNumber,
      },
      include: {
        variant: {
          include: {
            material: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(item);
  } catch (erro: any) {
    if (erro.name === 'ZodError') {
      return res.status(400).json({ erro: 'Dados inválidos', detalhes: erro.errors });
    }
    console.error('Erro ao adicionar item:', erro);
    res.status(500).json({ erro: 'Erro ao adicionar item ao documento' });
  }
};

/**
 * Atualizar um item existente
 */
export const atualizarItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const validado = documentItemSchema.partial().parse(req.body);

    const item = await prisma.documentItem.findUnique({
      where: { id: String(itemId) },
    });

    if (!item) {
      return res.status(404).json({ erro: 'Item não encontrado' });
    }

    const atualizado = await prisma.documentItem.update({
      where: { id: String(itemId) },
      data: validado,
      include: {
        variant: {
          include: {
            material: true,
          },
        },
      },
    });

    res.json(atualizado);
  } catch (erro: any) {
    if (erro.name === 'ZodError') {
      return res.status(400).json({ erro: 'Dados inválidos', detalhes: erro.errors });
    }
    console.error('Erro ao atualizar item:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar item' });
  }
};

/**
 * Remover um item de um documento
 */
export const removerItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;

    const item = await prisma.documentItem.findUnique({
      where: { id: String(itemId) },
    });

    if (!item) {
      return res.status(404).json({ erro: 'Item não encontrado' });
    }

    await prisma.documentItem.delete({
      where: { id: String(itemId) },
    });

    res.status(204).send();
  } catch (erro) {
    console.error('Erro ao remover item:', erro);
    res.status(500).json({ erro: 'Erro ao remover item' });
  }
};

/**
 * Adicionar múltiplos itens de uma vez (batch)
 */
export const adicionarItensBatch = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { itens } = req.body;

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ erro: 'Lista de itens inválida ou vazia' });
    }

    // Verificar se o documento existe
    const documento = await prisma.document.findFirst({
      where: { id: String(documentId), deletedAt: null },
    });

    if (!documento) {
      return res.status(404).json({ erro: 'Documento não encontrado' });
    }

    // Obter o próximo lineNumber
    const ultimoItem = await prisma.documentItem.findFirst({
      where: { documentId: String(documentId) },
      orderBy: { lineNumber: 'desc' },
    });

    let proximoLineNumber = ultimoItem ? ultimoItem.lineNumber + 1 : 1;

    // Criar todos os itens
    const itensCriados = await Promise.all(
      itens.map(async (itemData) => {
        const validado = documentItemSchema.parse(itemData);
        const item = await prisma.documentItem.create({
          data: {
            documentId: String(documentId),
            variantId: validado.variantId,
            quantity: validado.quantity,
            unitPrice: validado.unitPrice || null,
            totalPrice: validado.totalPrice || null,
            lineNumber: proximoLineNumber++,
          },
          include: {
            variant: {
              include: {
                material: true,
              },
            },
          },
        });
        return item;
      })
    );

    res.status(201).json(itensCriados);
  } catch (erro: any) {
    if (erro.name === 'ZodError') {
      return res.status(400).json({ erro: 'Dados inválidos', detalhes: erro.errors });
    }
    console.error('Erro ao adicionar itens em lote:', erro);
    res.status(500).json({ erro: 'Erro ao adicionar itens em lote' });
  }
};
