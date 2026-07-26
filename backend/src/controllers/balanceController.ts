import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const compararDocumentos = async (req: Request, res: Response) => {
  try {
    const documentIds = Array.isArray(req.body.documentIds)
      ? req.body.documentIds.map((id: unknown) => String(id))
      : [];

    if (documentIds.length < 2) {
      return res.status(400).json({ erro: 'Informe ao menos 2 documentos para comparação' });
    }

    const documentos = await prisma.document.findMany({
      where: {
        id: { in: documentIds },
        deletedAt: null,
      },
      include: {
        project: true,
        items: {
          include: {
            variant: {
              include: {
                material: true,
              },
            },
          },
        },
      },
    });

    if (documentos.length !== documentIds.length) {
      return res.status(404).json({ erro: 'Um ou mais documentos não foram encontrados' });
    }

    type DocumentoComItens = (typeof documentos)[number];

    const indexByVariant = new Map<
      string,
      {
        variantId: string;
        variantCode: string;
        variantNamePt: string;
        materialCode: string;
        materialNamePt: string;
        quantitiesByDocument: Record<string, number>;
      }
    >();

    for (const doc of documentos) {
      for (const item of doc.items) {
        const key = item.variantId;
        const qty = Number(item.quantity);
        if (!indexByVariant.has(key)) {
          indexByVariant.set(key, {
            variantId: item.variantId,
            variantCode: item.variant.code,
            variantNamePt: item.variant.namePt,
            materialCode: item.variant.material.code,
            materialNamePt: item.variant.material.namePt,
            quantitiesByDocument: {},
          });
        }

        const row = indexByVariant.get(key)!;
        row.quantitiesByDocument[doc.id] = (row.quantitiesByDocument[doc.id] ?? 0) + qty;
      }
    }

    const rows = Array.from(indexByVariant.values()).map((row) => {
      const quantities = documentos.map((doc: DocumentoComItens) => row.quantitiesByDocument[doc.id] ?? 0);
      const max = Math.max(...quantities);
      const min = Math.min(...quantities);
      const spread = max - min;

      return {
        ...row,
        quantitiesByDocument: Object.fromEntries(
          documentos.map((doc: DocumentoComItens) => [doc.id, row.quantitiesByDocument[doc.id] ?? 0])
        ),
        spread,
      };
    });

    rows.sort((a, b) => b.spread - a.spread);

    res.json({
      documentos: documentos.map((doc: DocumentoComItens) => ({
        id: doc.id,
        code: doc.code,
        title: doc.title,
        type: doc.type,
        revision: doc.revision,
        project: {
          id: doc.project.id,
          code: doc.project.code,
          name: doc.project.name,
        },
      })),
      resumo: {
        totalVariantes: rows.length,
        divergentes: rows.filter((r) => r.spread > 0).length,
      },
      itens: rows,
    });
  } catch (erro) {
    console.error('Erro ao comparar documentos:', erro);
    res.status(500).json({ erro: 'Erro ao comparar documentos' });
  }
};
