import React, { useState } from 'react';
import { CheckCircle2, Download, Printer, Truck, ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import dsvApi from '../../api/dsvApi';

const Step4Finalize = ({ data, onBack }) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);

    const handleBook = async () => {
        setLoading(true);
        try {
            const shipmentData = {
                origin_country: data.sender.countryCode,
                origin_zip: data.sender.zipCode,
                origin_city: data.sender.city,
                origin_address: data.sender.address,
                origin_company: data.sender.companyName,
                origin_contact: data.sender.contactName,
                origin_phone: data.sender.contactPhone,
                origin_email: data.sender.contactEmail,

                dest_country: data.receiver.countryCode,
                dest_zip: data.receiver.zipCode,
                dest_city: data.receiver.city,
                dest_address: data.receiver.address,
                dest_company: data.receiver.companyName,
                dest_contact: data.receiver.contactName,
                dest_phone: data.receiver.contactPhone,
                dest_email: data.receiver.contactEmail,

                weight: data.weight,
                length: data.dimensions.length,
                width: data.dimensions.width,
                height: data.dimensions.height,

                dsvAccount: "8004990000",
                serviceCode: data.direction === 'import' ? 'DSVAirExpressImport' : 'DSVAirExpress',
                packageType: 'PARCELS',
                currencyCode: 'CHF'
            };

            const response = await dsvApi.post('/bookings/simple', { shipmentData });

            if (response.data.success) {
                setSuccess(true);
                setBookingResult(response.data);
            } else {
                alert('Booking failed: ' + (response.data.error?.message || response.data.error));
            }
        } catch (err) {
            console.error('Booking error:', err);
            alert('Network error during booking');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="form-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <CheckCircle2 size={80} color="var(--success)" style={{ margin: '0 auto 2rem' }} />
                <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1.5rem' }}>Shipment Booked Successfully!</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                    Your shipment has been confirmed with DSV. Tracking ID: <strong>{bookingResult.bookingId}</strong>
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    {bookingResult.labelUrl && (
                        <a
                            href={bookingResult.labelUrl}
                            target="_blank"
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                        >
                            <Download size={20} /> Download Label PDF
                        </a>
                    )}
                    <button
                        className="btn-primary"
                        style={{ background: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                    >
                        <Truck size={20} /> Track Shipment
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="form-card" style={{ padding: '3rem' }}>
                <h2 style={{ marginBottom: '2rem', borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem' }}>
                    Final Summary
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                    <div>
                        <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.8rem' }}>Route & Size</h4>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontWeight: 700 }}>{data.sender.countryCode} → {data.receiver.countryCode}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{data.direction === 'export' ? 'Export' : 'Import'}</div>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontWeight: 700 }}>{data.weight} kg</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{data.dimensions.length}x{data.dimensions.width}x{data.dimensions.height} cm</div>
                        </div>
                    </div>

                    <div>
                        <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.8rem' }}>Price Estimate</h4>
                        {data.pricing ? (
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent)' }}>
                                CHF {data.pricing.totalPrice}
                            </div>
                        ) : (
                            <div style={{ color: 'var(--error)' }}>Rate unavailable</div>
                        )}
                    </div>
                </div>

                <hr style={{ margin: '2rem 0', border: '0', borderTop: '1px solid #e2e8f0' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.8rem' }}>Pickup (Sender)</h4>
                        <div style={{ fontSize: '0.9rem' }}>
                            <div style={{ fontWeight: 700 }}>{data.sender.companyName}</div>
                            <div>{data.sender.address}</div>
                            <div>{data.sender.zipCode} {data.sender.city}</div>
                            <div style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>{data.sender.contactName}</div>
                        </div>
                    </div>
                    <div>
                        <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.8rem' }}>Delivery (Receiver)</h4>
                        <div style={{ fontSize: '0.9rem' }}>
                            <div style={{ fontWeight: 700 }}>{data.receiver.companyName}</div>
                            <div>{data.receiver.address}</div>
                            <div>{data.receiver.zipCode} {data.receiver.city}</div>
                            <div style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>{data.receiver.contactName}</div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
                    <button
                        type="button"
                        className="btn-primary"
                        style={{ background: 'var(--text-muted)', flex: 1 }}
                        onClick={onBack}
                        disabled={loading}
                    >
                        <ArrowLeft size={18} /> Edit Details
                    </button>
                    <button
                        type="button"
                        className="btn-primary"
                        style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}
                        onClick={handleBook}
                        disabled={loading || !data.pricing}
                    >
                        {loading ? <Loader2 className="spin" size={24} /> : <Printer size={24} />}
                        {loading ? 'Processing Booking...' : 'Confirm & Book Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Step4Finalize;
