import { Router } from 'express';
import { listarUsuarios, atualizarAcessoUsuario, criarUsuario, excluirUsuario } from '../controllers/usersController';
import { autenticar, autorizar } from '../middlewares/authMiddleware';

const router = Router();

router.use(autenticar, autorizar('admin'));

router.get('/', listarUsuarios);
router.post('/', criarUsuario);
router.put('/:id/access', atualizarAcessoUsuario);
router.delete('/:id', excluirUsuario);

export default router;
