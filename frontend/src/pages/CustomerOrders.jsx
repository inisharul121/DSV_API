import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Package, RefreshCw, FileText, ExternalLink, Truck } from 'lucide-react';
import dsvApi from '../api/dsvApi';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../utils/urlConfig';

const CustomerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

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

    const filtered = orders.filter(o =>
        o.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.receiverName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                {[
                    { label: 'Total Shipments', value: orders.length, color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
                    { label: 'In Progress', value: orders.filter(o => o.status === 'Created').length, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
                    { label: 'Completed', value: orders.filter(o => o.status === 'Delivered').length, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
                ].map(stat => (
                    <div key={stat.label} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>{stat.label}</div>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={22} color={stat.color} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Orders Table Card */}
            <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: 0, fontWeight: 700 }}>My Orders</h4>
                    <button
                        onClick={fetchOrders}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px',
                            padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#475569'
                        }}
                    >
                        <RefreshCw size={15} /> Refresh
                    </button>
                </div>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search by Booking ID or Receiver..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="input-field"
                        style={{ paddingLeft: '2.5rem', width: '100%', boxSizing: 'border-box' }}
                    />
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading your shipments...</div>
                ) : error ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>{error}</div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <Package size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                        <p style={{ color: '#64748b', fontWeight: 600 }}>
                            {searchTerm ? 'No shipments match your search.' : "You don't have any shipments yet."}
                        </p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.8rem' }}>
                                    {['Date', 'Booking ID', 'Destination', 'Weight', 'Value', 'Status', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '1rem 0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
                                        <td style={{ padding: '1rem 0.75rem', color: '#64748b' }}>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem 0.75rem' }}>
                                            <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>{order.bookingId}</span>
                                        </td>
                                        <td style={{ padding: '1rem 0.75rem' }}>
                                            <div>{order.receiverName}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{order.originCountry} → {order.destinationCountry}</div>
                                        </td>
                                        <td style={{ padding: '1rem 0.75rem' }}>{order.totalWeight} KG</td>
                                        <td style={{ padding: '1rem 0.75rem' }}>{order.goodsValue} {order.currency}</td>
                                        <td style={{ padding: '1rem 0.75rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                                                background: order.status === 'Created' ? 'rgba(37,99,235,0.1)' : 'rgba(16,185,129,0.1)',
                                                color: order.status === 'Created' ? '#2563eb' : '#10b981'
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 0.75rem' }}>
                                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                {order.labelUrl && (
                                                    <a
                                                        href={`${API_BASE_URL}${order.labelUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn-secondary"
                                                        style={{ padding: '0.35rem 0.6rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                                    >
                                                        <FileText size={12} /> Label
                                                    </a>
                                                )}
                                                
                                                <a
                                                    href={`${API_BASE_URL}/customer/orders/${order.id}/invoice-html?token=${token}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-secondary"
                                                    style={{
                                                        padding: '0.35rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem',
                                                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                        background: 'rgba(230, 81, 0, 0.1)', color: '#e65100', border: 'none', textDecoration: 'none', fontWeight: 600
                                                    }}
                                                    title="Preview HTML Invoice"
                                                >
                                                    <FileText size={12} /> HTML
                                                </a>

                                                <a
                                                    href={`${API_BASE_URL}/customer/orders/${order.id}/invoice?token=${token}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-secondary"
                                                    style={{
                                                        padding: '0.35rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem',
                                                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                        background: 'rgba(37,99,235,0.1)', color: '#2563eb', border: 'none', textDecoration: 'none', fontWeight: 600
                                                    }}
                                                    title="Download PDF Invoice"
                                                >
                                                    <FileText size={12} /> PDF
                                                </a>

                                                <Link
                                                    to={`/portal/shipments?id=${order.bookingId}`}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#2563eb', textDecoration: 'none', fontWeight: 600, fontSize: '0.8rem' }}
                                                >
                                                    <ExternalLink size={13} /> Track
                                                </Link>
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
    );
};

export default CustomerOrders;
