import fs from 'fs/promises';
import path from 'path';
import { FileType } from '@prisma/client';
import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

const mimeToType = (mime: string): FileType => {
  if (mime.startsWith('image/')) return 'imagem';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.includes('dwg') || mime.includes('acad')) return 'dwg';
  if (mime.includes('rfa')) return 'rfa';
  return 'outro';
};

export const listarAnexosPorDetalhe = async (req: Request, res: Response) => {
  try {
    const { typicalDetailId } = req.params;

    const anexos = await prisma.fileAttachment.findMany({
      where: {
        typicalDetailId: String(typicalDetailId),
      },
      orderBy: [{ isMainImage: 'desc' }, { createdAt: 'desc' }],
    });

    res.json(anexos);
  } catch (erro) {
    console.error('Erro ao listar anexos:', erro);
    res.status(500).json({ erro: 'Erro ao listar anexos' });
  }
};

export const uploadAnexoDetalhe = async (req: Request, res: Response) => {
  try {
    const { typicalDetailId } = req.params;

    const detalhe = await prisma.typicalDetail.findFirst({
      where: { id: String(typicalDetailId), deletedAt: null },
    });

    if (!detalhe) {
      return res.status(404).json({ erro: 'Detalhe típico não encontrado' });
    }

    if (!req.file) {
      return res.status(400).json({ erro: 'Arquivo não enviado' });
    }

    const filePath = `/uploads/${req.file.filename}`;
    const language = req.body.language ? String(req.body.language) : null;
    const description = req.body.description ? String(req.body.description) : null;
    const isMainImage = req.body.isMainImage === 'true';

    if (isMainImage) {
      await prisma.fileAttachment.updateMany({
        where: {
          typicalDetailId: String(typicalDetailId),
          isMainImage: true,
        },
        data: { isMainImage: false },
      });
    }

    const anexo = await prisma.fileAttachment.create({
      data: {
        entityType: 'typical_detail',
        entityId: String(typicalDetailId),
        fileType: mimeToType(req.file.mimetype),
        fileName: req.file.originalname,
        filePath,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        language,
        description,
        isMainImage,
        typicalDetailId: String(typicalDetailId),
      },
    });

    res.status(201).json(anexo);
  } catch (erro) {
    console.error('Erro ao fazer upload do anexo:', erro);
    res.status(500).json({ erro: 'Erro ao fazer upload do anexo' });
  }
};

export const definirImagemPrincipal = async (req: Request, res: Response) => {
  try {
    const { attachmentId } = req.params;

    const anexo = await prisma.fileAttachment.findUnique({
      where: { id: String(attachmentId) },
    });

    if (!anexo || !anexo.typicalDetailId) {
      return res.status(404).json({ erro: 'Anexo não encontrado' });
    }

    await prisma.$transaction([
      prisma.fileAttachment.updateMany({
        where: {
          typicalDetailId: anexo.typicalDetailId,
          isMainImage: true,
        },
        data: { isMainImage: false },
      }),
      prisma.fileAttachment.update({
        where: { id: anexo.id },
        data: { isMainImage: true },
      }),
    ]);

    res.json({ mensagem: 'Imagem principal definida com sucesso' });
  } catch (erro) {
    console.error('Erro ao definir imagem principal:', erro);
    res.status(500).json({ erro: 'Erro ao definir imagem principal' });
  }
};

export const removerAnexo = async (req: Request, res: Response) => {
  try {
    const { attachmentId } = req.params;

    const anexo = await prisma.fileAttachment.findUnique({
      where: { id: String(attachmentId) },
    });

    if (!anexo) {
      return res.status(404).json({ erro: 'Anexo não encontrado' });
    }

    await prisma.fileAttachment.delete({
      where: { id: String(attachmentId) },
    });

    const absolutePath = path.resolve(process.cwd(), anexo.filePath.replace(/^\//, ''));
    await fs.unlink(absolutePath).catch(() => null);

    res.status(204).send();
  } catch (erro) {
    console.error('Erro ao remover anexo:', erro);
    res.status(500).json({ erro: 'Erro ao remover anexo' });
  }
};
