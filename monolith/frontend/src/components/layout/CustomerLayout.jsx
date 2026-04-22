import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import CustomerSidebar from './CustomerSidebar';
import Header from './Header';

const CustomerLayout = () => {
    const customerInfo = JSON.parse(localStorage.getItem('customerInfo') || '{}');
    const token = localStorage.getItem('customerToken');
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect to login if no token
    if (!token) {
        navigate('/login');
        return null;
    }

    const getPageTitle = () => {
        if (location.pathname === '/portal/dashboard') return { title: 'Dashboard', subtitle: 'Overview of your shipping activity.' };
        if (location.pathname === '/portal/orders') return { title: 'My Orders', subtitle: 'Detailed list of all your shipments.' };
        if (location.pathname === '/portal/profile') return { title: 'My Profile', subtitle: 'Manage your account settings.' };
        if (location.pathname === '/portal/book') return { title: 'Book Shipment', subtitle: 'Create a new shipment request.' };
        if (location.pathname === '/portal/shipments') return { title: 'Track Shipment', subtitle: 'Monitor your cargo in real-time.' };
        if (location.pathname === '/portal/labels') return { title: 'Download Label', subtitle: 'Retrieve your shipping documents.' };
        return { title: 'Customer Portal', subtitle: 'Manage your logistics with Limber Cargo.' };
    };

    const { title, subtitle } = getPageTitle();

    return (
        <div className="layout" style={{ display: 'flex', minHeight: '100vh' }}>
            <CustomerSidebar />
            <main className="main-content" style={{ marginLeft: 'var(--sidebar-width)', flex: 1, padding: '2rem 3rem' }}>
                <Header title={title} subtitle={subtitle} />

                <div className="view-container" style={{ marginTop: '2rem' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default CustomerLayout;
