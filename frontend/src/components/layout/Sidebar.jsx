import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Truck,
    Users,
    CreditCard,
    BarChart3,
    UserCircle,
    FileText
} from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Shipping Wizard', path: '/booking', icon: <Package size={20} /> },
        { name: 'Quotes', path: '/quotes', icon: <CreditCard size={20} /> },
        { name: 'Shipments', path: '/shipments', icon: <Truck size={20} /> },
        { name: 'Labels', path: '/labels', icon: <FileText size={20} /> },
        { name: 'Customers', path: '/customers', icon: <Users size={20} /> },
        { name: 'Payments', path: '/payments', icon: <CreditCard size={20} /> },
        { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} /> },
        { name: 'Staff Management', path: '/staff', icon: <Users size={20} /> },
        { name: 'Profile', path: '/profile', icon: <UserCircle size={20} /> },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-icon">DSV</div>
                <div className="logo-text">XPress</div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
