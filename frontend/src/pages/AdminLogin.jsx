import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, LogIn, AlertCircle, Building2 } from 'lucide-react';
import dsvApi from '../api/dsvApi';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await dsvApi.post('/auth/admin/login', { email, password });
            if (res.data.success) {
                localStorage.setItem('adminToken', res.data.token);
                localStorage.setItem('adminInfo', JSON.stringify(res.data.admin));
                // Clear customer session if any to avoid confusion
                localStorage.removeItem('customerToken');
                localStorage.removeItem('customerInfo');
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Admin login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            padding: '2rem'
        }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '56px', height: '56px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        <Shield size={28} color="#ef4444" />
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Limber Cargo</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.4rem' }}>Employee Management Portal</p>
                </div>

                <div style={{ background: '#1e293b', borderRadius: '16px', padding: '2rem', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                    <h2 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LogIn size={20} /> Staff Sign In
                    </h2>

                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', color: '#fca5a5', fontSize: '0.9rem'
                        }}>
                            <AlertCircle size={18} style={{ flexShrink: 0 }} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Official Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@bcic-swiss.com"
                                required
                                style={{
                                    width: '100%', padding: '0.85rem 1.1rem',
                                    background: '#0f172a', border: '1px solid #334155',
                                    borderRadius: '10px', color: '#f1f5f9', fontSize: '1rem',
                                    boxSizing: 'border-box', outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Secure Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{
                                    width: '100%', padding: '0.85rem 1.1rem',
                                    background: '#0f172a', border: '1px solid #334155',
                                    borderRadius: '10px', color: '#f1f5f9', fontSize: '1rem',
                                    boxSizing: 'border-box', outline: 'none'
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '0.5rem', padding: '1rem',
                                background: loading ? '#334155' : '#ef4444',
                                border: 'none', borderRadius: '10px',
                                color: '#fff', fontWeight: 700, fontSize: '1rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                transition: 'background 0.2s'
                            }}
                        >
                            {loading ? 'Authenticating...' : 'Access Dashboard'}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #334155', textAlign: 'center' }}>
                        <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                            <Building2 size={16} /> Back to Main Site
                        </Link>
                    </div>
                </div>

                <p style={{ color: '#475569', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem' }}>
                    Unauthorized access is strictly prohibited and monitored.
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
