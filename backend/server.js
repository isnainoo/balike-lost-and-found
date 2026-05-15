import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import fs from 'fs'; 
import path from 'path'; 
import { fileURLToPath } from 'url'; 

import db from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import laporanRoutes from './routes/laporanRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import kategoriRoutes from './routes/kategoriRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json()); 

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes); 
app.use('/api/laporan', laporanRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/kategori', kategoriRoutes);

// SOFT DELETE
cron.schedule('0 0 * * *', async () => {
    try {
        console.log('Menjalankan tugas pengarsipan otomatis...');
        
        const [laporanLama] = await db.query(`SELECT id_laporan, url_foto FROM LAPORAN WHERE status = 'selesai' AND waktu_dibuat < NOW() - INTERVAL 3 DAY`);

        if (laporanLama.length > 0) {
            for (let item of laporanLama) {
                if (item.url_foto) {
                    const filePath = path.join(__dirname, item.url_foto);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath); 
                    }
                }

                await db.query(`UPDATE LAPORAN SET status = 'archived', url_foto = NULL WHERE id_laporan = ?`, [item.id_laporan]);
            }
            console.log(`Pengarsipan selesai: ${laporanLama.length} laporan diubah menjadi 'archived' dan fotonya dihapus.`);
        } else {
            console.log('Tidak ada laporan lama yang perlu diarsipkan hari ini.');
        }

    } catch (error) {
        console.error('Error saat pengarsipan otomatis:', error);
    }
});

app.get('/', (req, res) => {
    res.send('API Balike berjalan lancar!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});