const Order = require('../models/Order');

exports.getOrders = async (req, res) => {
    try {
        console.log('[OrderController] Fetching all orders...');
        const orders = await Order.findAll({
            order: [['createdAt', 'DESC']]
        });
        console.log(`[OrderController] Found ${orders.length} orders.`);

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Fetch Orders Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Fetch Order Detail Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        console.log('[OrderController] Fetching dashboard stats...');
        const totalShipments = await Order.count();
        const delivered = await Order.count({ where: { status: 'Delivered' } });
        // In processing includes 'Created', 'In Transit', 'Pending'
        const inProcessing = await Order.count({
            where: {
                status: ['Created', 'In Transit', 'Pending', 'Booked']
            }
        });
        const exceptions = await Order.count({
            where: {
                status: ['Exception', 'Failed', 'Cancelled']
            }
        });

        res.json({
            success: true,
            data: {
                totalShipments,
                delivered,
                inProcessing,
                exceptions
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
