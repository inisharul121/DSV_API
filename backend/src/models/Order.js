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
    awb: {
        type: DataTypes.STRING,
        allowNull: true
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
    },
    invoiceUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    hsCode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    reasonForExport: {
        type: DataTypes.STRING,
        allowNull: true
    },
    incoterms: {
        type: DataTypes.STRING,
        allowNull: true
    },
    originOfGoods: {
        type: DataTypes.STRING(2),
        allowNull: true
    },
    origin_eori: { type: DataTypes.STRING, allowNull: true },
    dest_eori: { type: DataTypes.STRING, allowNull: true },
    iossNumber: { type: DataTypes.STRING, allowNull: true },
    unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    netWeight: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    uom: { type: DataTypes.STRING, allowNull: true },
    invoice_number: { type: DataTypes.STRING, allowNull: true },
    invoice_type: { type: DataTypes.STRING, allowNull: true },
    invoice_signature: { type: DataTypes.STRING, allowNull: true },
    customerId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'customers',
            key: 'id'
        }
    },
    totalShippingPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    baseShippingPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'orders'
});


module.exports = Order;
// Associations are handled in app.js to avoid circular dependencies
