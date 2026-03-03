const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_ADMIN_SECRET || 'limber-cargo-admin-secret-2026';
const JWT_EXPIRES = '24h';

// POST /api/auth/admin/register (Internal/Initial setup)
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existing = await Admin.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({ success: false, error: 'Admin already exists.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const admin = await Admin.create({ name, email, passwordHash, role });

        res.status(201).json({
            success: true,
            admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/auth/admin/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ where: { email } });
        if (!admin) {
            return res.status(401).json({ success: false, error: 'Invalid credentials.' });
        }

        if (admin.status !== 'Active') {
            return res.status(403).json({ success: false, error: 'Your account is pending approval or has been deactivated.' });
        }

        const valid = await bcrypt.compare(password, admin.passwordHash);
        if (!valid) {
            return res.status(401).json({ success: false, error: 'Invalid credentials.' });
        }

        const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

        res.json({
            success: true,
            token,
            admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/auth/admin/me
exports.me = async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.adminId, {
            attributes: ['id', 'name', 'email', 'role']
        });
        if (!admin) return res.status(404).json({ success: false, error: 'Admin not found.' });
        res.json({ success: true, admin });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/admins - List all staff (Admin only)
exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.findAll({
            attributes: ['id', 'name', 'email', 'role', 'status', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, admins });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /api/admins/:id/status - Update staff status (Admin only)
exports.updateAdminStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!['Active', 'Pending', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status.' });
        }

        const admin = await Admin.findByPk(id);
        if (!admin) return res.status(404).json({ success: false, error: 'Admin not found.' });

        admin.status = status;
        await admin.save();

        res.json({ success: true, message: `Staff status updated to ${status}.` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
