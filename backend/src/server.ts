import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { prisma } from './config/prisma';
import apiRoutes from './routes';
import { auditMiddleware } from './middlewares/auditMiddleware';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use(auditMiddleware);
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', servico: 'MM System Backend', versao: 'fase-1-mvp' });
});

app.use('/api/v1', apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  // Comentário: log informativo de inicialização.
  // eslint-disable-next-line no-console
  console.log(`🚀 Backend do MM System rodando na porta ${env.PORT}`);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close();
});
