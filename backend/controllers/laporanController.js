import db from '../config/db.js';
import { sendMatchEmail } from '../utils/sendEmail.js';

const stopWords = [
    'warna', 'warnanya', 'hilang', 'ditemukan', 'menemukan', 'nemu', 'jatuh', 
    'tertinggal', 'ketinggalan', 'sekitar', 'seperti', 'dengan', 'yang', 'dan', 
    'di', 'dari', 'ke', 'pada', 'merk', 'merek', 'unit', 'buah', 'sebuah', 
    'saya', 'aku', 'kami', 'kita', 'dia', 'kamu', 'bagi', 'bisa', 'hubungi', 
    'karena', 'area', 'dekat', 'didekat', 'satu', 'lagi', 'ini', 'itu', 'ada', 
    'untuk', 'buat', 'saat', 'ketika', 'tadi', 'surakarta', 'solo', 'spbu', 
    'mushola', 'masjid', 'kampus', 'ums', 'jalan', 'hari', 'jam'
];

const synonyms = {
    'hp': ['handphone', 'ponsel', 'smartphone'],
    'handphone': ['hp', 'ponsel', 'smartphone'],
    'laptop': ['notebook', 'macbook', 'pc'],
    'charger': ['casan', 'adaptor'],
    'casan': ['charger', 'adaptor'],
    'tws': ['earphone', 'headset', 'airpods', 'earbuds'],
    'parfum': ['parfume', 'minyak', 'cologne'],
    'dompet': ['wallet', 'pouch'],
    'tas': ['ransel', 'backpack', 'bag'],
    'motor': ['sepeda', 'kendaraan', 'roda'],
    'mobil': ['kendaraan', 'roda'],
    'ktp': ['identitas', 'kartu', 'id'],
    'biru': ['blue', 'navy'],
    'blue': ['biru', 'navy'],
    'hitam': ['black', 'dark'],
    'putih': ['white', 'clear'],
    'merah': ['red', 'maroon'],
    'hijau': ['green', 'ijo'],
    'abu': ['grey', 'gray', 'silver'],
    'kuning': ['yellow', 'gold']
};

const brandGroups = [
    ['iphone', 'ip', 'apple', 'macbook', 'ipad', 'ios'], 
    ['samsung', 'galaxy'], 
    ['xiaomi', 'redmi', 'poco', 'mi'], 
    ['oppo'], 
    ['vivo'],
    ['infinix'], 
    ['asus', 'rog'], 
    ['acer', 'predator'],
    ['lenovo', 'thinkpad', 'ideapad'], 
    ['honda', 'vario', 'beat', 'scoopy', 'pcx', 'supra'], 
    ['yamaha', 'nmax', 'aerox', 'mio', 'jupiter', 'r15'], 
    ['vespa'],
    ['dior', 'sauvage', 'chanel', 'bvlgari'] 
];

const getWords = (text) => {
    if (!text) return [];
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 1 && !stopWords.includes(w));
};

const hasBrandClash = (wordsA, wordsB) => {
    let groupIndexA = new Set();
    let groupIndexB = new Set();

    wordsA.forEach(wA => { brandGroups.forEach((group, index) => { if (group.includes(wA)) groupIndexA.add(index); }); });
    wordsB.forEach(wB => { brandGroups.forEach((group, index) => { if (group.includes(wB)) groupIndexB.add(index); }); });

    if (groupIndexA.size > 0 && groupIndexB.size > 0) {
        let intersection = [...groupIndexA].filter(x => groupIndexB.has(x));
        if (intersection.length === 0) return true; 
    }
    return false; 
};

const checkMatch = (wordsA, wordsB) => {
    let matched = [];
    for (let wA of wordsA) {
        for (let wB of wordsB) {
            if (wA === wB) matched.push(wA);
            else if (wA.length >= 4 && wB.length >= 4 && (wA.includes(wB) || wB.includes(wA))) matched.push(wA);
            else if (synonyms[wA] && synonyms[wA].includes(wB)) matched.push(wA);
        }
    }
    return matched;
};

export const runAutoSmartMatch = async (newReportId) => {
    try {
        const [newRepData] = await db.query(`
            SELECT l.*, u.email, u.nama_lengkap 
            FROM LAPORAN l JOIN USER u ON l.id_user = u.id_user 
            WHERE l.id_laporan = ?
        `, [newReportId]);
        
        if (newRepData.length === 0) return;
        const newRep = newRepData[0];

        const [otherReports] = await db.query(`
            SELECT l.*, u.email, u.nama_lengkap 
            FROM LAPORAN l JOIN USER u ON l.id_user = u.id_user 
            WHERE l.tipe_laporan != ? AND l.id_kategori = ? AND l.status = 'published' AND l.id_user != ?
        `, [newRep.tipe_laporan, newRep.id_kategori, newRep.id_user]);

        const myNameWords = getWords(newRep.nama_barang);
        const myDescWords = getWords(newRep.deskripsi);

        for (let otherRep of otherReports) {
            const otherNameWords = getWords(otherRep.nama_barang);
            const otherDescWords = getWords(otherRep.deskripsi);

            const isClashing = hasBrandClash(
                [...myNameWords, ...myDescWords], 
                [...otherNameWords, ...otherDescWords]
            );

            if (isClashing) continue;

            const titleMatches = checkMatch(myNameWords, otherNameWords);

            if (titleMatches.length > 0) {
                const descMatches = checkMatch(myDescWords, otherDescWords);
                
                let score = (titleMatches.length * 40) + (descMatches.length * 10);
                if (score > 99) score = 99;

                if (score >= 75) {
                    console.log(`🔥 Smart Match Terdeteksi! Skor: ${score}% - Mengirim email & notif...`);
                    
                    const pesanLama = `Barang temuan yang mirip dengan ${otherRep.nama_barang} telah dilaporkan! (Kecocokan: ${score}%)`;
                    
                    await sendMatchEmail(otherRep.email, otherRep.nama_barang, score, newRep.id_laporan);
                    await db.query(`INSERT INTO NOTIFIKASI (id_user, id_laporan_terkait, pesan) VALUES (?, ?, ?)`, [otherRep.id_user, newRep.id_laporan, pesanLama]);
                    
                    const pesanBaru = `Laporan Anda cocok dengan barang ${newRep.nama_barang} yang sudah ada di sistem! (Kecocokan: ${score}%)`;
        
                    await sendMatchEmail(newRep.email, newRep.nama_barang, score, otherRep.id_laporan);
                    await db.query(`INSERT INTO NOTIFIKASI (id_user, id_laporan_terkait, pesan) VALUES (?, ?, ?)`, [newRep.id_user, otherRep.id_laporan, pesanBaru]);
                }
            }
        }
    } catch (error) {
        console.error("Error pada runAutoSmartMatch:", error);
    }
};

export const createLaporan = async (req, res) => {
    try {
        const { id_kategori, tipe_laporan, nama_barang, deskripsi, lokasi_kejadian, tanggal_kejadian, imbalan } = req.body;
        const nominalImbalan = imbalan ? Math.round(Number(imbalan)) : null;
        const id_user = req.user.id_user; 
        const is_trusted = req.user.is_trusted; 
        const url_foto = req.file ? `/uploads/${req.file.filename}` : null;
        const status = is_trusted ? 'published' : 'pending';

        const query = `
            INSERT INTO LAPORAN 
            (id_user, id_kategori, tipe_laporan, nama_barang, deskripsi, lokasi_kejadian, tanggal_kejadian, url_foto, status, imbalan) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
            id_user, id_kategori || null, tipe_laporan, nama_barang, deskripsi, 
            lokasi_kejadian, tanggal_kejadian, url_foto, status, nominalImbalan
        ]);

        if (status === 'published') {
            runAutoSmartMatch(result.insertId);
        }

        res.status(201).json({ 
            message: "Report sent successfully!", 
            status_laporan: status 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred on the server." });
    }
};

export const getPublicLaporan = async (req, res) => {
    try {
        const query = `
            SELECT 
                l.*, 
                u.nama_lengkap, 
                u.nomor_telepon 
            FROM LAPORAN l
            JOIN USER u ON l.id_user = u.id_user
            WHERE l.status = 'published'
            ORDER BY l.waktu_dibuat DESC
        `;

        const [laporan] = await db.query(query);
        res.status(200).json(laporan);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred on the server." });
    }
};

export const getLaporanKu = async (req, res) => {
    try {
        const id_user = req.user.id_user; 
        
        const query = `
            SELECT * FROM LAPORAN 
            WHERE id_user = ? 
            ORDER BY waktu_dibuat DESC
        `;

        const [laporan] = await db.query(query, [id_user]);
        res.status(200).json(laporan);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred on the server." });
    }
};

export const getLaporanById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT l.*, u.nama_lengkap, u.nomor_telepon 
            FROM LAPORAN l
            JOIN USER u ON l.id_user = u.id_user
            WHERE l.id_laporan = ? AND l.status = 'published'
        `;
        const [laporan] = await db.query(query, [id]);
        
        if (laporan.length === 0) return res.status(404).json({ message: "Report not found" });
        
        res.status(200).json(laporan[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const markAsSelesai = async (req, res) => {
    try {
        const { id } = req.params;
        const id_user_req = req.user.id_user;
        const role_req = req.user.role;

        const [laporan] = await db.query('SELECT id_user FROM LAPORAN WHERE id_laporan = ?', [id]);
        if (laporan.length === 0) return res.status(404).json({ message: "Laporan tidak ditemukan" });

        if (laporan[0].id_user !== id_user_req && role_req !== 'admin') {
            return res.status(403).json({ message: "You do not have the right to change this report." });
        }

        await db.query('UPDATE LAPORAN SET status = "selesai" WHERE id_laporan = ?', [id]);
        res.status(200).json({ message: "Status successfully changed to Completed Found!" });
    } catch (error) {
        res.status(500).json({ message: "A server error occurred" });
    }
};

export const deleteLaporan = async (req, res) => {
    try {
        const { id } = req.params;
        const id_user_req = req.user.id_user;
        const role_req = req.user.role;

        const [laporan] = await db.query('SELECT id_user FROM LAPORAN WHERE id_laporan = ?', [id]);
        if (laporan.length === 0) return res.status(404).json({ message: "Report not found" });

        if (laporan[0].id_user !== id_user_req && role_req !== 'admin') {
            return res.status(403).json({ message: "You do not have the right to delete this report." });
        }

        await db.query('DELETE FROM LAPORAN WHERE id_laporan = ?', [id]);
        res.status(200).json({ message: "Report successfully deleted" });
    } catch (error) {
        res.status(500).json({ message: "A server error occurred" });
    }
};

export const updateLaporan = async (req, res) => {
    try {
        const { id } = req.params;
        const id_user_req = req.user.id_user;
        const role_req = req.user.role;

        const [laporanLama] = await db.query('SELECT * FROM LAPORAN WHERE id_laporan = ?', [id]);
        if (laporanLama.length === 0) return res.status(404).json({ message: "Report not found" });

        if (laporanLama[0].id_user !== id_user_req && role_req !== 'admin') {
            return res.status(403).json({ message: "You are not authorized to edit this report." });
        }

        const { tipe_laporan, id_kategori, nama_barang, deskripsi, lokasi_kejadian, tanggal_kejadian, imbalan } = req.body;
        
        let url_foto = laporanLama[0].url_foto; 
        if (req.file) {
            url_foto = `/uploads/${req.file.filename}`; 
        }

        const nominalImbalan = imbalan ? parseInt(imbalan) : null;

        const query = `
            UPDATE LAPORAN 
            SET tipe_laporan = ?, id_kategori = ?, nama_barang = ?, deskripsi = ?, lokasi_kejadian = ?, tanggal_kejadian = ?, url_foto = ?, imbalan = ?
            WHERE id_laporan = ?
        `;
        const values = [
            tipe_laporan, 
            id_kategori ? id_kategori : null, 
            nama_barang, 
            deskripsi, 
            lokasi_kejadian, 
            tanggal_kejadian, 
            url_foto, 
            nominalImbalan,
            id
        ];

        await db.query(query, values);
        res.status(200).json({ message: "Report successfully updated!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "A server error occurred" });
    }
};

export const markLaporanSelesai = async (req, res) => {
    try {
        const { id } = req.params;
        const id_user = req.user.id_user; 

        const [result] = await db.query(`UPDATE LAPORAN SET status = 'selesai' WHERE id_laporan = ? AND id_user = ?`, [id, id_user]);
        
        if (result.affectedRows === 0) {
            return res.status(403).json({ message: "Failed: Report not found or you are not the owner." });
        }

        res.status(200).json({ message: "Report successfully marked as complete!" });
    } catch (error) {
        console.error("Error ubah status:", error);
        res.status(500).json({ message: "A server error occurred" });
    }
};

export const getStatistikAdmin = async (req, res) => {
    try {
        const [data] = await db.query('SELECT tipe_laporan, status FROM LAPORAN');
        res.status(200).json(data);
    } catch (error) {
        console.error("Error getStatistikAdmin:", error);
        res.status(500).json({ message: "Failed to retrieve statistical data" });
    }
};

export const getSmartMatches = async (req, res) => {
    try {
        const id_user = req.user.id_user;

        const [myReports] = await db.query('SELECT * FROM LAPORAN WHERE id_user = ? AND status != "selesai"', [id_user]);
        if (myReports.length === 0) return res.status(200).json([]);

        const [otherReports] = await db.query(`
            SELECT l.*, u.nama_lengkap, u.nomor_telepon 
            FROM LAPORAN l
            JOIN USER u ON l.id_user = u.id_user
            WHERE l.id_user != ? AND l.status = 'published'
        `, [id_user]);

        let matchedResults = [];

        myReports.forEach(myRep => {
            otherReports.forEach(otherRep => {
                if (myRep.tipe_laporan !== otherRep.tipe_laporan && myRep.id_kategori === otherRep.id_kategori) {
                    
                    const myNameWords = getWords(myRep.nama_barang);
                    const otherNameWords = getWords(otherRep.nama_barang);
                    const myDescWords = getWords(myRep.deskripsi);
                    const otherDescWords = getWords(otherRep.deskripsi);

                    const isClashing = hasBrandClash(
                        [...myNameWords, ...myDescWords], 
                        [...otherNameWords, ...otherDescWords]
                    );

                    if (isClashing) return;

                    const titleMatches = checkMatch(myNameWords, otherNameWords);

                    if (titleMatches.length > 0) {
                        const descMatches = checkMatch(myDescWords, otherDescWords);
                        
                        let score = (titleMatches.length * 40) + (descMatches.length * 10);
                        if (score > 99) score = 99;

                        const isAlreadyMatched = matchedResults.some(m => m.match.id_laporan === otherRep.id_laporan);
                        if (!isAlreadyMatched) {
                            matchedResults.push({
                                myReportId: myRep.id_laporan,
                                myReportName: myRep.nama_barang,
                                match: otherRep,
                                score: score
                            });
                        }
                    }
                }
            });
        });

        matchedResults.sort((a, b) => b.score - a.score);
        res.status(200).json(matchedResults.slice(0, 5));
    } catch (error) {
        console.error("Error Smart Match:", error);
        res.status(500).json({ message: "A server error occurred" });
    }
};

export const getNotifikasiKu = async (req, res) => {
    try {
        const id_user = req.user.id_user;
        const [notif] = await db.query('SELECT * FROM NOTIFIKASI WHERE id_user = ? ORDER BY waktu_dibuat DESC', [id_user]);
        res.status(200).json(notif);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil notifikasi" });
    }
};

export const tandaiNotifDibaca = async (req, res) => {
    try {
        const id_user = req.user.id_user;
        await db.query('UPDATE NOTIFIKASI SET is_read = TRUE WHERE id_user = ?', [id_user]);
        res.status(200).json({ message: "Notifikasi telah dibaca" });
    } catch (error) {
        res.status(500).json({ message: "Gagal update notifikasi" });
    }
};