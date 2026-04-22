import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Truck } from 'lucide-react';

const PublicHeader = ({ activePage }) => {
    const isAdmin = !!localStorage.getItem('adminToken');
    const isCustomer = !!localStorage.getItem('customerToken');

    const handleSignOut = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerInfo');
        window.location.reload();
    };

    return (
        <header>
            {/* Top Bar */}
            <div className="top-header" style={{
                background: 'white',
                padding: '1rem 8%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #f0f0f0'
            }}>
                <Link to="/">
                    <img src="/images/logo.jpg" alt="Limber Cargo" style={{ height: '70px' }} />
                </Link>

                <div style={{ display: 'flex', gap: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ color: '#333' }}><MapPin size={32} strokeWidth={1.5} /></div>
                        <div style={{ fontSize: '0.85rem' }}>
                            <div style={{ color: '#777', fontStyle: 'italic' }}>Address : Limber Cargo,</div>
                            <div style={{ color: '#ff6600', fontWeight: 600 }}>Lättichstrasse 6,6340 Baar</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ color: '#333' }}><Phone size={32} strokeWidth={1.5} /></div>
                        <div style={{ fontSize: '0.85rem' }}>
                            <div style={{ color: '#777', fontStyle: 'italic' }}>Phone Number :</div>
                            <div style={{ color: '#ff6600', fontWeight: 600 }}>+41 78 619 59 28</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ color: '#333' }}><Clock size={32} strokeWidth={1.5} /></div>
                        <div style={{ fontSize: '0.85rem' }}>
                            <div style={{ color: '#777', fontStyle: 'italic' }}>Opening Hours :</div>
                            <div style={{ color: '#ff6600', fontWeight: 600 }}>MON - FRi: 8AM - 5PM</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation - Dark Theme */}
            <nav className="public-nav" style={{
                background: '#1a1a1a',
                color: 'white',
                padding: '0 8%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '60px',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <div style={{ display: 'flex', gap: '2rem', height: '100%', alignItems: 'center' }}>
                    <Link to="/" style={{ color: activePage === 'home' ? '#ff6600' : 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Home</Link>
                    <Link to="/shipments" style={{ color: activePage === 'tracking' ? '#ff6600' : 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Tracking</Link>
                    <Link to="/about" style={{ color: activePage === 'about' ? '#ff6600' : 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>About</Link>
                    <Link to="/support" style={{ color: activePage === 'support' ? '#ff6600' : 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Support</Link>
                    <Link to="/contact" style={{ color: activePage === 'contact' ? '#ff6600' : 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Contact</Link>
                    {isCustomer && <Link to="/portal/dashboard" style={{ color: '#ff6600', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Portal</Link>}
                    {isAdmin && <Link to="/dashboard" style={{ color: '#ff6600', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Admin</Link>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', height: '100%' }}>
                    {isAdmin ? (
                        <>
                            <Link to="/dashboard" style={{
                                color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem',
                                background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)',
                                padding: '0.4rem 1rem', borderRadius: '6px'
                            }}>
                                🛡️ Admin Dashboard
                            </Link>
                            <button onClick={handleSignOut} style={{
                                background: 'none', border: '1px solid #444', color: '#aaa',
                                padding: '0.4rem 0.85rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem'
                            }}>
                                Sign Out
                            </button>
                        </>
                    ) : isCustomer ? (
                        <>
                            <Link to="/portal/dashboard" style={{
                                color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem',
                                background: 'rgba(255,102,0,0.15)', border: '1px solid rgba(255,102,0,0.4)',
                                padding: '0.4rem 1rem', borderRadius: '6px'
                            }}>
                                📦 My Portal
                            </Link>
                            <button onClick={handleSignOut} style={{
                                background: 'none', border: '1px solid #444', color: '#aaa',
                                padding: '0.4rem 0.85rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem'
                            }}>
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{
                                color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
                                border: '1px solid #555', padding: '0.4rem 1.1rem', borderRadius: '6px'
                            }}>Login</Link>
                            <Link to="/portal/register" style={{
                                background: '#ff6600', color: 'white',
                                textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
                                padding: '0.4rem 1.1rem', borderRadius: '6px'
                            }}>Register</Link>
                        </>
                    )}
                    <Link to="/order" style={{
                        background: '#ff6600',
                        color: 'white',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 2.5rem',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '1rem'
                    }}>
                        Order Now!
                    </Link>
                </div>
            </nav>
        </header>
    );
};

export default PublicHeader;
