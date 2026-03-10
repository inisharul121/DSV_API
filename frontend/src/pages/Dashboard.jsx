import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ship, CheckCircle, Clock, AlertTriangle, ArrowRight, ExternalLink, Search, Truck } from 'lucide-react';
import dsvApi from '../api/dsvApi';
import API_BASE_URL from '../utils/urlConfig';

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

const Dashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        totalShipments: 0,
        delivered: 0,
        inProcessing: 0,
        exceptions: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [ordersRes, statsRes] = await Promise.all([
                    dsvApi.get('/orders'),
                    dsvApi.get('/orders/stats')
                ]);

                if (ordersRes.data.success) {
                    setOrders(ordersRes.data.data);
                }
                if (statsRes.data.success) {
                    setStats(statsRes.data.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleTrack = () => {
        if (trackingNumber.trim()) {
            navigate(`/shipments?id=${trackingNumber.trim()}`);
        }
    };

    const filteredOrders = orders.filter(order =>
        order.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shipperName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.receiverName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <StatCard
                    icon={Ship}
                    value={stats.totalShipments}
                    label="Total Shipments"
                    color="#2563eb"
                    bgColor="rgba(37, 99, 235, 0.1)"
                />
                <StatCard
                    icon={CheckCircle}
                    value={stats.delivered}
                    label="Delivered"
                    color="#10b981"
                    bgColor="rgba(16, 185, 129, 0.1)"
                />
                <StatCard
                    icon={Clock}
                    value={stats.inProcessing}
                    label="In Processing"
                    color="#f59e0b"
                    bgColor="rgba(245, 158, 11, 0.1)"
                />
                <StatCard
                    icon={AlertTriangle}
                    value={stats.exceptions}
                    label="Exceptions"
                    color="#ef4444"
                    bgColor="rgba(239, 68, 68, 0.1)"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '1.5rem' }}>
                <div className="card" style={{ minHeight: '400px', overflowX: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h4 style={{ margin: 0 }}>Recent Orders</h4>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    placeholder="Filter orders..."
                                    className="input-field"
                                    style={{ paddingLeft: '2.2rem', paddingRight: '0.5rem', paddingTop: '0.4rem', paddingBottom: '0.4rem', fontSize: '0.85rem', width: '200px' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Link to="/order-list" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', textDecoration: 'none' }}>View All</Link>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ display: 'grid', placeItems: 'center', height: '200px', color: '#64748b' }}>
                            Loading orders...
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div style={{ display: 'grid', placeItems: 'center', height: '200px', color: '#64748b' }}>
                            {searchTerm ? 'No orders match your search.' : 'No orders found yet. Start by creating a shipment!'}
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Date</th>
                                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Booking ID</th>
                                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Shipper / Receiver</th>
                                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Status</th>
                                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.slice(0, 10).map((order) => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
                                        <td style={{ padding: '1rem 0.5rem', color: '#64748b' }}>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem 0.5rem' }}>
                                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{order.bookingId}</span>
                                        </td>
                                        <td style={{ padding: '1rem 0.5rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 500 }}>{order.shipperName}</span>
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>To: {order.receiverName}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 0.5rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                background: ['Created', 'Booked', 'Pending'].includes(order.status) ? 'rgba(37, 99, 235, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                color: ['Created', 'Booked', 'Pending'].includes(order.status) ? '#2563eb' : '#10b981'
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                {order.labelUrl && (
                                                    <a
                                                        href={`${API_BASE_URL}${order.labelUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn-secondary"
                                                        style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem' }}
                                                        title="Download Label"
                                                    >
                                                        Label
                                                    </a>
                                                )}
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
                    <h4 style={{ marginBottom: '1.5rem' }}>Quick Status Check</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="input-group">
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter Tracking #..."
                                style={{ width: '100%' }}
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                            />
                        </div>
                        <button className="btn-primary" style={{ width: '100%' }} onClick={handleTrack}>
                            Track <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
