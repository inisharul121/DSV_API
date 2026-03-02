import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Package, Search, MapPin, ShieldCheck, Globe, Phone, Clock } from 'lucide-react';

const Home = () => {
    const [trackingNumber, setTrackingNumber] = useState('');

    return (
        <div className="home-container">
            {/* Top Bar */}
            <div className="top-bar" style={{ background: '#003366', color: 'white', padding: '0.5rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <span><Clock size={14} style={{ marginRight: '5px' }} /> MON - FRI: 8AM - 5PM</span>
                    <span><Phone size={14} style={{ marginRight: '5px' }} /> +41 78 619 59 28</span>
                </div>
                <div>Address: Lättichstrasse 6, 6340 Baar</div>
            </div>

            {/* Navigation */}
            <nav className="public-nav" style={{ padding: '1rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 100 }}>
                <Link to="/">
                    <img src="https://limbercargo.com/assets/images/rony_limber_logo.jpg" alt="Limber Cargo" style={{ height: '50px' }} />
                </Link>
                <div style={{ display: 'flex', gap: '2rem', fontWeight: 600 }}>
                    <Link to="/" style={{ color: 'var(--accent)' }}>Home</Link>
                    <Link to="/order">Order Now</Link>
                    <Link to="/tracking">Tracking</Link>
                    <Link to="/about">About</Link>
                    <Link to="/support">Support</Link>
                    <Link to="/contact">Contact</Link>
                    <Link to="/dashboard" style={{ background: 'var(--accent)', color: 'white', padding: '0.5rem 1rem', borderRadius: '5px', marginTop: '-0.5rem' }}>Dashboard</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero" style={{
                height: '80vh',
                background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                textAlign: 'center',
                padding: '0 1rem'
            }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem' }}>BEST LOGISTIC AND CARGO SOLUTION</h1>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 400, maxWidth: '800px', marginBottom: '2rem' }}>WORLDWIDE EXPRESS DELIVERY!! Grow your B2B Business with Limber Cargo !!!</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/order" style={{ background: 'var(--accent)', padding: '1rem 2.5rem', borderRadius: '5px', fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>Order Now!</Link>
                    <Link to="/quotes" style={{ background: 'white', color: '#333', padding: '1rem 2.5rem', borderRadius: '5px', fontSize: '1.1rem', fontWeight: 700 }}>Request Quote</Link>
                </div>
            </section>

            {/* Quick Actions */}
            <section style={{ padding: '4rem 5%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginTop: '-5rem' }}>
                <div className="card" style={{ padding: '2rem', textAlign: 'center', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                    <Globe size={48} color="var(--accent)" style={{ marginBottom: '1rem' }} />
                    <h3>Rate And Ship</h3>
                    <p>The rates for all services and shipment.</p>
                    <Link to="/order" style={{ color: 'var(--accent)', fontWeight: 700 }}>GET RATES →</Link>
                </div>
                <div className="card" style={{ padding: '2rem', textAlign: 'center', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                    <Search size={48} color="var(--accent)" style={{ marginBottom: '1rem' }} />
                    <h3>Tracking</h3>
                    <p>Track your shipment to see the current status</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <input type="text" placeholder="Tracking Number" style={{ flex: 1, padding: '0.5rem', border: '1px solid #eee' }} />
                        <button style={{ background: 'var(--accent)', color: 'white', padding: '0.5rem 1rem', border: 'none' }}>TRACK</button>
                    </div>
                </div>
                <div className="card" style={{ padding: '2rem', textAlign: 'center', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                    <MapPin size={48} color="var(--accent)" style={{ marginBottom: '1rem' }} />
                    <h3>Locations</h3>
                    <p>Where we provide our services worldwide.</p>
                    <Link to="/contact" style={{ color: 'var(--accent)', fontWeight: 700 }}>VIEW LOCATIONS →</Link>
                </div>
            </section>

            {/* Special Services */}
            <section style={{ padding: '6rem 5%', background: '#f8fafc' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>OUR SPECIAL SERVICES</h2>
                    <div style={{ width: '80px', height: '4px', background: 'var(--accent)', margin: '1rem auto' }}></div>
                    <p style={{ maxWidth: '800px', margin: '0 auto', color: '#64748b' }}>Our warehousing services are known nationwide to be one of the most reliable, safe and affordable.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem' }}>
                    {[
                        { title: 'Packaging And Storage', icon: Package },
                        { title: 'Warehousing', icon: ShieldCheck },
                        { title: 'Cargo', icon: Ship },
                        { title: 'Door to Door Delivery', icon: Truck },
                        { title: 'Worldwide Transport', icon: Globe },
                        { title: 'Ground Transport', icon: Truck },
                    ].map((svc, i) => (
                        <div key={i} style={{ display: 'flex', gap: '1.5rem' }}>
                            <div style={{ color: 'var(--accent)' }}><svc.icon size={32} /></div>
                            <div>
                                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{svc.title}</h4>
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>We take pride in delivering the best of warehousing services, at the most reasonable prices.</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: '#1a202c', color: 'white', padding: '6rem 5% 2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4rem', marginBottom: '4rem' }}>
                    <div>
                        <img src="https://limbercargo.com/assets/images/rony_limber_logo.jpg" alt="Limber Cargo" style={{ height: '40px', marginBottom: '1.5rem', filter: 'brightness(0) invert(1)' }} />
                        <p style={{ color: '#a0aec0', fontSize: '0.9rem' }}>Limber Cargo is a World-Class Global Supplier of Transport and logistics Solutions. Our Head office is in Switzerland.</p>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '2rem', borderBottom: '2px solid var(--accent)', display: 'inline-block' }}>Useful Links</h4>
                        <ul style={{ listStyle: 'none', padding: 0, color: '#a0aec0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li><Link to="/order">Shipping</Link></li>
                            <li><Link to="/tracking">Tracking</Link></li>
                            <li><Link to="/terms">Terms & Conditions</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '2rem', borderBottom: '2px solid var(--accent)', display: 'inline-block' }}>Contact</h4>
                        <p style={{ color: '#a0aec0', fontSize: '0.9rem' }}>Lättichstrasse 6, 6340 Baar<br />info@limbercargo.com<br />+41 78 619 59 28</p>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '2rem', borderBottom: '2px solid var(--accent)', display: 'inline-block' }}>Newsletter</h4>
                        <p style={{ color: '#a0aec0', fontSize: '0.9rem', marginBottom: '1rem' }}>Sign up today for tips and latest news.</p>
                        <div style={{ display: 'flex' }}>
                            <input type="text" placeholder="Email" style={{ padding: '0.5rem', flex: 1 }} />
                            <button style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '0.5rem 1rem' }}>GO</button>
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid #2d3748', color: '#718096', fontSize: '0.8rem' }}>
                    © 2026 Limber Cargo. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

// Simple Ship icon since Lucide might not have it or named differently in some versions
const Ship = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.26 1.13 4.3 2.87 5.6" /><path d="M12 10V4.5" /><path d="M12 7H7l1.5-1.5L7 4h5" /></svg>
);

export default Home;
