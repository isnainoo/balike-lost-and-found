import db from '../config/db.js';

export const getPendingLaporan = async (req, res) => {
    try {
        const query = `
            SELECT L.*, U.nama_lengkap 
            FROM LAPORAN L 
            JOIN USER U ON L.id_user = U.id_user 
            WHERE L.status = 'pending' 
            ORDER BY L.waktu_dibuat ASC
        `;
        const [laporan] = await db.query(query);
        res.status(200).json(laporan);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred on the server." });
    }
};

// Update status laporan (published/rejected)
export const updateStatusLaporan = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        if (!['published', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status!" });
        }

        await db.query(`UPDATE LAPORAN SET status = ? WHERE id_laporan = ?`, [status, id]);
        res.status(200).json({ message: `The report was successfully updated to ${status}!` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred on the server." });
    }
};

// Memberikan badge Trusted kepada user
export const updateTrustedUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_trusted } = req.body; 

        await db.query(`UPDATE USER SET is_trusted = ? WHERE id_user = ?`, [is_trusted, id]);
        
        const badgeStatus = is_trusted ? 'given to' : 'removed from';
        res.status(200).json({ message: `Badge Trusted succeed ${badgeStatus} user!` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred on the server." });
    }
};


// --- FUNGSI KHUSUS SUPER ADMIN ---

// 1. Tampilkan semua user untuk dikelola Super Admin
export const getAllUsers = async (req, res) => {
    try {
        const loggedInUserId = req.user.id_user;

        const query = `
            SELECT id_user, nama_lengkap, email, role, is_trusted 
            FROM USER 
            WHERE id_user != ?
            ORDER BY role DESC, nama_lengkap ASC
        `;
        
        const [users] = await db.query(query, [loggedInUserId]);
        res.status(200).json(users);
    } catch (error) {
        console.error("Error getAllUsers:", error);
        res.status(500).json({ message: "Failed to retrieve user list." });
    }
};

// 2. Ubah Role (User biasa ke Admin, atau sebaliknya)
export const changeUserRole = async (req, res) => {
    try {
        // Validasi tambahan: Pastikan hanya super_admin yang bisa akses (sudah dicek di routes, tapi bagus untuk double check)
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ message: "Access denied! Only Super Admin is authorized." });
        }

        const { id } = req.params; // ID User yang akan diubah
        const { role } = req.body;  // Role baru: 'admin' atau 'user'

        // Validasi input role
        if (!['admin', 'user'].includes(role)) {
            return res.status(400).json({ message: "Invalid role! Use 'admin' or 'user'." });
        }

        const query = `UPDATE USER SET role = ? WHERE id_user = ?`;
        await db.query(query, [role, id]);

        res.status(200).json({ 
            message: `Success! Now ${role === 'admin' ? 'This user has Admin access.' : 'This user returns to being a regular user.'}` 
        });
    } catch (error) {
        console.error("Error changeUserRole:", error);
        res.status(500).json({ message: "Failed to update user access rights." });
    }
};