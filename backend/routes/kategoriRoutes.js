import express from 'express';
import { getAllKategori } from '../controllers/kategoriController.js';

const router = express.Router();

router.get('/', getAllKategori);

export default router;