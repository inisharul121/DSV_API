import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Truck, Package, Search, LogOut, ExternalLink, FileText, RefreshCw } from 'lucide-react';
import dsvApi from '../api/dsvApi';

const CustomerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const customerInfo = JSON.parse(localStorage.getItem('customerInfo') || '{}');
    const token = localStorage.getItem('customerToken');

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await dsvApi.get('/customer/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setOrders(res.data.data);
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem('customerToken');
                localStorage.removeItem('customerInfo');
                navigate('/portal/login');
            } else {
                setError('Could not load your orders. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) { navigate('/portal/login'); return; }
        fetchOrders();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerInfo');
        navigate('/portal/login');
    };

    const filtered = orders.filter(o =>
        o.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.receiverName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Top Nav */}
            <div style={{
                background: '#0f172a', padding: '0 2rem', height: '64px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid #1e293b'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Truck size={24} color="#60a5fa" />
                    <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.1rem' }}>Limber Cargo</span>
                    <span style={{ color: '#334155', margin: '0 0.25rem' }}>|</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Customer Portal</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        👋 {customerInfo.name || 'Customer'}
                        {customerInfo.company && <span style={{ color: '#475569' }}> · {customerInfo.company}</span>}
                    </span>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                            color: '#f87171', borderRadius: '8px', padding: '0.4rem 0.85rem',
                            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                        }}
                    >
                        <LogOut size={15} /> Sign Out
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>My Shipments</h2>
                        <p style={{ color: '#64748b', marginTop: '0.4rem' }}>Track and manage your orders</p>
                    </div>
                    <button
                        onClick={fetchOrders}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: '#fff', border: '1px solid #e2e8f0',
                            borderRadius: '10px', padding: '0.6rem 1.2rem',
                            cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: '#475569'
                        }}
                    >
                        <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
                    </button>
                </div>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search by Booking ID or Receiver..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', padding: '0.75rem 1rem 0.75rem 3rem',
                            border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.95rem',
                            background: '#fff', outline: 'none', boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Table */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Loading your shipments...</div>
                    ) : error ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#ef4444' }}>{error}</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <Package size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: '#64748b', fontWeight: 600 }}>
                                {searchTerm ? 'No shipments match your search.' : "You don't have any shipments yet."}
                            </p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                        {['Date', 'Booking ID', 'Destination', 'Weight', 'Value', 'Status', 'Actions'].map(h => (
                                            <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(order => (
                                        <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace', fontSize: '0.9rem' }}>{order.bookingId}</span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontSize: '0.9rem' }}>{order.receiverName}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{order.originCountry} → {order.destinationCountry}</div>
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{order.totalWeight} KG</td>
                                            <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{order.goodsValue} {order.currency}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                                                    background: order.status === 'Created' ? 'rgba(37,99,235,0.1)' : 'rgba(16,185,129,0.1)',
                                                    color: order.status === 'Created' ? '#2563eb' : '#10b981'
                                                }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                                                    {order.labelUrl && (
                                                        <a
                                                            href={`/labels?id=${order.bookingId}`}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                                background: '#f1f5f9', border: '1px solid #e2e8f0',
                                                                borderRadius: '8px', padding: '0.4rem 0.7rem',
                                                                textDecoration: 'none', color: '#475569', fontSize: '0.8rem', fontWeight: 600
                                                            }}
                                                        >
                                                            <FileText size={14} /> Label
                                                        </a>
                                                    )}
                                                    <a
                                                        href={`/shipments?id=${order.bookingId}`}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                            background: '#eff6ff', border: '1px solid #bfdbfe',
                                                            borderRadius: '8px', padding: '0.4rem 0.7rem',
                                                            textDecoration: 'none', color: '#2563eb', fontSize: '0.8rem', fontWeight: 600
                                                        }}
                                                    >
                                                        <ExternalLink size={14} /> Track
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerOrders;
