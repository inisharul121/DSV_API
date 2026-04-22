import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, ExternalLink, RefreshCw, FileText, Truck, X } from 'lucide-react';
import dsvApi from '../api/dsvApi';
import API_BASE_URL, { resolveUrl } from '../utils/urlConfig';
import { toast } from 'react-hot-toast';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();

    const customerFilterId = searchParams.get('customerId');

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await dsvApi.get('/orders');
            if (response.data.success) {
                setOrders(response.data.data);
            } else {
                setError('Server returned an error.');
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(`Failed to load orders: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => {
        const matchesSearch = !searchTerm ||
            order.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shipperName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.receiverName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCustomer = !customerFilterId || order.customerId === customerFilterId;

        return matchesSearch && matchesCustomer;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Order History</h2>
                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Full list of shipments created through Limber Cargo</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <RefreshCw size={18} className={loading ? 'spin' : ''} /> Refresh
                </button>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
                {customerFilterId && (
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(37, 99, 235, 0.05)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
                        <Filter size={14} color="var(--accent)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filtered by Customer</span>
                        <button
                            onClick={() => setSearchParams({})}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto', color: '#64748b', display: 'flex', alignItems: 'center' }}
                        >
                            <X size={14} /> Clear
                        </button>
                    </div>
                )}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="input-group" style={{ flex: 1 }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Search by Booking ID, Shipper, or Receiver..."
                                style={{ width: '100%', paddingLeft: '3rem' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={18} /> Filter
                    </button>
                </div>

                {loading ? (
                    <div style={{ display: 'grid', placeItems: 'center', height: '300px', color: '#64748b' }}>
                        Loading order history...
                    </div>
                ) : error ? (
                    <div style={{ display: 'grid', placeItems: 'center', height: '300px', color: '#ef4444', textAlign: 'center' }}>
                        <div>
                            <p style={{ fontWeight: 600 }}>Could not load orders</p>
                            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</p>
                        </div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div style={{ display: 'grid', placeItems: 'center', height: '300px', color: '#64748b' }}>
                        {searchTerm ? 'No orders match your search.' : 'No orders found.'}
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                                        <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Date</th>
                                        <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Booking ID</th>
                                        <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Shipper</th>
                                        <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Receiver</th>
                                        <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Service</th>
                                        <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Weight</th>
                                        <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Status</th>
                                        <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Invoice</th>
                                        <th style={{ padding: '1rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
                                            <td style={{ padding: '1rem 0.5rem', color: '#64748b' }}>
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem 0.5rem' }}>
                                                <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{order.bookingId}</span>
                                            </td>
                                            <td style={{ padding: '1rem 0.5rem' }}>{order.shipperName}</td>
                                            <td style={{ padding: '1rem 0.5rem' }}>{order.receiverName}</td>
                                            <td style={{ padding: '1rem 0.5rem' }}>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.serviceCode}</div>
                                            </td>
                                            <td style={{ padding: '1rem 0.5rem' }}>{order.totalWeight} {order.weightUnit || 'KG'}</td>
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
                                            <td style={{ padding: '1rem 0.5rem' }}>
                                                <a
                                                    href={`${API_BASE_URL}/orders/${order.id}/invoice?token=${localStorage.getItem('adminToken')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-secondary"
                                                    style={{ padding: '0.35rem 0.5rem', borderRadius: '8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#2563eb', background: 'rgba(37, 99, 235, 0.1)', border: 'none', fontWeight: 600, width: 'fit-content' }}
                                                    title="Download PDF Invoice"
                                                >
                                                    <FileText size={12} /> PDF
                                                </a>
                                            </td>
                                            <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                    {order.labelUrl && (
                                                        <a
                                                            href={resolveUrl(order.labelUrl)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn-secondary"
                                                            style={{ padding: '0.35rem 0.7rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', border: '1px solid #e2e8f0' }}
                                                            title="Download Shipping Label"
                                                        >
                                                            <FileText size={14} /> Label
                                                        </a>
                                                    )}
                                                    {/* Hidden as requested: HTML Preview Link
                                                    <a
                                                        href={`${API_BASE_URL}/orders/${order.id}/invoice-html?token=${localStorage.getItem('adminToken')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn-secondary"
                                                        style={{ padding: '0.35rem 0.5rem', borderRadius: '8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#e65100', background: 'rgba(230, 81, 0, 0.1)', border: 'none', fontWeight: 600 }}
                                                        title="Preview HTML Invoice"
                                                    >
                                                        <FileText size={12} /> HTML
                                                    </a> 
                                                    */}
                                                    <Link
                                                        to={`/shipments?id=${order.bookingId}`}
                                                        className="btn-secondary"
                                                        style={{ padding: '0.35rem 0.7rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', border: 'none' }}
                                                        title="Track Shipment"
                                                    >
                                                        <Truck size={14} /> Track
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

export default OrderList;
