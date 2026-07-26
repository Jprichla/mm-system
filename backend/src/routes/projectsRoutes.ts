import { Router } from 'express';
import {
  adicionarMembroProjeto,
  atualizarProjeto,
  criarProjeto,
  detalharProjeto,
  listarMembrosProjeto,
  listarProjetos,
  removerMembroProjeto,
  removerProjeto,
} from '../controllers/projectsController';
import { autenticar, autorizar } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', autenticar, listarProjetos);
router.get('/:id', autenticar, detalharProjeto);
router.post('/', autenticar, autorizar('admin', 'gestor', 'engenheiro'), criarProjeto);
router.put('/:id', autenticar, autorizar('admin', 'gestor', 'engenheiro'), atualizarProjeto);
router.delete('/:id', autenticar, autorizar('admin', 'gestor'), removerProjeto);

router.get('/:id/members', autenticar, autorizar('admin', 'gestor', 'engenheiro'), listarMembrosProjeto);
router.post('/:id/members', autenticar, autorizar('admin', 'gestor'), adicionarMembroProjeto);
router.delete('/:id/members/:userId', autenticar, autorizar('admin', 'gestor'), removerMembroProjeto);

export default router;
