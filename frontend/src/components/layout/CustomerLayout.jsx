import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import CustomerSidebar from './CustomerSidebar';
import { Search, Bell, User } from 'lucide-react';

const CustomerLayout = () => {
    const customerInfo = JSON.parse(localStorage.getItem('customerInfo') || '{}');
    const token = localStorage.getItem('customerToken');
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect to login if no token
    if (!token) {
        navigate('/portal/login');
        return null;
    }

    const getPageTitle = () => {
        if (location.pathname === '/portal/dashboard') return { title: 'Dashboard', subtitle: 'Overview of your shipping activity.' };
        if (location.pathname === '/portal/orders') return { title: 'My Orders', subtitle: 'Detailed list of all your shipments.' };
        if (location.pathname === '/portal/profile') return { title: 'My Profile', subtitle: 'Manage your account settings.' };
        if (location.pathname === '/portal/book') return { title: 'Book Shipment', subtitle: 'Create a new shipment request.' };
        return { title: 'Customer Portal', subtitle: 'Manage your logistics with Limber Cargo.' };
    };

    const { title, subtitle } = getPageTitle();

    return (
        <div className="layout" style={{ display: 'flex', minHeight: '100vh' }}>
            <CustomerSidebar />
            <main className="main-content" style={{ marginLeft: 'var(--sidebar-width)', flex: 1, padding: '2rem 3rem' }}>
                {/* Header */}
                <header className="top-bar">
                    <div className="page-title">
                        <h1>{title}</h1>
                        <p>{subtitle}</p>
                    </div>

                    <div className="header-actions" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div className="search-box" style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="text"
                                placeholder="Search shipments..."
                                className="input-field"
                                style={{ paddingLeft: '2.5rem', width: '260px' }}
                            />
                        </div>

                        <button className="icon-btn" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', cursor: 'pointer', display: 'flex' }}>
                            <Bell size={20} />
                        </button>

                        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="user-info" style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{customerInfo.name || 'Customer'}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{customerInfo.company || 'Customer Account'}</div>
                            </div>
                            <div className="avatar" style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={24} />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="view-container" style={{ marginTop: '2rem' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default CustomerLayout;
