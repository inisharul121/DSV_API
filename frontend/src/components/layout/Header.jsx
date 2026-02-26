import React from 'react';
import { Search, Bell, User } from 'lucide-react';

const Header = ({ title, subtitle }) => {
    return (
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
                        style={{ paddingLeft: '2.5rem', width: '300px' }}
                    />
                </div>

                <button className="icon-btn" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', cursor: 'pointer', display: 'flex' }}>
                    <Bell size={20} />
                </button>

                <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="user-info" style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Nisharul Islam</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Admin Account</div>
                    </div>
                    <div className="avatar" style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={24} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
