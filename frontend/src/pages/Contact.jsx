import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, Clock, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Contact = () => {
    return (
        <div className="contact-page" style={{ fontWait: 400 }}>
            {/* Top Bar - Consistent */}
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
                    <Link to="/tracking" style={{ color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Tracking</Link>
                    <Link to="/about" style={{ color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>About</Link>
                    <Link to="/support" style={{ color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Support</Link>
                    <Link to="/contact" style={{ color: '#ff6600', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Contact</Link>
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

            {/* Hero Section */}
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
                <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem' }}>Contact Us</h1>
                <div style={{ fontSize: '1rem', color: '#ccc' }}>
                    <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link> <span style={{ margin: '0 0.5rem' }}>›</span> Contact
                </div>
            </section>

            {/* Contact Details & Working Hours */}
            <section style={{ padding: '8rem 8%', background: 'white' }}>
                <div style={{ display: 'flex', gap: '5rem' }}>
                    <div style={{ flex: 1.5 }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '1rem', textTransform: 'uppercase' }}>Contact Details</h2>
                        <div style={{ width: '60px', height: '3px', background: '#ff6600', marginBottom: '3rem' }}></div>

                        <p style={{ color: '#777', fontSize: '1rem', lineHeight: 1.8, marginBottom: '4rem' }}>
                            If you have any questions about what we offer for consumers or for business, you can always email us or call us via the below details. We'll reply within 24 hours.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4rem 2rem' }}>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{ color: '#ff6600' }}><MapPin size={32} strokeWidth={1.5} /></div>
                                <div>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Visit our office</h4>
                                    <p style={{ color: '#777', fontSize: '0.95rem' }}>Lättichstrasse 6 , 6340 Baar, Switzerland</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{ color: '#ff6600' }}><Phone size={32} strokeWidth={1.5} /></div>
                                <div>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Call us on</h4>
                                    <p style={{ color: '#777', fontSize: '0.95rem' }}>Office: +41 77 227 70 20</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{ color: '#ff6600' }}><Mail size={32} strokeWidth={1.5} /></div>
                                <div>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Mail Us at</h4>
                                    <p style={{ color: '#777', fontSize: '0.95rem' }}>info@limbercargo.com</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{ color: '#ff6600' }}><Globe size={32} strokeWidth={1.5} /></div>
                                <div>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>We are social</h4>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        {[Facebook, Twitter, Globe, Linkedin].map((Icon, i) => (
                                            <div key={i} style={{
                                                width: '35px', height: '35px', borderRadius: '50%', border: '1px solid #eee',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#777', cursor: 'pointer', transition: '0.3s'
                                            }}>
                                                <Icon size={16} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ background: '#fff', border: '1px solid #eee', padding: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '1rem', textTransform: 'uppercase' }}>Working Hours</h2>
                            <div style={{ width: '60px', height: '3px', background: '#ff6600', marginBottom: '2.5rem' }}></div>

                            <p style={{ color: '#777', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                                Contact us within these hours for best response.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {[
                                    { day: 'Monday', time: '9:00 am – 17.00 pm' },
                                    { day: 'Tuesday', time: '9:00 am – 18.00 pm' },
                                    { day: 'Wednesday', time: '9:00 am – 18.00 pm' },
                                    { day: 'Thurs & Friday', time: '10:00 am – 16.00 pm' },
                                    { day: 'Sat & Sunday', time: 'Closed', closed: true },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                        <span style={{ color: '#333', fontWeight: 500 }}>{item.day}</span>
                                        <span style={{ color: item.closed ? '#ff6600' : '#777' }}>{item.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Leave Your Message Form */}
            <section style={{ padding: '8rem 8%', background: '#fcfcfc' }}>
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '1rem', textTransform: 'uppercase' }}>Leave Your Message</h2>
                    <div style={{ width: '60px', height: '3px', background: '#ff6600', margin: '0 auto 3rem' }}></div>
                    <p style={{ color: '#777', fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto' }}>
                        If you have any questions about the services we provide simply use the form below. We try and respond to all queries and comments within 24 hours.
                    </p>
                </div>

                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <form style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <input type="text" placeholder="Your Name*" style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '4px', background: 'white' }} />
                            <input type="email" placeholder="Email Address*" style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '4px', background: 'white' }} />
                            <input type="text" placeholder="Phone" style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '4px', background: 'white' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <textarea placeholder="Your Message..." style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '4px', background: 'white', height: '100%', minHeight: '180px' }}></textarea>
                        </div>
                        <div style={{ gridColumn: 'span 2', textAlign: 'center', marginTop: '2rem' }}>
                            <button style={{
                                background: '#ff6600', color: 'white', border: 'none',
                                padding: '1rem 4rem', borderRadius: '4px', fontWeight: 700,
                                fontSize: '1.1rem', cursor: 'pointer', transition: '0.3s'
                            }}>
                                Submit
                            </button>
                        </div>
                    </form>
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
                            <li><Link to="/tracking" style={{ color: '#999', textDecoration: 'none', fontSize: '0.9rem' }}>Tracking</Link></li>
                            <li><Link to="/terms" style={{ color: '#999', textDecoration: 'none', fontSize: '0.9rem' }}>Terms & Conditions</Link></li>
                            <li><Link to="/contact" style={{ color: '#999', textDecoration: 'none', fontSize: '0.9rem' }}>Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '2.5rem', borderBottom: '2px solid #ff6600', display: 'inline-block', paddingBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>Contact</h4>
                        <div style={{ color: '#999', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.75rem' }}><MapPin size={18} color="#ff6600" /> Lättichstrasse 6, 6340 Baar</div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}><Phone size={18} color="#ff6600" /> +41 78 619 59 28</div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}><Mail size={18} color="#ff6600" /> info@limbercargo.com</div>
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

export default Contact;
