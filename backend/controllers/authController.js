import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const { nama_lengkap, email, password, nomor_telepon } = req.body;

        const [existingUser] = await db.query('SELECT * FROM USER WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Email is already registered!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = 'INSERT INTO USER (nama_lengkap, email, password, nomor_telepon) VALUES (?, ?, ?, ?)';
        await db.query(query, [nama_lengkap, email, hashedPassword, nomor_telepon]);

        res.status(201).json({ message: "Registration successful! Please login." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred on the server." });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.query('SELECT * FROM USER WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: "Email not found!" });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Wrong password!" });
        }

        const payload = {
            id_user: user.id_user,
            role: user.role,
            is_trusted: user.is_trusted
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            message: "Login successful!",
            token,
            user: {
                id_user: user.id_user,
                nama_lengkap: user.nama_lengkap,
                role: user.role,
                is_trusted: user.is_trusted
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred on the server." });
    }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
    try {
        const id_user = req.user.id_user; 
        const { nama_lengkap, nomor_telepon } = req.body;

        await db.query(`UPDATE USER SET nama_lengkap = ?, nomor_telepon = ? WHERE id_user = ?`, [nama_lengkap, nomor_telepon, id_user]);
        res.status(200).json({ message: "Profile updated successfully!" });
    } catch (error) {
        console.error("Error Update Profile:", error);
        res.status(500).json({ message: "A server error occurred" });
    }
};

// UPDATE PASSWORD
export const updatePassword = async (req, res) => {
    try {
        const id_user = req.user.id_user;
        const { passwordLama, passwordBaru } = req.body;

        const [users] = await db.query('SELECT password FROM USER WHERE id_user = ?', [id_user]);
        if (users.length === 0) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(passwordLama, users[0].password);
        if (!isMatch) return res.status(400).json({ message: "Old password is incorrect!" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordBaru, salt);

        await db.query('UPDATE USER SET password = ? WHERE id_user = ?', [hashedPassword, id_user]);
        res.status(200).json({ message: "Password changed successfully!" });
    } catch (error) {
        console.error("Error Update Password:", error);
        res.status(500).json({ message: "A server error occurred" });
    }
};

// LUPA PASSWORD
export const verifikasiLupaPassword = async (req, res) => {
    try {
        const { email, nomor_telepon } = req.body;

        const [users] = await db.query('SELECT id_user FROM USER WHERE email = ? AND nomor_telepon = ?', [email, nomor_telepon]);
        if (users.length === 0) {
            return res.status(404).json({ message: "Email or Phone Number does not match our data!" });
        }

        const resetToken = jwt.sign({ id_user: users[0].id_user }, process.env.JWT_SECRET, { expiresIn: '15m' });
        
        res.status(200).json({ resetToken, message: "Verification successful. Please create a new password." });
    } catch (error) {
        res.status(500).json({ message: "A server error occurred" });
    }
};

// SAVE PASSWORD BARU
export const resetPassword = async (req, res) => {
    try {
        const { resetToken, passwordBaru } = req.body;

        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordBaru, salt);

        await db.query('UPDATE USER SET password = ? WHERE id_user = ?', [hashedPassword, decoded.id_user]);
        
        res.status(200).json({ message: "Password successfully reset! Please login." });
    } catch (error) {
        res.status(400).json({ message: "The password reset session is invalid or has expired." });
    }
};