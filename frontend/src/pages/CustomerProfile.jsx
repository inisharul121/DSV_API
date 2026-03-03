import React, { useState, useEffect } from 'react';
import { User, Mail, Building, Phone, Key, Save, AlertCircle, CheckCircle } from 'lucide-react';
import dsvApi from '../api/dsvApi';

const CustomerProfile = () => {
    const [customer, setCustomer] = useState({
        name: '',
        email: '',
        company: '',
        phone: ''
    });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await dsvApi.get('/auth/customer/me');
                if (res.data.success) {
                    setCustomer(res.data.customer);
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (password && password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setSaving(true);
        try {
            const payload = { ...customer };
            if (password) payload.password = password;

            const res = await dsvApi.put('/auth/customer/profile', payload);
            if (res.data.success) {
                setMessage('Profile updated successfully!');
                localStorage.setItem('customerInfo', JSON.stringify(res.data.customer));
                setPassword('');
                setConfirmPassword('');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', borderRadius: '12px' }}>
                        <User size={28} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>My Profile</h2>
                        <p style={{ color: '#64748b', margin: '0.2rem 0 0' }}>Update your account information and password.</p>
                    </div>
                </div>

                {message && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <CheckCircle size={20} /> {message}
                    </div>
                )}

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="input-group">
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={16} /> Full Name
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            value={customer.name}
                            onChange={e => setCustomer({ ...customer, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={16} /> Email Address
                        </label>
                        <input
                            type="email"
                            className="input-field"
                            value={customer.email}
                            disabled
                            style={{ background: '#f8fafc', cursor: 'not-allowed' }}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Email cannot be changed.</span>
                    </div>

                    <div className="input-group">
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Building size={16} /> Company
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            value={customer.company || ''}
                            onChange={e => setCustomer({ ...customer, company: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Phone size={16} /> Phone Number
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            value={customer.phone || ''}
                            onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e2e8f0', margin: '1rem 0', paddingTop: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Change Password</h3>
                    </div>

                    <div className="input-group">
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Key size={16} /> New Password
                        </label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Leave blank to keep current"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Key size={16} /> Confirm New Password
                        </label>
                        <input
                            type="password"
                            className="input-field"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={saving}
                            style={{ width: '200px', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerProfile;
