/* ==========================================================================
   FeedbackFlow Core Application Logic (Single Page Application Model)
   ========================================================================== */

(function () {
  // Global State
  const state = {
    feedback: [],
    stats: null,
    activeView: 'home',
    selectedRating: 0,
    pollingInterval: null
  };

  // API Endpoints
  const API = {
    feedback: '/api/feedback',
    stats: '/api/stats'
  };

  // DOM Elements cache
  const DOM = {
    // Navigation & Status
    navLinks: document.querySelectorAll('.nav-link'),
    views: document.querySelectorAll('.view-section'),
    serverStatusDot: document.getElementById('server-status-dot'),
    serverStatusText: document.getElementById('server-status-text'),
    menuToggle: document.getElementById('menu-toggle'),
    navLinksContainer: document.getElementById('nav-links'),

    // Home Section
    heroBtnSubmit: document.getElementById('hero-btn-submit'),
    heroBtnExplore: document.getElementById('hero-btn-explore'),

    // Dashboard Section
    refreshBtn: document.getElementById('btn-refresh-dashboard'),
    feedbackContainer: document.getElementById('feedback-list-container'),
    searchField: document.getElementById('feedback-search'),
    filterPills: document.querySelectorAll('.filter-pill'),
    emptyState: document.getElementById('empty-state'),
    
    // Stats elements
    statTotal: document.querySelector('#card-total-feedback .stat-value'),
    statToday: document.querySelector('#card-today-feedback .stat-value'),
    statPending: document.querySelector('#card-pending-feedback .stat-value'),
    statAvgRatingVal: document.getElementById('avg-rating-val'),
    statAvgRatingStars: document.getElementById('avg-rating-stars'),
    
    // Sidebar elements
    categoryBarsList: document.getElementById('category-bars-list'),
    activityFeedList: document.getElementById('activity-feed-list'),
    telemetryUptime: document.getElementById('telemetry-uptime'),
    telemetryCpu: document.getElementById('telemetry-cpu'),
    telemetryMemory: document.getElementById('telemetry-memory'),

    // Form Section
    feedbackForm: document.getElementById('feedback-form'),
    formName: document.getElementById('form-name'),
    formEmail: document.getElementById('form-email'),
    formCompany: document.getElementById('form-company'),
    formCategory: document.getElementById('form-category'),
    formMessage: document.getElementById('form-message'),
    formRatingInput: document.getElementById('form-rating'),
    starBtns: document.querySelectorAll('.star-btn'),
    charCounter: document.getElementById('message-char-count'),
    formProgress: document.getElementById('form-progress'),
    btnResetForm: document.getElementById('btn-reset-form'),
    btnSubmitFeedback: document.getElementById('btn-submit-feedback'),

    // Success Modal
    modalBackdrop: document.getElementById('success-modal-backdrop'),
    modalCloseBtn: document.getElementById('btn-modal-close'),
    confettiCanvas: document.getElementById('confetti-canvas'),

    // Developer Console Section
    consoleMethod: document.getElementById('console-method'),
    consoleEndpoint: document.getElementById('console-endpoint'),
    consoleBodyWrapper: document.getElementById('console-body-wrapper'),
    consoleBody: document.getElementById('console-body'),
    btnExecuteRequest: document.getElementById('btn-execute-request'),
    btnClearConsole: document.getElementById('btn-clear-console'),
    respStatusBadge: document.getElementById('resp-status'),
    respTimeBadge: document.getElementById('resp-time'),
    respSizeBadge: document.getElementById('resp-size'),
    respViewer: document.getElementById('resp-body-viewer'),
    bodyJsonError: document.getElementById('body-json-error'),

    // Developer Mode Slide Drawer
    devDrawer: document.getElementById('dev-drawer'),
    devDrawerToggle: document.getElementById('dev-drawer-toggle'),
    devDrawerClose: document.getElementById('dev-drawer-close'),
    telemetryTotalReqs: document.getElementById('telemetry-total-requests'),
    telemetryGetCount: document.getElementById('telemetry-get-count'),
    telemetryPostCount: document.getElementById('telemetry-post-count'),
    devLastReqEmpty: document.getElementById('dev-last-req-empty'),
    devLastReqData: document.getElementById('dev-last-req-data'),
    devLastMethod: document.getElementById('dev-last-method'),
    devLastPath: document.getElementById('dev-last-path'),
    devLastStatus: document.getElementById('dev-last-status'),
    devLastDuration: document.getElementById('dev-last-duration'),
    devLastSize: document.getElementById('dev-last-size'),
    devLastTime: document.getElementById('dev-last-time'),
    devLastJsonViewer: document.getElementById('dev-last-json-viewer'),
    btnCopyTelemetryJson: document.getElementById('btn-copy-telemetry-json')
  };

  /* --------------------------------------------------------------------------
     1. SPA Routing & View Management
     -------------------------------------------------------------------------- */
  function handleRoute() {
    const hash = window.location.hash || '#home';
    let targetView = hash.substring(1);

    // Map targets to view IDs
    const validViews = ['home', 'dashboard', 'submit', 'console'];
    if (!validViews.includes(targetView)) {
      targetView = 'home';
    }

    state.activeView = targetView;
    DOM.navLinksContainer.classList.remove('open'); // Close mobile menu

    // Toggle Nav Link Active class
    DOM.navLinks.forEach(link => {
      if (link.getAttribute('href') === `#${targetView}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Toggle Section visibility with transitions
    DOM.views.forEach(view => {
      const viewId = view.getAttribute('id');
      if (viewId === `${targetView}-view`) {
        view.classList.add('active');
        view.classList.add('fade-in');
      } else {
        view.classList.remove('active');
        view.classList.remove('fade-in');
      }
    });

    // View specific startup routines
    if (targetView === 'dashboard') {
      fetchFeedback(true); // reload dashboard with animation triggers
    }
  }

  // Hook up navigation clicks
  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('load', handleRoute);

  // Mobile menu toggle
  DOM.menuToggle.addEventListener('click', () => {
    const expanded = DOM.menuToggle.getAttribute('aria-expanded') === 'true' || false;
    DOM.menuToggle.setAttribute('aria-expanded', !expanded);
    DOM.navLinksContainer.classList.toggle('open');
  });

  /* --------------------------------------------------------------------------
     2. AJAX API Integrations
     -------------------------------------------------------------------------- */
  async function fetchFeedback(triggerCounterAnims = false) {
    // Show loading skeleton inside container
    if (triggerCounterAnims) {
      showListLoader();
    }

    try {
      const response = await fetch(API.feedback);
      if (!response.ok) throw new Error('API server unreachable');
      const data = await response.json();
      
      state.feedback = data.feedback || [];
      renderFeedbackList(state.feedback);
      
      // Update local telemetry stats as well, but wait for polling stats update for sidebar
      if (triggerCounterAnims) {
        fetchStatsTelemetry(true);
      }
    } catch (err) {
      console.error("Error fetching feedback list:", err);
      DOM.feedbackContainer.innerHTML = `
        <div class="empty-state text-center" style="border-color: #fca5a5; background: #fff5f5;">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 12px; color: #dc2626;"></i>
          <h3 class="empty-title">Failed to load feedback</h3>
          <p class="empty-subtitle">The API server returned an error. Please verify the backend service is running.</p>
          <button class="btn btn-secondary btn-sm" onclick="location.reload()"><i class="fa-solid fa-rotate-right"></i> Try Again</button>
        </div>
      `;
    }
  }

  async function fetchStatsTelemetry(animateCounters = false) {
    try {
      const response = await fetch(API.stats);
      if (!response.ok) throw new Error('Stats api error');
      const data = await response.json();
      
      if (data.success) {
        state.stats = data.stats;
        updateStatsDashboard(data.stats, animateCounters);
        updateDeveloperDrawer(data.stats);
        updateServerStatus(true);
      }
    } catch (err) {
      console.error("Stats telemetry sync failed:", err);
      updateServerStatus(false);
    }
  }

  function updateServerStatus(online) {
    if (online) {
      DOM.serverStatusDot.className = 'status-indicator active';
      DOM.serverStatusText.textContent = 'Server: Connected';
    } else {
      DOM.serverStatusDot.className = 'status-indicator';
      DOM.serverStatusDot.style.backgroundColor = 'var(--accent-red)';
      DOM.serverStatusDot.style.boxShadow = '0 0 8px var(--accent-red)';
      DOM.serverStatusText.textContent = 'Server: Offline';
    }
  }

  // Stat Counter Animation Utility
  function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.innerHTML = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  function updateStatsDashboard(stats, animate = false) {
    const summary = stats.feedbackSummary;
    const telemetry = stats.serverTelemetry;

    // 1. Update Card Metrics
    if (animate) {
      animateValue(DOM.statTotal, 0, summary.total, 800);
      animateValue(DOM.statToday, 0, summary.today, 800);
      animateValue(DOM.statPending, 0, summary.pending, 800);
    } else {
      DOM.statTotal.textContent = summary.total;
      DOM.statToday.textContent = summary.today;
      DOM.statPending.textContent = summary.pending;
    }

    // Average rating decimal update
    DOM.statAvgRatingVal.textContent = summary.averageRating.toFixed(1);
    
    // Render stars representation
    DOM.statAvgRatingStars.innerHTML = getStarIconsHTML(summary.averageRating);

    // 2. Sidebar popular categories progress indicators
    DOM.categoryBarsList.innerHTML = '';
    const maxVal = Math.max(...Object.values(summary.categories), 1);
    
    for (const [category, count] of Object.entries(summary.categories)) {
      const percentage = summary.total > 0 ? (count / summary.total) * 100 : 0;
      const barItem = document.createElement('div');
      barItem.className = 'category-bar-item';
      barItem.innerHTML = `
        <div class="category-bar-label-row">
          <span class="category-bar-label">${category}</span>
          <span class="category-bar-count">${count} (${Math.round(percentage)}%)</span>
        </div>
        <div class="category-track">
          <div class="category-fill" style="width: 0%"></div>
        </div>
      `;
      DOM.categoryBarsList.appendChild(barItem);
      
      // Delay style assignments slightly to enable clean CSS transition layout sweeps
      setTimeout(() => {
        const fill = barItem.querySelector('.category-fill');
        if (fill) fill.style.width = `${percentage}%`;
      }, 50);
    }

    // 3. Sidebar Live Telemetry Widgets
    DOM.telemetryUptime.textContent = formatUptime(telemetry.uptimeSeconds);
    DOM.telemetryCpu.textContent = `${telemetry.cpuLoad}%`;
    DOM.telemetryMemory.textContent = `${telemetry.memoryUsage} MB`;
  }

  function formatUptime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes < 60) return `${minutes}m ${secs}s`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  function getStarIconsHTML(rating) {
    let starsHTML = '';
    const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        starsHTML += '<i class="fa-solid fa-star"></i>';
      } else if (i - 0.5 === roundedRating) {
        starsHTML += '<i class="fa-solid fa-star-half-stroke"></i>';
      } else {
        starsHTML += '<i class="fa-regular fa-star"></i>';
      }
    }
    return starsHTML;
  }

  /* --------------------------------------------------------------------------
     3. Search, Filter, and Feedback List Layout Render
     -------------------------------------------------------------------------- */
  function showListLoader() {
    DOM.feedbackContainer.innerHTML = `
      <div class="feedback-skeleton-loader">
        <div class="skeleton-card-large">
          <div class="skeleton-card-header">
            <div class="skeleton circle"></div>
            <div class="skeleton block" style="width: 150px; height: 16px;"></div>
          </div>
          <div class="skeleton block" style="width: 100%; height: 60px; margin-top: 16px;"></div>
        </div>
        <div class="skeleton-card-large" style="margin-top: 16px;">
          <div class="skeleton-card-header">
            <div class="skeleton circle"></div>
            <div class="skeleton block" style="width: 120px; height: 16px;"></div>
          </div>
          <div class="skeleton block" style="width: 100%; height: 40px; margin-top: 16px;"></div>
        </div>
      </div>
    `;
    DOM.emptyState.classList.add('hidden');
  }

  function renderFeedbackList(list) {
    DOM.feedbackContainer.innerHTML = '';

    const filterTerm = getActiveCategoryFilter();
    const searchTerm = DOM.searchField.value.trim().toLowerCase();

    // Filter feedback local array
    const filteredList = list.filter(item => {
      // 1. Category check
      const matchesCategory = (filterTerm === 'All' || item.category === filterTerm);
      
      // 2. Search check
      const nameMatch = item.name.toLowerCase().includes(searchTerm);
      const emailMatch = item.email.toLowerCase().includes(searchTerm);
      const messageMatch = item.message.toLowerCase().includes(searchTerm);
      const categoryMatch = item.category.toLowerCase().includes(searchTerm);
      const companyMatch = item.company ? item.company.toLowerCase().includes(searchTerm) : false;

      const matchesSearch = (!searchTerm || nameMatch || emailMatch || messageMatch || categoryMatch || companyMatch);
      
      return matchesCategory && matchesSearch;
    });

    // Check empty state
    if (filteredList.length === 0) {
      DOM.emptyState.classList.remove('hidden');
      return;
    }

    DOM.emptyState.classList.add('hidden');

    // Populate feedback cards
    filteredList.forEach(item => {
      const card = document.createElement('div');
      card.className = 'feedback-card';
      
      // Generate initials for avatar
      const initials = item.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

      // Format Date string
      const dateFormatted = formatDate(item.createdAt);

      // Star string
      let starMarkup = '';
      for (let s = 1; s <= 5; s++) {
        starMarkup += `<i class="${s <= item.rating ? 'fa-solid' : 'fa-regular'} fa-star"></i>`;
      }

      // Determine category CSS class badge
      let catBadgeClass = 'badge-category';
      // Status badges
      const statusClean = item.status ? item.status.toLowerCase() : 'pending review';
      let statusBadgeClass = 'status-badge pending';
      if (statusClean === 'investigating' || statusClean === 'in progress') {
        statusBadgeClass = 'status-badge investigating';
      } else if (statusClean === 'reviewed' || statusClean === 'resolved' || statusClean === 'completed') {
        statusBadgeClass = 'status-badge reviewed';
      }

      card.innerHTML = `
        <div class="feedback-card-header">
          <div class="customer-info-group">
            <div class="avatar-circle">${initials}</div>
            <div class="customer-details">
              <h4 class="customer-name">${escapeHTML(item.name)}</h4>
              <span class="customer-subtext">${escapeHTML(item.email)} ${item.company ? `&bull; ${escapeHTML(item.company)}` : ''}</span>
            </div>
          </div>
          <div class="customer-meta-group">
            <div class="card-stars" aria-label="${item.rating} out of 5 stars">${starMarkup}</div>
            <span class="${statusBadgeClass}">${escapeHTML(item.status || 'Pending Review')}</span>
          </div>
        </div>
        <div class="feedback-card-body">
          <p>${escapeHTML(item.message)}</p>
        </div>
        <div class="feedback-card-footer">
          <div class="card-footer-item">
            <i class="fa-regular fa-clock"></i> <span>Submitted ${dateFormatted}</span>
          </div>
          <span class="${catBadgeClass}">${escapeHTML(item.category)}</span>
        </div>
      `;
      DOM.feedbackContainer.appendChild(card);
    });

    // Populate recent activity log
    updateActivityFeed(list);
  }

  function getActiveCategoryFilter() {
    let category = 'All';
    DOM.filterPills.forEach(pill => {
      if (pill.classList.contains('active')) {
        category = pill.getAttribute('data-category');
      }
    });
    return category;
  }

  function updateActivityFeed(list) {
    DOM.activityFeedList.innerHTML = '';
    
    // Sort array by date descending
    const sorted = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

    if (sorted.length === 0) {
      DOM.activityFeedList.innerHTML = '<div class="activity-item" style="border-left:none; padding-left:0"><span class="activity-text">No activity logs.</span></div>';
      return;
    }

    sorted.forEach(item => {
      const timeDiffStr = getFriendlyTimeDiff(item.createdAt);
      
      const activity = document.createElement('div');
      activity.className = 'activity-item';
      activity.innerHTML = `
        <div class="activity-dot"></div>
        <div class="activity-content">
          <span class="activity-text">
            <span class="activity-user">${escapeHTML(item.name)}</span> submitted a 
            <span class="text-purple font-mono" style="font-size: 0.73rem">${escapeHTML(item.category)}</span> (${item.rating}★)
          </span>
          <span class="activity-time">${timeDiffStr}</span>
        </div>
      `;
      DOM.activityFeedList.appendChild(activity);
    });
  }

  // Filter Pill clicks handler
  DOM.filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      DOM.filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      renderFeedbackList(state.feedback);
    });
  });

  // Search input events with keyup debounce
  let searchDebounceTimeout;
  DOM.searchField.addEventListener('keyup', () => {
    clearTimeout(searchDebounceTimeout);
    searchDebounceTimeout = setTimeout(() => {
      renderFeedbackList(state.feedback);
    }, 150);
  });

  DOM.refreshBtn.addEventListener('click', () => {
    fetchFeedback(true);
  });

  /* --------------------------------------------------------------------------
     4. Form Logic & Confetti Visuals
     -------------------------------------------------------------------------- */
  // Character counter for textarea
  DOM.formMessage.addEventListener('input', () => {
    const len = DOM.formMessage.value.length;
    DOM.charCounter.textContent = len;
    
    if (len > 1000) {
      DOM.formMessage.value = DOM.formMessage.value.substring(0, 1000);
      DOM.charCounter.textContent = 1000;
    }
    updateFormProgressBar();
  });

  // Interactive rating stars selector
  DOM.starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.getAttribute('data-value'), 10);
      state.selectedRating = val;
      DOM.formRatingInput.value = val;
      
      highlightStars(val);
      validateField(DOM.formRatingInput, document.getElementById('error-rating'), () => !!val, "Please select a rating.");
      updateFormProgressBar();
    });

    btn.addEventListener('mouseenter', () => {
      const val = parseInt(btn.getAttribute('data-value'), 10);
      highlightStars(val, true);
    });

    btn.addEventListener('mouseleave', () => {
      highlightStars(state.selectedRating);
    });
  });

  function highlightStars(count, isHover = false) {
    DOM.starBtns.forEach(btn => {
      const val = parseInt(btn.getAttribute('data-value'), 10);
      const icon = btn.querySelector('i');
      
      if (val <= count) {
        icon.className = 'fa-solid fa-star';
        if (isHover) {
          btn.style.color = 'rgba(249, 115, 22, 0.7)';
        } else {
          btn.style.color = 'var(--accent-orange)';
        }
      } else {
        icon.className = 'fa-regular fa-star';
        btn.style.color = 'var(--text-muted)';
      }
    });
  }

  // Update Progress Indicator Bar on Form completion steps
  function updateFormProgressBar() {
    let completedSteps = 0;
    const totalSteps = 5; // name, email, category, rating, message

    if (DOM.formName.value.trim() !== '') completedSteps++;
    if (validateEmailPattern(DOM.formEmail.value.trim())) completedSteps++;
    if (DOM.formCategory.value !== '') completedSteps++;
    if (state.selectedRating > 0) completedSteps++;
    if (DOM.formMessage.value.trim().length >= 5) completedSteps++;

    const percent = Math.min((completedSteps / totalSteps) * 100, 100);
    DOM.formProgress.style.width = `${percent}%`;
  }

  // Field change updates progress
  [DOM.formName, DOM.formEmail, DOM.formCategory, DOM.formMessage].forEach(elem => {
    elem.addEventListener('input', updateFormProgressBar);
    elem.addEventListener('change', updateFormProgressBar);
  });

  // Client Validation helpers
  function validateEmailPattern(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validateField(inputElement, errorElement, validatorFn, errorMessage) {
    const wrapper = inputElement.closest('.form-field');
    const isValid = validatorFn();

    if (!isValid) {
      if (wrapper) wrapper.classList.add('invalid');
      errorElement.textContent = errorMessage;
      return false;
    } else {
      if (wrapper) wrapper.classList.remove('invalid');
      errorElement.textContent = '';
      return true;
    }
  }

  // Clean form variables
  function resetFeedbackForm() {
    DOM.feedbackForm.reset();
    state.selectedRating = 0;
    DOM.formRatingInput.value = '';
    highlightStars(0);
    DOM.charCounter.textContent = '0';
    DOM.formProgress.style.width = '0%';
    
    // Remove all error styles
    document.querySelectorAll('.form-field').forEach(field => field.classList.remove('invalid'));
    document.querySelectorAll('.field-error-msg').forEach(msg => msg.textContent = '');
  }

  DOM.btnResetForm.addEventListener('click', resetFeedbackForm);

  // Form submit intercept
  DOM.feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Trigger full checks
    const isNameValid = validateField(DOM.formName, document.getElementById('error-name'), 
      () => DOM.formName.value.trim() !== '', "Full name is required.");
    
    const isEmailValid = validateField(DOM.formEmail, document.getElementById('error-email'), 
      () => validateEmailPattern(DOM.formEmail.value.trim()), "Please enter a valid email address.");
      
    const isCategoryValid = validateField(DOM.formCategory, document.getElementById('error-category'), 
      () => DOM.formCategory.value !== '', "Please select a feedback category.");
      
    const isRatingValid = validateField(DOM.formRatingInput, document.getElementById('error-rating'), 
      () => state.selectedRating > 0, "Rating is required. Choose stars.");
      
    const isMessageValid = validateField(DOM.formMessage, document.getElementById('error-message'), 
      () => DOM.formMessage.value.trim().length >= 5, "Feedback message must be at least 5 characters.");

    if (!isNameValid || !isEmailValid || !isCategoryValid || !isRatingValid || !isMessageValid) {
      // Find first invalid and focus it
      const firstInvalid = document.querySelector('.form-field.invalid input, .form-field.invalid select, .form-field.invalid textarea');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Valid -> Submit
    toggleFormSubmitting(true);

    const payload = {
      name: DOM.formName.value.trim(),
      email: DOM.formEmail.value.trim(),
      company: DOM.formCompany.value.trim() || undefined,
      category: DOM.formCategory.value,
      rating: state.selectedRating,
      message: DOM.formMessage.value.trim()
    };

    try {
      const response = await fetch(API.feedback, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.status === 201) {
        // Success!
        resetFeedbackForm();
        launchSuccessModal();
      } else {
        // Handle server side validation errors if returned
        if (result.errors) {
          for (const [key, msg] of Object.entries(result.errors)) {
            const fieldInput = document.getElementById(`form-${key}`) || (key === 'rating' ? DOM.formRatingInput : null);
            const fieldErr = document.getElementById(`error-${key}`);
            if (fieldInput && fieldErr) {
              validateField(fieldInput, fieldErr, () => false, msg);
            }
          }
        } else {
          alert(`Submission failed: ${result.message || 'Unknown Server Error'}`);
        }
      }
    } catch (err) {
      console.error("API submission error:", err);
      alert("Network error: Could not contact the FeedbackFlow API server.");
    } finally {
      toggleFormSubmitting(false);
    }
  });

  function toggleFormSubmitting(submitting) {
    if (submitting) {
      DOM.btnSubmitFeedback.disabled = true;
      DOM.btnSubmitFeedback.querySelector('.btn-text').textContent = 'Submitting...';
      DOM.btnSubmitFeedback.querySelector('.spinner').classList.remove('hidden');
    } else {
      DOM.btnSubmitFeedback.disabled = false;
      DOM.btnSubmitFeedback.querySelector('.btn-text').textContent = 'Submit Feedback';
      DOM.btnSubmitFeedback.querySelector('.spinner').classList.add('hidden');
    }
  }

  // Modal Dialog routines
  let confettiInterval;
  function launchSuccessModal() {
    DOM.modalBackdrop.classList.add('active');
    initConfetti(DOM.confettiCanvas);
  }

  DOM.modalCloseBtn.addEventListener('click', () => {
    DOM.modalBackdrop.classList.remove('active');
    stopConfetti();
    // Redirect to dashboard view
    window.location.hash = '#dashboard';
  });

  // Basic Confetti Animation
  let confettiActive = false;
  let confettiAnimationId = null;
  
  function initConfetti(canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight);

    let colors = ['#8b5cf6', '#6366f1', '#3b82f6', '#10b981', '#fbbf24', '#f472b6'];
    let pieces = [];
    confettiActive = true;

    // Create 70 particles
    for (let i = 0; i < 70; i++) {
      pieces.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        r: Math.random() * 6 + 4,
        d: Math.random() * height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0
      });
    }

    function draw() {
      if (!confettiActive) return;
      ctx.clearRect(0, 0, width, height);

      pieces.forEach((p, idx) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();

        // Recycle particles that hit bottom
        if (p.y > height) {
          pieces[idx] = {
            x: Math.random() * width,
            y: -10,
            r: p.r,
            d: p.d,
            color: p.color,
            tilt: p.tilt,
            tiltAngleIncremental: p.tiltAngleIncremental,
            tiltAngle: p.tiltAngle
          };
        }
      });

      confettiAnimationId = requestAnimationFrame(draw);
    }

    draw();

    // Auto resize listener support
    window.addEventListener('resize', () => {
      if (canvas && confettiActive) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    });
  }

  function stopConfetti() {
    confettiActive = false;
    cancelAnimationFrame(confettiAnimationId);
  }

  /* --------------------------------------------------------------------------
     5. Developer Console Sandbox
     -------------------------------------------------------------------------- */
  // Toggle request body view on method selection change
  DOM.consoleMethod.addEventListener('change', () => {
    const method = DOM.consoleMethod.value;
    if (method === 'POST') {
      DOM.consoleBodyWrapper.style.opacity = '1';
      DOM.consoleBodyWrapper.style.pointerEvents = 'auto';
      DOM.consoleBody.disabled = false;
    } else {
      DOM.consoleBodyWrapper.style.opacity = '0.5';
      DOM.consoleBodyWrapper.style.pointerEvents = 'none';
      DOM.consoleBody.disabled = true;
      DOM.bodyJsonError.style.display = 'none';
    }
  });

  DOM.btnExecuteRequest.addEventListener('click', async () => {
    const method = DOM.consoleMethod.value;
    const endpoint = DOM.consoleEndpoint.value;
    const bodyStr = DOM.consoleBody.value;
    
    let options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (method === 'POST') {
      // Validate request body is proper JSON
      try {
        JSON.parse(bodyStr);
        DOM.bodyJsonError.style.display = 'none';
        options.body = bodyStr;
      } catch (err) {
        DOM.bodyJsonError.style.display = 'block';
        DOM.bodyJsonError.textContent = "Syntax error: Invalid request body JSON payload.";
        DOM.consoleBody.focus();
        return;
      }
    }

    // Toggle loading spinner
    toggleConsoleExecuting(true);
    
    const startTime = performance.now();
    let sizeBytes = 0;
    let statusCode = 0;

    try {
      const response = await fetch(`/api${endpoint}`, options);
      const endTime = performance.now();
      const elapsedMs = (endTime - startTime).toFixed(1);
      
      statusCode = response.status;
      const text = await response.text();
      sizeBytes = text.length;

      let jsonResponse;
      try {
        jsonResponse = JSON.parse(text);
      } catch (e) {
        jsonResponse = text; // fallback if text is not JSON
      }

      // Render meta data
      renderConsoleMeta(statusCode, `${elapsedMs}ms`, `${sizeBytes} B`);
      
      // Render body with highlighting
      if (typeof jsonResponse === 'object') {
        DOM.respViewer.innerHTML = syntaxHighlightJSON(jsonResponse);
      } else {
        DOM.respViewer.textContent = jsonResponse;
      }

      // Triggers immediate stats telemetry reload to show execution logged instantly in dashboard
      fetchStatsTelemetry();
    } catch (err) {
      const endTime = performance.now();
      const elapsedMs = (endTime - startTime).toFixed(1);
      renderConsoleMeta(500, `${elapsedMs}ms`, '0 B');
      DOM.respViewer.innerHTML = `<span class="json-key">"Error"</span>: <span class="json-string">"Failed to connect to FeedbackFlow API: ${err.message}"</span>`;
    } finally {
      toggleConsoleExecuting(false);
    }
  });

  function toggleConsoleExecuting(executing) {
    if (executing) {
      DOM.btnExecuteRequest.disabled = true;
      DOM.btnExecuteRequest.querySelector('.spinner').classList.remove('hidden');
      DOM.btnExecuteRequest.querySelector('.btn-text').innerHTML = 'Sending...';
    } else {
      DOM.btnExecuteRequest.disabled = false;
      DOM.btnExecuteRequest.querySelector('.spinner').classList.add('hidden');
      DOM.btnExecuteRequest.querySelector('.btn-text').innerHTML = '<i class="fa-solid fa-play"></i> Send Request';
    }
  }

  function renderConsoleMeta(status, time, size) {
    DOM.respStatusBadge.textContent = status;
    DOM.respStatusBadge.className = 'value'; // clear previous badge

    if (status >= 200 && status < 300) {
      DOM.respStatusBadge.classList.add('badge-2xx');
    } else if (status >= 400 && status < 500) {
      DOM.respStatusBadge.classList.add('badge-4xx');
    } else {
      DOM.respStatusBadge.classList.add('badge-5xx');
    }

    DOM.respTimeBadge.textContent = time;
    DOM.respSizeBadge.textContent = size;
  }

  DOM.btnClearConsole.addEventListener('click', () => {
    DOM.respStatusBadge.textContent = '-';
    DOM.respStatusBadge.className = 'value badge-inactive';
    DOM.respTimeBadge.textContent = '-';
    DOM.respSizeBadge.textContent = '-';
    DOM.respViewer.textContent = '// Output cleared.';
  });

  // Custom regex JSON pretty-printer with coloring classes matching stylesheet tokens
  function syntaxHighlightJSON(json) {
    if (typeof json !== 'string') {
      json = JSON.stringify(json, undefined, 2);
    }
    // Escape standard tags
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      // Wrap token
      return `<span class="${cls}">${match}</span>`;
    });
  }

  /* --------------------------------------------------------------------------
     6. Developer Mode Drawer (Real-time telemetry streams)
     -------------------------------------------------------------------------- */
  DOM.devDrawerToggle.addEventListener('click', () => {
    const isHidden = DOM.devDrawer.getAttribute('aria-hidden') === 'true';
    if (isHidden) {
      DOM.devDrawer.classList.add('open');
      DOM.devDrawer.setAttribute('aria-hidden', 'false');
    } else {
      DOM.devDrawer.classList.remove('open');
      DOM.devDrawer.setAttribute('aria-hidden', 'true');
    }
  });

  DOM.devDrawerClose.addEventListener('click', () => {
    DOM.devDrawer.classList.remove('open');
    DOM.devDrawer.setAttribute('aria-hidden', 'true');
  });

  // Close drawer on clicking outside
  document.addEventListener('click', (e) => {
    if (!DOM.devDrawer.contains(e.target) && !DOM.devDrawerToggle.contains(e.target) && DOM.devDrawer.classList.contains('open')) {
      DOM.devDrawer.classList.remove('open');
      DOM.devDrawer.setAttribute('aria-hidden', 'true');
    }
  });

  function updateDeveloperDrawer(stats) {
    const telemetry = stats.serverTelemetry;
    
    // Update total counts
    DOM.telemetryTotalReqs.textContent = telemetry.totalRequests;
    DOM.telemetryGetCount.textContent = telemetry.methods.GET || 0;
    DOM.telemetryPostCount.textContent = telemetry.methods.POST || 0;

    // Last Inbound request display
    if (telemetry.lastRequest) {
      DOM.devLastReqEmpty.classList.add('hidden');
      DOM.devLastReqData.classList.remove('hidden');

      const req = telemetry.lastRequest;
      DOM.devLastMethod.textContent = req.method;
      DOM.devLastMethod.className = `req-method-badge ${req.method.toLowerCase()}`;
      DOM.devLastPath.textContent = req.path;

      // Status code badge coloring
      DOM.devLastStatus.textContent = req.statusCode;
      DOM.devLastStatus.className = 'status-val-badge';
      if (req.statusCode >= 200 && req.statusCode < 300) {
        DOM.devLastStatus.classList.add('s-2xx');
      } else if (req.statusCode >= 400 && req.statusCode < 500) {
        DOM.devLastStatus.classList.add('s-4xx');
      } else {
        DOM.devLastStatus.classList.add('s-5xx');
      }

      DOM.devLastDuration.textContent = `${req.durationMs}ms`;
      DOM.devLastSize.textContent = req.responseSize === 'unknown' ? '-' : `${req.responseSize} B`;
      
      // Timestamp parser
      const timeStr = new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      DOM.devLastTime.textContent = timeStr;

      // Body display
      if (req.body) {
        DOM.devLastJsonViewer.innerHTML = syntaxHighlightJSON(req.body);
        DOM.btnCopyTelemetryJson.style.display = 'block';
      } else {
        DOM.devLastJsonViewer.innerHTML = '<span class="text-muted">// No payload sent</span>';
        DOM.btnCopyTelemetryJson.style.display = 'none';
      }
    } else {
      DOM.devLastReqEmpty.classList.remove('hidden');
      DOM.devLastReqData.classList.add('hidden');
    }
  }

  // Copy JSON telemetry helper
  DOM.btnCopyTelemetryJson.addEventListener('click', () => {
    if (state.stats && state.stats.serverTelemetry.lastRequest && state.stats.serverTelemetry.lastRequest.body) {
      const jsonText = JSON.stringify(state.stats.serverTelemetry.lastRequest.body, null, 2);
      navigator.clipboard.writeText(jsonText)
        .then(() => {
          const originalText = DOM.btnCopyTelemetryJson.textContent;
          DOM.btnCopyTelemetryJson.textContent = 'Copied!';
          DOM.btnCopyTelemetryJson.disabled = true;
          setTimeout(() => {
            DOM.btnCopyTelemetryJson.textContent = originalText;
            DOM.btnCopyTelemetryJson.disabled = false;
          }, 1500);
        })
        .catch(err => {
          console.error('Could not copy JSON content:', err);
        });
    }
  });

  /* --------------------------------------------------------------------------
     7. Utilities / Helpers
     -------------------------------------------------------------------------- */
  function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function getFriendlyTimeDiff(isoString) {
    const date = new Date(isoString);
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    return `${days} days ago`;
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  /* --------------------------------------------------------------------------
     8. App Initializer
     -------------------------------------------------------------------------- */
  function initApp() {
    // 1. Fetch initial statistics and feedback arrays
    fetchFeedback(true);
    
    // 2. Start polling statistics every 1.5 seconds for live activity panels & dev mode drawer
    state.pollingInterval = setInterval(() => {
      fetchStatsTelemetry(false);
    }, 1500);
  }

  // Kickstart
  initApp();

})();
