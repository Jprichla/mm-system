import { Router } from 'express';
import { listarUsuarios, atualizarAcessoUsuario, criarUsuario, excluirUsuario, resetarSenhaUsuario } from '../controllers/usersController';
import { autenticar, autorizar } from '../middlewares/authMiddleware';

const router = Router();

router.use(autenticar);

router.get('/', autorizar('admin', 'gestor'), listarUsuarios);
router.post('/', autorizar('admin'), criarUsuario);
router.put('/:id/access', autorizar('admin'), atualizarAcessoUsuario);
router.delete('/:id', autorizar('admin'), excluirUsuario);
router.post('/:id/reset-password', autorizar('admin'), resetarSenhaUsuario);

export default router;
