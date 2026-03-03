import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Shield, Mail, Phone, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import dsvApi from '../api/dsvApi';

const Staff = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await dsvApi.get('/admins');
            if (res.data.success) {
                setStaff(res.data.admins);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        setUpdating(id);
        try {
            const res = await dsvApi.put(`/admins/${id}/status`, { status });
            if (res.data.success) {
                fetchStaff();
            }
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    const filteredStaff = staff.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Shield size={22} color="var(--accent)" /> Staff & User Management
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
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        <Loader2 size={24} className="loader" style={{ marginBottom: '1rem' }} />
                        <p>Loading staff list...</p>
                    </div>
                ) : (
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
                                            <span style={{
                                                padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem',
                                                background: s.status === 'Active' ? '#dcfce7' : s.status === 'Pending' ? '#fff7ed' : '#fee2e2',
                                                color: s.status === 'Active' ? '#166534' : s.status === 'Pending' ? '#9a3412' : '#991b1b',
                                                fontWeight: 600
                                            }}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                            {s.status === 'Pending' && (
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button
                                                        disabled={updating === s.id}
                                                        onClick={() => handleUpdateStatus(s.id, 'Active')}
                                                        style={{
                                                            background: '#10b981', color: 'white', border: 'none',
                                                            borderRadius: '6px', padding: '0.4rem 0.8rem', cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        <CheckCircle2 size={14} /> Approve
                                                    </button>
                                                    <button
                                                        disabled={updating === s.id}
                                                        onClick={() => handleUpdateStatus(s.id, 'Rejected')}
                                                        style={{
                                                            background: '#ef4444', color: 'white', border: 'none',
                                                            borderRadius: '6px', padding: '0.4rem 0.8rem', cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        <XCircle size={14} /> Reject
                                                    </button>
                                                </div>
                                            )}
                                            {s.status === 'Active' && s.email !== 'admin@gmail.com' && (
                                                <button
                                                    disabled={updating === s.id}
                                                    onClick={() => handleUpdateStatus(s.id, 'Rejected')}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.85rem' }}
                                                >
                                                    Deactivate
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Staff;
