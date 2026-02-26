import React, { useState } from 'react';
import { UserPlus, Search, Shield, Mail, Phone } from 'lucide-react';

const Staff = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const staff = [
        { id: 1, name: 'Mazharul Sheikh', role: 'Administrator', email: 'rony.sheikh@bcic-swiss.com', phone: '+41 78 619 59 28', status: 'Active' },
        { id: 2, name: 'Support Team', role: 'Support', email: 'support@bcic-swiss.com', phone: '+41 44 123 45 67', status: 'Active' },
    ];

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Shield size={22} color="var(--accent)" /> Staff Management
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Search staff..."
                                style={{ paddingLeft: '2.5rem', width: '250px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn-primary">
                            <UserPlus size={18} style={{ marginRight: '0.5rem' }} /> Add Staff
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>NAME</th>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ROLE</th>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>CONTACT</th>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>STATUS</th>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStaff.map((s) => (
                                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem 0.5rem', fontWeight: 700 }}>{s.name}</td>
                                    <td style={{ padding: '1rem 0.5rem' }}>{s.role}</td>
                                    <td style={{ padding: '1rem 0.5rem' }}>
                                        <div style={{ fontSize: '0.85rem' }}><Mail size={12} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />{s.email}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><Phone size={12} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />{s.phone}</div>
                                    </td>
                                    <td style={{ padding: '1rem 0.5rem' }}>
                                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', background: '#dcfce7', color: '#166534' }}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}>Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Staff;
