document.addEventListener('DOMContentLoaded', () => {
    console.log('--- DSV Dashboard Loaded v1.2 ---');

    // UI Elements
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');
    const viewTitle = document.getElementById('view-title');
    const viewSubtitle = document.getElementById('view-subtitle');
    const bookingForm = document.getElementById('booking-form');
    const bookingFormContainer = document.getElementById('booking-form-container');
    const btnOpenBooking = document.getElementById('btn-open-booking-modal');
    const btnCloseBooking = document.getElementById('btn-close-booking');
    const btnQuickCreateOrder = document.getElementById('btn-create-new-order');

    // Tracking Elements
    const trackingInput = document.getElementById('tracking-input');
    const btnTrack = document.getElementById('btn-track');
    const quickTrackInput = document.getElementById('quick-track-input');
    const btnQuickTrack = document.getElementById('btn-quick-track');

    const trackingResult = document.getElementById('tracking-result');
    const trackingTimeline = document.getElementById('tracking-timeline');

    // Navigation Logic
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.getAttribute('data-view');

            // Update Navigation UI
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Update View Title
            updateViewHeader(view);

            // Switch Sections
            sections.forEach(sec => {
                sec.classList.remove('active');
                if (sec.id === `view-${view}`) {
                    sec.classList.add('active');
                    // Trigger data fetch for specific views
                    if (view === 'orders') fetchOrders();
                }
            });
        });
    });

    function updateViewHeader(view) {
        switch (view) {
            case 'shipping-wizard':
                viewTitle.innerText = 'Start New Shipment';
                viewSubtitle.innerText = 'Complete the 4-step wizard to book your DSV courier.';
                break;
            case 'dashboard':
                viewTitle.innerText = 'Dashboard Overview';
                viewSubtitle.innerText = "Welcome back! Here's what's happening today.";
                break;
            case 'orders':
                viewTitle.innerText = 'Order Management';
                viewSubtitle.innerText = 'View and manage your active courier orders.';
                break;
            case 'shipments':
                viewTitle.innerText = 'Shipment Tracking';
                viewSubtitle.innerText = 'Monitor real-time status of your packages.';
                break;
            case 'quotes':
                viewTitle.innerText = 'Shipping Quotes';
                viewSubtitle.innerText = 'Compare rates across different service levels.';
                break;
            case 'customers':
                viewTitle.innerText = 'Customer Directory';
                viewSubtitle.innerText = 'Manage your address book and customer profiles.';
                break;
            case 'payments':
                viewTitle.innerText = 'Financial Overview';
                viewSubtitle.innerText = 'Track invoices, payments, and billing history.';
                break;
            case 'reports':
                viewTitle.innerText = 'Analytics & Reports';
                viewSubtitle.innerText = 'Deep dive into your logistical performance.';
                break;
            case 'users':
                viewTitle.innerText = 'User Management';
                viewSubtitle.innerText = 'Control access for local dashboard administrators.';
                break;
        }
    }

    // Modal/Form Toggles
    if (btnOpenBooking) {
        btnOpenBooking.addEventListener('click', () => {
            bookingFormContainer.classList.remove('hidden');
            bookingFormContainer.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (btnCloseBooking) {
        btnCloseBooking.addEventListener('click', () => {
            bookingFormContainer.classList.add('hidden');
        });
    }

    if (btnQuickCreateOrder) {
        btnQuickCreateOrder.addEventListener('click', () => {
            // Switch to orders view
            const ordersNavItem = document.querySelector('[data-view="orders"]');
            if (ordersNavItem) ordersNavItem.click();
            // Show form
            setTimeout(() => {
                bookingFormContainer.classList.remove('hidden');
                bookingFormContainer.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        });
    }

    // Chart.js Analytics
    const ctx = document.getElementById('volumeChart');
    if (ctx) {
        try {
            if (typeof Chart === 'undefined') {
                console.warn('Chart.js not loaded, skipping analytics');
                ctx.parentElement.innerHTML = '<div style="padding: 2rem; color: var(--text-muted); text-align: center;">Analytics unavailable (offline)</div>';
            } else {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [{
                            label: 'Packages Shipped',
                            data: [12, 19, 3, 5, 2, 3, 7],
                            borderColor: '#2563eb',
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { beginAtZero: true, grid: { opacity: 0.05 } },
                            x: { grid: { display: false } }
                        }
                    }
                });
            }
        } catch (chartErr) {
            console.error('Chart initialization failed:', chartErr);
        }
    }

    // Booking Logic
    if (bookingForm) {
        console.log('Booking form found and listener attached');
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            const formData = new FormData(bookingForm);
            const data = Object.fromEntries(formData.entries());

            showToast('Submitting shipment to DSV...', 'info');

            try {
                const response = await fetch('/api/bookings/simple', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ shipmentData: data })
                });

                const result = await response.json();

                if (result.success) {
                    showToast(`Success! Booking ID: ${result.bookingId}`, 'success');
                    bookingForm.reset();
                } else {
                    const errorMsg = result.error?.message || result.error || 'Failed to create booking';
                    showToast(`Error: ${errorMsg}`, 'error');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                showToast('Network error while creating booking', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    } else {
        console.error('Booking form NOT found in DOM');
    }

    // Price Estimation on Booking Form
    const btnGetBookingQuote = document.getElementById('btn-get-booking-quote');
    const bookingPriceDisplay = document.getElementById('booking-price-display');

    if (btnGetBookingQuote) {
        btnGetBookingQuote.addEventListener('click', async () => {
            const formData = new FormData(bookingForm);
            const bookingData = Object.fromEntries(formData.entries());

            // Map Booking Form fields to Quote API fields
            const quoteRequestData = {
                dsvAccount: bookingData.dsvAccount,
                pickupCountryCode: bookingData.origin_country,
                deliveryCountryCode: bookingData.dest_country,
                deliveryCity: bookingData.dest_city,
                deliveryZipCode: bookingData.dest_zip,
                packageType: "PARCELS", // Default for the simple form
                defaultWeight: bookingData.weight
            };

            const originalContent = btnGetBookingQuote.innerHTML;
            btnGetBookingQuote.disabled = true;
            btnGetBookingQuote.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            bookingPriceDisplay.innerText = 'Calculating...';

            try {
                const response = await fetch('/api/quotes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(quoteRequestData)
                });

                const result = await response.json();
                if (result.success && result.data.services && result.data.services.length > 0) {
                    // Find the best match for the selected service code, or use the first one
                    const selectedService = bookingData.serviceCode;
                    const matchedService = result.data.services.find(s =>
                        s.serviceName.toLowerCase().includes(selectedService.toLowerCase()) ||
                        selectedService.toLowerCase().includes(s.serviceType.toLowerCase())
                    ) || result.data.services[0];

                    bookingPriceDisplay.innerHTML = `${matchedService.totalPrice} ${matchedService.currencyCode}`;
                    showToast('Price estimated successfully', 'success');
                } else if (result.success && result.data.warnings) {
                    bookingPriceDisplay.innerText = 'No Rate';
                    showToast(`Warning: ${result.data.warnings[0].message}`, 'warning');
                } else {
                    bookingPriceDisplay.innerText = 'Err';
                    showToast('Could not calculate price', 'error');
                }
            } catch (err) {
                console.error('Quote calculation error:', err);
                bookingPriceDisplay.innerText = 'Error';
                showToast('Network error calculating price', 'error');
            } finally {
                btnGetBookingQuote.disabled = false;
                btnGetBookingQuote.innerHTML = originalContent;
            }
        });
    }

    // Quote Logic
    const quoteForm = document.getElementById('quote-form');
    const quoteResults = document.getElementById('quote-results');

    if (quoteForm) {
        quoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = quoteForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
            quoteResults.innerHTML = '<div class="loader"></div> Requesting rates from DSV...';

            const formData = new FormData(quoteForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/quotes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                if (result.success) {
                    renderQuoteResults(result.data);
                } else {
                    quoteResults.innerHTML = `<div style="color: var(--error); padding: 1rem;">${result.error?.message || 'Failed to fetch quotes'}</div>`;
                }
            } catch (err) {
                console.error('Quote fetch error:', err);
                quoteResults.innerHTML = '<div style="color: var(--error); padding: 1rem;">Network error fetching quotes</div>';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    function renderQuoteResults(data) {
        if (!data || (!data.services && !data.warnings)) {
            quoteResults.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">No services available for this route.</div>';
            return;
        }

        let html = '';

        if (data.warnings && data.warnings.length > 0) {
            html += `<div style="background: rgba(245, 158, 11, 0.1); color: var(--warning); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.85rem;">
                <i class="fas fa-exclamation-triangle"></i> ${data.warnings.map(w => w.message).join('<br>')}
            </div>`;
        }

        if (data.services && data.services.length > 0) {
            html += data.services.map(svc => `
                <div class="stat-card" style="margin-bottom: 1rem; border: 1px solid var(--border-color); box-shadow: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0;">${svc.serviceName}</h4>
                            <small style="color: var(--text-muted);">${svc.serviceType} • ETA: ${svc.estimatedArrival || 'N/A'}</small>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 800; color: var(--accent); font-size: 1.1rem;">${svc.totalPrice} ${svc.currencyCode}</div>
                            ${svc.vat ? `<small style="font-size: 0.7rem;">incl. VAT</small>` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        } else if (!data.warnings) {
            html = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">No services found for the requested route.</div>';
        }

        quoteResults.innerHTML = html;
    }

    // --- SHIPPING WIZARD LOGIC ---
    let currentStep = 1;
    const wizardForm1 = document.getElementById('wizard-form-1');
    const pricingResultContainer = document.getElementById('pricing-result-container');

    // Wizard Navigation
    function goToStep(step) {
        // Hide all steps
        document.querySelectorAll('.wizard-content').forEach(el => el.classList.add('hidden'));
        const targetStepEl = document.getElementById(`wizard-step-${step}`);
        if (targetStepEl) targetStepEl.classList.remove('hidden');

        // Update Progress Bar
        document.querySelectorAll('.wizard-step').forEach(el => {
            const elStep = parseInt(el.getAttribute('data-step'));
            el.classList.remove('active', 'completed');
            if (elStep === step) el.classList.add('active');
            if (elStep < step) el.classList.add('completed');
        });

        currentStep = step;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Step 2 Presets
    window.setBox = (l, w, h) => {
        document.getElementById('box-length').value = l;
        document.getElementById('box-width').value = w;
        document.getElementById('box-height').value = h;
        showToast(`Dimensions set: ${l}x${w}x${h}cm`, 'info');
    };

    // Step 1: Handle Change/Next
    const nextStep1 = document.getElementById('btn-next-step-1');
    if (nextStep1) {
        nextStep1.addEventListener('click', () => {
            const country = wizardForm1.targetCountry.value;
            if (!country) return showToast('Please select a country', 'error');
            goToStep(2);
        });
    }

    // Auto-Pricing on Step 1
    if (wizardForm1) {
        wizardForm1.addEventListener('change', async () => {
            const country = wizardForm1.targetCountry.value;
            if (!country) return;

            pricingResultContainer.innerHTML = '<div class="loader"></div> Calculating...';

            try {
                const response = await fetch('/api/quotes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        dsvAccount: 8004990000,
                        pickupCountryCode: wizardForm1.direction.value === 'export' ? 'CH' : country,
                        deliveryCountryCode: wizardForm1.direction.value === 'export' ? country : 'CH',
                        packageType: "PARCELS",
                        defaultWeight: wizardForm1.weight.value
                    })
                });

                const result = await response.json();
                if (result.success && result.data.services?.length > 0) {
                    const svc = result.data.services[0]; // Take premium/first
                    const b = svc.breakdown;

                    pricingResultContainer.innerHTML = `
                        <table class="pricing-table">
                            <tr><td class="label">Base Price</td><td class="value">CHF ${b.basePrice}</td></tr>
                            <tr><td class="label">Fuel+Pickup Surcharge</td><td class="value">CHF ${b.fuelSurcharge}</td></tr>
                            <tr><td class="label">Commission</td><td class="value">CHF ${b.commission}</td></tr>
                            <tr><td class="label">Home Delivery Charge</td><td class="value">CHF ${b.homeDeliveryCharge}</td></tr>
                            <tr><td class="label">Total Price</td><td class="value">CHF ${b.totalPrice}</td></tr>
                        </table>
                    `;
                } else {
                    pricingResultContainer.innerHTML = '<p style="color: var(--error); text-align: center; padding: 2rem;">No rate found for this route.</p>';
                }
            } catch (err) {
                pricingResultContainer.innerHTML = '<p style="color: var(--error); text-align: center; padding: 2rem;">Error calculating price.</p>';
            }
        });
    }

    // Step 2: Dimensions
    document.getElementById('btn-next-step-2')?.addEventListener('click', () => {
        // Carry data to step 3/4
        document.getElementById('wizard-dest-company').value = "Test Co"; // Placeholder
        goToStep(3);
    });
    document.getElementById('btn-prev-step-2')?.addEventListener('click', () => goToStep(1));

    // Step 3: Address
    document.getElementById('btn-next-step-3')?.addEventListener('click', () => {
        const pricingHtml = pricingResultContainer.innerHTML;
        document.getElementById('final-pricing-summary').innerHTML = pricingHtml;
        goToStep(4);
    });
    document.getElementById('btn-prev-step-3')?.addEventListener('click', () => goToStep(2));

    // Step 4: Final Book
    document.getElementById('btn-final-book')?.addEventListener('click', async () => {
        const btn = document.getElementById('btn-final-book');
        const originalContent = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Booking...';

        showToast('Finalizing DSV Booking...', 'info');

        try {
            // Collect all data
            const bookingData = {
                shipmentData: {
                    pickup: {
                        companyName: document.getElementById('wizard-pickup-company').value,
                        address: document.getElementById('wizard-pickup-address').value,
                        city: document.getElementById('wizard-pickup-city').value,
                        zipCode: document.getElementById('wizard-pickup-zip').value,
                        countryCode: wizardForm1.direction.value === 'export' ? 'CH' : wizardForm1.targetCountry.value
                    },
                    delivery: {
                        companyName: document.getElementById('wizard-dest-company').value,
                        address: document.getElementById('wizard-dest-address').value,
                        city: document.getElementById('wizard-dest-city').value,
                        zipCode: document.getElementById('wizard-dest-zip').value,
                        countryCode: wizardForm1.direction.value === 'export' ? wizardForm1.targetCountry.value : 'CH',
                        contactName: document.getElementById('wizard-dest-contact').value,
                        contactPhone: document.getElementById('wizard-dest-phone').value,
                        contactEmail: document.getElementById('wizard-dest-email').value
                    },
                    weight: wizardForm1.weight.value,
                    dimensions: {
                        length: document.getElementById('box-length').value,
                        width: document.getElementById('box-width').value,
                        height: document.getElementById('box-height').value
                    }
                }
            };

            const response = await fetch('/api/bookings/simple', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });

            const result = await response.json();
            if (result.success) {
                showToast(`Success! Booking ID: ${result.bookingId}`, 'success');
                // Redirect to orders or reset wizard
                setTimeout(() => {
                    const ordersNavItem = document.querySelector('[data-view="orders"]');
                    if (ordersNavItem) ordersNavItem.click();
                    goToStep(1);
                }, 2000);
            } else {
                showToast(`Booking failed: ${result.error || 'Unknown error'}`, 'error');
            }
        } catch (err) {
            showToast('Network error during booking', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalContent;
        }
    });
    document.getElementById('btn-prev-step-4')?.addEventListener('click', () => goToStep(3));


    // Unified Tracking Logic
    async function handleTracking(shipmentId) {
        if (!shipmentId) return showToast('Please enter a tracking ID', 'error');
        shipmentId = shipmentId.trim();

        console.log(`[Dashboard] Tracking shipment: ${shipmentId} (v1.3)`);

        // Switch to shipments view if not already there
        const shipmentsNavItem = document.querySelector('[data-view="shipments"]');
        if (shipmentsNavItem && !shipmentsNavItem.classList.contains('active')) {
            shipmentsNavItem.click();
        }

        const container = document.getElementById('tracking-result');
        const timeline = document.getElementById('tracking-timeline');

        container.classList.remove('hidden');
        timeline.innerHTML = '<div class="loader"></div> Loading tracking data from DSV...';

        try {
            // 1. Determine which endpoint to use based on the ID format
            let detailsUrl = `/api/tracking/shipments/${shipmentId}`;
            let eventsUrl = `/api/tracking/shipments/${shipmentId}/events`;

            // Simple heuristic for AWB or Carrier IDs
            if (shipmentId.length > 15 && /^\d+$/.test(shipmentId)) {
                // Likely AWB
                eventsUrl = `/api/tracking/awb/${shipmentId}/events`;
            } else if (shipmentId.startsWith('DSV-')) {
                // Internal reference
                eventsUrl = `/api/tracking/shipments/${shipmentId}/events`;
            } else if (shipmentId.length === 12 && /^\d+$/.test(shipmentId)) {
                // Likely Carrier Tracking Number (e.g., 921541696551)
                eventsUrl = `/api/tracking/carrier/${shipmentId}/events`;
            }

            // 2. Fetch both Details and Events
            const [detailsRes, eventsRes] = await Promise.all([
                fetch(detailsUrl).then(r => r.json()).catch(() => ({ success: false })),
                fetch(eventsUrl).then(r => r.json()).catch(() => ({ success: false }))
            ]);

            if (eventsRes.success && eventsRes.data.events && eventsRes.data.events.length > 0) {
                renderTrackingData({ events: eventsRes.data.events });
            } else {
                const errorMsg = eventsRes.error?.errors?.[0]?.message || 'No events recorded yet for this shipment.';
                timeline.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 1rem;">${errorMsg}</div>`;
                if (!eventsRes.success) showToast('Tracking information unavailable', 'warning');
            }
        } catch (err) {
            console.error('Tracking fetch error:', err);
            timeline.innerHTML = '<div style="color: var(--error);">Error fetching tracking data.</div>';
            showToast('Error fetching tracking data', 'error');
        }
    }

    if (btnTrack) {
        btnTrack.addEventListener('click', () => handleTracking(trackingInput.value));
    }

    if (btnQuickTrack) {
        btnQuickTrack.addEventListener('click', () => handleTracking(quickTrackInput.value));
    }

    function renderTrackingData(data) {
        const events = data.events || [];
        const timeline = document.getElementById('tracking-timeline');

        timeline.innerHTML = events.map((ev, index) => `
            <div class="timeline-event" style="opacity: ${1 - (index * 0.1)};">
                <div class="timeline-dot" style="background: ${index === 0 ? 'var(--accent)' : 'var(--border-color)'};"></div>
                <div style="font-weight: 700; font-size: 1rem;">${ev.eventDescription || ev.eventCode}</div>
                <div style="color: var(--text-muted); font-size: 0.875rem;">${new Date(ev.eventDate).toLocaleString()}</div>
                <div style="margin-top: 0.25rem;">${ev.location || 'DSV Tracking Node'}</div>
            </div>
        `).join('');
    }

    // Orders Logic
    async function fetchOrders() {
        const ordersTableBody = document.querySelector('#view-orders tbody');
        if (!ordersTableBody) return;

        ordersTableBody.innerHTML = '<tr><td colspan="6" style="padding: 2rem; text-align: center;"><div class="loader"></div> Loading real order data...</td></tr>';

        try {
            const response = await fetch('/api/orders');
            const result = await response.json();

            if (result.success && result.data.length > 0) {
                renderOrders(result.data);
            } else if (result.success) {
                ordersTableBody.innerHTML = '<tr><td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-muted);">No active orders found.</td></tr>';
            } else {
                ordersTableBody.innerHTML = `<tr><td colspan="6" style="padding: 2rem; text-align: center; color: var(--error);">Error: ${result.error || 'Failed to fetch orders'}</td></tr>`;
            }
        } catch (err) {
            console.error('Fetch orders error:', err);
            ordersTableBody.innerHTML = '<tr><td colspan="6" style="padding: 2rem; text-align: center; color: var(--error);">Network error fetching orders.</td></tr>';
        }
    }

    function renderOrders(orders) {
        const ordersTableBody = document.querySelector('#view-orders tbody');
        ordersTableBody.innerHTML = orders.map(order => `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 1rem; font-weight: 600;">#${order.shipmentId}</td>
                <td style="padding: 1rem;">${order.receiver.companyName}</td>
                <td style="padding: 1rem;">${new Date(order.pickup.collectDateFrom).toLocaleDateString()}</td>
                <td style="padding: 1rem;">
                    <span style="padding: 0.25rem 0.75rem; border-radius: 20px; background: rgba(16, 185, 129, 0.1); color: var(--success); font-size: 0.75rem;">
                        ${order.serviceOptions.serviceCode}
                    </span>
                </td>
                <td style="padding: 1rem;">${order.packages[0].grossWeight} ${order.weightUnit}</td>
                <td style="padding: 1rem;">
                    <i class="fas fa-search" style="cursor:pointer; color: var(--accent); margin-right: 0.5rem;" onclick="handleTracking('${order.shipmentId}')"></i>
                    <i class="fas fa-ellipsis-h" style="cursor:pointer; color: var(--text-muted);"></i>
                </td>
            </tr>
        `).join('');
    }

    // Expose handleTracking to window for onclick in rendered rows
    window.handleTracking = handleTracking;

    // Toast Function
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const icon = document.getElementById('toast-icon');
        const msg = document.getElementById('toast-message');

        toast.className = `toast show ${type}`;
        msg.innerText = message;

        icon.className = type === 'success' ? 'fas fa-check-circle' :
            type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-info-circle';

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Load initial orders if we land on orders view
    const initialView = document.querySelector('.nav-item.active')?.getAttribute('data-view');
    if (initialView === 'orders') fetchOrders();
});
