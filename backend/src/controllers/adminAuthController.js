const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET || 'limber-cargo-admin-secret-2026';
const JWT_EXPIRES = '24h';

// POST /api/auth/admin/register
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        const existing = await Admin.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({ success: false, error: 'Admin already exists.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const admin = await Admin.create({ name, email, passwordHash, role, phone });

        res.status(201).json({
            success: true,
            admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, phone: admin.phone }
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
            attributes: ['id', 'name', 'email', 'role', 'phone']
        });
        if (!admin) return res.status(404).json({ success: false, error: 'Admin not found.' });
        res.json({ success: true, admin });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /api/auth/admin/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const admin = await Admin.findByPk(req.adminId);

        if (!admin) return res.status(404).json({ success: false, error: 'Admin not found.' });

        if (name) admin.name = name;
        if (email) admin.email = email;
        if (phone) admin.phone = phone;

        if (password) {
            admin.passwordHash = await bcrypt.hash(password, 10);
        }

        await admin.save();

        res.json({
            success: true,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                phone: admin.phone
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/admins - List all staff (Admin only)
exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.findAll({
            attributes: ['id', 'name', 'email', 'role', 'status', 'phone', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, admins });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /api/admins/:id - Update staff details (Admin only)
exports.updateAdmin = async (req, res) => {
    try {
        const { name, role, phone, email } = req.body;
        const admin = await Admin.findByPk(req.params.id);

        if (!admin) return res.status(404).json({ success: false, error: 'Admin not found.' });

        if (name) admin.name = name;
        if (role) admin.role = role;
        if (phone) admin.phone = phone;
        if (email) admin.email = email;

        await admin.save();
        res.json({ success: true, admin });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// DELETE /api/admins/:id - Delete staff (Admin only)
exports.deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.params.id);
        if (!admin) return res.status(404).json({ success: false, error: 'Admin not found.' });

        // Prevent deleting the main admin
        if (admin.email === 'admin@gmail.com') {
            return res.status(403).json({ success: false, error: 'Super Admin cannot be deleted.' });
        }

        await admin.destroy();
        res.json({ success: true, message: 'Admin deleted successfully.' });
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
