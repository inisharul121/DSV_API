import React, { useState } from 'react';
import { ArrowLeft, Send, Building2, MapPin, Phone, Mail, User, ShieldCheck } from 'lucide-react';
import { countries } from '../../utils/countries';
import dsvApi from '../../api/dsvApi';

const Step3Booking = ({ data, updateData, onBack, onComplete }) => {
    const [submitting, setSubmitting] = useState(false);

    // Internal state for the complex form
    const [form, setForm] = useState({
        collectDateFrom: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
        collectDateTo: new Date(new Date().getTime() + 6 * 60 * 60 * 1000).toISOString().slice(0, 16),
        pickupInstructions: 'Ready at front desk',
        origin: { ...data.sender },
        dest: { ...data.receiver },
        payment: {
            shippingCharges: 'SENDER',
            dutiesTaxes: 'RECEIVER'
        },
        service: {
            packageType: 'PARCELS',
            serviceCode: 'DSVAirExpress',
            currency: 'CHF',
            insuranceValue: 0
        },
        measurements: {
            length: data.dimensions.length,
            width: data.dimensions.width,
            height: data.dimensions.height,
            weight: data.weight,
            length2: '',
            width2: '',
            height2: '',
            weight2: ''
        },
        commodity: {
            origin: 'CH',
            description: 'Shipping Goods',
            currency: 'CHF',
            value: 60
        },
        notifications: {
            dep: 'recipient1@receiver.com',
            exc: 'recipient1@receiver.com',
            lang: 'EN'
        },
        reference: {
            qualifier: 'SHPR_REF',
            value: ''
        }
    });

    const handleFormChange = (section, field, value) => {
        setForm(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Mapping for the API
            const payload = {
                collectDateFrom: form.collectDateFrom,
                collectDateTo: form.collectDateTo,
                pickupInstructions: form.pickupInstructions,
                origin_company: form.origin.company,
                origin_address: form.origin.address,
                origin_zip: form.origin.zip,
                origin_city: form.origin.city,
                origin_country: form.origin.country,
                origin_contact: form.origin.contact,
                origin_phone: form.origin.phone,
                origin_email: form.origin.email,

                dest_company: form.dest.company,
                dest_address: form.dest.address,
                dest_zip: form.dest.zip,
                dest_city: form.dest.city,
                dest_country: form.dest.country,
                dest_contact: form.dest.contact,
                dest_phone: form.dest.phone,
                dest_email: form.dest.email,

                paymentType: form.payment.shippingCharges,
                dutiesType: form.payment.dutiesTaxes,

                packageType: form.service.packageType,
                serviceCode: form.service.serviceCode,
                currencyCode: form.service.currency,
                insuranceValue: form.service.insuranceValue,

                length: form.measurements.length,
                width: form.measurements.width,
                height: form.measurements.height,
                weight: form.measurements.weight,

                commodity_origin: form.commodity.origin,
                commodity: form.commodity.description,
                commodity_currency: form.commodity.currency,
                goodsValue: form.commodity.value,

                notif_email_1: form.notifications.dep,
                notif_email_2: form.notifications.exc,
                notif_lang: form.notifications.lang,

                ref_value: form.reference.value
            };

            const response = await dsvApi.post('/bookings/simple', { shipmentData: payload });
            if (response.data.success) {
                alert('Booking created successfully! Shipment ID: ' + (response.data.shipmentId || response.data.bookingId));
                onComplete();
            } else {
                alert('Booking failed: ' + (response.data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Booking error:', err);
            alert('Booking failed. Please check the console for details.');
        } finally {
            setSubmitting(false);
        }
    };

    const SectionHeader = ({ title, icon: Icon }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
            {Icon && <Icon size={20} color="var(--accent)" />}
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>{title}</h3>
        </div>
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '2.5rem', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontWeight: 800 }}>BOOKING INFORMATION</h2>
                    <div style={{ background: 'var(--accent)', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                        WIZARD DATA ATTACHED
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                        {/* LEFT COLUMN */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <section>
                                <SectionHeader title="Pickup Information" icon={Building2} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div className="input-group">
                                        <label className="input-label">Date From *</label>
                                        <input type="datetime-local" className="input-field" required value={form.collectDateFrom} onChange={(e) => setForm({ ...form, collectDateFrom: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Date To *</label>
                                        <input type="datetime-local" className="input-field" required value={form.collectDateTo} onChange={(e) => setForm({ ...form, collectDateTo: e.target.value })} />
                                    </div>
                                </div>
                                <div className="input-group" style={{ marginBottom: '1rem' }}>
                                    <label className="input-label">Instructions</label>
                                    <input type="text" className="input-field" value={form.pickupInstructions} onChange={(e) => setForm({ ...form, pickupInstructions: e.target.value })} />
                                </div>
                                <div className="input-group" style={{ marginBottom: '1rem' }}>
                                    <label className="input-label">Company Name</label>
                                    <input type="text" className="input-field" value={form.origin.company} onChange={(e) => handleFormChange('origin', 'company', e.target.value)} />
                                </div>
                                <div className="input-group" style={{ marginBottom: '1rem' }}>
                                    <label className="input-label">Address *</label>
                                    <input type="text" className="input-field" required value={form.origin.address} onChange={(e) => handleFormChange('origin', 'address', e.target.value)} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div className="input-group">
                                        <label className="input-label">Zip Code</label>
                                        <input type="text" className="input-field" value={form.origin.zip} onChange={(e) => handleFormChange('origin', 'zip', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">City *</label>
                                        <input type="text" className="input-field" required value={form.origin.city} onChange={(e) => handleFormChange('origin', 'city', e.target.value)} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label className="input-label">Contact Name *</label>
                                        <input type="text" className="input-field" required value={form.origin.contact} onChange={(e) => handleFormChange('origin', 'contact', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Contact Phone *</label>
                                        <input type="text" className="input-field" required placeholder="+41 78 123 45 67" value={form.origin.phone} onChange={(e) => handleFormChange('origin', 'phone', e.target.value)} />
                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Format: +XX XXXXXXXX</span>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <SectionHeader title="Payment Information" icon={ShieldCheck} />
                                <div className="input-group" style={{ marginBottom: '1rem' }}>
                                    <label className="input-label">Shipping Charges</label>
                                    <select className="input-field" value={form.payment.shippingCharges} onChange={(e) => handleFormChange('payment', 'shippingCharges', e.target.value)}>
                                        <option value="SENDER">Sender</option>
                                        <option value="RECEIVER">Receiver</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Duties and Taxes</label>
                                    <select className="input-field" value={form.payment.dutiesTaxes} onChange={(e) => handleFormChange('payment', 'dutiesTaxes', e.target.value)}>
                                        <option value="SENDER">Sender</option>
                                        <option value="RECEIVER">Receiver</option>
                                    </select>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <section>
                                <SectionHeader title="Delivery Information" icon={MapPin} />
                                <div className="input-group" style={{ marginBottom: '1rem' }}>
                                    <label className="input-label">Company Name</label>
                                    <input type="text" className="input-field" placeholder="Recipient Company" value={form.dest.company} onChange={(e) => handleFormChange('dest', 'company', e.target.value)} />
                                </div>
                                <div className="input-group" style={{ marginBottom: '1rem' }}>
                                    <label className="input-label">Address *</label>
                                    <input type="text" className="input-field" required value={form.dest.address} onChange={(e) => handleFormChange('dest', 'address', e.target.value)} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div className="input-group">
                                        <label className="input-label">Zip Code</label>
                                        <input type="text" className="input-field" value={form.dest.zip} onChange={(e) => handleFormChange('dest', 'zip', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">City *</label>
                                        <input type="text" className="input-field" required value={form.dest.city} onChange={(e) => handleFormChange('dest', 'city', e.target.value)} />
                                    </div>
                                </div>
                                <div className="input-group" style={{ marginBottom: '1rem' }}>
                                    <label className="input-label">Country Code *</label>
                                    <select className="input-field" required value={form.dest.country} onChange={(e) => handleFormChange('dest', 'country', e.target.value)}>
                                        <option value="">Select Country</option>
                                        {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label className="input-label">Contact Name *</label>
                                        <input type="text" className="input-field" required value={form.dest.contact} onChange={(e) => handleFormChange('dest', 'contact', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Contact Phone *</label>
                                        <input type="text" className="input-field" required placeholder="+41 78 123 45 67" value={form.dest.phone} onChange={(e) => handleFormChange('dest', 'phone', e.target.value)} />
                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Format: +XX XXXXXXXX</span>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <SectionHeader title="Service & Items" icon={ShieldCheck} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div className="input-group">
                                        <label className="input-label">Service Code</label>
                                        <select className="input-field" value={form.service.serviceCode} onChange={(e) => handleFormChange('service', 'serviceCode', e.target.value)}>
                                            <option value="DSVAirExpress">DSV Air Express</option>
                                            <option value="DSVEconomy">DSV Economy</option>
                                            <option value="DSVAirExpressImport">DSV Air Express Import</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Good Description *</label>
                                        <input type="text" className="input-field" required value={form.commodity.description} onChange={(e) => handleFormChange('commodity', 'description', e.target.value)} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label className="input-label">Goods Value *</label>
                                        <input type="number" className="input-field" required value={form.commodity.value} onChange={(e) => handleFormChange('commodity', 'value', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Currency</label>
                                        <select className="input-field" value={form.commodity.currency} onChange={(e) => handleFormChange('commodity', 'currency', e.target.value)}>
                                            <option value="CHF">CHF</option>
                                            <option value="EUR">EUR</option>
                                            <option value="USD">USD</option>
                                        </select>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', borderTop: '2px solid #f1f5f9', paddingTop: '2rem' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
                            Final Estimate: {data.pricing?.currency || 'CHF'} {data.pricing?.totalPrice || '---'}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '500px' }}>
                            <button type="button" className="btn-primary" style={{ background: 'var(--text-muted)', flex: 1 }} onClick={onBack}>
                                <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Back
                            </button>
                            <button type="submit" className="btn-primary" style={{ flex: 2, background: '#e65100' }} disabled={submitting}>
                                {submitting ? 'Processing...' : 'Submit Booking'}
                                {!submitting && <Send size={18} style={{ marginLeft: '0.5rem' }} />}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Step3Booking;
