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
                }
            });
        });
    });

    function updateViewHeader(view) {
        switch (view) {
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
});
