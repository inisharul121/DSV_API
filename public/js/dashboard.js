document.addEventListener('DOMContentLoaded', () => {
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

    // Chart.js Mock Data
    const ctx = document.getElementById('volumeChart');
    if (ctx) {
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

    // Booking Logic
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showToast('Processing booking...', 'info');

            // Mocking a delay to show premium feel
            setTimeout(() => {
                showToast('Draft booking created successfully #102934', 'success');
            }, 1500);
        });
    }

    // Tracking Logic
    if (btnTrack) {
        btnTrack.addEventListener('click', async () => {
            const id = trackingInput.value;
            if (!id) return showToast('Please enter a tracking ID', 'error');

            trackingResult.classList.remove('hidden');
            trackingTimeline.innerHTML = '<div class="loader"></div> Loading tracking data...';

            try {
                // In a real scenario, we would fetch from /api/shipments/${id}/tracking
                setTimeout(() => {
                    renderTrackingMock();
                }, 1000);
            } catch (err) {
                showToast('Could not find shipment', 'error');
            }
        });
    }

    function renderTrackingMock() {
        const events = [
            { time: 'Today, 10:45 AM', status: 'In Transit', desc: 'Arrived at Sorting Facility - Krefeld, DE' },
            { time: 'Yesterday, 02:20 PM', status: 'Picked Up', desc: 'Package collected from sender - Hedehusene, DK' },
            { time: '3 Days Ago', status: 'Label Created', desc: 'Shipment data confirmed by DSV XPress' }
        ];

        trackingTimeline.innerHTML = events.map(ev => `
            <div class="timeline-event">
                <div class="timeline-dot"></div>
                <div style="font-weight: 700; font-size: 1rem;">${ev.status}</div>
                <div style="color: var(--text-muted); font-size: 0.875rem;">${ev.time}</div>
                <div style="margin-top: 0.25rem;">${ev.desc}</div>
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
