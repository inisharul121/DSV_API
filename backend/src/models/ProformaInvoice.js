const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProformaInvoice = sequelize.define('ProformaInvoice', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    invoiceNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    baseAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    taxAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    currency: {
        type: DataTypes.STRING(3),
        allowNull: true
    },
    invoiceUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Generated'
    }
}, {
    timestamps: true,
    tableName: 'proforma_invoices'
});


module.exports = ProformaInvoice;
// Associations are handled in app.js to avoid circular dependencies
