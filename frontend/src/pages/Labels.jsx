import React, { useState } from 'react';
import { Search, FileText, Download, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import dsvApi from '../api/dsvApi';

const Labels = () => {
    const [shipmentId, setShipmentId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleDownloadLabel = async (e) => {
        if (e) e.preventDefault();
        if (!shipmentId) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // The API expects a POST or GET based on our controller. 
            // In our documentController.js, getShipmentLabels is a GET-like POST route on /bookings/:shipmentId/labels
            // But actually it's a POST in routes/api.js.

            const response = await dsvApi.post(`/bookings/${shipmentId}/labels`, {});

            if (response.data.success && (response.data.data.labelResults || response.data.data.packageLabels)) {
                const labelData = response.data.data.labelResults?.[0]?.labelContent ||
                    response.data.data.packageLabels?.[0]?.labelContent;

                if (labelData) {
                    const byteCharacters = atob(labelData);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'application/pdf' });

                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `Label_${shipmentId}.pdf`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();

                    setSuccess(`Label for ${shipmentId} downloaded successfully!`);
                } else {
                    setError('Label data was found but the content is empty.');
                }
            } else {
                setError('No labels found for this Shipment ID. Please verify the ID and try again.');
            }
        } catch (err) {
            console.error('Label download error:', err);
            const msg = err.response?.data?.error?.message || err.response?.data?.error || 'Could not retrieve label. Ensure the Shipment ID is correct and has been confirmed.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'rgba(37, 99, 235, 0.1)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    color: 'var(--accent)'
                }}>
                    <FileText size={32} />
                </div>

                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Download Shipping Label</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
                    Enter your Shipment ID or Booking ID to retrieve and download your PDF shipping label.
                </p>

                <form onSubmit={handleDownloadLabel} style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <div className="input-group" style={{ position: 'relative' }}>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. DSV12345678"
                            value={shipmentId}
                            onChange={(e) => setShipmentId(e.target.value.toUpperCase())}
                            style={{
                                paddingLeft: '3rem',
                                height: '3.5rem',
                                fontSize: '1.1rem',
                                borderRadius: '12px',
                                border: '2px solid #e2e8f0'
                            }}
                            required
                        />
                        <Search
                            size={20}
                            style={{
                                position: 'absolute',
                                left: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#94a3b8'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading || !shipmentId}
                        style={{
                            width: '100%',
                            marginTop: '1.5rem',
                            height: '3.5rem',
                            fontSize: '1.1rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem'
                        }}
                    >
                        {loading ? (
                            <Loader2 className="spin" size={24} />
                        ) : (
                            <>
                                <Download size={24} />
                                <span>Generate & Download PDF</span>
                            </>
                        )}
                    </button>
                </form>

                {error && (
                    <div style={{
                        marginTop: '2rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        padding: '1.25rem',
                        background: '#fef2f2',
                        borderRadius: '12px',
                        border: '1px solid #fee2e2',
                        textAlign: 'left'
                    }}>
                        <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ color: '#b91c1c', fontSize: '0.95rem' }}>{error}</div>
                    </div>
                )}

                {success && (
                    <div style={{
                        marginTop: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1.25rem',
                        background: '#f0fdf4',
                        borderRadius: '12px',
                        border: '1px solid #dcfce7',
                        textAlign: 'left'
                    }}>
                        <CheckCircle2 size={20} color="#22c55e" />
                        <div style={{ color: '#15803d', fontSize: '0.95rem' }}>{success}</div>
                    </div>
                )}
            </div>

            <div className="card" style={{ padding: '2rem' }}>
                <h4 style={{ marginBottom: '1rem', fontWeight: 700 }}>Common Questions</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Where do I find my ID?</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Your ID is provided immediately after booking. It's also sent to your registered email address.
                        </p>
                    </div>
                    <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Label not downloading?</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Labels are typically available 30-60 seconds after a successful booking. Try again if it fails initially.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Labels;
