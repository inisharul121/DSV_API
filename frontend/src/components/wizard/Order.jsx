import React, { useState, useEffect } from 'react';
import Step1Delivery from './Step1Countries';
import Step3Booking from './Step3Addresses';
import Step4Finalize from './Step4Finalize';
import { toast } from 'react-hot-toast';

const Order = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        originCountry: 'CH',
        addressType: 'business',
        pickupCountry: 'CH',
        deliveryCountry: '',
        weight: '',
        dimensions: { length: 10, width: 10, height: 10 },
        sender: {
            company: 'BCIC Swiss GmbH',
            address: 'Lättichstrasse 6',
            zip: '6340',
            city: 'Baar',
            country: 'CH',
            contact: 'Mazharul Sheikh',
            phone: '+41786195928',
            email: 'rony.sheikh@bcic-swiss.com'
        },
        receiver: {},
        pricing: null
    });

    useEffect(() => {
        const customerInfo = JSON.parse(localStorage.getItem('customerInfo') || 'null');
        if (customerInfo) {
            setFormData(prev => ({
                ...prev,
                sender: {
                    ...prev.sender,
                    company: customerInfo.company || prev.sender.company,
                    contact: customerInfo.name || prev.sender.contact,
                    email: customerInfo.email || prev.sender.email,
                    phone: customerInfo.phone || prev.sender.phone
                }
            }));
        }
    }, []);

    const [bookingResult, setBookingResult] = useState(null);

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const handleComplete = (result) => {
        setBookingResult(result);
        setCurrentStep(3);
    };

    const updateFormData = (updates) => {
        setFormData((prev) => ({ ...prev, ...updates }));
    };

    const steps = [
        { number: 1, label: 'Delivery & Box' },
        { number: 2, label: 'Booking Form' },
        { number: 3, label: 'Success' },
    ];

    if (currentStep === 3 && bookingResult) {
        return (
            <div className="wizard-container">
                <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '80px', height: '80px', background: '#dcfce7', color: '#166534', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>Booking Confirmed!</h2>
                    <p style={{ color: '#64748b', marginBottom: '2.5rem' }}>Your shipment <strong>{bookingResult.bookingId}</strong> has been successfully scheduled.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', width: '100%', maxWidth: '600px', margin: '0 auto 2rem' }}>
                        {bookingResult.invoiceUrl && (
                            <a 
                                href={`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${bookingResult.invoiceUrl}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn-primary"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#e67e22', textDecoration: 'none' }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                View Proforma Invoice
                            </a>
                        )}
                        {bookingResult.labelUrl && (
                            <a 
                                href={`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${bookingResult.labelUrl}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn-primary"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                                Download Labels
                            </a>
                        )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button 
                            className="btn-primary" 
                            style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}
                            onClick={() => window.location.href = '/shipments'}
                        >
                            Back to Shipments
                        </button>
                        <button 
                            className="btn-primary"
                            onClick={() => window.location.reload()}
                        >
                            Start New Booking
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="wizard-container">
            <div className="wizard-progress">
                {steps.map((step) => (
                    <div
                        key={step.number}
                        className={`wizard-step ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
                    >
                        <div className="step-number">{step.number}</div>
                        <div className="step-label">{step.label}</div>
                    </div>
                ))}
            </div>

            <div className="wizard-content">
                {currentStep === 1 && (
                    <Step1Delivery
                        data={formData}
                        updateData={updateFormData}
                        onNext={nextStep}
                    />
                )}
                {currentStep === 2 && (
                    <Step3Booking
                        data={formData}
                        updateData={updateFormData}
                        onBack={prevStep}
                        onComplete={handleComplete}
                    />
                )}
            </div>
        </div>
    );
};

export default Order;
