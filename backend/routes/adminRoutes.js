import express from 'express';
import { getPendingLaporan, updateStatusLaporan, updateTrustedUser, getAllUsers, changeUserRole } from '../controllers/adminController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken, isAdmin);
router.get('/laporan/pending', getPendingLaporan);
router.put('/laporan/:id/status', updateStatusLaporan);
router.put('/user/:id/trust', updateTrustedUser);
router.get('/users', verifyToken, getAllUsers);
router.put('/users/:id/role', verifyToken, changeUserRole);

export default router;