import { Router } from 'express';
import {
  definirImagemPrincipal,
  listarAnexosPorDetalhe,
  removerAnexo,
  uploadAnexoDetalhe,
} from '../controllers/attachmentsController';
import { autenticar, autorizar } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

router.use(autenticar);

router.get('/typical-details/:typicalDetailId/attachments', listarAnexosPorDetalhe);
router.post(
  '/typical-details/:typicalDetailId/attachments',
  autorizar('admin', 'gestor', 'engenheiro'),
  upload.single('file'),
  uploadAnexoDetalhe
);
router.patch('/attachments/:attachmentId/main-image', autorizar('admin', 'gestor', 'engenheiro'), definirImagemPrincipal);
router.delete('/attachments/:attachmentId', autorizar('admin', 'gestor', 'engenheiro'), removerAnexo);

export default router;
