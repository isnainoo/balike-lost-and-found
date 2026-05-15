import express from 'express';
import { register, login, updateProfile, updatePassword, verifikasiLupaPassword, resetPassword} from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/profile', verifyToken, updateProfile);
router.put('/password', verifyToken, updatePassword);
router.post('/forgot-password', verifikasiLupaPassword);
router.post('/reset-password', resetPassword);

export default router;