import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
    Package,
    Truck,
    FileText,
    LogOut,
    LayoutDashboard,
    User,
    Calculator
} from 'lucide-react';

const CustomerSidebar = () => {
    const navigate = useNavigate();
    const customerInfo = JSON.parse(localStorage.getItem('customerInfo') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerInfo');
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/portal/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'My Orders', path: '/portal/orders', icon: <Package size={20} /> },
        { name: 'Quotes', path: '/portal/quotes', icon: <Calculator size={20} /> },
        { name: 'Add Order', path: '/portal/book', icon: <Package size={20} /> },
        { name: 'My Profile', path: '/portal/profile', icon: <User size={20} /> },
        { name: 'Track Shipment', path: '/portal/shipments', icon: <Truck size={20} /> },
        { name: 'Download Label', path: '/portal/labels', icon: <FileText size={20} /> },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <Link to="/">
                    <img src="/images/logo.jpg" alt="Limber Cargo" style={{ width: '100%', height: 'auto' }} />
                </Link>
            </div>

            {/* Customer Info */}
            <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                background: 'rgba(37, 99, 235, 0.04)'
            }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                    Customer Portal
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {customerInfo.name || 'Customer'}
                </div>
                {customerInfo.company && (
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                        {customerInfo.company}
                    </div>
                )}
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Sign Out at the bottom */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        width: '100%', padding: '0.75rem 1rem',
                        background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239,68,68,0.15)',
                        borderRadius: '10px', color: '#dc2626', cursor: 'pointer',
                        fontWeight: 600, fontSize: '0.9rem'
                    }}
                >
                    <LogOut size={18} /> Sign Out
                </button>
            </div>
        </aside>
    );
};

export default CustomerSidebar;
