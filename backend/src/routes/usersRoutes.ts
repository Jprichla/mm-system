import { Router } from 'express';
import { listarUsuarios, atualizarAcessoUsuario } from '../controllers/usersController';
import { autenticar, autorizar } from '../middlewares/authMiddleware';

const router = Router();

router.use(autenticar, autorizar('admin'));

router.get('/', listarUsuarios);
router.put('/:id/access', atualizarAcessoUsuario);

export default router;
