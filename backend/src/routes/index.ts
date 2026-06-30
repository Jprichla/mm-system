import { Router } from 'express';
import authRoutes from './authRoutes';
import categoriesRoutes from './categoriesRoutes';
import materialsRoutes from './materialsRoutes';
import projectsRoutes from './projectsRoutes';
import documentsRoutes from './documentsRoutes';
import typicalDetailsRoutes from './typicalDetailsRoutes';
import documentItemsRoutes from './documentItemsRoutes';
import attachmentsRoutes from './attachmentsRoutes';
import usersRoutes from './usersRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoriesRoutes);
router.use('/materials', materialsRoutes);
router.use('/projects', projectsRoutes);
router.use('/documents', documentsRoutes);
router.use('/typical-details', typicalDetailsRoutes);
router.use('/users', usersRoutes);
router.use('/', documentItemsRoutes); // Document Items usa rotas aninhadas
router.use('/', attachmentsRoutes);

export default router;
