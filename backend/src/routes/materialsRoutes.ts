import { Router } from 'express';
import {
  atualizarMaterial,
  atualizarVariante,
  criarMaterial,
  criarVariante,
  detalharMaterial,
  listarMateriais,
  listarVariantes,
  removerMaterial,
  removerVariante,
} from '../controllers/materialsController';
import { autenticar, autorizar } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', autenticar, listarMateriais);
router.get('/:id', autenticar, detalharMaterial);
router.post('/', autenticar, autorizar('admin', 'gestor', 'engenheiro'), criarMaterial);
router.put('/:id', autenticar, autorizar('admin', 'gestor', 'engenheiro'), atualizarMaterial);
router.delete('/:id', autenticar, autorizar('admin', 'gestor'), removerMaterial);

router.get('/:materialId/variants', autenticar, listarVariantes);
router.post('/:materialId/variants', autenticar, autorizar('admin', 'gestor', 'engenheiro'), criarVariante);
router.put('/:materialId/variants/:variantId', autenticar, autorizar('admin', 'gestor', 'engenheiro'), atualizarVariante);
router.delete('/:materialId/variants/:variantId', autenticar, autorizar('admin', 'gestor'), removerVariante);

export default router;
