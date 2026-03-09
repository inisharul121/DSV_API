import React, { useState, useEffect } from 'react';
import { Building2, Home, ArrowRight, Loader2, Box, Truck, Calendar, ChevronDown } from 'lucide-react';
import { countries } from '../../utils/countries';
import dsvApi from '../../api/dsvApi';

const Step1Countries = ({ data, updateData, onNext }) => {
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(data.serviceCode);

    const presets = [
        { label: 'A4 Envelope', l: 32, w: 24, h: 3 },
        { label: 'Shoe Box', l: 35, w: 20, h: 15 },
        { label: 'Moving Box', l: 75, w: 35, h: 35 },
    ];

    const handlePricing = async () => {
        if (!data.originCountry || !data.deliveryCountry || !data.weight) return;

        setLoading(true);
        try {
            const response = await dsvApi.post('/quotes', {
                dsvAccount: 8004990000,
                pickupCountryCode: data.originCountry,
                pickupCity: data.originCountry === 'CH' ? data.sender?.city || 'Baar' : undefined,
                pickupZipCode: data.originCountry === 'CH' ? data.sender?.zip || '6340' : undefined,
                deliveryCountryCode: data.deliveryCountry,
                packageType: "PARCELS",
                weight: data.weight,
                length: data.dimensions?.length || 10,
                width: data.dimensions?.width || 10,
                height: data.dimensions?.height || 10,
                collectDate: new Date().toISOString().split('T')[0]
            });

            if (response.data.success && response.data.data.services?.length > 0) {
                setServices(response.data.data.services);
                // Store services in parent for Step 2 to use if user changes service code
                updateData({ availableServices: response.data.data.services });

                // If current selected service is not in new results, or none selected, pick the first one
                const remainsAvailable = response.data.data.services.find(s => s.serviceCode === selectedService);
                if (!remainsAvailable) {
                    const first = response.data.data.services[0];
                    setSelectedService(first.serviceCode);
                    updateData({
                        serviceCode: first.serviceCode,
                        pricing: {
                            totalPrice: first.totalDisplay,
                            currency: first.currency,
                            breakdown: first.detailedBreakdown
                        }
                    });
                }
            } else {
                setServices([]);
            }
        } catch (err) {
            console.error('Pricing error:', err);
            setServices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            handlePricing();
        }, 600);
        return () => clearTimeout(timer);
    }, [data.originCountry, data.deliveryCountry, data.weight, data.dimensions?.length, data.dimensions?.width, data.dimensions?.height]);

    const handleSelectService = (svc) => {
        setSelectedService(svc.serviceCode);
        updateData({
            serviceCode: svc.serviceCode,
            pricing: {
                totalPrice: svc.totalDisplay,
                currency: svc.currency,
                breakdown: svc.detailedBreakdown
            }
        });
    };

    const handleDimensionChange = (field, value) => {
        updateData({
            dimensions: { ...data.dimensions, [field]: value }
        });
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
            <div className="form-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                    Step 1: Route & Box Size
                </h3>

                <div className="input-group">
                    <label className="input-label">Select Origin Country:</label>
                    <select
                        className="input-field"
                        value={data.originCountry || ''}
                        onChange={(e) => updateData({
                            originCountry: e.target.value,
                            sender: { ...data.sender, country: e.target.value }
                        })}
                    >
                        <option value="">Select Country</option>
                        {countries.map(c => (
                            <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="input-group">
                        <label className="input-label">Destination Country:</label>
                        <select
                            className="input-field"
                            value={data.deliveryCountry || ''}
                            onChange={(e) => updateData({
                                deliveryCountry: e.target.value,
                                receiver: { ...data.receiver, country: e.target.value }
                            })}
                        >
                            <option value="">Select Country</option>
                            {countries.map(c => (
                                <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Weight (kg):</label>
                        <input
                            type="number"
                            step="0.1"
                            className="input-field"
                            placeholder="e.g. 10"
                            value={data.weight || ''}
                            onChange={(e) => updateData({ weight: e.target.value })}
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label className="input-label">Address Type:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <label className={`radio-card ${data.addrType !== 'home' ? 'active' : ''}`} style={{ cursor: 'pointer', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <input type="radio" checked={data.addrType !== 'home'} onChange={() => updateData({ addrType: 'business' })} style={{ display: 'none' }} />
                            <Building2 size={20} color={data.addrType !== 'home' ? 'var(--accent)' : '#64748b'} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Business</span>
                        </label>
                        <label className={`radio-card ${data.addrType === 'home' ? 'active' : ''}`} style={{ cursor: 'pointer', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <input type="radio" checked={data.addrType === 'home'} onChange={() => updateData({ addrType: 'home' })} style={{ display: 'none' }} />
                            <Home size={20} color={data.addrType === 'home' ? 'var(--accent)' : '#64748b'} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Home</span>
                        </label>
                    </div>
                </div>

                <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>
                        <Box size={18} /> BOX DIMENSIONS (CM)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="input-group">
                            <label className="input-label" style={{ fontSize: '0.75rem' }}>Length</label>
                            <input type="number" className="input-field" value={data.dimensions?.length || ''} onChange={(e) => handleDimensionChange('length', e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label className="input-label" style={{ fontSize: '0.75rem' }}>Width</label>
                            <input type="number" className="input-field" value={data.dimensions?.width || ''} onChange={(e) => handleDimensionChange('width', e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label className="input-label" style={{ fontSize: '0.75rem' }}>Height</label>
                            <input type="number" className="input-field" value={data.dimensions?.height || ''} onChange={(e) => handleDimensionChange('height', e.target.value)} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {presets.map(p => (
                            <button
                                key={p.label}
                                className="btn-preset"
                                onClick={() => updateData({ dimensions: { length: p.l, width: p.w, height: p.h } })}
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', cursor: 'pointer', color: '#475569', fontWeight: 600 }}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        className="btn-primary"
                        disabled={!data.deliveryCountry || !data.weight || !selectedService}
                        onClick={onNext}
                        style={{ width: '100%', height: '50px', fontSize: '1rem' }}
                    >
                        Review Booking Details <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                    </button>
                </div>
            </div>

            <div className="stat-card" style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '16px' }}>
                <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Available Services</h3>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto', color: 'var(--accent)' }} />
                        <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 500 }}>Fetching real-time rates...</p>
                    </div>
                ) : services.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {services.map((svc, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleSelectService(svc)}
                                style={{
                                    background: 'white',
                                    padding: '1.25rem',
                                    borderRadius: '12px',
                                    border: selectedService === svc.serviceCode ? '2.5px solid var(--accent)' : '1px solid #e2e8f0',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: selectedService === svc.serviceCode ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ padding: '0.5rem', background: '#eff6ff', color: '#2563eb', borderRadius: '8px' }}>
                                            <Truck size={24} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>{svc.serviceCode}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Calendar size={14} /> Est. {svc.etaMin}-{svc.etaMax} Days
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent)' }}>{svc.currency} {svc.totalDisplay}</div>
                                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#94a3b8' }}>Total Price</div>
                                    </div>
                                </div>

                                {selectedService === svc.serviceCode && (
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Price Breakdown</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            {svc.detailedBreakdown?.map((item, bIdx) => {
                                                const isHandlingFee = item.label === 'Limber Cargo Handling Fee';
                                                return (
                                                    <div key={bIdx} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        fontSize: '0.8rem',
                                                        fontWeight: isHandlingFee ? 700 : 400,
                                                        color: isHandlingFee ? 'var(--accent)' : '#64748b',
                                                        padding: isHandlingFee ? '0.2rem 0' : '0'
                                                    }}>
                                                        <span>{item.label}</span>
                                                        <span style={{ fontWeight: 600 }}>{svc.currency} {item.value}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            Enter route and dimensions to view available shipping services.
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .radio-card.active { border-color: var(--accent) !important; background: #fff7ed !important; }
            `}</style>
        </div>
    );
};

export default Step1Countries;
