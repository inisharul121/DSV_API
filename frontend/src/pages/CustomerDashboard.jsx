import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Truck, FileText, CheckCircle, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import dsvApi from '../api/dsvApi';

const StatCard = ({ icon: Icon, value, label, color, bgColor }) => (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: bgColor, color: color }}>
                <Icon size={24} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800' }}>{value}</div>
        </div>
        <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>{label}</div>
    </div>
);

const CustomerDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('customerToken');

    useEffect(() => {
        if (!token) {
            navigate('/portal/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await dsvApi.get('/customer/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setOrders(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('customerToken');
                    localStorage.removeItem('customerInfo');
                    navigate('/portal/login');
                } else {
                    setError('Failed to fetch orders');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token, navigate]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <StatCard
                    icon={Package}
                    value={orders.length}
                    label="Total Shipments"
                    color="#2563eb"
                    bgColor="rgba(37, 99, 235, 0.1)"
                />
                <StatCard
                    icon={Clock}
                    value={orders.filter(o => o.status === 'Created').length}
                    label="In Processing"
                    color="#f59e0b"
                    bgColor="rgba(245, 158, 11, 0.1)"
                />
                <StatCard
                    icon={CheckCircle}
                    value={orders.filter(o => o.status === 'Delivered').length}
                    label="Delivered"
                    color="#10b981"
                    bgColor="rgba(16, 185, 129, 0.1)"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '1.5rem' }}>
                <div className="card" style={{ minHeight: '400px', overflowX: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h4 style={{ margin: 0 }}>Recent Orders</h4>
                        <Link to="/portal/orders" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', textDecoration: 'none' }}>View All</Link>
                    </div>

                    {loading ? (
                        <div style={{ display: 'grid', placeItems: 'center', height: '200px', color: '#64748b' }}>
                            Loading orders...
                        </div>
                    ) : orders.length === 0 ? (
                        <div style={{ display: 'grid', placeItems: 'center', height: '200px', color: '#64748b' }}>
                            No orders found yet.
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Date</th>
                                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Booking ID</th>
                                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Recipient</th>
                                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Status</th>
                                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.slice(0, 5).map((order) => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
                                        <td style={{ padding: '1rem 0.5rem', color: '#64748b' }}>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem 0.5rem' }}>
                                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{order.bookingId}</span>
                                        </td>
                                        <td style={{ padding: '1rem 0.5rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 500 }}>{order.receiverName}</span>
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{order.destinationCountry}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 0.5rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                background: order.status === 'Created' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                color: order.status === 'Created' ? '#2563eb' : '#10b981'
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <Link
                                                    to={`/shipments?id=${order.bookingId}`}
                                                    style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontWeight: 500 }}
                                                >
                                                    Track <ExternalLink size={14} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="card">
                    <h4 style={{ marginBottom: '1.5rem' }}>Quick Tracking</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="input-group">
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter Tracking #..."
                                style={{ width: '100%' }}
                            />
                        </div>
                        <button className="btn-primary" style={{ width: '100%' }}>
                            Track <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                        </button>
                    </div>

                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                        <Link to="/portal/book" className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', textDecoration: 'none', padding: '0.75rem' }}>
                            Book New Shipment
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
