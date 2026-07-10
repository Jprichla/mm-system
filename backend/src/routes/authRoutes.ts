import { Router } from 'express';
import { login, me, register, alterarSenha } from '../controllers/authController';
import { autenticar } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', autenticar, me);
router.put('/change-password', autenticar, alterarSenha);

export default router;
