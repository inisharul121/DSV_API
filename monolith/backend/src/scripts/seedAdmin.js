const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const Admin = require('../models/Admin');
const sequelize = require('../config/database');

async function seedAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const passwordHash = await bcrypt.hash('demo1234', 10);

        const [admin, created] = await Admin.findOrCreate({
            where: { email: 'admin@gmail.com' },
            defaults: {
                id: uuidv4(),
                name: 'Test Admin',
                passwordHash: passwordHash,
                role: 'Admin',
                status: 'Active'
            }
        });

        if (created) {
            console.log('Test admin created: admin@gmail.com / demo1234');
        } else {
            admin.status = 'Active';
            admin.passwordHash = passwordHash;
            await admin.save();
            console.log('Test admin updated: admin@gmail.com / demo1234');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
