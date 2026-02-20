document.addEventListener('DOMContentLoaded', () => {
    console.log('--- DSV Dashboard Loaded v1.2 ---');

    // UI Elements
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');
    const viewTitle = document.getElementById('view-title');
    const viewSubtitle = document.getElementById('view-subtitle');
    const bookingForm = document.getElementById('booking-form');
    const trackingInput = document.getElementById('tracking-input');
    const btnTrack = document.getElementById('btn-track');
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
            case 'bookings':
                viewTitle.innerText = 'Shipment Booking';
                viewSubtitle.innerText = 'Create and manage your DSV shipments efficiently.';
                break;
            case 'tracking':
                viewTitle.innerText = 'Real-time Tracking';
                viewSubtitle.innerText = 'Get visibility into your shipment movement.';
                break;
            case 'documents':
                viewTitle.innerText = 'Document Management';
                viewSubtitle.innerText = 'Securely upload and manage customs documentation.';
                break;
        }
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

    // Tracking Logic
    if (btnTrack) {
        btnTrack.addEventListener('click', async () => {
            const id = trackingInput.value;
            if (!id) return showToast('Please enter a tracking ID', 'error');

            trackingResult.classList.remove('hidden');
            trackingTimeline.innerHTML = '<div class="loader"></div> Loading tracking data...';

            try {
                const response = await fetch(`/api/shipments/${id}/tracking`);
                const result = await response.json();

                if (result.success && result.data) {
                    renderTrackingData(result.data);
                } else {
                    trackingTimeline.innerHTML = '<div style="color: var(--error);">No tracking information found for this ID.</div>';
                    showToast('Shipment not found', 'error');
                }
            } catch (err) {
                console.error('Tracking fetch error:', err);
                trackingTimeline.innerHTML = '<div style="color: var(--error);">Error fetching tracking data.</div>';
                showToast('Error fetching tracking data', 'error');
            }
        });
    }

    function renderTrackingData(data) {
        // DSV tracking data usually has an events array or similar
        const events = data.events || [];

        if (events.length === 0) {
            trackingTimeline.innerHTML = '<div style="color: var(--text-muted);">No events recorded yet for this shipment.</div>';
            return;
        }

        trackingTimeline.innerHTML = events.map(ev => `
            <div class="timeline-event">
                <div class="timeline-dot"></div>
                <div style="font-weight: 700; font-size: 1rem;">${ev.status || 'Status Updated'}</div>
                <div style="color: var(--text-muted); font-size: 0.875rem;">${new Date(ev.date).toLocaleString()}</div>
                <div style="margin-top: 0.25rem;">${ev.description || ev.location || ''}</div>
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
