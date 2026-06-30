import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ mensagem: 'Rota não encontrada.' });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      mensagem: 'Dados inválidos.',
      erros: error.flatten(),
    });
    return;
  }

  if (error instanceof Error) {
    res.status(500).json({ mensagem: error.message });
    return;
  }

  res.status(500).json({ mensagem: 'Erro interno inesperado.' });
}
