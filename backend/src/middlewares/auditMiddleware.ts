import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const METODOS_AUDITAVEIS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function detectarEntidade(caminho: string): string {
  if (caminho.includes('/materials') && caminho.includes('/variants')) return 'material_variant';
  if (caminho.includes('/materials')) return 'material';
  if (caminho.includes('/projects') && caminho.includes('/documents')) return 'document';
  if (caminho.includes('/projects')) return 'project';
  if (caminho.includes('/categories')) return 'category';
  if (caminho.includes('/auth')) return 'auth';
  return 'generic';
}

export function auditMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!METODOS_AUDITAVEIS.has(req.method)) {
    next();
    return;
  }

  const inicio = Date.now();
  res.on('finish', async () => {
    try {
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          entityType: detectarEntidade(req.path),
          entityId: (req.params.id ?? req.params.docId ?? req.params.variantId ?? null) as string | null,
          action: req.method,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          newData: req.body ?? null,
          oldData: { duracaoMs: Date.now() - inicio },
        },
      });
    } catch (_erro) {
      // Comentário: auditoria não pode quebrar o fluxo principal.
    }
  });

  next();
}
