import React, { useState, useEffect } from 'react';
import { Search, Calculator, Filter, Download, Plus, MapPin, Package, Calendar, ArrowRight, Loader, ChevronDown, Truck } from 'lucide-react';
import dsvApi from '../api/dsvApi';

const Quotes = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [quotes, setQuotes] = useState([
        { id: 'QT-9901', date: '2026-02-25', country: 'Germany (DE)', weight: '15kg', service: 'Air Express', price: 'CHF 145.20' },
        { id: 'QT-9884', date: '2026-02-24', country: 'United States (US)', weight: '2.5kg', service: 'Air Express', price: 'CHF 88.50' },
        { id: 'QT-9872', date: '2026-02-24', country: 'United Kingdom (GB)', weight: '10kg', service: 'Economy', price: 'CHF 112.00' },
    ]);

    const [formData, setFormData] = useState({
        pickupCountryCode: 'CH',
        pickupCity: 'Baar',
        pickupZipCode: '6340',
        deliveryCountryCode: '',
        deliveryCity: '',
        deliveryZipCode: '',
        packageType: 'PARCELS',
        weight: 1.0,
        length: 10,
        width: 10,
        height: 10,
        collectDate: new Date().toISOString().split('T')[0]
    });

    const [quoteResults, setQuoteResults] = useState(null);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setQuoteResults(null);
        try {
            const response = await dsvApi.post('/quotes', formData);
            if (response.data.success) {
                setQuoteResults(response.data.data.services);
                // Add to history
                if (response.data.data.services && response.data.data.services.length > 0) {
                    const firstSvc = response.data.data.services[0];
                    const newQuote = {
                        id: `QT-${Math.floor(Math.random() * 10000)}`,
                        date: formData.collectDate,
                        country: `${formData.deliveryCountryCode}`,
                        weight: `${formData.weight}kg`,
                        service: firstSvc.serviceDescription,
                        price: `${firstSvc.currency} ${firstSvc.totalDisplay}`
                    };
                    setQuotes(prev => [newQuote, ...prev]);
                }
            }
        } catch (error) {
            console.error('Error fetching quote:', error);
            alert('Failed to fetch quote. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    const filteredQuotes = quotes.filter(q =>
        q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Action Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Quotes & Rates</h2>
                <button
                    className="btn-primary"
                    onClick={() => setShowForm(!showForm)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {showForm ? 'View History' : <><Plus size={18} /> New Request</>}
                </button>
            </div>

            {showForm ? (
                <div className="card" style={{ padding: '2rem', animation: 'fadeIn 0.3s ease-in-out' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Calculator size={22} color="var(--accent)" /> Request New Quote
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        {/* Origin Section */}
                        <div style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <MapPin size={16} /> ORIGIN
                            </h4>
                            <div className="input-group">
                                <label className="input-label">Country Code (ISO)</label>
                                <input name="pickupCountryCode" value={formData.pickupCountryCode} onChange={handleFormChange} className="input-field" placeholder="e.g. CH" required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label className="input-label">City</label>
                                    <input name="pickupCity" value={formData.pickupCity} onChange={handleFormChange} className="input-field" placeholder="Baar" />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Zip Code</label>
                                    <input name="pickupZipCode" value={formData.pickupZipCode} onChange={handleFormChange} className="input-field" placeholder="6340" />
                                </div>
                            </div>
                        </div>

                        {/* Destination Section */}
                        <div style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <MapPin size={16} color="red" /> DESTINATION
                            </h4>
                            <div className="input-group">
                                <label className="input-label">Country Code (ISO)</label>
                                <input name="deliveryCountryCode" value={formData.deliveryCountryCode} onChange={handleFormChange} className="input-field" placeholder="e.g. DE" required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label className="input-label">City</label>
                                    <input name="deliveryCity" value={formData.deliveryCity} onChange={handleFormChange} className="input-field" placeholder="Munich" />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Zip Code</label>
                                    <input name="deliveryZipCode" value={formData.deliveryZipCode} onChange={handleFormChange} className="input-field" placeholder="80331" />
                                </div>
                            </div>
                        </div>

                        {/* Package Info */}
                        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <Package size={16} /> PACKAGE DETAILS
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                <div className="input-group">
                                    <label className="input-label">Weight (KG)</label>
                                    <input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleFormChange} className="input-field" required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Length (CM)</label>
                                    <input type="number" name="length" value={formData.length} onChange={handleFormChange} className="input-field" />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Width (CM)</label>
                                    <input type="number" name="width" value={formData.width} onChange={handleFormChange} className="input-field" />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Height (CM)</label>
                                    <input type="number" name="height" value={formData.height} onChange={handleFormChange} className="input-field" />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label className="input-label">Departure Date</label>
                                    <input type="date" name="collectDate" value={formData.collectDate} onChange={handleFormChange} className="input-field" />
                                </div>
                                <div className="input-group" style={{ justifyContent: 'end', display: 'flex', alignItems: 'end' }}>
                                    <button type="submit" className="btn-primary" style={{ width: '100%', height: '42px' }} disabled={loading}>
                                        {loading ? <Loader className="animate-spin" size={20} /> : 'Get Real-time Rates'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Results Table */}
                    {quoteResults && (
                        <div style={{ marginTop: '2rem', borderTop: '2px solid var(--accent)', paddingTop: '1.5rem', animation: 'slideUp 0.4s ease-out' }}>
                            <h4 style={{ marginBottom: '1.5rem', color: 'var(--accent)', fontWeight: 700 }}>Available Services</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                {quoteResults.map((svc, idx) => (
                                    <div key={idx} className="group bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white' }}>
                                        <div style={{ padding: '1.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ padding: '0.5rem', background: '#eff6ff', color: '#2563eb', borderRadius: '0.5rem' }}>
                                                        <Truck size={20} />
                                                    </div>
                                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase' }}>
                                                        {svc.serviceCode || svc.serviceDescription}
                                                    </h3>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1d4ed8' }}>
                                                        {svc.currency} {svc.totalDisplay}
                                                    </div>
                                                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Total Price</div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                                                <Calendar size={14} />
                                                <span>Delivery: <strong>{svc.etaMin} - {svc.etaMax} Days</strong></span>
                                            </div>

                                            {/* Price Breakdown Section */}
                                            <div style={{ paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const el = document.getElementById(`breakdown-${idx}`);
                                                        if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
                                                    }}
                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                                >
                                                    <span>Price Breakdown</span>
                                                    <ChevronDown size={14} />
                                                </button>

                                                <div id={`breakdown-${idx}`} style={{ display: 'none', marginTop: '1rem' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        {svc.detailedBreakdown?.map((item, bIdx) => (
                                                            <div key={bIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                                <span style={{ color: '#64748b' }}>{item.label}</span>
                                                                <span style={{ fontWeight: 600, color: '#334155' }}>{svc.currency} {item.value}</span>
                                                            </div>
                                                        ))}
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#1d4ed8', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9', marginTop: '0.25rem' }}>
                                                            <span>Total Amount</span>
                                                            <span>{svc.currency} {svc.totalDisplay}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button style={{ width: '100%', padding: '1rem', border: 'none', background: '#f8fafc', fontWeight: 700, color: '#475569', cursor: 'pointer', transition: 'all 0.2s', borderTop: '1px solid #f1f5f9' }}>
                                            Select & Book
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Calendar size={22} color="var(--accent)" /> Recent Quotes
                        </h3>
                        <div className="input-group" style={{ margin: 0 }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Search by ID or Country..."
                                    style={{ paddingLeft: '2.5rem', width: '300px' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
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
                                    <tr key={q.id} className="hover-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem 0.5rem', fontWeight: 700 }}>{q.id}</td>
                                        <td style={{ padding: '1rem 0.5rem' }}>{q.date}</td>
                                        <td style={{ padding: '1rem 0.5rem' }}>
                                            <span style={{ padding: '0.25rem 0.5rem', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.85rem' }}>
                                                {q.country}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 0.5rem' }}>{q.weight}</td>
                                        <td style={{ padding: '1rem 0.5rem' }}>{q.service}</td>
                                        <td style={{ padding: '1rem 0.5rem', color: 'var(--accent)', fontWeight: 700 }}>{q.price}</td>
                                        <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'end' }}>
                                                Re-quote <ArrowRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredQuotes.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                            No quotes found matching "{searchTerm}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <style>{`
                .hover-row:hover { background-color: #f8fafc; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Quotes;
