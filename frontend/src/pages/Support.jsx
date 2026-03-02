import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Package, Search, MapPin, Globe, Phone, Clock, ShieldCheck, ChevronDown, CheckCircle } from 'lucide-react';

const Support = () => {
    return (
        <div className="support-page" style={{ fontWait: 400 }}>
            {/* Top Bar - Consistent across public pages */}
            <div className="top-header" style={{
                background: 'white',
                padding: '1rem 8%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #f0f0f0'
            }}>
                <Link to="/">
                    <img src="https://limbercargo.com/assets/images/rony_limber_logo.jpg" alt="Limber Cargo" style={{ height: '70px' }} />
                </Link>

                <div style={{ display: 'flex', gap: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ color: '#333' }}><MapPin size={32} strokeWidth={1.5} /></div>
                        <div style={{ fontSize: '0.85rem' }}>
                            <div style={{ color: '#777', fontStyle: 'italic' }}>Address : Limber Cargo,</div>
                            <div style={{ color: '#ff6600', fontWeight: 600 }}>Lättichstrasse 6,6340 Baar</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ color: '#333' }}><Phone size={32} strokeWidth={1.5} /></div>
                        <div style={{ fontSize: '0.85rem' }}>
                            <div style={{ color: '#777', fontStyle: 'italic' }}>Phone Number :</div>
                            <div style={{ color: '#ff6600', fontWeight: 600 }}>+41 78 619 59 28</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ color: '#333' }}><Clock size={32} strokeWidth={1.5} /></div>
                        <div style={{ fontSize: '0.85rem' }}>
                            <div style={{ color: '#777', fontStyle: 'italic' }}>Opening Hours :</div>
                            <div style={{ color: '#ff6600', fontWeight: 600 }}>MON - FRi: 8AM - 5PM</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation - Dark Theme */}
            <nav className="public-nav" style={{
                background: '#1a1a1a',
                color: 'white',
                padding: '0 8%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '60px',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <div style={{ display: 'flex', gap: '2rem', height: '100%', alignItems: 'center' }}>
                    <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Home</Link>
                    <Link to="/shipments" style={{ color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Tracking</Link>
                    <Link to="/about" style={{ color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>About</Link>
                    <Link to="/support" style={{ color: '#ff6600', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Support</Link>
                    <Link to="/contact" style={{ color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Contact</Link>
                    <Link to="/dashboard" style={{ color: '#ff6600', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Dashboard</Link>
                </div>

                <Link to="/order" style={{
                    background: '#ff6600',
                    color: 'white',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 2.5rem',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '1rem'
                }}>
                    Order Now!
                </Link>
            </nav>

            {/* Breadcrumb / Hero */}
            <section style={{
                height: '400px',
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://limbercargo.com/assets/images/002.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white'
            }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem' }}>Support</h1>
                <div style={{ fontSize: '1rem', color: '#ccc' }}>
                    <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link> <span style={{ margin: '0 0.5rem' }}>›</span> Support
                </div>
            </section>

            {/* Unbeatable Trucking Section */}
            <section style={{ padding: '8rem 8%', background: 'white' }}>
                <div style={{ display: 'flex', gap: '5rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ borderLeft: '4px solid #ff0000', paddingLeft: '2rem' }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '1.5rem', lineHeight: 1.1, textTransform: 'uppercase' }}>
                                Unbeatable Trucking and Transport Services
                            </h2>
                        </div>
                        <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: 1.6, marginBottom: '1rem' }}>
                            Limber Cargo is a global logistic service company and <span style={{ color: '#ff6600' }}>provide Top-notch Solution.</span>
                        </p>
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ color: '#777', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                            Limber Cargo is a global logistic service company, We have a wide experience in overland industry specific logistic solutions like pharmaceutical logistics, retail and automotive logistics by train or road.
                        </p>
                        <p style={{ color: '#777', fontSize: '1rem', lineHeight: 1.8 }}>
                            We bring your goods safely to worldwide destinations with our great sea fright services. We offer LLC and FLC shipments that are fast and effective with no delays.
                        </p>
                    </div>
                </div>
            </section>

            {/* The Complete Solution Section */}
            <section style={{ padding: '6rem 8%', background: '#fcfcfc' }}>
                <div style={{ display: 'flex', gap: '5rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <img
                            src="https://limbercargo.com/assets/images/support_img.jpg"
                            alt="The Complete Solution"
                            style={{ width: '100%', borderRadius: '4px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '1rem', textTransform: 'uppercase' }}>The Complete Solution</h2>
                        <div style={{ width: '60px', height: '3px', background: '#ff6600', marginBottom: '2.5rem' }}></div>

                        <p style={{ color: '#555', fontSize: '1rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                            Our warehousing services are known nationwide to be one of the most reliable, safe and affordable, because we take pride in delivering the best of warehousing services, at the most reasonable prices.
                        </p>
                        <p style={{ color: '#555', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>
                            Pleasure and praising pain was born and I will give you a complete account of system, and expound actual teachings occasionally circumstances.
                        </p>

                        <Link to="/about" style={{
                            background: '#ff6600',
                            color: 'white',
                            padding: '1rem 2rem',
                            display: 'inline-block',
                            textDecoration: 'none',
                            fontWeight: 700,
                            borderRadius: '4px',
                            transition: 'background 0.3s'
                        }}>
                            More About Us
                        </Link>
                    </div>
                </div>
            </section>

            {/* Style for Hover Effects */}
            <style>{`
                .hover-icon-box {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    border: 1px solid #eee;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 2rem;
                    transition: all 0.3s ease;
                    background: white;
                    color: #333;
                }
                .hover-icon-box:hover {
                    background: #ff6600;
                    color: white;
                    border-color: #ff6600;
                    box-shadow: 0 10px 20px rgba(255,102,0,0.2);
                }
                .hover-icon-box svg {
                    transition: color 0.3s ease;
                }
            `}</style>

            {/* Three Step Processing Section */}
            <section style={{ padding: '8rem 8%', background: 'white', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '1rem', textTransform: 'uppercase' }}>Three Step Processing</h2>
                <div style={{ width: '60px', height: '3px', background: '#ff6600', margin: '0 auto 5rem' }}></div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div className="hover-icon-box">
                            <Package size={42} />
                        </div>
                        <h4 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem' }}>Receive From Shipper</h4>
                        <p style={{ color: '#777', fontSize: '1rem', lineHeight: 1.6 }}>Pursues or desires to obtain sed pain of it because it is pain circumstances.</p>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div className="hover-icon-box">
                            <Truck size={42} />
                        </div>
                        <h4 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem' }}>Safe & Secure Shipment</h4>
                        <p style={{ color: '#777', fontSize: '1rem', lineHeight: 1.6 }}>Except to obtain some advantage from it but who has any rights too find fault with enjoy.</p>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div className="hover-icon-box">
                            <div style={{ position: 'relative', display: 'flex' }}>
                                <Package size={42} />
                                <div style={{ position: 'absolute', bottom: -5, right: -5, background: 'white', borderRadius: '50%', border: '1px solid #eee' }}>
                                    <ChevronDown size={20} color="#333" />
                                </div>
                            </div>
                        </div>
                        <h4 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem' }}>Handover to Receiver</h4>
                        <p style={{ color: '#777', fontSize: '1rem', lineHeight: 1.6 }}>At vero eos et accusamus et iusto sed odio dignissimos ducimus ut blanditiis</p>
                    </div>
                </div>
            </section>

            {/* Footer - Consistent */}
            <footer style={{ background: '#111', color: 'white', padding: '6rem 8% 2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4rem', marginBottom: '5rem' }}>
                    <div>
                        <img src="https://limbercargo.com/assets/images/rony_limber_logo.jpg" alt="Limber Cargo" style={{ height: '70px', marginBottom: '2rem' }} />
                        <p style={{ color: '#999', fontSize: '0.9rem', lineHeight: 1.6 }}>Limber Cargo is a World-Class Global Supplier of Transport and logistics Solutions. Our Head office is in Switzerland and we have international network of partners and agents.</p>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '2.5rem', borderBottom: '2px solid #ff6600', display: 'inline-block', paddingBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>Useful Links</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li><Link to="/order" style={{ color: '#999', textDecoration: 'none', fontSize: '0.9rem' }}>Shipping</Link></li>
                            <li><Link to="/shipments" style={{ color: '#999', textDecoration: 'none', fontSize: '0.9rem' }}>Tracking</Link></li>
                            <li><Link to="/terms" style={{ color: '#999', textDecoration: 'none', fontSize: '0.9rem' }}>Terms & Conditions</Link></li>
                            <li><Link to="/contact" style={{ color: '#999', textDecoration: 'none', fontSize: '0.9rem' }}>Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '2.5rem', borderBottom: '2px solid #ff6600', display: 'inline-block', paddingBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>Contact</h4>
                        <div style={{ color: '#999', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.75rem' }}><MapPin size={18} color="#ff6600" /> Lättichstrasse 6, 6340 Baar</div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}><Phone size={18} color="#ff6600" /> +41 78 619 59 28</div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}><Globe size={18} color="#ff6600" /> info@limbercargo.com</div>
                        </div>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '2.5rem', borderBottom: '2px solid #ff6600', display: 'inline-block', paddingBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>Newsletter</h4>
                        <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Sign up today for tips and latest news and exclusive special offers.</p>
                        <div style={{ display: 'flex' }}>
                            <input type="text" placeholder="Your Email" style={{ padding: '0.75rem', flex: 1, background: '#222', border: 'none', color: 'white', borderRadius: '4px 0 0 4px' }} />
                            <button style={{ background: '#ff6600', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0 4px 4px 0', fontWeight: 700, cursor: 'pointer' }}>GO</button>
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: 'center', paddingTop: '2.5rem', borderTop: '1px solid #222', color: '#666', fontSize: '0.85rem' }}>
                    © 2026 Limber Cargo. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Support;
