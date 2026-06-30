import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { typicalDetailSchema, typicalDetailComponentSchema } from '../utils/validators';

/**
 * Listar todos os detalhes típicos com paginação e busca
 */
export const listarDetalhes = async (req: Request, res: Response) => {
  try {
    const { pagina = '1', limite = '10', busca = '' } = req.query;
    const paginaNum = parseInt(pagina as string);
    const limiteNum = parseInt(limite as string);
    const skip = (paginaNum - 1) * limiteNum;

    const where: any = {
      deletedAt: null,
      OR: busca
        ? [
            { code: { contains: busca as string, mode: 'insensitive' } },
            { namePt: { contains: busca as string, mode: 'insensitive' } },
            { nameEn: { contains: busca as string, mode: 'insensitive' } },
            { nameEs: { contains: busca as string, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [detalhes, total] = await Promise.all([
      prisma.typicalDetail.findMany({
        where,
        skip,
        take: limiteNum,
        orderBy: { code: 'asc' },
        include: {
          components: {
            include: {
              variant: {
                include: {
                  material: true,
                },
              },
            },
            orderBy: { lineNumber: 'asc' },
          },
          attachments: {
            where: { isMainImage: true },
            take: 1,
          },
        },
      }),
      prisma.typicalDetail.count({ where }),
    ]);

    res.json({
      dados: detalhes,
      paginacao: {
        total,
        pagina: paginaNum,
        limite: limiteNum,
        totalPaginas: Math.ceil(total / limiteNum),
      },
    });
  } catch (erro) {
    console.error('Erro ao listar detalhes típicos:', erro);
    res.status(500).json({ erro: 'Erro ao listar detalhes típicos' });
  }
};

/**
 * Obter um detalhe típico específico por ID
 */
export const obterDetalhe = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const detalhe = await prisma.typicalDetail.findFirst({
      where: { id: String(id), deletedAt: null },
      include: {
        components: {
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
        },
        attachments: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!detalhe) {
      return res.status(404).json({ erro: 'Detalhe típico não encontrado' });
    }

    res.json(detalhe);
  } catch (erro) {
    console.error('Erro ao obter detalhe típico:', erro);
    res.status(500).json({ erro: 'Erro ao obter detalhe típico' });
  }
};

/**
 * Criar um novo detalhe típico
 */
export const criarDetalhe = async (req: Request, res: Response) => {
  try {
    const validado = typicalDetailSchema.parse(req.body);
    const userId = req.user?.id;

    const detalhe = await prisma.typicalDetail.create({
      data: {
        ...validado,
        createdById: userId,
      },
      include: {
        components: true,
        attachments: true,
      },
    });

    res.status(201).json(detalhe);
  } catch (erro: any) {
    if (erro.name === 'ZodError') {
      return res.status(400).json({ erro: 'Dados inválidos', detalhes: erro.errors });
    }
    if (erro.code === 'P2002') {
      return res.status(409).json({ erro: 'Já existe um detalhe típico com este código' });
    }
    console.error('Erro ao criar detalhe típico:', erro);
    res.status(500).json({ erro: 'Erro ao criar detalhe típico' });
  }
};

/**
 * Atualizar um detalhe típico existente
 */
export const atualizarDetalhe = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validado = typicalDetailSchema.partial().parse(req.body);

    // Verificar se existe
    const existe = await prisma.typicalDetail.findFirst({
      where: { id: String(id), deletedAt: null },
    });

    if (!existe) {
      return res.status(404).json({ erro: 'Detalhe típico não encontrado' });
    }

    const atualizado = await prisma.typicalDetail.update({
      where: { id: String(id) },
      data: validado,
      include: {
        components: true,
        attachments: true,
      },
    });

    res.json(atualizado);
  } catch (erro: any) {
    if (erro.name === 'ZodError') {
      return res.status(400).json({ erro: 'Dados inválidos', detalhes: erro.errors });
    }
    if (erro.code === 'P2002') {
      return res.status(409).json({ erro: 'Já existe um detalhe típico com este código' });
    }
    console.error('Erro ao atualizar detalhe típico:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar detalhe típico' });
  }
};

/**
 * Remover um detalhe típico (soft delete)
 */
export const removerDetalhe = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const detalhe = await prisma.typicalDetail.findFirst({
      where: { id: String(id), deletedAt: null },
    });

    if (!detalhe) {
      return res.status(404).json({ erro: 'Detalhe típico não encontrado' });
    }

    await prisma.typicalDetail.update({
      where: { id: String(id) },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (erro) {
    console.error('Erro ao remover detalhe típico:', erro);
    res.status(500).json({ erro: 'Erro ao remover detalhe típico' });
  }
};

/**
 * Listar componentes de um detalhe típico
 */
export const listarComponentes = async (req: Request, res: Response) => {
  try {
    const { typicalDetailId } = req.params;

    const componentes = await prisma.typicalDetailComponent.findMany({
      where: { typicalDetailId: String(typicalDetailId) },
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

    res.json(componentes);
  } catch (erro) {
    console.error('Erro ao listar componentes:', erro);
    res.status(500).json({ erro: 'Erro ao listar componentes' });
  }
};

/**
 * Adicionar um componente a um detalhe típico
 */
export const adicionarComponente = async (req: Request, res: Response) => {
  try {
    const { typicalDetailId } = req.params;
    const validado = typicalDetailComponentSchema.parse(req.body);

    // Verificar se o detalhe típico existe
    const detalhe = await prisma.typicalDetail.findFirst({
      where: { id: String(typicalDetailId), deletedAt: null },
    });

    if (!detalhe) {
      return res.status(404).json({ erro: 'Detalhe típico não encontrado' });
    }

    // Verificar se a variante existe
    const variante = await prisma.materialVariant.findFirst({
      where: { id: validado.variantId, deletedAt: null },
    });

    if (!variante) {
      return res.status(404).json({ erro: 'Variante de material não encontrada' });
    }

    // Obter o próximo lineNumber
    const ultimoComponente = await prisma.typicalDetailComponent.findFirst({
      where: { typicalDetailId: String(typicalDetailId) },
      orderBy: { lineNumber: 'desc' },
    });

    const proximoLineNumber = ultimoComponente ? ultimoComponente.lineNumber + 1 : 1;

    const componente = await prisma.typicalDetailComponent.create({
      data: {
        typicalDetailId: String(typicalDetailId),
        variantId: validado.variantId,
        quantity: validado.quantity,
        lineNumber: proximoLineNumber,
      },
      include: {
        variant: {
          include: {
            material: true,
          },
        },
      },
    });

    res.status(201).json(componente);
  } catch (erro: any) {
    if (erro.name === 'ZodError') {
      return res.status(400).json({ erro: 'Dados inválidos', detalhes: erro.errors });
    }
    console.error('Erro ao adicionar componente:', erro);
    res.status(500).json({ erro: 'Erro ao adicionar componente' });
  }
};

/**
 * Atualizar um componente existente
 */
export const atualizarComponente = async (req: Request, res: Response) => {
  try {
    const { componentId } = req.params;
    const validado = typicalDetailComponentSchema.partial().parse(req.body);

    const componente = await prisma.typicalDetailComponent.findUnique({
      where: { id: String(componentId) },
    });

    if (!componente) {
      return res.status(404).json({ erro: 'Componente não encontrado' });
    }

    const atualizado = await prisma.typicalDetailComponent.update({
      where: { id: String(componentId) },
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
    console.error('Erro ao atualizar componente:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar componente' });
  }
};

/**
 * Remover um componente de um detalhe típico
 */
export const removerComponente = async (req: Request, res: Response) => {
  try {
    const { componentId } = req.params;

    const componente = await prisma.typicalDetailComponent.findUnique({
      where: { id: String(componentId) },
    });

    if (!componente) {
      return res.status(404).json({ erro: 'Componente não encontrado' });
    }

    await prisma.typicalDetailComponent.delete({
      where: { id: String(componentId) },
    });

    res.status(204).send();
  } catch (erro) {
    console.error('Erro ao remover componente:', erro);
    res.status(500).json({ erro: 'Erro ao remover componente' });
  }
};
