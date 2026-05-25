import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

import { 
    createLaporan, 
    getPublicLaporan, 
    getLaporanKu, 
    getLaporanById,
    markAsSelesai, 
    deleteLaporan, 
    updateLaporan, 
    getSmartMatches,
    markLaporanSelesai,
    getStatistikAdmin,
    getNotifikasiKu,
    tandaiNotifDibaca
} from '../controllers/laporanController.js';

const router = express.Router();

router.get('/public', getPublicLaporan);
router.get('/me', verifyToken, getLaporanKu);
router.post('/', verifyToken, upload.single('foto'), createLaporan);
router.get('/:id', getLaporanById);
router.delete('/:id', verifyToken, deleteLaporan);
router.put('/:id', verifyToken, upload.single('foto'), updateLaporan);

router.get('/me/matches', verifyToken, getSmartMatches);
router.get('/admin/statistik', verifyToken, getStatistikAdmin);

router.put('/:id/selesai', verifyToken, markAsSelesai);
router.put('/:id/selesai_user', verifyToken, markLaporanSelesai);

router.get('/notifikasi/all', verifyToken, getNotifikasiKu);
router.put('/notifikasi/read', verifyToken, tandaiNotifDibaca);

export default router;