import db from '../config/db.js';
import { sendMatchEmail } from '../utils/sendEmail.js';

const stopWords = [
    'hilang', 'kehilangan', 'ditemukan', 'menemukan', 'nemu', 'jatuh', 'terjatuh', 
    'tertinggal', 'ketinggalan', 'nyelip', 'terselip', 'dicari', 'mencari', 'ketemu',
    'saya', 'aku', 'kami', 'kita', 'dia', 'kamu', 'beliau', 'mereka', 'ybs', 'min', 'admin',
    'sekitar', 'seperti', 'dengan', 'yang', 'dan', 'di', 'dari', 'ke', 'pada', 'dalam', 
    'untuk', 'buat', 'bagi', 'karena', 'sebab', 'atau', 'tetapi', 'namun', 'jika', 'bila',
    'ini', 'itu', 'sana', 'sini', 'situ', 'ada', 'lagi', 'satu', 'sebuah', 'unit', 'buah', 
    'helai', 'lembar', 'pasang', 'banyak', 'beberapa',
    'warna', 'warnanya', 'berwarna', 'merk', 'merek', 'brand', 'tipe', 'type', 'seri',
    'saat', 'ketika', 'tadi', 'kemarin', 'besok', 'pagi', 'siang', 'sore', 'malam', 'hari', 
    'jam', 'pukul', 'area', 'dekat', 'didekat', 'depan', 'belakang', 'samping', 'luar',
    'tolong', 'bantu', 'hubungi', 'bisa', 'mohon', 'infonya', 'info', 'share', 'bagikan',
    'barangkali', 'siapa', 'tau', 'tahu', 'dong', 'sih', 'nih', 'tuh', 'ya', 'kan', 'kok',
    'lur', 'sedulur', 'minca', 'neng', 'nang', 'ndek', 'ning', 'iki', 'kuwi', 
    'iku', 'mau', 'pas', 'wis', 'wes', 'durung', 'udah', 'belum', 'ilang', 'ketlisut', 
    'ceblok', 'tibho', 'tibo', 'golek', 'pados', 'nuwun', 'monggo', 'punten',
    'yaallah', 'bismillah', 'alhamdulillah', 'astagfirullah', 'guys', 'gaes', 'rek', 
    'temen-temen', 'teman-teman', 'plis', 'please', 'help', 'urgent'
];

const synonyms = {
    'hp': ['handphone', 'ponsel', 'smartphone', 'hape'],
    'handphone': ['hp', 'ponsel', 'smartphone', 'hape'],
    'laptop': ['notebook', 'macbook', 'pc', 'komputer'],
    'charger': ['casan', 'adaptor', 'kabel', 'charging'],
    'casan': ['charger', 'adaptor', 'kabel'],
    'tws': ['earphone', 'headset', 'airpods', 'earbuds', 'headphone'],
    'flashdisk': ['fd', 'usb', 'pendrive', 'flashdrive', 'otg'],
    'powerbank': ['pb', 'baterai'],
    'smartwatch': ['jam pintar', 'iwatch', 'galaxy watch', 'band'],
    'kacamata': ['glasses', 'sunglasses', 'kacamata minus', 'softlens', 'kacamata hitam'],
    'jam tangan': ['arloji', 'watch', 'jam'],
    'powerbank': ['pb', 'baterai', 'power'],
    'tas': ['ransel', 'backpack', 'bag', 'totebag', 'selempang'],
    'dompet': ['wallet', 'pouch', 'cardholder'],
    'sepatu': ['shoes', 'sneakers', 'kets'],
    'sandal': ['sendal', 'slipper', 'swallow', 'slop'],
    'jaket': ['hoodie', 'sweater', 'coat', 'cardigan', 'vest'],
    'topi': ['hat', 'cap', 'kupluk'],
    'helm': ['helmet', 'helem', 'cargloss', 'bogo', 'fullface', 'halfface'],
    'parfum': ['parfume', 'minyak wangi', 'cologne', 'bodymist'],
    'ktp': ['identitas', 'kartu', 'e-ktp', 'id', 'kartu tanda penduduk', 'id card'],
    'ktm': ['kartu mahasiswa', 'krs', 'identitas kampus', 'kartu tanda mahasiswa', 'kartu perpus'],
    'sim': ['surat izin mengemudi', 'sim a', 'sim c', 'sim b'],
    'stnk': ['surat motor', 'surat kendaraan', 'kertas pajak', 'pajak motor', 'kertas stnk'],
    'bpkb': ['buku motor', 'surat kendaraan'],
    'atm': ['kartu debit', 'kredit', 'cc', 'kartu bank'],
    'kunci': ['key', 'remot', 'keyless', 'smartkey', 'kontak'],
    'kunci kos': ['kunci kamar', 'kunci kost', 'kunci gembok'],
    'kunci motor': ['kunci kontak', 'remot motor', 'keyless'],
    'kunci mobil': ['remot mobil', 'kunci kontak mobil'],
    'motor': ['sepeda motor', 'kendaraan', 'roda dua', 'kereta'],
    'mobil': ['kendaraan', 'roda empat', 'car'],
    'botol': ['tumbler', 'botol minum', 'tempat minum', 'termos'],
    'kalkulator': ['calculator', 'alat hitung'],
    'alat tulis': ['tempat pensil', 'tepak', 'kotak pensil', 'pulpen', 'pensil'],
    'buku': ['binder', 'catatan', 'jurnal', 'diktat', 'modul'],
    'payung': ['umbrella', 'payung lipat'],
    'jas hujan': ['mantol', 'mantal', 'raincoat'],
    'biru': ['blue', 'navy', 'cyan'],
    'blue': ['biru', 'navy'],
    'hitam': ['black', 'dark', 'gelap'],
    'putih': ['white', 'clear', 'bening'],
    'merah': ['red', 'maroon', 'marun', 'pink', 'merah muda'],
    'hijau': ['green', 'ijo', 'tosca'],
    'abu': ['grey', 'gray', 'silver', 'abu-abu'],
    'kuning': ['yellow', 'gold', 'emas'],
    'coklat': ['brown', 'cokelat', 'cream', 'krem'],
    'biru dongker': ['navy', 'biru gelap', 'dark blue'],
    'merah marun': ['maroon', 'merah tua', 'dark red'],
    'hijau botol': ['hijau tua', 'dark green'],
    'putih tulang': ['broken white', 'krem', 'cream']
};

const brandGroups = [
    ['apple', 'iphone', 'ip', 'macbook', 'ipad', 'ios', 'airpods', 'iwatch'], 
    ['samsung', 'galaxy', 'zflip', 'zfold', 'note'], 
    ['xiaomi', 'redmi', 'poco', 'mi', 'blackshark'], 
    ['oppo', 'reno', 'findx'], 
    ['vivo', 'iqoo', 'nex'],
    ['infinix', 'zero', 'hot', 'note', 'smart'], 
    ['realme', 'narzo'],
    ['huawei', 'honor'],
    ['asus', 'rog', 'tuf', 'vivobook', 'zenbook'], 
    ['acer', 'predator', 'nitro', 'swift', 'aspire'],
    ['lenovo', 'thinkpad', 'ideapad', 'legion', 'yoga', 'loq'], 
    ['hp', 'omen', 'pavilion', 'victus', 'envy'],
    ['msi', 'stealth', 'katana', 'cyborg'],
    ['honda', 'vario', 'beat', 'scoopy', 'pcx', 'supra', 'cbr', 'brio', 'jazz', 'hrv', 'crv', 'civic'], 
    ['yamaha', 'nmax', 'aerox', 'mio', 'jupiter', 'r15', 'lexi', 'fazzio', 'grand filano'], 
    ['suzuki', 'satria', 'gsx', 'ertiga', 'jimny'],
    ['kawasaki', 'ninja', 'klx', 'w175'],
    ['vespa', 'piaggio', 'sprint', 'primavera', 'gts'],
    ['toyota', 'avanza', 'innova', 'agya', 'yaris', 'fortuner', 'rush'],
    ['daihatsu', 'ayla', 'sigra', 'xenia', 'terios'],
    ['kyt', 'vendetta', 'falcon', 'rc7', 'kyoto', 'galaxy'],
    ['nhk', 'terminator', 'rx9', 'r6'],
    ['ink', 'centro', 'clmax', 'cx22'],
    ['bogo', 'cargloss', 'carglos'],
    ['rsv', 'sv300', 'ff500'],
    ['njs', 'kairoz', 'zx1'],
    ['gm', 'bmc', 'mds'],
    ['shoei'], ['agv'], ['arai'], ['nolan'],
    ['nike', 'jordan', 'swoosh', 'airmax'],
    ['adidas', 'yeezy', 'ultraboost'],
    ['vans', 'old skool', 'sk8'],
    ['converse', 'all star', 'chuck taylor'],
    ['eiger', 'consina', 'arei', 'deuter', 'hydroflask'],
    ['uniqlo'], ['h&m'], ['zara'],
    ['bca', 'tahapan', 'xpresi', 'flazz'],
    ['bri', 'simpedes', 'britama', 'brizzi'],
    ['bni', 'taplus', 'tapcash'],
    ['mandiri', 'livin', 'emoney'],
    ['bsi', 'bsm', 'syariah'],
    ['dior', 'sauvage', 'chanel', 'bvlgari', 'baccarat', 'kahf', 'gatsby'],
    ['corkcicle', 'cork'],
    ['tupperware', 'tuperware'],
    ['locknlock', 'lock n lock', 'lock&lock'],
    ['miniso', 'kkv'],
    ['casio', 'citizen', 'karce', 'joyko', 'kenko', 'g-shock', 'gshock', 'baby-g', 'edifice'],
    ['garmin', 'suunto', 'coros'],
    ['alexandre christie', 'ac', 'expedition'],
    ['fossil', 'daniel wellington', 'dw', 'seiko', 'alba'],
    ['miband', 'mi band', 'huawei band', 'galaxy fit']
];

const formatDateToString = (dateObj) => {
    if (!dateObj) return null;
    const d = new Date(dateObj);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

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

const checkDateMatch = (date1, date2) => {
    if (!date1 || !date2) return 0;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays === 0) return 20; 
    if (diffDays <= 2) return 10;  
    if (diffDays <= 7) return 5;   
    return 0; 
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
        const myLocWords = getWords(newRep.lokasi_kejadian);

        for (let otherRep of otherReports) {
            const otherNameWords = getWords(otherRep.nama_barang);
            const otherDescWords = getWords(otherRep.deskripsi);
            const otherLocWords = getWords(otherRep.lokasi_kejadian);

            const isClashing = hasBrandClash(
                [...myNameWords, ...myDescWords], 
                [...otherNameWords, ...otherDescWords]
            );

            if (isClashing) continue;

            const titleMatches = checkMatch(myNameWords, otherNameWords);

            if (titleMatches.length > 0) {
                const descMatches = checkMatch(myDescWords, otherDescWords);
                const locMatches = checkMatch(myLocWords, otherLocWords);
                const dateScore = checkDateMatch(newRep.tanggal_kejadian, otherRep.tanggal_kejadian);

                let titleScore = Math.round((titleMatches.length / Math.max(myNameWords.length, 1)) * 50);
                if (titleScore > 50) titleScore = 50;

                let descScore = Math.round((descMatches.length / Math.max(myDescWords.length, 1)) * 15);
                if (descScore > 15) descScore = 15;

                let locScore = Math.round((locMatches.length / Math.max(myLocWords.length, 1)) * 15);
                if (locScore > 15) locScore = 15;

                let score = titleScore + descScore + locScore + dateScore;
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
                    const myLocWords = getWords(myRep.lokasi_kejadian);
                    const otherLocWords = getWords(otherRep.lokasi_kejadian);

                    const isClashing = hasBrandClash(
                        [...myNameWords, ...myDescWords], 
                        [...otherNameWords, ...otherDescWords]
                    );

                    if (isClashing) return;

                    const titleMatches = checkMatch(myNameWords, otherNameWords);

                    if (titleMatches.length > 0) {
                        const descMatches = checkMatch(myDescWords, otherDescWords);
                        const locMatches = checkMatch(myLocWords, otherLocWords);
                        const dateScore = checkDateMatch(myRep.tanggal_kejadian, otherRep.tanggal_kejadian);
                        
                        let titleScore = Math.round((titleMatches.length / Math.max(myNameWords.length, 1)) * 50);
                        if (titleScore > 50) titleScore = 50;

                        let descScore = Math.round((descMatches.length / Math.max(myDescWords.length, 1)) * 15);
                        if (descScore > 15) descScore = 15;

                        let locScore = Math.round((locMatches.length / Math.max(myLocWords.length, 1)) * 15);
                        if (locScore > 15) locScore = 15;

                        let score = titleScore + descScore + locScore + dateScore;
                        if (score > 99) score = 99;

                        if (score >= 55) { 
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

        laporan.forEach(lap => {
            lap.tanggal_kejadian = formatDateToString(lap.tanggal_kejadian);
        });

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

        laporan.forEach(lap => {
            lap.tanggal_kejadian = formatDateToString(lap.tanggal_kejadian);
        });

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
        
        laporan[0].tanggal_kejadian = formatDateToString(laporan[0].tanggal_kejadian);
        
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

        const nominalImbalan = imbalan ? Math.round(Number(imbalan)) : null;

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
