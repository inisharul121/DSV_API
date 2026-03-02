import React, { useState, useEffect } from 'react';
import { Building2, Home, ArrowRight, Loader2 } from 'lucide-react';
import { countries } from '../../utils/countries';
import dsvApi from '../../api/dsvApi';

const Step1Countries = ({ data, updateData, onNext }) => {
    const [loading, setLoading] = useState(false);
    const [pricing, setPricing] = useState(data.pricing);

    const handlePricing = async () => {
        if (!data.deliveryCountry || !data.weight) return;

        setLoading(true);
        try {
            const direction = data.direction || 'export';
            const response = await dsvApi.post('/quotes', {
                dsvAccount: 8004990000,
                pickupCountryCode: direction === 'export' ? 'CH' : data.deliveryCountry,
                deliveryCountryCode: direction === 'export' ? data.deliveryCountry : 'CH',
                packageType: "PARCELS",
                weight: data.weight,
                // Default small box for initial quote
                length: data.dimensions?.length || 10,
                width: data.dimensions?.width || 10,
                height: data.dimensions?.height || 10
            });

            if (response.data.success && response.data.data.services?.length > 0) {
                const svc = response.data.data.services[0];
                const pricingData = {
                    totalPrice: svc.totalDisplay,
                    currency: svc.currency,
                    breakdown: svc.detailedBreakdown
                };
                setPricing(pricingData);
                updateData({ pricing: pricingData });
            } else {
                setPricing(null);
            }
        } catch (err) {
            console.error('Pricing error:', err);
            setPricing(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            handlePricing();
        }, 500);
        return () => clearTimeout(timer);
    }, [data.deliveryCountry, data.weight, data.direction]);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="form-card">
                <h3 style={{ marginBottom: '2rem', borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem' }}>
                    Step 1: Delivery Options
                </h3>

                <div className="input-group">
                    <label className="input-label">Export/Import:</label>
                    <select
                        className="input-field"
                        value={data.direction || 'export'}
                        onChange={(e) => updateData({ direction: e.target.value })}
                    >
                        <option value="export">Export from Switzerland</option>
                        <option value="import">Import to Switzerland</option>
                    </select>
                </div>

                <div className="input-group">
                    <label className="input-label">Address Type:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                        <label className="radio-card">
                            <input
                                type="radio"
                                name="addrType"
                                value="business"
                                checked={data.addrType !== 'home'}
                                onChange={() => updateData({ addrType: 'business' })}
                            />
                            <div className="radio-content">
                                <Building2 size={24} />
                                <span>Business Address</span>
                            </div>
                        </label>
                        <label className="radio-card">
                            <input
                                type="radio"
                                name="addrType"
                                value="home"
                                checked={data.addrType === 'home'}
                                onChange={() => updateData({ addrType: 'home' })}
                            />
                            <div className="radio-content">
                                <Home size={24} />
                                <span>Home Address</span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="input-group">
                    <label className="input-label">Select Country:</label>
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
                        placeholder="e.g. 2.5"
                        value={data.weight || ''}
                        onChange={(e) => updateData({ weight: e.target.value })}
                    />
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        className="btn-primary"
                        disabled={!data.deliveryCountry || !data.weight}
                        onClick={onNext}
                    >
                        Next <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                    </button>
                </div>
            </div>

            <div className="stat-card">
                <h3 style={{ marginBottom: '1.5rem' }}>Pricing Result</h3>
                <div id="pricing-result-container">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <Loader2 className="spin" size={32} style={{ margin: '0 auto', color: 'var(--accent)' }} />
                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Calculating rates...</p>
                        </div>
                    ) : pricing ? (
                        <table className="pricing-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                {pricing.breakdown?.map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td className="label" style={{ padding: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.label}</td>
                                        <td className="value" style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 600 }}>{pricing.currency} {item.value}</td>
                                    </tr>
                                ))}
                                <tr style={{ borderTop: '2px solid var(--accent)' }}>
                                    <td className="label" style={{ padding: '1rem 0', fontWeight: 800, fontSize: '1rem' }}>Total Price</td>
                                    <td className="value" style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 800, color: 'var(--accent)', fontSize: '1.2rem' }}>
                                        {pricing.currency} {pricing.totalPrice}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                            Please select country and weight to see estimated pricing.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step1Countries;
