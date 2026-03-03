import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, MapPin, ExternalLink, Loader2 } from 'lucide-react';
import dsvApi from '../api/dsvApi';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await dsvApi.get('/customers');
                if (res.data.success) {
                    setCustomers(res.data.customers);
                }
            } catch (error) {
                console.error('Error fetching customers:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const filtered = customers.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Users size={22} color="var(--accent)" /> Customer Directory
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Search customers..."
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
                        <p>Loading customers...</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                                    <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>NAME</th>
                                    <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>LOCATION</th>
                                    <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>CONTACT</th>
                                    <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>SHIPMENTS</th>
                                    <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c) => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem 0.5rem', fontWeight: 700 }}>{c.name}</td>
                                        <td style={{ padding: '1rem 0.5rem' }}><MapPin size={12} style={{ marginRight: '0.4rem' }} />{c.company || 'N/A'}</td>
                                        <td style={{ padding: '1rem 0.5rem' }}>{c.email}</td>
                                        <td style={{ padding: '1rem 0.5rem' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}>
                                                <ExternalLink size={16} />
                                            </button>
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

export default Customers;
