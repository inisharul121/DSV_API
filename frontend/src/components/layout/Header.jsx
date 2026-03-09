import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, LogOut, UserCircle, ChevronDown } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Header = ({ title, subtitle }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');
    const name = adminInfo.name || 'Admin User';
    const role = adminInfo.role || 'Administrator';

    // Get initials for avatar
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            navigate(`/shipments?id=${searchTerm.trim()}`);
            setSearchTerm('');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        navigate('/login');
    };

    return (
        <header className="top-bar">
            <div className="page-title">
                <h1>{title}</h1>
                <p>{subtitle}</p>
            </div>

            <div className="header-actions" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <div className="search-box" style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                        type="text"
                        placeholder="Search shipments..."
                        className="input-field"
                        style={{ paddingLeft: '2.5rem', width: '280px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleSearch}
                    />
                </div>

                <button className="icon-btn" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', cursor: 'pointer', display: 'flex', color: '#64748b' }}>
                    <Bell size={20} />
                </button>

                <div
                    className="user-profile-container"
                    ref={dropdownRef}
                    style={{ position: 'relative' }}
                >
                    <div
                        className="user-profile"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '12px',
                            transition: 'background 0.2s',
                            background: isProfileOpen ? '#f1f5f9' : 'transparent'
                        }}
                    >
                        <div className="avatar" style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'var(--accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.9rem'
                        }}>
                            {initials}
                        </div>
                        <div className="user-info" style={{ textAlign: 'left', display: 'none', '@media (minWidth: 768px)': { display: 'block' } }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                {name} <ChevronDown size={14} style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{role}</div>
                        </div>
                    </div>

                    {isProfileOpen && (
                        <div className="dropdown-menu card" style={{
                            position: 'absolute',
                            top: 'calc(100% + 10px)',
                            right: 0,
                            width: '200px',
                            padding: '0.5rem',
                            zIndex: 100,
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                            animation: 'fadeIn 0.2s ease-out'
                        }}>
                            <Link to="/profile" onClick={() => setIsProfileOpen(false)} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                color: '#475569',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                transition: 'background 0.2s'
                            }} className="dropdown-item">
                                <UserCircle size={18} /> My Profile
                            </Link>
                            <div style={{ height: '1px', background: '#f1f5f9', margin: '0.4rem 0' }}></div>
                            <button
                                onClick={handleLogout}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    color: '#ef4444',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    textAlign: 'left',
                                    transition: 'background 0.2s'
                                }}
                                className="dropdown-item logout"
                            >
                                <LogOut size={18} /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
