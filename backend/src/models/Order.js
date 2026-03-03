const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    bookingId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    shipperName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    receiverName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    originCountry: {
        type: DataTypes.STRING(2),
        allowNull: true
    },
    destinationCountry: {
        type: DataTypes.STRING(2),
        allowNull: true
    },
    serviceCode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    totalWeight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    goodsValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    currency: {
        type: DataTypes.STRING(3),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Created'
    },
    labelUrl: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'orders'
});

module.exports = Order;
