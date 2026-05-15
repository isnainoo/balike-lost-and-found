import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(403).json({ message: "Access denied, token not found!" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Token is invalid or expired!" });
        req.user = decoded; 
        next();
    });
};

export const isAdmin = (req, res, next) => {
    // --- PERBAIKAN DI SINI ---
    // Tambahkan kondisi OR (||) untuk mengenali super_admin
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
        next();
    } else {
        res.status(403).json({ message: "Access denied! Only Admin or Super Admin is allowed." });
    }
};