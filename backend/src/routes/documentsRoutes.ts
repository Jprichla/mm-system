import { Router } from 'express';
import {
  atualizarDocumento,
  criarDocumento,
  detalharDocumento,
  listarDocumentos,
  removerDocumento,
} from '../controllers/documentsController';
import { autenticar, autorizar } from '../middlewares/authMiddleware';
import { compararDocumentos } from '../controllers/balanceController';

const router = Router();

router.get('/', autenticar, listarDocumentos);
router.post('/balance/compare', autenticar, autorizar('admin', 'gestor', 'engenheiro', 'usuario'), compararDocumentos);
router.get('/:id', autenticar, detalharDocumento);
router.post('/', autenticar, autorizar('admin', 'gestor', 'engenheiro', 'usuario'), criarDocumento);
router.put('/:id', autenticar, autorizar('admin', 'gestor', 'engenheiro', 'usuario'), atualizarDocumento);
router.delete('/:id', autenticar, autorizar('admin', 'gestor'), removerDocumento);

export default router;
