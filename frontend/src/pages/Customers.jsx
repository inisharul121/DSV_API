import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, MapPin, ExternalLink, Loader2, Edit, Trash2, Eye, X, Phone, Calendar, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dsvApi from '../api/dsvApi';

const Customers = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerSummary, setCustomerSummary] = useState(null);
    const [editData, setEditData] = useState({ name: '', email: '', company: '', phone: '' });
    const [saving, setSaving] = useState(false);

    const fetchCustomers = async () => {
        setLoading(true);
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

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return;

        try {
            const res = await dsvApi.delete(`/customers/${id}`);
            if (res.data.success) {
                setCustomers(prev => prev.filter(c => c.id !== id));
            }
        } catch (error) {
            alert('Error deleting customer: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleEditClick = (customer) => {
        setSelectedCustomer(customer);
        setEditData({
            name: customer.name || '',
            email: customer.email || '',
            company: customer.company || '',
            phone: customer.phone || ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await dsvApi.put(`/customers/${selectedCustomer.id}`, editData);
            if (res.data.success) {
                setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, ...editData } : c));
                setIsEditModalOpen(false);
            }
        } catch (error) {
            alert('Error updating customer: ' + (error.response?.data?.error || error.message));
        } finally {
            setSaving(false);
        }
    };

    const handleViewSummary = async (customer) => {
        setSelectedCustomer(customer);
        setIsSummaryModalOpen(true);
        setCustomerSummary(null);
        try {
            const res = await dsvApi.get(`/customers/${customer.id}/summary`);
            if (res.data.success) {
                setCustomerSummary(res.data.summary);
            }
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    };

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
                                    <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>COMPANY</th>
                                    <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>EMAIL</th>
                                    <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>PHONE</th>
                                    <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>JOINED</th>
                                    <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c) => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem 0.5rem', fontWeight: 700 }}>{c.name}</td>
                                        <td style={{ padding: '1rem 0.5rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <MapPin size={12} color="var(--text-muted)" />
                                                {c.company || 'N/A'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 0.5rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Mail size={12} color="var(--text-muted)" />
                                                {c.email}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 0.5rem' }}>{c.phone || 'N/A'}</td>
                                        <td style={{ padding: '1rem 0.5rem' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    title="View Summary"
                                                    onClick={() => handleViewSummary(c)}
                                                    style={{ background: 'rgba(37, 99, 235, 0.1)', border: 'none', cursor: 'pointer', color: '#2563eb', padding: '0.4rem', borderRadius: '4px' }}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    title="Edit Customer"
                                                    onClick={() => handleEditClick(c)}
                                                    style={{ background: 'rgba(16, 185, 129, 0.1)', border: 'none', cursor: 'pointer', color: '#10b981', padding: '0.4rem', borderRadius: '4px' }}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    title="View Shipments"
                                                    onClick={() => navigate(`/order-list?customerId=${c.id}`)}
                                                    style={{ background: 'rgba(245, 158, 11, 0.1)', border: 'none', cursor: 'pointer', color: '#f59e0b', padding: '0.4rem', borderRadius: '4px' }}
                                                >
                                                    <ExternalLink size={16} />
                                                </button>
                                                <button
                                                    title="Delete Customer"
                                                    onClick={() => handleDelete(c.id)}
                                                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.4rem', borderRadius: '4px' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No customers found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '450px', padding: '2rem', position: 'relative' }}>
                        <button onClick={() => setIsEditModalOpen(false)} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                            <X size={20} />
                        </button>
                        <h3 style={{ marginBottom: '1.5rem' }}>Edit Customer</h3>
                        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Name</label>
                                <input
                                    className="input-field"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Email</label>
                                <input
                                    className="input-field"
                                    type="email"
                                    value={editData.email}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Company</label>
                                <input
                                    className="input-field"
                                    value={editData.company}
                                    onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Phone</label>
                                <input
                                    className="input-field"
                                    value={editData.phone}
                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                />
                            </div>
                            <button className="btn-primary" type="submit" disabled={saving} style={{ marginTop: '1rem' }}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Summary Modal */}
            {isSummaryModalOpen && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '550px', padding: '2.5rem', position: 'relative' }}>
                        <button onClick={() => setIsSummaryModalOpen(false)} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                            <X size={20} />
                        </button>

                        {!customerSummary ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <Loader2 size={24} className="loader" />
                                <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading summary...</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ margin: 0 }}>{selectedCustomer.name}</h3>
                                    <p style={{ color: '#64748b', margin: '0.25rem 0 0 0' }}>{selectedCustomer.company || 'Individual'}</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                        <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Package size={14} /> TOTAL ORDERS
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem' }}>{customerSummary.stats.totalOrders}</div>
                                    </div>
                                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                        <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Calendar size={14} /> REGISTERED
                                        </div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.5rem' }}>
                                            {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                                        <span style={{ color: '#64748b' }}>Last Shipment</span>
                                        <span style={{ fontWeight: 600 }}>{customerSummary.stats.lastOrderDate ? new Date(customerSummary.stats.lastOrderDate).toLocaleDateString() : 'Never'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                                        <span style={{ color: '#64748b' }}>Email Contact</span>
                                        <span style={{ fontWeight: 600 }}>{selectedCustomer.email}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem' }}>
                                        <span style={{ color: '#64748b' }}>Phone Number</span>
                                        <span style={{ fontWeight: 600 }}>{selectedCustomer.phone || 'N/A'}</span>
                                    </div>
                                </div>

                                <button
                                    className="btn-secondary"
                                    style={{ width: '100%', marginTop: '2rem' }}
                                    onClick={() => {
                                        setIsSummaryModalOpen(false);
                                        navigate(`/order-list?customerId=${selectedCustomer.id}`);
                                    }}
                                >
                                    View Detailed Order History
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
