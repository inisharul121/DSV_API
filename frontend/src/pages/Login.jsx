import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Truck, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import dsvApi from '../api/dsvApi';
import PublicHeader from '../components/layout/PublicHeader';

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
        // Redirect if already logged in
        if (localStorage.getItem('adminToken') || localStorage.getItem('customerToken')) {
            navigate('/');
        }
    }, [navigate]);

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
            background: '#f8fafc'
        }}>
            <PublicHeader />

            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 2rem'
            }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: '56px', height: '56px',
                            background: 'rgba(255, 102, 0, 0.1)',
                            borderRadius: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1rem',
                            border: '1px solid rgba(255, 102, 0, 0.2)'
                        }}>
                            <Truck size={28} color="#ff6600" />
                        </div>
                        <h1 style={{ color: '#1e293b', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Limber Cargo</h1>
                        <p style={{ color: '#64748b', marginTop: '0.4rem' }}>Secure Access Portal</p>
                    </div>

                    <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <button
                                onClick={() => setRole('Customer')}
                                style={{
                                    flex: 1, padding: '0.6rem', borderRadius: '8px',
                                    background: role === 'Customer' ? '#ff6600' : '#f1f5f9',
                                    color: role === 'Customer' ? '#fff' : '#475569',
                                    border: '1px solid #e2e8f0', cursor: 'pointer',
                                    fontWeight: 600, fontSize: '0.85rem'
                                }}
                            >
                                Client Login
                            </button>
                            <button
                                onClick={() => setRole('Admin')}
                                style={{
                                    flex: 1, padding: '0.6rem', borderRadius: '8px',
                                    background: role === 'Admin' ? '#ff6600' : '#f1f5f9',
                                    color: role === 'Admin' ? '#fff' : '#475569',
                                    border: '1px solid #e2e8f0', cursor: 'pointer',
                                    fontWeight: 600, fontSize: '0.85rem'
                                }}
                            >
                                Admin Login
                            </button>
                        </div>

                        <h2 style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
                            {role === 'Admin' ? 'Admin Sign In' : 'Client Sign In'}
                        </h2>

                        {error && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', color: '#b91c1c', fontSize: '0.9rem'
                            }}>
                                <AlertCircle size={18} style={{ flexShrink: 0 }} /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.4rem' }}>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    required
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem',
                                        background: '#fff', border: '1px solid #e2e8f0',
                                        borderRadius: '10px', color: '#1e293b', fontSize: '1rem',
                                        boxSizing: 'border-box', outline: 'none'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.4rem' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        style={{
                                            width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem',
                                            background: '#fff', border: '1px solid #e2e8f0',
                                            borderRadius: '10px', color: '#1e293b', fontSize: '1rem',
                                            boxSizing: 'border-box', outline: 'none'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center'
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
                                    background: loading ? '#94a3b8' : '#ff6600',
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
        </div>
    );
};

export default CustomerLogin;
