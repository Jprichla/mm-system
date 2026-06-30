import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { verificarToken } from '../utils/jwt';

export function autenticar(req: Request, res: Response, next: NextFunction): void {
  const cabecalho = req.headers.authorization;
  if (!cabecalho?.startsWith('Bearer ')) {
    res.status(401).json({ mensagem: 'Token de acesso não informado.' });
    return;
  }

  const token = cabecalho.split(' ')[1];
  try {
    const payload = verificarToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role as Role,
      companyId: payload.companyId,
    };
    next();
  } catch (_erro) {
    res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
  }
}

export function autorizar(...rolesPermitidos: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ mensagem: 'Usuário não autenticado.' });
      return;
    }

    if (!rolesPermitidos.includes(req.user.role)) {
      res.status(403).json({ mensagem: 'Acesso negado para este perfil.' });
      return;
    }

    next();
  };
}
