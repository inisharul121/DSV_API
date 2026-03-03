const Order = require('../models/Order');

// GET /api/customer/orders — returns only orders belonging to the logged-in customer
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { customerId: req.customerId },
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Customer Orders Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};
