/**
 * CivicConnect Portal - Client-Side App Logic
 * 
 * Manages state, handles API interactions, executes real-time DOM updates,
 * handles search debounce, form validation, and toast alerts.
 */

// Application State
const state = {
  complaints: [],
  stats: {
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0
  },
  filters: {
    search: '',
    status: 'All',
    sort: 'newest'
  },
  selectedComplaintId: null,
  isEditing: false
};

// API Base URL
const API_URL = '/api/complaints';

// DOM Elements Selectors
const DOM = {
  // Stats
  statsTotal: document.getElementById('stats-total'),
  statsPending: document.getElementById('stats-pending'),
  statsInProgress: document.getElementById('stats-in-progress'),
  statsResolved: document.getElementById('stats-resolved'),
  statsHighPriority: document.getElementById('stats-high-priority'),

  // Filters & Controls
  searchInput: document.getElementById('search-input'),
  filterStatus: document.getElementById('filter-status'),
  sortBy: document.getElementById('sort-by'),

  // Containers & Spinners
  complaintsContainer: document.getElementById('complaints-container'),
  loadingSpinner: document.getElementById('loading-spinner'),
  emptyState: document.getElementById('empty-state'),
  toastContainer: document.getElementById('toast-container'),

  // Modals
  complaintModal: document.getElementById('complaint-modal'),
  deleteModal: document.getElementById('delete-modal'),

  // Form Fields
  form: document.getElementById('complaint-form'),
  formId: document.getElementById('complaint-id'),
  formName: document.getElementById('form-name'),
  formEmail: document.getElementById('form-email'),
  formPhone: document.getElementById('form-phone'),
  formCategory: document.getElementById('form-category'),
  formLocation: document.getElementById('form-location'),
  formPriority: document.getElementById('form-priority'),
  formStatus: document.getElementById('form-status'),
  formStatusGroup: document.getElementById('form-status-group'),
  formDescription: document.getElementById('form-description'),
  modalTitleText: document.getElementById('modal-title-text'),
  btnSubmitComplaint: document.getElementById('btn-submit-complaint'),

  // Modal Triggers
  btnOpenLodge: document.getElementById('btn-open-lodge-modal'),
  btnHeroLodge: document.getElementById('btn-hero-lodge'),
  btnEmptyStateLodge: document.getElementById('btn-empty-state-lodge'),
  btnCloseComplaintModal: document.getElementById('btn-close-complaint-modal'),
  btnCancelComplaintModal: document.getElementById('btn-cancel-complaint-modal'),
  btnCloseDeleteModal: document.getElementById('btn-close-delete-modal'),
  btnCancelDeleteModal: document.getElementById('btn-cancel-delete-modal'),
  btnConfirmDelete: document.getElementById('btn-confirm-delete'),

  // Delete Card Info
  deleteComplaintNum: document.getElementById('delete-complaint-num'),
  deleteComplaintTitle: document.getElementById('delete-complaint-title')
};

// ==========================================================================
// TOAST NOTIFICATIONS
// ==========================================================================

/**
 * Trigger a modern, animated toast alert
 * @param {string} title - Heading of toast
 * @param {string} message - Content body
 * @param {string} type - Theme style ('success', 'error', 'info')
 */
function showToast(title, message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'fa-circle-info';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-circle-exclamation';

  toast.innerHTML = `
    <span class="toast-icon"><i class="fa-solid ${icon}"></i></span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
    <button class="toast-close">&times;</button>
  `;

  // Append to container
  DOM.toastContainer.appendChild(toast);

  // Close event listener
  toast.querySelector('.toast-close').addEventListener('click', () => {
    removeToast(toast);
  });

  // Self destruct timer
  setTimeout(() => {
    removeToast(toast);
  }, 4500);
}

function removeToast(toast) {
  toast.style.transform = 'translateX(120%)';
  toast.style.opacity = '0';
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

// ==========================================================================
// LOADING SPINNER STATE
// ==========================================================================

function showLoading() {
  DOM.loadingSpinner.style.display = 'flex';
  DOM.complaintsContainer.style.display = 'none';
  DOM.emptyState.style.display = 'none';
}

function hideLoading() {
  DOM.loadingSpinner.style.display = 'none';
}

// ==========================================================================
// DATA FETCHING & RENDERING
// ==========================================================================

/**
 * Fetch complaints from the backend matching filters
 */
async function fetchComplaints() {
  showLoading();
  try {
    const { search, status, sort } = state.filters;
    const url = new URL(API_URL, window.location.origin);
    
    if (search) url.searchParams.append('search', search);
    if (status) url.searchParams.append('status', status);
    if (sort) url.searchParams.append('sort', sort);

    const response = await fetch(url.toString());
    const result = await response.json();

    if (result.success) {
      state.complaints = result.data || [];
      state.stats = result.stats || state.stats;
      
      updateDashboardUI();
      renderComplaintsUI();
    } else {
      showToast('Error', result.message || 'Could not fetch complaints', 'error');
    }
  } catch (error) {
    console.error('Fetch error:', error);
    showToast('Network Error', 'Failed to communicate with server', 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Render dashboard stats counters
 */
function updateDashboardUI() {
  const { total, pending, inProgress, resolved, highPriority } = state.stats;
  
  animateCounter(DOM.statsTotal, total);
  animateCounter(DOM.statsPending, pending);
  animateCounter(DOM.statsInProgress, inProgress);
  animateCounter(DOM.statsResolved, resolved);
  animateCounter(DOM.statsHighPriority, highPriority);
}

/**
 * Simple digit transition effect
 * @param {HTMLElement} element - Target counter element
 * @param {number} targetValue - Ending number
 */
function animateCounter(element, targetValue) {
  if (!element) return;
  const startValue = parseInt(element.innerText) || 0;
  if (startValue === targetValue) {
    element.innerText = targetValue;
    return;
  }
  
  let current = startValue;
  const duration = 500; // ms
  const stepTime = Math.max(Math.floor(duration / Math.abs(targetValue - startValue || 1)), 15);
  const increment = targetValue > startValue ? 1 : -1;
  
  const timer = setInterval(() => {
    current += increment;
    element.innerText = current;
    if (current === targetValue) {
      clearInterval(timer);
    }
  }, stepTime);

  // Fallback check to ensure exact value
  setTimeout(() => {
    element.innerText = targetValue;
    clearInterval(timer);
  }, duration + 50);
}

/**
 * Render complaint cards grid or empty state
 */
function renderComplaintsUI() {
  DOM.complaintsContainer.innerHTML = '';
  
  if (state.complaints.length === 0) {
    DOM.complaintsContainer.style.display = 'none';
    DOM.emptyState.style.display = 'block';
    return;
  }

  DOM.complaintsContainer.style.display = 'grid';
  DOM.emptyState.style.display = 'none';

  state.complaints.forEach(complaint => {
    // Generate elements
    const card = document.createElement('div');
    card.className = 'complaint-card glass-card';
    
    // Formatting date
    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const dateStr = new Date(complaint.created_at || complaint.createdAt).toLocaleDateString('en-US', dateOptions);

    // Format badge classes
    const statusClass = `badge-status-${complaint.status.replace(/\s+/g, '').toLowerCase()}`;
    const priorityClass = `badge-priority-${complaint.priority.toLowerCase()}`;

    // Formatting category icon
    const categoryIcons = {
      'Garbage Collection': 'fa-trash-can',
      'Road Damage': 'fa-road-barrier',
      'Water Leakage': 'fa-droplet',
      'Street Light': 'fa-lightbulb',
      'Drainage': 'fa-water',
      'Electricity': 'fa-bolt',
      'Tree Fallen': 'fa-tree',
      'Other': 'fa-circle-question'
    };
    const catIcon = categoryIcons[complaint.category] || 'fa-triangle-exclamation';

    // Mock complaint visual serial number based on last digits
    const serial = String(complaint.id).slice(-6).toUpperCase();

    card.innerHTML = `
      <div class="card-header">
        <div class="card-meta">
          <span class="complaint-number"><i class="fa-solid fa-hashtag"></i> ${serial}</span>
          <div class="badge-group">
            <span class="badge ${priorityClass}"><i class="fa-solid fa-triangle-exclamation"></i> ${complaint.priority}</span>
            <span class="badge ${statusClass}"><i class="fa-solid fa-spinner"></i> ${complaint.status}</span>
          </div>
        </div>
        <h3 class="card-category"><i class="fa-solid ${catIcon}"></i> ${complaint.category}</h3>
        <span class="card-citizen"><i class="fa-solid fa-user-circle"></i> Reported by: ${escapeHTML(complaint.name)}</span>
      </div>

      <div class="card-body">
        <p class="card-description">${escapeHTML(complaint.description)}</p>
        <div class="card-details">
          <div class="detail-item">
            <i class="fa-solid fa-location-dot"></i>
            <span>${escapeHTML(complaint.location)}</span>
          </div>
          <div class="detail-item">
            <i class="fa-solid fa-phone"></i>
            <span>${escapeHTML(complaint.phone)}</span>
          </div>
          <div class="detail-item">
            <i class="fa-solid fa-calendar-day"></i>
            <span>${dateStr}</span>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <button class="btn btn-icon btn-edit" title="Edit Complaint" data-id="${complaint.id}">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button class="btn btn-icon btn-delete" title="Delete Complaint" data-id="${complaint.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;

    // Hook buttons
    card.querySelector('.btn-edit').addEventListener('click', () => editComplaint(complaint.id));
    card.querySelector('.btn-delete').addEventListener('click', () => initiateDelete(complaint.id, serial, complaint.category));

    DOM.complaintsContainer.appendChild(card);
  });
}

/**
 * Escapes HTML characters to prevent XSS injection
 * @param {string} str - User input string
 */
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================================================
// MODAL FORMS - CREATE & EDIT
// ==========================================================================

function openLodgeModal() {
  resetFormValidation();
  DOM.form.reset();
  DOM.formId.value = '';
  state.isEditing = false;

  DOM.modalTitleText.innerHTML = '<i class="fa-solid fa-clipboard-question"></i> Lodge New Complaint';
  DOM.btnSubmitComplaint.innerHTML = 'Submit Complaint <i class="fa-solid fa-paper-plane"></i>';
  DOM.formStatusGroup.style.display = 'none';

  DOM.complaintModal.classList.add('active');
}

function closeLodgeModal() {
  DOM.complaintModal.classList.remove('active');
  DOM.form.reset();
  DOM.formId.value = '';
  resetFormValidation();
}

/**
 * Pre-populate form fields to trigger edit mode
 * @param {string|number} id - Complaint ID
 */
async function editComplaint(id) {
  resetFormValidation();
  showLoading();

  try {
    const response = await fetch(`${API_URL}/${id}`);
    const result = await response.json();

    if (result.success) {
      const complaint = result.data;
      
      DOM.formId.value = complaint.id;
      DOM.formName.value = complaint.name;
      DOM.formEmail.value = complaint.email;
      DOM.formPhone.value = complaint.phone;
      DOM.formCategory.value = complaint.category;
      DOM.formLocation.value = complaint.location;
      DOM.formPriority.value = complaint.priority;
      DOM.formStatus.value = complaint.status;
      DOM.formDescription.value = complaint.description;

      // Adjust Modal title and buttons
      DOM.modalTitleText.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Complaint Details';
      DOM.btnSubmitComplaint.innerHTML = 'Save Changes <i class="fa-solid fa-circle-check"></i>';
      DOM.formStatusGroup.style.display = 'flex';
      
      state.isEditing = true;
      DOM.complaintModal.classList.add('active');
    } else {
      showToast('Error', result.message || 'Could not fetch complaint details', 'error');
    }
  } catch (error) {
    showToast('Network Error', 'Failed to contact database', 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Handle submit event for lodge/edit complaint
 */
async function submitComplaintForm(e) {
  e.preventDefault();
  
  if (!validateLocalForm()) {
    showToast('Validation Error', 'Please check the invalid fields highlighted in red.', 'error');
    return;
  }

  const payload = {
    name: DOM.formName.value.trim(),
    email: DOM.formEmail.value.trim(),
    phone: DOM.formPhone.value.trim(),
    category: DOM.formCategory.value,
    location: DOM.formLocation.value.trim(),
    priority: DOM.formPriority.value,
    description: DOM.formDescription.value.trim()
  };

  if (state.isEditing) {
    payload.status = DOM.formStatus.value;
  }

  DOM.btnSubmitComplaint.disabled = true;
  const isEdit = state.isEditing;
  const id = DOM.formId.value;

  try {
    const url = isEdit ? `${API_URL}/${id}` : API_URL;
    const method = isEdit ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      showToast(
        isEdit ? 'Updated!' : 'Submitted!',
        isEdit ? 'Complaint details updated successfully.' : 'Your complaint has been logged and queued for review.',
        'success'
      );
      closeLodgeModal();
      
      // Auto-refresh list and stats with updated values
      state.stats = result.stats || state.stats;
      fetchComplaints();
    } else {
      // Check for express-validator backend errors
      if (result.errors && Array.isArray(result.errors)) {
        result.errors.forEach(err => {
          showFieldError(err.field, err.message);
        });
        showToast('Submission Rejected', 'Server rejected input values. Please review inputs.', 'error');
      } else {
        showToast('Error', result.message || 'Failed to submit complaint', 'error');
      }
    }
  } catch (error) {
    showToast('Network Error', 'Submission failed. Check network link.', 'error');
  } finally {
    DOM.btnSubmitComplaint.disabled = false;
  }
}

// ==========================================================================
// FORM VALIDATIONS (LOCAL VALIDATION RULES)
// ==========================================================================

function resetFormValidation() {
  const groups = document.querySelectorAll('.form-group');
  groups.forEach(g => g.classList.remove('has-error'));
  
  const messages = document.querySelectorAll('.error-msg');
  messages.forEach(m => m.innerText = '');
}

function showFieldError(field, msg) {
  let element;
  let errSpan;
  
  if (field === 'name') { element = DOM.formName; errSpan = document.getElementById('err-name'); }
  if (field === 'email') { element = DOM.formEmail; errSpan = document.getElementById('err-email'); }
  if (field === 'phone') { element = DOM.formPhone; errSpan = document.getElementById('err-phone'); }
  if (field === 'category') { element = DOM.formCategory; errSpan = document.getElementById('err-category'); }
  if (field === 'location') { element = DOM.formLocation; errSpan = document.getElementById('err-location'); }
  if (field === 'description') { element = DOM.formDescription; errSpan = document.getElementById('err-description'); }
  if (field === 'status') { element = DOM.formStatus; errSpan = document.getElementById('err-status'); }

  if (element && errSpan) {
    element.parentElement.classList.add('has-error');
    errSpan.innerText = msg;
  }
}

/**
 * Validates inputs locally before sending network requests
 */
function validateLocalForm() {
  resetFormValidation();
  let isValid = true;

  // Name
  if (!DOM.formName.value.trim()) {
    showFieldError('name', 'Full name is required.');
    isValid = false;
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!DOM.formEmail.value.trim()) {
    showFieldError('email', 'Email address is required.');
    isValid = false;
  } else if (!emailRegex.test(DOM.formEmail.value.trim())) {
    showFieldError('email', 'Please provide a valid email format.');
    isValid = false;
  }

  // Phone
  const phoneVal = DOM.formPhone.value.trim();
  const phoneRegex = /^[0-9]+$/;
  if (!phoneVal) {
    showFieldError('phone', 'Phone number is required.');
    isValid = false;
  } else if (!phoneRegex.test(phoneVal)) {
    showFieldError('phone', 'Phone number must contain only numbers.');
    isValid = false;
  } else if (phoneVal.length < 10 || phoneVal.length > 15) {
    showFieldError('phone', 'Phone number must be between 10 and 15 digits.');
    isValid = false;
  }

  // Category
  if (!DOM.formCategory.value) {
    showFieldError('category', 'Please select a complaint category.');
    isValid = false;
  }

  // Location
  if (!DOM.formLocation.value.trim()) {
    showFieldError('location', 'Location of issue is required.');
    isValid = false;
  }

  // Description
  const descVal = DOM.formDescription.value.trim();
  if (!descVal) {
    showFieldError('description', 'Description is required.');
    isValid = false;
  } else if (descVal.length < 10) {
    showFieldError('description', 'Description must contain at least 10 characters.');
    isValid = false;
  }

  return isValid;
}

// ==========================================================================
// MODAL FORMS - DELETE CONFIRMATION
// ==========================================================================

function initiateDelete(id, serial, category) {
  state.selectedComplaintId = id;
  DOM.deleteComplaintNum.innerText = `Complaint #${serial}`;
  DOM.deleteComplaintTitle.innerText = category;
  DOM.deleteModal.classList.add('active');
}

function closeDeleteModal() {
  DOM.deleteModal.classList.remove('active');
  state.selectedComplaintId = null;
}

async function deleteSelectedComplaint() {
  const id = state.selectedComplaintId;
  if (!id) return;

  DOM.btnConfirmDelete.disabled = true;
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    const result = await response.json();

    if (result.success) {
      showToast('Deleted!', 'The complaint has been permanently removed.', 'success');
      closeDeleteModal();
      
      // Auto-refresh stats and records
      state.stats = result.stats || state.stats;
      fetchComplaints();
    } else {
      showToast('Error', result.message || 'Failed to delete complaint', 'error');
    }
  } catch (error) {
    showToast('Network Error', 'Deletion request failed.', 'error');
  } finally {
    DOM.btnConfirmDelete.disabled = false;
  }
}

// ==========================================================================
// DEBOUNCED SEARCH & FILTER LISTENERS
// ==========================================================================

/**
 * Prevent high frequency requests on typing
 */
function debounce(func, delay = 350) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const handleSearchInput = debounce((e) => {
  state.filters.search = e.target.value.trim();
  fetchComplaints();
});

// ==========================================================================
// PORTAL INITIALIZATION
// ==========================================================================

function init() {
  // 1. Fetch data on load
  fetchComplaints();

  // 2. Open / Close Modals Events
  DOM.btnOpenLodge.addEventListener('click', openLodgeModal);
  DOM.btnHeroLodge.addEventListener('click', openLodgeModal);
  DOM.btnEmptyStateLodge.addEventListener('click', openLodgeModal);
  
  DOM.btnCloseComplaintModal.addEventListener('click', closeLodgeModal);
  DOM.btnCancelComplaintModal.addEventListener('click', closeLodgeModal);
  
  DOM.btnCloseDeleteModal.addEventListener('click', closeDeleteModal);
  DOM.btnCancelDeleteModal.addEventListener('click', closeDeleteModal);

  // 3. Form Submit Event
  DOM.form.addEventListener('submit', submitComplaintForm);

  // 4. Confirm Delete Event
  DOM.btnConfirmDelete.addEventListener('click', deleteSelectedComplaint);

  // 5. Search Box (Debounced input)
  DOM.searchInput.addEventListener('input', handleSearchInput);

  // 6. Status and Sort filters
  DOM.filterStatus.addEventListener('change', (e) => {
    state.filters.status = e.target.value;
    fetchComplaints();
  });

  DOM.sortBy.addEventListener('change', (e) => {
    state.filters.sort = e.target.value;
    fetchComplaints();
  });

  // 7. Modal backdrop click closes modal
  window.addEventListener('click', (e) => {
    if (e.target === DOM.complaintModal) closeLodgeModal();
    if (e.target === DOM.deleteModal) closeDeleteModal();
  });
}

// Boot Client App
document.addEventListener('DOMContentLoaded', init);
