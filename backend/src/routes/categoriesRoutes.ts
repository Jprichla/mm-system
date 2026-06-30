import { Router } from 'express';
import {
  atualizarCategoria,
  criarCategoria,
  listarCategorias,
  removerCategoria,
} from '../controllers/categoriesController';
import { autenticar, autorizar } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', autenticar, listarCategorias);
router.post('/', autenticar, autorizar('admin', 'gestor'), criarCategoria);
router.put('/:id', autenticar, autorizar('admin', 'gestor'), atualizarCategoria);
router.delete('/:id', autenticar, autorizar('admin', 'gestor'), removerCategoria);

export default router;
