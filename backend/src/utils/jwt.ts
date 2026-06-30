import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  companyId?: string | null;
}

export function gerarToken(payload: TokenPayload): string {
  const opcoes: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, env.JWT_SECRET, opcoes);
}

export function verificarToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
