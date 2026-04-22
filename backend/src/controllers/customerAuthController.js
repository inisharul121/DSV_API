const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const { Sequelize } = require('sequelize');

const JWT_SECRET = process.env.JWT_CUSTOMER_SECRET || process.env.JWT_SECRET || 'limber-cargo-customer-secret-2026';
const JWT_EXPIRES = '7d';

// POST /api/auth/customer/register
exports.register = async (req, res) => {
    try {
        const { name, email, password, company, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: 'Name, email and password are required.' });
        }

        const existing = await Customer.findOne({ where: { email } });
        if (existing) {
            return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const customer = await Customer.create({ name, email, passwordHash, company, phone });

        const token = jwt.sign({ id: customer.id, email: customer.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

        res.status(201).json({
            success: true,
            token,
            customer: { id: customer.id, name: customer.name, email: customer.email, company: customer.company }
        });
    } catch (error) {
        console.error('Customer Register Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/auth/customer/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required.' });
        }

        const customer = await Customer.findOne({ where: { email } });
        if (!customer) {
            return res.status(401).json({ success: false, error: 'Invalid email or password.' });
        }

        const valid = await bcrypt.compare(password, customer.passwordHash);
        if (!valid) {
            return res.status(401).json({ success: false, error: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: customer.id, email: customer.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

        res.json({
            success: true,
            token,
            customer: { id: customer.id, name: customer.name, email: customer.email, company: customer.company }
        });
    } catch (error) {
        console.error('Customer Login Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /api/auth/customer/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, company, phone, password } = req.body;
        const customer = await Customer.findByPk(req.customerId);

        if (!customer) return res.status(404).json({ success: false, error: 'Customer not found.' });

        if (name) customer.name = name;
        if (company) customer.company = company;
        if (phone) customer.phone = phone;

        if (password) {
            customer.passwordHash = await bcrypt.hash(password, 10);
        }

        await customer.save();

        res.json({
            success: true,
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                company: customer.company,
                phone: customer.phone
            }
        });
    } catch (error) {
        console.error('Customer Update Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/auth/customer/me  (verify token)
exports.me = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.customerId, {
            attributes: ['id', 'name', 'email', 'company', 'phone', 'createdAt']
        });
        if (!customer) return res.status(404).json({ success: false, error: 'Customer not found.' });
        res.json({ success: true, customer });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/customers - List all customers (Admin only)
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.findAll({
            attributes: ['id', 'name', 'email', 'company', 'phone', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, customers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /api/customers/:id - Admin Update Customer
exports.updateCustomerAdmin = async (req, res) => {
    try {
        const { name, company, phone, email } = req.body;
        const customer = await Customer.findByPk(req.params.id);

        if (!customer) return res.status(404).json({ success: false, error: 'Customer not found.' });

        if (name) customer.name = name;
        if (company) customer.company = company;
        if (phone) customer.phone = phone;
        if (email) customer.email = email;

        await customer.save();

        res.json({ success: true, customer });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// DELETE /api/customers/:id - Admin Delete Customer
exports.deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ success: false, error: 'Customer not found.' });

        await customer.destroy();
        res.json({ success: true, message: 'Customer deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/customers/:id/summary - Admin Get Customer Summary
exports.getCustomerSummary = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findByPk(id, {
            attributes: ['id', 'name', 'email', 'company', 'createdAt']
        });

        if (!customer) return res.status(404).json({ success: false, error: 'Customer not found.' });

        const totalOrders = await Order.count({ where: { customerId: id } });
        const totalSpent = await Order.sum('goodsValue', { where: { customerId: id } }) || 0;
        const totalWeight = await Order.sum('totalWeight', { where: { customerId: id } }) || 0;

        const lastOrder = await Order.findOne({
            where: { customerId: id },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            summary: {
                customer,
                stats: {
                    totalOrders,
                    totalSpent,
                    totalWeight,
                    lastOrderDate: lastOrder ? lastOrder.createdAt : null
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
