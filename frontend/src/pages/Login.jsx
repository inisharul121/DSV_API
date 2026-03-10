import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Truck, LogIn, AlertCircle, Clock, Eye, EyeOff } from 'lucide-react';
import dsvApi from '../api/dsvApi';

const CustomerLogin = () => {
    const [role, setRole] = useState('Customer'); // Default role
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('error') === 'session_expired') {
            setError('Your session has expired. Please log in again.');
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const endpoint = role === 'Admin' ? '/auth/admin/login' : '/auth/customer/login';
            const res = await dsvApi.post(endpoint, { email, password });

            if (res.data.success) {
                if (role === 'Admin') {
                    localStorage.setItem('adminToken', res.data.token);
                    localStorage.setItem('adminInfo', JSON.stringify(res.data.admin));
                    localStorage.removeItem('customerToken');
                    localStorage.removeItem('customerInfo');
                    navigate('/dashboard');
                } else {
                    localStorage.setItem('customerToken', res.data.token);
                    localStorage.setItem('customerInfo', JSON.stringify(res.data.customer));
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminInfo');
                    navigate('/portal/dashboard');
                }
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
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #001f3f 0%, #003366 100%)',
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
                        border: '1px solid rgba(255,102,0,0.3)'
                    }}>
                        <Truck size={28} color="#ff6600" />
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Limber Cargo</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.4rem' }}>Secure Access Portal</p>
                </div>

                <div style={{ background: '#1e293b', borderRadius: '16px', padding: '2rem', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <button
                            onClick={() => setRole('Customer')}
                            style={{
                                flex: 1, padding: '0.6rem', borderRadius: '8px',
                                background: role === 'Customer' ? '#ff6600' : '#001a33',
                                color: '#fff', border: '1px solid #334155', cursor: 'pointer',
                                fontWeight: 600, fontSize: '0.85rem'
                            }}
                        >
                            Client Login
                        </button>
                        <button
                            onClick={() => setRole('Admin')}
                            style={{
                                flex: 1, padding: '0.6rem', borderRadius: '8px',
                                background: role === 'Admin' ? '#ff6600' : '#001a33',
                                color: '#fff', border: '1px solid #334155', cursor: 'pointer',
                                fontWeight: 600, fontSize: '0.85rem'
                            }}
                        >
                            Staff Login
                        </button>
                    </div>

                    <h2 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
                        {role === 'Admin' ? 'Staff Sign In' : 'Client Sign In'}
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
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{
                                        width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem',
                                        background: '#0f172a', border: '1px solid #334155',
                                        borderRadius: '10px', color: '#f1f5f9', fontSize: '1rem',
                                        boxSizing: 'border-box', outline: 'none'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '0.5rem', padding: '0.85rem',
                                background: loading ? '#334155' : '#ff6600',
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
                        <Link to="/portal/register" style={{ color: '#ff6600', textDecoration: 'none', fontWeight: 600 }}>Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CustomerLogin;
