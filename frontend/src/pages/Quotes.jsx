import React, { useState } from 'react';
import { Search, Calculator, Filter, Download } from 'lucide-react';

const Quotes = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock quotes data
    const quotes = [
        { id: 'QT-9901', date: '2026-02-25', country: 'Germany (DE)', weight: '15kg', service: 'Air Express', price: 'CHF 145.20' },
        { id: 'QT-9884', date: '2026-02-24', country: 'United States (US)', weight: '2.5kg', service: 'Air Express', price: 'CHF 88.50' },
        { id: 'QT-9872', date: '2026-02-24', country: 'United Kingdom (GB)', weight: '10kg', service: 'Economy', price: 'CHF 112.00' },
    ];

    const filteredQuotes = quotes.filter(q =>
        q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Calculator size={22} color="var(--accent)" /> Quote History
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="input-group" style={{ margin: 0 }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Search quotes..."
                                    style={{ paddingLeft: '2.5rem', width: '300px' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <button className="btn-primary" style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                            <Filter size={18} style={{ marginRight: '0.5rem' }} /> Filter
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>QUOTE ID</th>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>DATE</th>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>COUNTRY</th>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>WEIGHT</th>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>SERVICE</th>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>PRICE</th>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuotes.map((q) => (
                                <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem 0.5rem', fontWeight: 700 }}>{q.id}</td>
                                    <td style={{ padding: '1rem 0.5rem' }}>{q.date}</td>
                                    <td style={{ padding: '1rem 0.5rem' }}>{q.country}</td>
                                    <td style={{ padding: '1rem 0.5rem' }}>{q.weight}</td>
                                    <td style={{ padding: '1rem 0.5rem' }}>{q.service}</td>
                                    <td style={{ padding: '1rem 0.5rem', color: 'var(--accent)', fontWeight: 700 }}>{q.price}</td>
                                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}>
                                            Book Now
                                        </button>
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

export default Quotes;
