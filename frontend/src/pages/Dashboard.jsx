import React from 'react';
import { Ship, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

const StatCard = ({ icon: Icon, value, label, color, bgColor }) => (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: bgColor, color: color }}>
                <Icon size={24} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800' }}>{value}</div>
        </div>
        <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>{label}</div>
    </div>
);

const Dashboard = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <StatCard
                    icon={Ship}
                    value="24"
                    label="Active Shipments"
                    color="#2563eb"
                    bgColor="rgba(37, 99, 235, 0.1)"
                />
                <StatCard
                    icon={CheckCircle}
                    value="128"
                    label="Delivered This Month"
                    color="#10b981"
                    bgColor="rgba(16, 185, 129, 0.1)"
                />
                <StatCard
                    icon={Clock}
                    value="3"
                    label="Pending Clearances"
                    color="#f59e0b"
                    bgColor="rgba(245, 158, 11, 0.1)"
                />
                <StatCard
                    icon={AlertTriangle}
                    value="0"
                    label="Exceptions"
                    color="#ef4444"
                    bgColor="rgba(239, 68, 68, 0.1)"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="card" style={{ minHeight: '300px' }}>
                    <h4 style={{ marginBottom: '1.5rem' }}>Volume Analytics</h4>
                    <div style={{ height: '240px', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '12px', display: 'grid', placeItems: 'center', color: '#64748b' }}>
                        {/* Dynamic chart logic will go here */}
                        <p>Analytics Chart Placeholder</p>
                    </div>
                </div>

                <div className="card">
                    <h4 style={{ marginBottom: '1.5rem' }}>Quick Status Check</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="input-group">
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter Tracking #..."
                                style={{ width: '100%' }}
                            />
                        </div>
                        <button className="btn-primary" style={{ width: '100%' }}>
                            Track <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
