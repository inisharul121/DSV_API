import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, Globe, ChevronRight, Calendar, Loader2, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';
import dsvApi from '../api/dsvApi';

const Reports = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const years = [2024, 2025, 2026];

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await dsvApi.get(`/reports/monthly?month=${selectedMonth}&year=${selectedYear}`);
            if (res.data.success) {
                setReportData(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [selectedMonth, selectedYear]);

    if (loading && !reportData) {
        return (
            <div style={{ display: 'grid', placeItems: 'center', height: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 size={32} className="loader" color="var(--accent)" />
                    <p style={{ marginTop: '1rem', color: '#64748b' }}>Generating your analytics report...</p>
                </div>
            </div>
        );
    }

    const { summary, breakdowns } = reportData || {};

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header & Filter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Business Analytics</h2>
                    <p style={{ color: '#64748b', marginTop: '0.4rem' }}>Performance insights for {months[selectedMonth - 1]} {selectedYear}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: 'white', padding: '0.4rem', borderRadius: '12px', border: '1px solid #e2e8f0', gap: '0.5rem' }}>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="select-plain"
                            style={{ border: 'none', fontWeight: 600, color: '#1a1a1a', outline: 'none', cursor: 'pointer' }}
                        >
                            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="select-plain"
                            style={{ border: 'none', fontWeight: 600, color: '#1a1a1a', outline: 'none', cursor: 'pointer' }}
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '10px', display: 'grid', placeItems: 'center' }}>
                            <Package size={20} color="#2563eb" />
                        </div>
                        <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                            +12% <ArrowUpRight size={14} />
                        </div>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>TOTAL SHIPMENTS</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.5rem 0' }}>{summary?.totalShipments || 0}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Billed events this period</div>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', display: 'grid', placeItems: 'center' }}>
                            <TrendingUp size={20} color="#10b981" />
                        </div>
                        <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                            +8% <ArrowUpRight size={14} />
                        </div>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>EST. REVENUE (CHF)</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.5rem 0' }}>{summary?.totalRevenue || 0}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total goods value processed</div>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px', display: 'grid', placeItems: 'center' }}>
                            <BarChart3 size={20} color="#f59e0b" />
                        </div>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>AVG. BASKET</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.5rem 0' }}>CHF {summary?.avgRevenuePerShipment || 0}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Per shipment efficiency</div>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'rgba(107, 114, 128, 0.1)', borderRadius: '10px', display: 'grid', placeItems: 'center' }}>
                            <Globe size={20} color="#6b7280" />
                        </div>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>TOTAL VOLUME</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.5rem 0' }}>{summary?.totalWeight || 0} KG</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Gross weight handled</div>
                </div>
            </div>

            {/* Detailed Analytics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '2rem' }}>Service Distribution</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {Object.entries(breakdowns?.service || {}).map(([service, count]) => {
                            const percent = ((count / summary.totalShipments) * 100).toFixed(0);
                            return (
                                <div key={service}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                        <span style={{ fontWeight: 600 }}>{service}</span>
                                        <span style={{ color: '#64748b' }}>{count} shipments ({percent}%)</span>
                                    </div>
                                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${percent}%`, background: 'var(--accent)', transition: 'width 0.6s ease' }} />
                                    </div>
                                </div>
                            );
                        })}
                        {Object.keys(breakdowns?.service || {}).length === 0 && (
                            <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No data available for this period.</p>
                        )}
                    </div>
                </div>

                <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Top Destinations</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        {breakdowns?.topDestinations.map((dest, i) => (
                            <div key={dest.country} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: i === breakdowns.topDestinations.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                <div style={{ width: '32px', height: '32px', background: '#f8fafc', borderRadius: '8px', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent)' }}>
                                    {i + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{dest.country}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{dest.count} recurring routes</div>
                                </div>
                                <div style={{ fontWeight: 700, color: '#1a1a1a' }}>{dest.count}</div>
                            </div>
                        ))}
                        {breakdowns?.topDestinations.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>No destination data.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Radar Block */}
            <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Network Operations Status</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    {Object.entries(breakdowns?.status || {}).map(([status, count]) => (
                        <div key={status} style={{ padding: '1.5rem', border: '1px solid #f1f5f9', borderRadius: '14px', textAlign: 'center' }}>
                            <div style={{
                                width: '12px', height: '12px', borderRadius: '50%', margin: '0 auto 1rem auto',
                                background: status === 'Delivered' ? '#10b981' : (status === 'Cancelled' ? '#ef4444' : '#2563eb')
                            }} />
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{count}</div>
                            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.25rem' }}>{status.toUpperCase()}</div>
                        </div>
                    ))}
                    {Object.keys(breakdowns?.status || {}).length === 0 && (
                        <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b' }}>No operational status to report.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
