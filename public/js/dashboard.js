document.addEventListener('DOMContentLoaded', () => {
    console.log('--- DSV Dashboard Loaded v1.2 ---');
    // Translations
    const translations = {
        en: {
            nav_dashboard: "Dashboard",
            nav_new_booking: "New Booking",
            nav_tracking: "Shipment Tracking",
            nav_documents: "Documents",
            stat_active: "Active Shipments",
            stat_delivered: "Delivered This Month",
            stat_pending: "Pending Clearances",
            stat_exceptions: "Exceptions",
            dashboard_analytics: "Volume Analytics",
            dashboard_status_check: "Quick Status Check",
            placeholder_track: "Enter Tracking #...",
            btn_track: "Track",
            booking_title: "Create New Draft Booking",
            booking_desc: "Fill in the shipment details below to generate a DSV booking label.",
            label_dsv_account: "DSV Account Number",
            label_service_code: "Service Code",
            label_origin_country: "Origin Country (ISO)",
            label_commodity: "Commodity",
            header_receiver: "Receiver Information",
            label_company_name: "Company Name",
            label_address: "Address",
            label_city: "City",
            label_zip_code: "Zip Code (5 digits for DE)",
            label_dest_country: "Country (ISO)",
            label_weight: "Weight (KG)",
            btn_create_booking: "Create Real Booking",
            tracking_title: "Track Your Shipment",
            placeholder_track_main: "Search by ID or Tracking #",
            btn_track_main: "Track",
            docs_title: "Document Repository",
            docs_desc: "Drag and drop customs documents here to attach them to your drafts.",
            btn_browse: "Browse Files",
            toast_processing: "Submitting shipment to DSV...",
            toast_success: "Success! Booking ID: ",
            toast_error: "Error: ",
            toast_network_error: "Network error while creating booking",
            toast_track_id: "Please enter a tracking ID",
            toast_not_found: "Shipment not found",
            toast_fetch_error: "Error fetching tracking data",
            tracking_loading: "Loading tracking data...",
            tracking_none: "No events recorded yet for this shipment.",
            tracking_not_found: "No tracking information found for this ID.",
            status_updated: "Status Updated",
            header_dashboard_title: "Dashboard Overview",
            header_dashboard_sub: "Welcome back! Here's what's happening today.",
            header_bookings_title: "Shipment Booking",
            header_bookings_sub: "Create and manage your DSV shipments efficiently.",
            header_tracking_title: "Real-time Tracking",
            header_tracking_sub: "Get visibility into your shipment movement.",
            header_documents_title: "Document Management",
            header_documents_sub: "Securely upload and manage customs documentation.",
            sidebar_footer: "v1.2.0 • API Operational",
            btn_quick_booking: "+ Quick Booking"
        },
        bn: {
            nav_dashboard: "ড্যাশবোর্ড",
            nav_new_booking: "নতুন বুকিং",
            nav_tracking: "শিপমেন্ট ট্র্যাকিং",
            nav_documents: "নথিপত্র",
            stat_active: "সক্রিয় শিপমেন্ট",
            stat_delivered: "এই মাসে ডেলিভারি হয়েছে",
            stat_pending: "পেন্ডিং ক্লিয়ারেন্স",
            stat_exceptions: "ব্যতিক্রম",
            dashboard_analytics: "ভলিউম অ্যানালিটিক্স",
            dashboard_status_check: "দ্রুত স্ট্যাটাস চেক",
            placeholder_track: "ট্র্যাকিং নম্বর লিখুন...",
            btn_track: "ট্র্যাক করুন",
            booking_title: "নতুন ড্রাফট বুকিং তৈরি করুন",
            booking_desc: "DSV বুকিং লেবেল তৈরি করতে নিচের শিপমেন্টের বিবরণ লিখুন।",
            label_dsv_account: "DSV অ্যাকাউন্ট নম্বর",
            label_service_code: "সার্ভিস কোড",
            label_origin_country: "উৎপত্তিস্থল দেশ (ISO)",
            label_commodity: "পণ্য (Commodity)",
            header_receiver: "প্রাপকের তথ্য",
            label_company_name: "প্রতিষ্ঠানের নাম",
            label_address: "ঠিকানা",
            label_city: "শহর",
            label_zip_code: "জিপ কোড (জার্মানির জন্য ৫ সংখ্যা)",
            label_dest_country: "গন্তব্য দেশ (ISO)",
            label_weight: "ওজন (কেজি)",
            btn_create_booking: "বুকিং তৈরি করুন",
            tracking_title: "আপনার শিপমেন্ট ট্র্যাক করুন",
            placeholder_track_main: "ID বা ট্র্যাকিং নম্বর দিয়ে সার্চ করুন",
            btn_track_main: "ট্র্যাক করুন",
            docs_title: "ডকুমেন্ট রিপোজিটরি",
            docs_desc: "আপনার ড্রাফটে যুক্ত করতে শুল্ক নথিপত্র এখানে ড্র্যাগ এবং ড্রপ করুন।",
            btn_browse: "ফাইল খুঁজুন",
            toast_processing: "DSV-তে শিপমেন্ট জমা দেওয়া হচ্ছে...",
            toast_success: "সফল! বুকিং আইডি: ",
            toast_error: "ত্রুটি: ",
            toast_network_error: "বুকিং তৈরির সময় নেটওয়ার্ক ত্রুটি হয়েছে",
            toast_track_id: "দয়া করে একটি ট্র্যাকিং আইডি লিখুন",
            toast_not_found: "শিপমেন্ট পাওয়া যায়নি",
            toast_fetch_error: "ট্র্যাকিং তথ্য আনতে ত্রুটি হয়েছে",
            tracking_loading: "ট্র্যাকিং তথ্য লোড হচ্ছে...",
            tracking_none: "এই শিপমেন্টের জন্য এখনও কোনো ইভেন্ট রেকর্ড করা হয়নি।",
            tracking_not_found: "এই আইডির জন্য কোনো ট্র্যাকিং তথ্য পাওয়া যায়নি।",
            status_updated: "স্ট্যাটাস আপডেট করা হয়েছে",
            header_dashboard_title: "ড্যাশবোর্ড ওভারভিউ",
            header_dashboard_sub: "আবার স্বাগতম! আজ কী কী ঘটছে দেখুন।",
            header_bookings_title: "শিপমেন্ট বুকিং",
            header_bookings_sub: "দক্ষতার সাথে আপনার DSV শিপমেন্ট তৈরি এবং পরিচালনা করুন।",
            header_tracking_title: "রিয়েল-টাইম ট্র্যাকিং",
            header_tracking_sub: "আপনার শিপমেন্টের গতিবিধির ওপর নজর রাখুন।",
            header_documents_title: "ডকুমেন্ট ম্যানেজমেন্ট",
            header_documents_sub: "নিরাপদে শুল্ক নথিপত্র আপলোড এবং পরিচালনা করুন।",
            sidebar_footer: "v1.2.0 • API সচল আছে",
            btn_quick_booking: "+ দ্রুত বুকিং"
        }
    };

    function updateLanguage(lang) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                el.innerText = translations[lang][key];
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[lang][key]) {
                el.placeholder = translations[lang][key];
            }
        });

        // Update dynamic headers if necessary
        const activeNav = document.querySelector('.nav-item.active');
        if (activeNav) {
            updateViewHeader(activeNav.getAttribute('data-view'));
        }
    }

    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            updateLanguage(e.target.value);
        });
    }

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
        const lang = languageSelect.value || 'en';
        const titleKey = `header_${view}_title`;
        const subKey = `header_${view}_sub`;

        if (translations[lang][titleKey]) {
            viewTitle.innerText = translations[lang][titleKey];
            viewSubtitle.innerText = translations[lang][subKey];
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

            const lang = languageSelect.value || 'en';
            showToast(translations[lang].toast_processing, 'info');

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
                    showToast(`${translations[lang].toast_success}${result.bookingId}`, 'success');
                    bookingForm.reset();
                } else {
                    const errorMsg = result.error?.message || result.error || 'Failed to create booking';
                    showToast(`${translations[lang].toast_error}${errorMsg}`, 'error');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                showToast(translations[lang].toast_network_error, 'error');
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
            const lang = languageSelect.value || 'en';
            if (!id) return showToast(translations[lang].toast_track_id, 'error');

            trackingResult.classList.remove('hidden');
            trackingTimeline.innerHTML = `<div class="loader"></div> ${translations[lang].tracking_loading}`;

            try {
                const response = await fetch(`/api/shipments/${id}/tracking`);
                const result = await response.json();

                if (result.success && result.data) {
                    renderTrackingData(result.data);
                } else {
                    trackingTimeline.innerHTML = `<div style="color: var(--error);">${translations[lang].tracking_not_found}</div>`;
                    showToast(translations[lang].toast_not_found, 'error');
                }
            } catch (err) {
                console.error('Tracking fetch error:', err);
                trackingTimeline.innerHTML = `<div style="color: var(--error);">${translations[lang].toast_fetch_error}</div>`;
                showToast(translations[lang].toast_fetch_error, 'error');
            }
        });
    }

    function renderTrackingData(data) {
        const lang = languageSelect.value || 'en';
        // DSV tracking data usually has an events array or similar
        const events = data.events || [];

        if (events.length === 0) {
            trackingTimeline.innerHTML = `<div style="color: var(--text-muted);">${translations[lang].tracking_none}</div>`;
            return;
        }

        trackingTimeline.innerHTML = events.map(ev => `
            <div class="timeline-event">
                <div class="timeline-dot"></div>
                <div style="font-weight: 700; font-size: 1rem;">${ev.status || translations[lang].status_updated}</div>
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
