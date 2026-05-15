import express from 'express';
import { createLaporan, getPublicLaporan, getLaporanKu, getLaporanById } from '../controllers/laporanController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { markAsSelesai, deleteLaporan, updateLaporan, getSmartMatches } from '../controllers/laporanController.js';
import { markLaporanSelesai } from '../controllers/laporanController.js';
import { getStatistikAdmin } from '../controllers/laporanController.js';

const router = express.Router();

router.get('/public', getPublicLaporan);
router.get('/me', verifyToken, getLaporanKu);
router.post('/', verifyToken, upload.single('foto'), createLaporan);
router.get('/:id', getLaporanById);
router.put('/:id/selesai', verifyToken, markAsSelesai);
router.delete('/:id', verifyToken, deleteLaporan);
router.put('/:id', verifyToken, upload.single('foto'), updateLaporan);
router.get('/me/matches', verifyToken, getSmartMatches);
router.put('/:id/selesai', verifyToken, markLaporanSelesai);
router.get('/admin/statistik', verifyToken, getStatistikAdmin);

export default router;