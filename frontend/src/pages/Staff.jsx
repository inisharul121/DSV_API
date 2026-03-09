import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Shield, Mail, Phone, CheckCircle2, XCircle, Loader2, Edit, Trash2, X, User } from 'lucide-react';
import dsvApi from '../api/dsvApi';
import { toast } from 'react-hot-toast';

const Staff = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updating, setUpdating] = useState(null);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Employee', phone: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
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
                toast.success(`Staff status updated to ${status}`);
                fetchStaff();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this staff member?')) return;
        try {
            const res = await dsvApi.delete(`/admins/${id}`);
            if (res.data.success) {
                toast.success('Staff member deleted');
                setStaff(prev => prev.filter(s => s.id !== id));
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete staff');
        }
    };

    const handleOpenModal = (mode, data = null) => {
        setModalMode(mode);
        setSelectedStaff(data);
        if (mode === 'edit' && data) {
            setFormData({
                name: data.name || '',
                email: data.email || '',
                password: '',
                role: data.role || 'Employee',
                phone: data.phone || ''
            });
        } else {
            setFormData({ name: '', email: '', password: '', role: 'Employee', phone: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (modalMode === 'add') {
                const res = await dsvApi.post('/auth/admin/register', formData);
                if (res.data.success) {
                    toast.success('Staff member created successfully');
                    setIsModalOpen(false);
                    fetchStaff();
                }
            } else {
                const res = await dsvApi.put(`/admins/${selectedStaff.id}`, formData);
                if (res.data.success) {
                    toast.success('Staff details updated');
                    setIsModalOpen(false);
                    fetchStaff();
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save staff information');
        } finally {
            setSaving(false);
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
                        <button
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
                            onClick={() => handleOpenModal('add')}
                        >
                            <UserPlus size={18} /> Add Staff
                        </button>
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
                                        <td style={{ padding: '1rem 0.5rem', fontWeight: 700 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '32px', height: '32px', background: '#f1f5f9', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
                                                    <User size={16} color="#64748b" />
                                                </div>
                                                {s.name}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 0.5rem' }}>
                                            <span style={{
                                                fontSize: '0.8rem', fontWeight: 600, padding: '0.2rem 0.5rem',
                                                background: s.role === 'Admin' ? 'rgba(37, 99, 235, 0.1)' : '#f1f5f9',
                                                color: s.role === 'Admin' ? '#2563eb' : '#64748b',
                                                borderRadius: '6px'
                                            }}>
                                                {s.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 0.5rem' }}>
                                            <div style={{ fontSize: '0.85rem' }}><Mail size={12} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />{s.email}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><Phone size={12} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />{s.phone || 'N/A'}</div>
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
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                {s.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            disabled={updating === s.id}
                                                            onClick={() => handleUpdateStatus(s.id, 'Active')}
                                                            title="Approve"
                                                            style={{
                                                                background: '#10b981', color: 'white', border: 'none',
                                                                borderRadius: '6px', padding: '0.4rem', cursor: 'pointer'
                                                            }}
                                                        >
                                                            <CheckCircle2 size={16} />
                                                        </button>
                                                        <button
                                                            disabled={updating === s.id}
                                                            onClick={() => handleUpdateStatus(s.id, 'Rejected')}
                                                            title="Reject"
                                                            style={{
                                                                background: '#ef4444', color: 'white', border: 'none',
                                                                borderRadius: '6px', padding: '0.4rem', cursor: 'pointer'
                                                            }}
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}

                                                <button
                                                    onClick={() => handleOpenModal('edit', s)}
                                                    title="Edit Staff"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                                                >
                                                    <Edit size={16} />
                                                </button>

                                                {s.email !== 'admin@gmail.com' && (
                                                    <button
                                                        onClick={() => handleDelete(s.id)}
                                                        title="Delete Staff"
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStaff.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No staff members found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '450px', padding: '2rem', position: 'relative' }}>
                        <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                            <X size={20} />
                        </button>
                        <h3 style={{ marginBottom: '1.5rem' }}>{modalMode === 'add' ? 'Add New Staff' : 'Edit Staff Details'}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Full Name</label>
                                <input
                                    className="input-field"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Email Address</label>
                                <input
                                    className="input-field"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    placeholder="email@example.com"
                                />
                            </div>
                            {modalMode === 'add' && (
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Initial Password</label>
                                    <input
                                        className="input-field"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        placeholder="Set a password"
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Phone Number</label>
                                <input
                                    className="input-field"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+41 XXXXXXXX"
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Role</label>
                                <select
                                    className="input-field"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    style={{ width: '100%', appearance: 'auto' }}
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Employee">Employee</option>
                                    <option value="Support">Support</option>
                                </select>
                            </div>
                            <button className="btn-primary" type="submit" disabled={saving} style={{ marginTop: '1rem' }}>
                                {saving ? 'Saving...' : (modalMode === 'add' ? 'Create Staff Member' : 'Save Changes')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staff;
