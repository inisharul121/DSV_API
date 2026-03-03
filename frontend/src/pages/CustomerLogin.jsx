import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, LogIn, AlertCircle } from 'lucide-react';
import dsvApi from '../api/dsvApi';

const CustomerLogin = () => {
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
            const res = await dsvApi.post('/auth/customer/login', { email, password });
            if (res.data.success) {
                localStorage.setItem('customerToken', res.data.token);
                localStorage.setItem('customerInfo', JSON.stringify(res.data.customer));
                navigate('/portal/orders');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
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
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
            padding: '2rem'
        }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '56px', height: '56px',
                        background: 'rgba(37, 99, 235, 0.15)',
                        borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem',
                        border: '1px solid rgba(37,99,235,0.3)'
                    }}>
                        <Truck size={28} color="#60a5fa" />
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Limber Cargo</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.4rem' }}>Customer Portal</p>
                </div>

                <div style={{ background: '#1e293b', borderRadius: '16px', padding: '2rem', border: '1px solid #334155' }}>
                    <h2 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Sign In</h2>

                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', color: '#fca5a5', fontSize: '0.9rem'
                        }}>
                            <AlertCircle size={18} style={{ flexShrink: 0 }} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.4rem' }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                required
                                style={{
                                    width: '100%', padding: '0.75rem 1rem',
                                    background: '#0f172a', border: '1px solid #334155',
                                    borderRadius: '10px', color: '#f1f5f9', fontSize: '1rem',
                                    boxSizing: 'border-box', outline: 'none'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.4rem' }}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{
                                    width: '100%', padding: '0.75rem 1rem',
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
                                marginTop: '0.5rem', padding: '0.85rem',
                                background: loading ? '#334155' : '#2563eb',
                                border: 'none', borderRadius: '10px',
                                color: '#fff', fontWeight: 700, fontSize: '1rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            <LogIn size={18} /> {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p style={{ color: '#64748b', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                        Don't have an account?{' '}
                        <Link to="/portal/register" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CustomerLogin;
