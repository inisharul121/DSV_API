import React from 'react';
import { ArrowLeft, ArrowRight, Box } from 'lucide-react';

const Step2Dimensions = ({ data, updateData, onNext, onBack }) => {
    const presets = [
        { label: 'A4 Envelope', l: 32, w: 24, h: 3 },
        { label: 'Two Books', l: 23, w: 14, h: 5 },
        { label: 'Shoe Box', l: 35, w: 20, h: 15 },
        { label: 'Moving Box', l: 75, w: 35, h: 35 },
    ];

    const handlePreset = (preset) => {
        updateData({
            dimensions: { length: preset.l, width: preset.w, height: preset.h }
        });
    };

    const handleDimensionChange = (field, value) => {
        updateData({
            dimensions: { ...data.dimensions, [field]: value }
        });
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>
                BOX DIMENSIONS
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem', lineHeight: 1.6 }}>
                Please select the right criteria here to filter to desired pricing. Accurate dimensions ensure no surprise surcharges from DSV.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                <div className="box-preview" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', height: '300px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box size={100} color="var(--accent)" strokeWidth={1} style={{ opacity: 0.5 }} />
                    <div style={{ position: 'absolute', bottom: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {data.dimensions.length || 0} x {data.dimensions.width || 0} x {data.dimensions.height || 0} cm
                    </div>
                </div>

                <div className="form-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div className="input-group">
                            <label className="input-label">Length (cm):</label>
                            <input
                                type="number"
                                className="input-field"
                                value={data.dimensions.length || ''}
                                onChange={(e) => handleDimensionChange('length', e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Width (cm):</label>
                            <input
                                type="number"
                                className="input-field"
                                value={data.dimensions.width || ''}
                                onChange={(e) => handleDimensionChange('width', e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Height (cm):</label>
                            <input
                                type="number"
                                className="input-field"
                                value={data.dimensions.height || ''}
                                onChange={(e) => handleDimensionChange('height', e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Presets
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            {presets.map((p) => (
                                <button
                                    key={p.label}
                                    type="button"
                                    className="btn-preset"
                                    onClick={() => handlePreset(p)}
                                    style={{ fontSize: '0.75rem', padding: '0.6rem' }}
                                >
                                    {p.label} {p.l}x{p.w}x{p.h}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '3rem', display: 'flex', justifyBetween: 'space-between', gap: '1rem' }}>
                <button
                    type="button"
                    className="btn-primary"
                    style={{ background: 'var(--text-muted)', flex: 1 }}
                    onClick={onBack}
                >
                    <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Back
                </button>
                <button
                    type="button"
                    className="btn-primary"
                    style={{ flex: 1 }}
                    onClick={onNext}
                >
                    Next <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                </button>
            </div>
        </div>
    );
};

export default Step2Dimensions;
