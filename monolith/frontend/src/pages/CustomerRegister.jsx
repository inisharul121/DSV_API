import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle2, Eye, EyeOff, Truck } from 'lucide-react';
import dsvApi from '../api/dsvApi';
import PublicHeader from '../components/layout/PublicHeader';

const CustomerRegister = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', company: '', phone: '', role: 'Customer' });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false); // New state for admin success message
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if already logged in
        if (localStorage.getItem('adminToken') || localStorage.getItem('customerToken')) {
            navigate('/');
        }
    }, [navigate]);

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const endpoint = form.role === 'Admin' ? '/auth/admin/register' : '/auth/customer/register';
            const res = await dsvApi.post(endpoint, form);

            if (res.data.success) {
                if (form.role === 'Admin') {
                    setSuccess(true);
                } else {
                    localStorage.setItem('customerToken', res.data.token);
                    localStorage.setItem('customerInfo', JSON.stringify(res.data.customer));
                    navigate('/portal/orders');
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '0.75rem 1rem',
        background: '#fff', border: '1px solid #e2e8f0',
        borderRadius: '10px', color: '#1e293b', fontSize: '1rem',
        boxSizing: 'border-box', outline: 'none'
    };
    const passwordInputStyle = { ...inputStyle, paddingRight: '2.5rem' };
    const labelStyle = { color: '#64748b', fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.4rem' };

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
                <div style={{ width: '100%', maxWidth: '460px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: '56px', height: '56px', background: 'rgba(255, 102, 0, 0.1)',
                            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1rem', border: '1px solid rgba(255, 102, 0, 0.2)'
                        }}>
                            <Truck size={28} color="#ff6600" />
                        </div>
                        <h1 style={{ color: '#1e293b', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Limber Cargo</h1>
                        <p style={{ color: '#64748b', marginTop: '0.4rem' }}>Create Your Account</p>
                    </div>

                    <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                        {error && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', color: '#b91c1c', fontSize: '0.9rem'
                            }}>
                                <AlertCircle size={18} style={{ flexShrink: 0 }} /> {error}
                            </div>
                        )}

                        {success ? (
                            <div style={{ textAlign: 'center', padding: '1rem' }}>
                                <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
                                <h2 style={{ color: '#1e293b', marginBottom: '1rem', fontWeight: 700 }}>Registration Successful!</h2>
                                <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '2rem' }}>
                                    Your admin account has been created and is currently <strong>pending approval</strong>.
                                    You will be able to log in once an administrator activates your account.
                                </p>
                                <Link to="/login" style={{
                                    display: 'block', padding: '0.85rem', background: '#2563eb',
                                    borderRadius: '10px', color: '#fff', fontWeight: 700, textDecoration: 'none'
                                }}>
                                    Go to Sign In
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* Role Selection */}
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, role: 'Customer' }))}
                                        style={{
                                            flex: 1, padding: '0.6rem', borderRadius: '8px',
                                            background: form.role === 'Customer' ? '#ff6600' : '#f1f5f9',
                                            color: form.role === 'Customer' ? '#fff' : '#475569',
                                            border: '1px solid #e2e8f0', cursor: 'pointer',
                                            fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s'
                                        }}
                                    >
                                        Individual/Company
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, role: 'Admin' }))}
                                        style={{
                                            flex: 1, padding: '0.6rem', borderRadius: '8px',
                                            background: form.role === 'Admin' ? '#ff6600' : '#f1f5f9',
                                            color: form.role === 'Admin' ? '#fff' : '#475569',
                                            border: '1px solid #e2e8f0', cursor: 'pointer',
                                            fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s'
                                        }}
                                    >
                                        Admin/Employee
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={labelStyle}>Full Name *</label>
                                        <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="John Doe" required style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Company</label>
                                        <input name="company" type="text" value={form.company} onChange={handleChange} placeholder="Acme AG" style={inputStyle} />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Email *</label>
                                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@company.com" required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Phone</label>
                                    <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+41 79 000 0000" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Password *</label>
                                    <div style={{ position: 'relative' }}>
                                        <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="Min. 8 characters" required minLength={8} style={passwordInputStyle} />
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
                                    <UserPlus size={18} /> {loading ? 'Creating account...' : form.role === 'Admin' ? 'Request Access' : 'Create Account'}
                                </button>
                            </form>
                        )}

                        <p style={{ color: '#64748b', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: '#ff6600', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerRegister;
