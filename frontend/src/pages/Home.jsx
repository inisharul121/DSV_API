import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Package, Search, MapPin, ShieldCheck, Globe, Phone, Clock, ChevronDown } from 'lucide-react';

const Home = () => {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);

    const heroImages = [
        "https://limbercargo.com/assets/images/002.jpg",
        "https://limbercargo.com/assets/images/limber_plane.jpg",
        "https://limbercargo.com/assets/images/slide_3.jpg"
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroImages.length]);

    return (
        <div className="home-container" style={{ fontWait: 400 }}>
            {/* Top Bar - Refined Layout */}
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
                    <Link to="/" style={{ color: '#ff6600', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Home</Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase' }}>
                        SHIPPING <ChevronDown size={14} />
                    </div>
                    <Link to="/tracking" style={{ color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Tracking</Link>
                    <Link to="/about" style={{ color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>About</Link>
                    <Link to="/support" style={{ color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Support</Link>
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

            {/* Hero Section with Slider */}
            <section className="hero" style={{
                height: '75vh',
                position: 'relative',
                overflow: 'hidden',
                background: '#000'
            }}>
                {heroImages.map((img, idx) => (
                    <div key={idx} style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("${img}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transition: 'opacity 1s ease-in-out',
                        opacity: currentSlide === idx ? 1 : 0,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        textAlign: 'center',
                        zIndex: currentSlide === idx ? 1 : 0
                    }}>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem', textShadow: '2px 2px 8px rgba(0,0,0,0.6)' }}>BEST LOGISTIC AND CARGO SOLUTION</h1>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 400, maxWidth: '800px', marginBottom: '2.5rem' }}>WORLDWIDE EXPRESS DELIVERY!! Grow your B2B Business with Limber Cargo !!!</h2>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <Link to="/order" style={{ background: '#ff6600', padding: '1rem 2.5rem', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 700, color: 'white', textDecoration: 'none' }}>Order Now!</Link>
                            <Link to="/quotes" style={{ background: 'white', color: '#1a1a1a', padding: '1rem 2.5rem', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 700, textDecoration: 'none' }}>Request Quote</Link>
                        </div>
                    </div>
                ))}
            </section>

            {/* Rest of the content remains identical but with refined spacing/colors */}
            {/* Quick Actions */}
            <section style={{ padding: '0 8%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginTop: '-4rem', position: 'relative', zIndex: 10 }}>
                <div className="card" style={{ padding: '2.5rem', textAlign: 'center', background: 'white', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                    <Globe size={48} color="#ff6600" style={{ marginBottom: '1.5rem' }} />
                    <h3 style={{ color: '#003366', marginBottom: '1rem' }}>Rate And Ship</h3>
                    <p style={{ color: '#666', marginBottom: '1.5rem' }}>The rates for all services and shipment.</p>
                    <Link to="/order" style={{ color: '#ff6600', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>GET RATES →</Link>
                </div>
                <div className="card" style={{ padding: '2.5rem', textAlign: 'center', background: 'white', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                    <Search size={48} color="#ff6600" style={{ marginBottom: '1.5rem' }} />
                    <h3 style={{ color: '#003366', marginBottom: '1rem' }}>Tracking</h3>
                    <p style={{ color: '#666', marginBottom: '1.5rem' }}>Track your shipment to see the current status</p>
                    <div style={{ display: 'flex', gap: 0 }}>
                        <input type="text" placeholder="Tracking Number" style={{ flex: 1, padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px 0 0 4px', fontSize: '0.9rem' }} />
                        <button style={{ background: '#ff6600', color: 'white', padding: '0.75rem 1.25rem', border: 'none', borderRadius: '0 4px 4px 0', cursor: 'pointer', fontWeight: 700 }}>TRACK</button>
                    </div>
                </div>
                <div className="card" style={{ padding: '2.5rem', textAlign: 'center', background: 'white', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                    <MapPin size={48} color="#ff6600" style={{ marginBottom: '1.5rem' }} />
                    <h3 style={{ color: '#003366', marginBottom: '1rem' }}>Locations</h3>
                    <p style={{ color: '#666', marginBottom: '1.5rem' }}>Where we provide our services worldwide.</p>
                    <Link to="/contact" style={{ color: '#ff6600', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>VIEW LOCATIONS →</Link>
                </div>
            </section>

            {/* Worldwide Express Delivery Section */}
            <section style={{ padding: '6rem 8%', display: 'flex', gap: '5rem', alignItems: 'center', background: 'white' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ position: 'relative' }}>
                        <img
                            src="https://limbercargo.com/assets/images/home_small_one.png"
                            alt="Worldwide Delivery"
                            style={{ width: '100%', borderRadius: '20px', display: 'block' }}
                        />
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                        WORLDWIDE EXPRESS <br /> DELIVERY!!
                    </h2>
                    <div style={{ width: '60px', height: '3px', background: '#ff6600', marginBottom: '3.5rem' }}></div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Globe size={24} color="#333" />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1a1a1a' }}>Global supply within shortest time!</h4>
                                <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6 }}>In 5-7 working days your package arrived worldwide. Hand to hand delivery.</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                background: '#ff6600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 10px 20px rgba(255,102,0,0.2)'
                            }}>
                                <Search size={24} color="white" />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1a1a1a' }}>Realtime shipment tracking</h4>
                                <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6 }}>You can realtime track your package location with a simple click. Just don't forget to put in your tracker number!</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Package size={24} color="#333" />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1a1a1a' }}>Best Rate in Asia, Middle East and Africa</h4>
                                <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6 }}>Best market rate 30-70% cheaper than SwissPast, DHL, Fedex,UPS etc.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Grow Your B2B Business Section */}
            <section style={{ padding: '6rem 8%', display: 'flex', gap: '5rem', alignItems: 'center', background: '#fcfcfc' }}>
                <div style={{ flex: 1.2 }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '1.5rem', lineHeight: 1.2 }}>
                        GROW YOUR B2B BUSINESS <br /> WITH LIMBER CARGO !!!
                    </h2>
                    <div style={{ width: '60px', height: '3px', background: '#ff6600', marginBottom: '3rem' }}></div>

                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <li style={{ display: 'flex', gap: '1rem', color: '#555', fontSize: '1rem', lineHeight: 1.6 }}>
                            <span style={{ color: '#ff6600', fontSize: '1.5rem', lineHeight: 0.8 }}>•</span>
                            We offer a unique 5-7 days worlwide express service for small, medium, and large-scale businesses.
                        </li>
                        <li style={{ display: 'flex', gap: '1rem', color: '#555', fontSize: '1rem', lineHeight: 1.6 }}>
                            <span style={{ color: '#ff6600', fontSize: '1.5rem', lineHeight: 0.8 }}>•</span>
                            We are here as a total solution for those of you who have a business depending on imported goods from made in Europe, UK and Switzerland, we help to make sending your products easier and less complicated till your hand or warehouse around the world.
                        </li>
                        <li style={{ display: 'flex', gap: '1rem', color: '#555', fontSize: '1rem', lineHeight: 1.6 }}>
                            <span style={{ color: '#ff6600', fontSize: '1.5rem', lineHeight: 0.8 }}>•</span>
                            <div>
                                Our shipping range is huge which is include, Made in Europe/uk/Switzerland: Cosmetics, Watches, Clothing, Machineries, R&D material, Electronics, Pharma/medicine, supplement, food, chocolate, coffee etc etc.. No minimum oder! Let's Collaborate! Choose Limber for your worlwide logistics partner!
                            </div>
                        </li>
                    </ul>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <img
                        src="https://limbercargo.com/assets/images/plane.jpg"
                        alt="B2B Logistics"
                        style={{ width: '100%', maxWidth: '600px' }}
                    />
                </div>
            </section>

            {/* Special Services */}
            <section style={{ padding: '8rem 8% 6rem', background: '#fff' }}>
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#003366', letterSpacing: '-1px' }}>OUR SPECIAL SERVICES</h2>
                    <div style={{ width: '60px', height: '4px', background: '#ff6600', margin: '1.5rem auto' }}></div>
                    <p style={{ maxWidth: '800px', margin: '0 auto', color: '#777', lineHeight: 1.6 }}>Our warehousing services are known nationwide to be one of the most reliable, safe and affordable, because we take pride in delivering the best of warehousing services, at the most reasonable prices.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4rem 3rem' }}>
                    {[
                        { title: 'Packaging And Storage', icon: Package },
                        { title: 'Warehousing', icon: ShieldCheck },
                        { title: 'Cargo', icon: ShipIcon },
                        { title: 'Door to Door Delivery', icon: Truck },
                        { title: 'Worldwide Transport', icon: Globe },
                        { title: 'Ground Transport', icon: Truck },
                    ].map((svc, i) => (
                        <div key={i} style={{ display: 'flex', gap: '1.5rem' }}>
                            <div style={{ color: '#ff6600' }}><svc.icon size={32} strokeWidth={1.5} /></div>
                            <div>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1a1a1a' }}>{svc.title}</h4>
                                <p style={{ color: '#777', fontSize: '0.95rem', lineHeight: 1.5 }}>Package and store your things effectively and securely to make sure them in storage.</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
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

const ShipIcon = ({ size, strokeWidth = 2 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.26 1.13 4.3 2.87 5.6" /><path d="M12 10V4.5" /><path d="M12 7H7l1.5-1.5L7 4h5" /></svg>
);

export default Home;
