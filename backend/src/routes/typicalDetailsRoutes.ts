import { Router } from 'express';
import {
  listarDetalhes,
  obterDetalhe,
  criarDetalhe,
  atualizarDetalhe,
  removerDetalhe,
  listarComponentes,
  adicionarComponente,
  atualizarComponente,
  removerComponente,
} from '../controllers/typicalDetailsController';
import { autenticar, autorizar } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas exigem autenticação
router.use(autenticar);

// Rotas de Detalhes Típicos
router.get('/', listarDetalhes);
router.get('/:id', obterDetalhe);
router.post('/', autorizar('admin', 'gestor', 'engenheiro'), criarDetalhe);
router.put('/:id', autorizar('admin', 'gestor', 'engenheiro'), atualizarDetalhe);
router.delete('/:id', autorizar('admin', 'gestor'), removerDetalhe);

// Rotas de Componentes
router.get('/:typicalDetailId/components', listarComponentes);
router.post('/:typicalDetailId/components', autorizar('admin', 'gestor', 'engenheiro'), adicionarComponente);
router.put('/components/:componentId', autorizar('admin', 'gestor', 'engenheiro'), atualizarComponente);
router.delete('/components/:componentId', autorizar('admin', 'gestor', 'engenheiro'), removerComponente);

export default router;
