/**
 * requests.js - Student Requests & Unlisted Components Controller
 * 
 * Manages request filtering (All, Pending, Approved, Completed),
 * request details modal display, custom unlisted component submissions,
 * and data synchronization with localStorage.
 */

// Base request dataset
const requestData = {
    "req001": {
        id: "req001",
        status: "Pending",
        statusClass: "badge-pending",
        submitted: "14 Aug 2026",
        due: "20 Aug 2026",
        purpose: "Obstacle Avoidance Robot Project (CSE302)",
        items: [
            { name: "Arduino Uno R3", qty: 1, serial: "ARD-2026-991" },
            { name: "HC-SR04 Ultrasonic Sensor", qty: 1, serial: "SEN-0412" }
        ]
    },
    "req007": {
        id: "req007",
        status: "Completed",
        statusClass: "badge-completed",
        submitted: "8 Aug 2026",
        due: "Returned on 13 Aug 2026",
        purpose: "Breadboard Prototyping Workshop",
        items: [
            { name: "Jumper Wires M-M 40pcs", qty: 1, serial: "WIR-40M" },
            { name: "Breadboard 830 Points", qty: 1, serial: "BRD-830-18" }
        ]
    }
};

const STORAGE_KEY = 'tinkerlab_custom_requests';

/**
 * Retrieves custom requests array from localStorage using storage.js helper.
 * @returns {Array} List of custom request objects.
 */
function getCustomRequests() {
    return getData(STORAGE_KEY, []);
}

/**
 * Saves the custom requests array into localStorage.
 * @param {Array} list - The list of requests.
 */
function saveCustomRequests(list) {
    saveData(STORAGE_KEY, list);
}

/**
 * Generates the next sequential request identifier (e.g. req009).
 * @returns {string} New request ID.
 */
function generateRequestId() {
    const custom = getCustomRequests();
    let maxNum = 8;
    custom.forEach(r => {
        const match = r.id && r.id.match(/^req(\d+)$/i);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
        }
    });
    return 'req' + String(maxNum + 1).padStart(3, '0');
}

/**
 * Escapes unsafe HTML characters to prevent XSS.
 * @param {string} str - Raw string.
 * @returns {string} Safe HTML string.
 */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Formats date string into readable format (e.g. "20 Aug 2026").
 * @param {string} dateStr - Raw date input.
 * @returns {string} Formatted date.
 */
function formatDateDisplay(dateStr) {
    if (!dateStr) return '—';
    try {
        if (dateStr.includes(' ')) return dateStr;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch (e) {
        return dateStr;
    }
}

/**
 * Returns today's formatted date string.
 * @returns {string} Today's date.
 */
function getTodayDisplay() {
    const d = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Creates and returns a table row DOM element for a request.
 * @param {Object} req - Request object.
 * @returns {HTMLTableRowElement}
 */
function createRequestRowElement(req) {
    const tr = document.createElement('tr');
    tr.className = 'request-row';
    tr.setAttribute('data-status', (req.status || 'pending').toLowerCase());
    tr.setAttribute('data-id', req.id);

    const isUnlisted = !!req.isUnlisted;
    const unlistedTagHtml = isUnlisted 
        ? `<span class="unlisted-tag"><span class="unlisted-tag-pulse"></span> Unlisted</span>` 
        : '';
    const countSubtitle = isUnlisted
        ? `${req.quantity || 1} item${(req.quantity || 1) > 1 ? 's' : ''} &bull; Special Request`
        : `${(req.items && req.items.length) || 1} items`;

    tr.innerHTML = `
        <td class="req-id">${escapeHtml(req.id)}</td>
        <td class="req-components">
            <div class="comp-title-container">
                <span class="comp-title">${escapeHtml(req.componentName || (req.items && req.items[0] && req.items[0].name) || 'Custom Component')}</span>
                ${unlistedTagHtml}
            </div>
            <div class="comp-count">${countSubtitle}</div>
        </td>
        <td class="req-submitted">${escapeHtml(req.submitted)}</td>
        <td class="req-due">${escapeHtml(req.due || '—')}</td>
        <td class="req-status">
            <span class="status-badge ${escapeHtml(req.statusClass || 'badge-pending')}">${escapeHtml(req.status || 'Pending')}</span>
        </td>
        <td class="req-action">
            <button class="view-btn" data-req-id="${escapeHtml(req.id)}" aria-label="View request details">View &rarr;</button>
        </td>
    `;
    return tr;
}

/**
 * Recalculates and updates the count badges on the filter pills.
 */
function updateFilterPillsCount() {
    const allRows = document.querySelectorAll('#requestsTableBody .request-row');
    let counts = { all: 0, pending: 0, approved: 0, rejected: 0, completed: 0 };

    allRows.forEach(row => {
        counts.all++;
        const status = (row.getAttribute('data-status') || '').toLowerCase();
        if (counts[status] !== undefined) {
            counts[status]++;
        }
    });

    const pillAll = document.getElementById('pillAll');
    const pillPending = document.getElementById('pillPending');
    const pillApproved = document.getElementById('pillApproved');
    const pillRejected = document.getElementById('pillRejected');
    const pillCompleted = document.getElementById('pillCompleted');

    if (pillAll) pillAll.textContent = `All (${counts.all})`;
    if (pillPending) pillPending.textContent = `Pending (${counts.pending})`;
    if (pillApproved) pillApproved.textContent = `Approved (${counts.approved})`;
    if (pillRejected) pillRejected.textContent = `Rejected (${counts.rejected})`;
    if (pillCompleted) pillCompleted.textContent = `Completed (${counts.completed})`;
}

/**
 * Applies the currently selected status filter tab to the requests table.
 */
function applyCurrentFilter() {
    const activePill = document.querySelector('.filter-pill.active');
    const filter = activePill ? activePill.getAttribute('data-filter') : 'all';
    const rows = document.querySelectorAll('#requestsTableBody .request-row');
    const emptyState = document.getElementById('emptyState');
    let visibleCount = 0;

    rows.forEach(row => {
        const rowStatus = row.getAttribute('data-status');
        if (filter === 'all' || rowStatus === filter) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    if (emptyState) {
        emptyState.style.display = (visibleCount === 0) ? 'block' : 'none';
    }
}

let toastTimer = null;
/**
 * Displays a toast notification message.
 * @param {string} message - Message text.
 */
function showToast(message) {
    const toast = document.getElementById('toastNotice');
    const textEl = document.getElementById('toastMessage');
    if (!toast || !textEl) return;
    textEl.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

/**
 * Opens the request details modal populated with the given request data.
 * @param {string} reqId - Request ID (e.g. req001).
 */
function openDetails(reqId) {
    const req = requestData[reqId];
    if (!req) return;

    document.getElementById('modalReqId').textContent = req.id;
    document.getElementById('modalStatusBadge').innerHTML = `<span class="status-badge ${req.statusClass}">${req.status}</span>`;
    document.getElementById('modalSubmitted').textContent = req.submitted;
    document.getElementById('modalDue').textContent = req.due;
    document.getElementById('modalPurpose').textContent = req.purpose;

    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) {
        modalTitle.textContent = req.isUnlisted ? 'Unlisted Request Details' : 'Request Details';
    }

    // Unlisted metadata rows
    const typeRow = document.getElementById('modalReqTypeRow');
    const catRow = document.getElementById('modalCategoryRow');
    const priorityRow = document.getElementById('modalPriorityRow');
    const partRefRow = document.getElementById('modalPartRefRow');

    if (req.isUnlisted) {
        if (typeRow) {
            typeRow.style.display = 'flex';
            document.getElementById('modalReqType').innerHTML = '<span class="unlisted-tag"><span class="unlisted-tag-pulse"></span> Unlisted Component</span>';
        }
        if (catRow) {
            catRow.style.display = 'flex';
            document.getElementById('modalCategory').textContent = req.category || 'Special Order';
        }
        if (priorityRow) {
            priorityRow.style.display = 'flex';
            document.getElementById('modalPriority').textContent = req.priority || 'Normal';
        }
        if (partRefRow) {
            if (req.partRef && req.partRef.trim()) {
                partRefRow.style.display = 'flex';
                const refVal = req.partRef.trim();
                if (/^https?:\/\//i.test(refVal)) {
                    document.getElementById('modalPartRef').innerHTML = `<a href="${escapeHtml(refVal)}" target="_blank" rel="noopener noreferrer" style="color:#2563eb; text-decoration:underline;">View Link &nearr;</a>`;
                } else {
                    document.getElementById('modalPartRef').textContent = refVal;
                }
            } else {
                partRefRow.style.display = 'none';
            }
        }
    } else {
        if (typeRow) typeRow.style.display = 'none';
        if (catRow) catRow.style.display = 'none';
        if (priorityRow) priorityRow.style.display = 'none';
        if (partRefRow) partRefRow.style.display = 'none';
    }

    const itemsContainer = document.getElementById('modalItemsContainer');
    itemsContainer.innerHTML = '';
    (req.items || []).forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'modal-item-entry';
        if (req.isUnlisted) {
            itemDiv.innerHTML = `
                <div>
                    <span><strong>${escapeHtml(item.name)}</strong> <span class="unlisted-tag" style="margin-left: 6px;">Special Item</span></span>
                    <div style="color:#64748b; font-size:12px; margin-top:3px;">Serial: ${escapeHtml(item.serial || 'Pending Lab Staff Allotment')}</div>
                </div>
                <span style="font-weight:600; color:#2563eb;">Qty: ${item.qty}</span>
            `;
        } else {
            itemDiv.innerHTML = `
                <span><strong>${escapeHtml(item.name)}</strong> <span style="color:#64748b; font-size:12px;">(${escapeHtml(item.serial || 'N/A')})</span></span>
                <span style="font-weight:600; color:#2563eb;">Qty: ${item.qty}</span>
            `;
        }
        itemsContainer.appendChild(itemDiv);
    });

    const modal = document.getElementById('requestModal');
    if (modal) modal.classList.add('open');
}

/**
 * Closes the request details modal dialog.
 */
function closeModal() {
    const modal = document.getElementById('requestModal');
    if (modal) modal.classList.remove('open');
}

/**
 * Sets the default return due date (7 days from today).
 */
function setDefaultDueDate() {
    const dateInput = document.getElementById('unlistedDueDate');
    if (!dateInput) return;
    const now = new Date();
    const minStr = now.toISOString().split('T')[0];
    dateInput.min = minStr;

    const future = new Date();
    future.setDate(future.getDate() + 7);
    const yyyy = future.getFullYear();
    const mm = String(future.getMonth() + 1).padStart(2, '0');
    const dd = String(future.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;
}

/**
 * Opens the unlisted special request modal.
 */
function openUnlistedModal() {
    setDefaultDueDate();
    const modal = document.getElementById('unlistedModal');
    if (modal) {
        modal.classList.add('open');
        setTimeout(() => {
            const firstInput = document.getElementById('unlistedCompName');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

/**
 * Closes the unlisted special request modal.
 */
function closeUnlistedModal() {
    const modal = document.getElementById('unlistedModal');
    if (modal) {
        modal.classList.remove('open');
    }
}

/**
 * Handles submission of the unlisted component request form.
 * @param {Event} e - Form submission event.
 */
function handleUnlistedFormSubmit(e) {
    e.preventDefault();

    const compName = document.getElementById('unlistedCompName').value.trim();
    const category = document.getElementById('unlistedCategory').value;
    const qty = parseInt(document.getElementById('unlistedQuantity').value, 10) || 1;
    const rawDueDate = document.getElementById('unlistedDueDate').value;
    const priority = document.getElementById('unlistedPriority').value;
    const partRef = document.getElementById('unlistedPartRef').value.trim();
    const purpose = document.getElementById('unlistedPurpose').value.trim();

    if (!compName || !category || !purpose || !rawDueDate) {
        alert('Please fill in all required fields.');
        return;
    }

    const formattedDue = formatDateDisplay(rawDueDate);
    const submittedDate = getTodayDisplay();
    const newId = generateRequestId();

    // Retrieve active student profile
    const profile = getData('tinkerlab_profile', {
        fullName: 'Arjun Sharma',
        rollNumber: 'CS21B001',
        department: 'Computer Science'
    });

    const newRequest = {
        id: newId,
        isUnlisted: true,
        status: 'Pending',
        statusClass: 'badge-pending',
        submitted: submittedDate,
        due: formattedDue,
        rawDueDate: rawDueDate,
        purpose: purpose,
        componentName: compName,
        category: category,
        quantity: qty,
        priority: priority,
        partRef: partRef,
        studentName: profile.fullName || 'Arjun Sharma',
        studentRoll: profile.rollNumber || 'CS21B001',
        studentDept: profile.department || 'Computer Science',
        items: [
            {
                name: compName,
                qty: qty,
                serial: 'UNLISTED / PENDING ALLOCATION',
                isUnlisted: true,
                category: category,
                partRef: partRef
            }
        ]
    };

    // 1. Add to active memory requestData
    requestData[newId] = newRequest;

    // 2. Persist in localStorage via storage.js
    const customList = getCustomRequests();
    customList.unshift(newRequest);
    saveCustomRequests(customList);

    // 3. Insert new row at the top of table body
    const tbody = document.getElementById('requestsTableBody');
    const newRow = createRequestRowElement(newRequest);
    if (tbody.firstChild) {
        tbody.insertBefore(newRow, tbody.firstChild);
    } else {
        tbody.appendChild(newRow);
    }

    // 4. Update filter badges and active view
    updateFilterPillsCount();
    applyCurrentFilter();

    // 5. Reset form and close dialog
    document.getElementById('unlistedRequestForm').reset();
    setDefaultDueDate();
    closeUnlistedModal();

    // 6. Show toast confirmation
    showToast(`Unlisted request for "${compName}" submitted successfully!`);
}

// Wire up event listeners upon DOM readiness
document.addEventListener('DOMContentLoaded', () => {
    // 1. Populate custom requests from localStorage
    const customList = getCustomRequests();
    const tbody = document.getElementById('requestsTableBody');

    if (tbody) {
        customList.slice().reverse().forEach(req => {
            requestData[req.id] = req;
            const rowEl = createRequestRowElement(req);
            if (tbody.firstChild) {
                tbody.insertBefore(rowEl, tbody.firstChild);
            } else {
                tbody.appendChild(rowEl);
            }
        });
    }

    // 2. Update filter counts and default date
    updateFilterPillsCount();
    applyCurrentFilter();
    setDefaultDueDate();

    // 3. Filter pills click listeners
    const filterPills = document.querySelectorAll('.filter-pill');
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => {
                p.classList.remove('active');
                p.setAttribute('aria-selected', 'false');
            });
            pill.classList.add('active');
            pill.setAttribute('aria-selected', 'true');
            applyCurrentFilter();
        });
    });

    // 4. Banner action button -> open unlisted modal
    const bannerBtn = document.querySelector('.btn-banner-action');
    if (bannerBtn) {
        bannerBtn.addEventListener('click', openUnlistedModal);
    }

    // 5. Table rows event delegation for "View ->" buttons
    if (tbody) {
        tbody.addEventListener('click', (e) => {
            const btn = e.target.closest('.view-btn');
            if (btn) {
                const reqId = btn.getAttribute('data-req-id');
                if (reqId) openDetails(reqId);
            }
        });
    }

    // 6. Modal close buttons (replaces inline onclick)
    const requestModal = document.getElementById('requestModal');
    if (requestModal) {
        requestModal.addEventListener('click', (e) => {
            if (e.target === requestModal || e.target.closest('.close-btn') || e.target.closest('.btn-secondary')) {
                closeModal();
            }
        });
    }

    const unlistedModal = document.getElementById('unlistedModal');
    if (unlistedModal) {
        unlistedModal.addEventListener('click', (e) => {
            if (e.target === unlistedModal || e.target.closest('.close-btn') || e.target.closest('.btn-secondary')) {
                closeUnlistedModal();
            }
        });
    }

    // 7. Unlisted request form submit listener
    const unlistedForm = document.getElementById('unlistedRequestForm');
    if (unlistedForm) {
        unlistedForm.addEventListener('submit', handleUnlistedFormSubmit);
    }

    // 8. Escape key closes open modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeUnlistedModal();
        }
    });
});

// Export functions to window for global availability
window.openDetails = openDetails;
window.closeModal = closeModal;
window.openUnlistedModal = openUnlistedModal;
window.closeUnlistedModal = closeUnlistedModal;
