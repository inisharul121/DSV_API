import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Truck, Loader2, Calendar, MapPin, Clock, Download, FileText, ChevronRight } from 'lucide-react';
import dsvApi from '../api/dsvApi';

const Shipments = () => {
    const [trackingId, setTrackingId] = useState('');
    const [loading, setLoading] = useState(false);
    const [trackingData, setTrackingData] = useState(null);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(null);
    const [searchParams] = useSearchParams();

    const [allShipments, setAllShipments] = useState([]);
    const [fetching, setFetching] = useState(false);

    const fetchShipments = async () => {
        setFetching(true);
        try {
            // Determine if we should fetch admin orders or customer orders
            const isCustomer = !!localStorage.getItem('customerToken');
            const endpoint = isCustomer ? '/customer/orders' : '/orders';

            const response = await dsvApi.get(endpoint);
            if (response.data.success) {
                setAllShipments(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching shipments:', err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchShipments();
    }, []);

    const handleTrack = async (e, id) => {
        const idToTrack = id || trackingId;
        if (e) e.preventDefault();
        if (!idToTrack) return;

        setLoading(true);
        setError(null);
        setTrackingData(null);
        setTrackingId(idToTrack);

        try {
            // Priority: if it's a long numeric string, it's likely an AWB or Shipment ID
            let eventsUrl = `/tracking/shipments/${idToTrack}/events`;

            // Heuristic for tracking endpoint
            if (idToTrack.startsWith('DSV') || idToTrack.length > 10) {
                eventsUrl = `/tracking/shipments/${idToTrack}/events`;
            }

            const response = await dsvApi.get(eventsUrl);
            if (response.data.success && response.data.data.events?.length > 0) {
                setTrackingData(response.data.data.events);
            } else {
                setError(response.data.error?.message || 'No tracking events found for this ID.');
            }
        } catch (err) {
            console.error('Tracking error:', err);
            setError('Could not retrieve tracking events. Ensure the ID is valid.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const id = searchParams.get('id') || searchParams.get('bookingId');
        if (id) {
            handleTrack(null, id);
        }
    }, [searchParams]);

    const handleDownloadLabel = async (shipmentId) => {
        setDownloading(shipmentId);
        try {
            const response = await dsvApi.post(`/bookings/${shipmentId}/labels`, {});
            if (response.data.success) {
                const labelData = response.data.pdfBase64;

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
                } else {
                    alert('No PDF content found in the label response.');
                }
            } else {
                alert('No labels found for this shipment.');
            }
        } catch (err) {
            console.error('Download error:', err);
            alert('Could not download label. Ensure the Shipment ID is valid and has been confirmed.');
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                {/* TRACKING SECTION */}
                <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Search size={22} color="var(--accent)" /> Shipment Tracking
                    </h3>
                    <form onSubmit={handleTrack} style={{ display: 'flex', gap: '0.75rem' }}>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Tracking # or Shipment ID"
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button type="submit" className="btn-primary" disabled={loading || !trackingId}>
                            {loading ? <Loader2 className="spin" size={18} /> : 'Track'}
                        </button>
                    </form>

                    {error && (
                        <div style={{ marginTop: '1.5rem', color: 'var(--error)', fontSize: '0.9rem', background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            {error}
                        </div>
                    )}

                    {trackingData && (
                        <div style={{ marginTop: '2.5rem' }}>
                            <div className="timeline">
                                {trackingData.map((event, index) => (
                                    <div key={index} className="timeline-event" style={{ paddingLeft: '2.5rem', marginBottom: '1.5rem', position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: 0, top: '0.25rem', width: '12px', height: '12px', borderRadius: '50%', background: index === 0 ? 'var(--accent)' : '#cbd5e1', border: '3px solid white', boxShadow: index === 0 ? '0 0 0 4px rgba(37, 99, 235, 0.1)' : 'none' }} />
                                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{event.eventDescription}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                            {new Date(event.eventDate).toLocaleString()} • {event.location || 'In Transit'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RECENT SHIPMENTS */}
                <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Clock size={22} color="var(--accent)" /> Recent Bookings
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {fetching && <div style={{ textAlign: 'center', padding: '1rem' }}><Loader2 className="spin" /></div>}
                        {!fetching && allShipments.slice(0, 3).map((s) => (
                            <div key={s.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.bookingId}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.destinationCountry} • {new Date(s.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className="btn-primary"
                                        style={{ padding: '0.4rem', borderRadius: '8px', background: '#e2e8f0', color: '#475569' }}
                                        onClick={() => handleDownloadLabel(s.bookingId)}
                                        title="Download Label"
                                    >
                                        {downloading === s.bookingId ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
                                    </button>
                                    <button
                                        className="btn-primary"
                                        style={{ padding: '0.4rem', borderRadius: '8px' }}
                                        onClick={() => handleTrack(null, s.bookingId)}
                                        title="Track Shipment"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {!fetching && allShipments.length === 0 && (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No recent bookings found.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* FULL TABLE VIEW (Optional - for parity) */}
            <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={22} color="var(--accent)" /> All Shipments
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID</th>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>DESTINATION</th>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>STATUS</th>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>AWB</th>
                                <th style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allShipments.map((s) => (
                                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem 0.5rem', fontWeight: 700 }}>{s.bookingId}</td>
                                    <td style={{ padding: '1rem 0.5rem' }}>{s.destinationCountry}</td>
                                    <td style={{ padding: '1rem 0.5rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            background: s.status === 'Delivered' ? '#dcfce7' : (s.status === 'Exception' ? '#fee2e2' : '#dbeafe'),
                                            color: s.status === 'Delivered' ? '#166534' : (s.status === 'Exception' ? '#991b1b' : '#1e40af')
                                        }}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 0.5rem', fontFamily: 'monospace' }}>{s.awb || s.bookingId}</td>
                                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDownloadLabel(s.bookingId)}
                                            disabled={downloading === s.bookingId}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', marginRight: '1rem' }}
                                        >
                                            {downloading === s.bookingId ? '...' : 'Label'}
                                        </button>
                                        <button
                                            onClick={() => handleTrack(null, s.bookingId)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}
                                        >
                                            Track
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!fetching && allShipments.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No shipments found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Shipments;
