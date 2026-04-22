import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Truck,
    Users,
    CreditCard,
    BarChart3,
    UserCircle,
    FileText,
    LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Order List', path: '/order-list', icon: <FileText size={20} /> },
        { name: 'Order', path: '/order', icon: <Package size={20} /> },
        { name: 'Quotes', path: '/quotes', icon: <CreditCard size={20} /> },
        { name: 'Shipments', path: '/shipments', icon: <Truck size={20} /> },
        { name: 'Labels', path: '/labels', icon: <FileText size={20} /> },
        { name: 'Customers', path: '/customers', icon: <Users size={20} /> },
        { name: 'Payments', path: '/payments', icon: <CreditCard size={20} /> },
        { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} /> },
        { name: 'Admin Management', path: '/staff', icon: <Users size={20} /> },
        { name: 'Profile', path: '/profile', icon: <UserCircle size={20} /> },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <Link to="/">
                    <img src="/images/logo.jpg" alt="Limber Cargo" style={{ width: '100%', height: 'auto' }} />
                </Link>
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

            <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--border)' }}>
                <button
                    onClick={() => {
                        localStorage.removeItem('adminToken');
                        localStorage.removeItem('adminInfo');
                        navigate('/login');
                    }}
                    className="nav-item"
                    style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                    }}
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
