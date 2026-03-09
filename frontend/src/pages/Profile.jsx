import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Save, Loader2, ShieldCheck, UserCircle } from 'lucide-react';
import dsvApi from '../api/dsvApi';
import { toast } from 'react-hot-toast';

const Profile = () => {
    const [profile, setProfile] = useState({ name: '', email: '', phone: '', role: '' });
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [securitySaving, setSecuritySaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await dsvApi.get('/auth/admin/me');
            if (res.data.success) {
                setProfile(res.data.admin);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await dsvApi.put('/auth/admin/profile', {
                name: profile.name,
                email: profile.email,
                phone: profile.phone
            });
            if (res.data.success) {
                // Update local storage so header also reflects changes
                const updatedInfo = { ...JSON.parse(localStorage.getItem('adminInfo') || '{}'), ...res.data.admin };
                localStorage.setItem('adminInfo', JSON.stringify(updatedInfo));

                toast.success('Profile updated successfully!');
                // Reload page after a short delay to allow toast to be seen
                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setSecuritySaving(true);
        try {
            const res = await dsvApi.put('/auth/admin/profile', {
                password: passwordData.newPassword
            });
            if (res.data.success) {
                toast.success('Password changed successfully!');
                setPasswordData({ newPassword: '', confirmPassword: '' });
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update password');
        } finally {
            setSecuritySaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'grid', placeItems: 'center', height: '400px' }}>
                <Loader2 size={32} className="loader" color="var(--accent)" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ width: '80px', height: '80px', background: 'var(--accent)', borderRadius: '24px', display: 'grid', placeItems: 'center', color: 'white', fontSize: '2rem', fontWeight: 700 }}>
                    {profile.name?.charAt(0)}
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.75rem' }}>{profile.name}</h2>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldCheck size={16} /> {profile.role} Account
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                {/* Personal Information */}
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '2rem' }}>
                        <UserCircle size={20} color="var(--accent)" />
                        <h3 style={{ margin: 0 }}>Account Settings</h3>
                    </div>

                    <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    className="input-field"
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    className="input-field"
                                    style={{ paddingLeft: '2.5rem' }}
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Phone Number</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    className="input-field"
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={profile.phone || ''}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <button className="btn-primary" type="submit" disabled={saving} style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            {saving ? <Loader2 size={18} className="loader" /> : <Save size={18} />}
                            Save Profile Changes
                        </button>
                    </form>
                </div>

                {/* Security Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '2rem' }}>
                            <Lock size={20} color="#f59e0b" />
                            <h3 style={{ margin: 0 }}>Security</h3>
                        </div>

                        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>New Password</label>
                                <input
                                    className="input-field"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Confirm Password</label>
                                <input
                                    className="input-field"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                />
                            </div>
                            <button className="btn-secondary" type="submit" disabled={securitySaving} style={{ marginTop: '0.5rem' }}>
                                {securitySaving ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>

                    <div className="card" style={{ padding: '1.5rem', background: '#f8fafc' }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>Account Information</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                <span style={{ color: '#64748b' }}>Account ID</span>
                                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{profile.id?.substring(0, 8)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                <span style={{ color: '#64748b' }}>Status</span>
                                <span style={{ color: '#10b981', fontWeight: 600 }}>ACTIVE</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
