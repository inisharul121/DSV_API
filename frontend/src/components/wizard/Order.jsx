import React, { useState } from 'react';
import Step1Delivery from './Step1Countries'; // Renaming internal reference
import Step2Dimensions from './Step2Dimensions';
import Step3Booking from './Step3Addresses'; // Renaming internal reference

const Order = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        direction: 'export',
        addressType: 'business',
        pickupCountry: 'CH',
        deliveryCountry: '',
        weight: '',
        dimensions: { length: 75, width: 35, height: 35 },
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

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const updateFormData = (updates) => {
        setFormData((prev) => ({ ...prev, ...updates }));
    };

    const steps = [
        { number: 1, label: 'Delivery Options' },
        { number: 2, label: 'Box Size' },
        { number: 3, label: 'Booking' },
    ];

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
                    <Step2Dimensions
                        data={formData}
                        updateData={updateFormData}
                        onNext={nextStep}
                        onBack={prevStep}
                    />
                )}
                {currentStep === 3 && (
                    <Step3Booking
                        data={formData}
                        updateData={updateFormData}
                        onBack={prevStep}
                        onComplete={() => alert('Booking Submitted!')}
                    />
                )}
            </div>
        </div>
    );
};

export default Order;
