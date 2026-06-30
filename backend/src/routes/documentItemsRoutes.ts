import { Router } from 'express';
import {
  listarItens,
  obterItem,
  adicionarItem,
  atualizarItem,
  removerItem,
  adicionarItensBatch,
} from '../controllers/documentItemsController';
import { autenticar, autorizar } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas exigem autenticação
router.use(autenticar);

// Rotas de Itens de Documentos
router.get('/documents/:documentId/items', listarItens);
router.get('/items/:itemId', obterItem);
router.post('/documents/:documentId/items', autorizar('admin', 'gestor', 'engenheiro', 'usuario'), adicionarItem);
router.post('/documents/:documentId/items/batch', autorizar('admin', 'gestor', 'engenheiro'), adicionarItensBatch);
router.put('/items/:itemId', autorizar('admin', 'gestor', 'engenheiro', 'usuario'), atualizarItem);
router.delete('/items/:itemId', autorizar('admin', 'gestor', 'engenheiro', 'usuario'), removerItem);

export default router;
