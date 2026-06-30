import { Router } from 'express';
import {
  atualizarProjeto,
  criarProjeto,
  detalharProjeto,
  listarProjetos,
  removerProjeto,
} from '../controllers/projectsController';
import { autenticar, autorizar } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', autenticar, listarProjetos);
router.get('/:id', autenticar, detalharProjeto);
router.post('/', autenticar, autorizar('admin', 'gestor', 'engenheiro', 'usuario', 'cliente'), criarProjeto);
router.put('/:id', autenticar, autorizar('admin', 'gestor', 'engenheiro', 'usuario', 'cliente'), atualizarProjeto);
router.delete('/:id', autenticar, autorizar('admin', 'gestor'), removerProjeto);

export default router;
