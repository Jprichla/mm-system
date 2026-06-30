import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  JWT_SECRET: process.env.JWT_SECRET ?? 'chave_nao_segura',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '15m',
};

if (!env.DATABASE_URL) {
  // Comentário: falha rápida para evitar subir API sem conexão de banco.
  // eslint-disable-next-line no-console
  console.warn('⚠️ DATABASE_URL não definida. Configure o arquivo .env para executar corretamente.');
}
