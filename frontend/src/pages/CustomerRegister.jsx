import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, UserPlus, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import dsvApi from '../api/dsvApi';

const CustomerRegister = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', company: '', phone: '', role: 'Customer' });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false); // New state for admin success message
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

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
        background: '#0f172a', border: '1px solid #334155',
        borderRadius: '10px', color: '#f1f5f9', fontSize: '1rem',
        boxSizing: 'border-box', outline: 'none'
    };
    const passwordInputStyle = { ...inputStyle, paddingRight: '2.5rem' };
    const labelStyle = { color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.4rem' };

    return (
        <div style={{
            minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #001f3f 0%, #003366 100%)', padding: '2rem'
        }}>
            <div style={{ width: '100%', maxWidth: '460px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '56px', height: '56px', background: 'rgba(37, 99, 235, 0.15)',
                        borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem', border: '1px solid rgba(255,102,0,0.3)'
                    }}>
                        <Truck size={28} color="#ff6600" />
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Limber Cargo</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.4rem' }}>Create Your Account</p>
                </div>

                <div style={{ background: '#1e293b', borderRadius: '16px', padding: '2rem', border: '1px solid #334155' }}>
                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', color: '#fca5a5', fontSize: '0.9rem'
                        }}>
                            <AlertCircle size={18} style={{ flexShrink: 0 }} /> {error}
                        </div>
                    )}

                    {success ? (
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                            <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
                            <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Registration Successful!</h2>
                            <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem' }}>
                                Your staff account has been created and is currently <strong>pending approval</strong>.
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
                                        background: form.role === 'Customer' ? '#ff6600' : '#001a33',
                                        color: '#fff', border: '1px solid #334155', cursor: 'pointer',
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
                                        background: form.role === 'Admin' ? '#ff6600' : '#001a33',
                                        color: '#fff', border: '1px solid #334155', cursor: 'pointer',
                                        fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s'
                                    }}
                                >
                                    Staff/Employee
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
    );
};

export default CustomerRegister;
