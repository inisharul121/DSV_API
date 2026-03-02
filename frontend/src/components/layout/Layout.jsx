import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
    const location = useLocation();

    // Map routes to titles
    const getPageTitle = (pathname) => {
        switch (pathname) {
            case '/': return 'Dashboard Overview';
            case '/order': return 'Order';
            case '/shipments': return 'Shipment Management';
            case '/orders': return 'Order History';
            case '/customers': return 'Customer Directory';
            case '/payments': return 'Payment History';
            case '/reports': return 'Detailed Reports';
            case '/profile': return 'User Profile';
            default: return 'DSV XPress';
        }
    };

    const getPageSubtitle = (pathname) => {
        switch (pathname) {
            case '/': return 'Welcome back, Islam! Here is what is happening today.';
            case '/order': return 'Follow the steps below to book a new order.';
            default: return 'Manage your DSV XPress operations.';
        }
    };

    return (
        <div className="layout" style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main className="main-content" style={{ marginLeft: 'var(--sidebar-width)', flex: 1, padding: '2rem 3rem' }}>
                <Header
                    title={getPageTitle(location.pathname)}
                    subtitle={getPageSubtitle(location.pathname)}
                />
                <div className="view-container" style={{ marginTop: '2rem' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
