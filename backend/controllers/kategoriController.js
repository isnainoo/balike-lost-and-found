import db from '../config/db.js';

export const getAllKategori = async (req, res) => {
    try {
        const [kategori] = await db.query('SELECT * FROM KATEGORI ORDER BY id_kategori ASC');
        res.status(200).json(kategori);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred on the server." });
    }
};