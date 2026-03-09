const Order = require('../models/Order');
const { Op, fn, col, literal } = require('sequelize');

exports.getMonthlyReport = async (req, res) => {
    try {
        const { month, year } = req.query;

        // Default to current month/year if not provided
        const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
        const targetYear = year ? parseInt(year) : new Date().getFullYear();

        console.log(`[ReportController] Generating report for ${targetMonth}/${targetYear}`);

        // Define date range for the selected month
        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

        const orders = await Order.findAll({
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        // Basic Aggregates
        const totalShipments = orders.length;
        const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.totalPrice) || 0), 0);
        const totalWeight = orders.reduce((sum, o) => sum + (parseFloat(o.totalWeight) || 0), 0);

        // Status Breakdown
        const statusBreakdown = orders.reduce((acc, o) => {
            acc[o.status] = (acc[o.status] || 0) + 1;
            return acc;
        }, {});

        // Service Breakdown
        const serviceBreakdown = orders.reduce((acc, o) => {
            acc[o.serviceCode] = (acc[o.serviceCode] || 0) + 1;
            return acc;
        }, {});

        // Destination Breakdown (Corridors)
        const destinationBreakdown = orders.reduce((acc, o) => {
            const country = o.receiverCountry || 'Unknown';
            acc[country] = (acc[country] || 0) + 1;
            return acc;
        }, {});

        // Sort destinations by count
        const topDestinations = Object.entries(destinationBreakdown)
            .map(([country, count]) => ({ country, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        res.json({
            success: true,
            data: {
                period: { month: targetMonth, year: targetYear },
                summary: {
                    totalShipments,
                    totalRevenue: totalRevenue.toFixed(2),
                    totalWeight: totalWeight.toFixed(2),
                    avgRevenuePerShipment: totalShipments > 0 ? (totalRevenue / totalShipments).toFixed(2) : 0
                },
                breakdowns: {
                    status: statusBreakdown,
                    service: serviceBreakdown,
                    topDestinations
                }
            }
        });
    } catch (error) {
        console.error('Monthly Report Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
