/**
 * requests.js - Student Requests & Unlisted Components Controller
 * 
 * Dynamically displays student borrowing requests from localStorage (JSON),
 * manages status filtering (All, Pending, Approved, Rejected, Completed),
 * updates filter tab count badges, renders details modal with comments,
 * and allows submitting custom unlisted component requests.
 */

document.addEventListener('DOMContentLoaded', () => {
    let currentFilter = 'all';

    const tbody = document.getElementById('requestsTableBody');
    const emptyState = document.getElementById('emptyState');

    // Filter pill buttons
    const pillAll = document.getElementById('pillAll');
    const pillPending = document.getElementById('pillPending');
    const pillApproved = document.getElementById('pillApproved');
    const pillRejected = document.getElementById('pillRejected');
    const pillCompleted = document.getElementById('pillCompleted');

    // Modals
    const requestModal = document.getElementById('requestModal');
    const unlistedModal = document.getElementById('unlistedModal');
    const unlistedForm = document.getElementById('unlistedRequestForm');

    // Helper: returns CSS badge class for request status
    function getStatusBadgeClass(status) {
        const s = (status || '').toLowerCase();
        if (s === 'approved') return 'badge-approved';
        if (s === 'rejected') return 'badge-rejected';
        if (s === 'completed') return 'badge-completed';
        return 'badge-pending';
    }

    /**
     * Renders requests table dynamically from shared localStorage array.
     */
    function renderRequestsTable() {
        if (!tbody) return;

        const requests = (typeof getRequests === 'function') ? getRequests() : [];

        // Count totals per status
        const totalCount = requests.length;
        const pendingCount = requests.filter(r => (r.status || '').toLowerCase() === 'pending').length;
        const approvedCount = requests.filter(r => (r.status || '').toLowerCase() === 'approved').length;
        const rejectedCount = requests.filter(r => (r.status || '').toLowerCase() === 'rejected').length;
        const completedCount = requests.filter(r => (r.status || '').toLowerCase() === 'completed').length;

        // Update pill labels with live counts
        if (pillAll) pillAll.textContent = `All (${totalCount})`;
        if (pillPending) pillPending.textContent = `Pending (${pendingCount})`;
        if (pillApproved) pillApproved.textContent = `Approved (${approvedCount})`;
        if (pillRejected) pillRejected.textContent = `Rejected (${rejectedCount})`;
        if (pillCompleted) pillCompleted.textContent = `Completed (${completedCount})`;

        tbody.innerHTML = '';

        let visibleRows = 0;

        requests.forEach(req => {
            const statusLower = (req.status || 'Pending').toLowerCase();
            const matchesFilter = (currentFilter === 'all') || (statusLower === currentFilter);

            const tr = document.createElement('tr');
            tr.className = 'request-row';
            tr.setAttribute('data-status', statusLower);
            tr.setAttribute('data-id', req.id);

            if (!matchesFilter) {
                tr.style.display = 'none';
            } else {
                visibleRows++;
            }

            const safeId = escapeHtml(req.id);
            const safeStatus = escapeHtml(req.status || 'Pending');
            const badgeClass = getStatusBadgeClass(req.status);

            const items = req.items || [];
            const compNames = items.map(i => i.name).join(', ') || 'Custom Component';
            const safeCompNames = escapeHtml(compNames);
            const totalQty = items.reduce((sum, i) => sum + (i.qty || 1), 0);
            const itemCountText = `${totalQty} ${totalQty === 1 ? 'item' : 'items'}`;

            const submittedText = escapeHtml(req.submittedDate || 'Recent');
            const dueText = escapeHtml(req.dueDate || '—');

            tr.innerHTML = `
                <td class="req-id">${safeId}</td>
                <td class="req-components">
                    <div class="comp-title">${safeCompNames}</div>
                    <div class="comp-count">${itemCountText}</div>
                </td>
                <td class="req-submitted">${submittedText}</td>
                <td class="req-due">${dueText}</td>
                <td class="req-status">
                    <span class="status-badge ${badgeClass}">${safeStatus}</span>
                </td>
                <td class="req-action">
                    <button class="view-btn" data-req-id="${safeId}" aria-label="View request details">View &rarr;</button>
                </td>
            `;

            tbody.appendChild(tr);
        });

        if (emptyState) {
            emptyState.style.display = (visibleRows === 0) ? 'block' : 'none';
        }
    }

    /**
     * Sets active filter pill and updates visible table rows.
     * @param {string} filter - 'all', 'pending', 'approved', 'rejected', or 'completed'
     */
    function setFilter(filter) {
        currentFilter = filter.toLowerCase();

        const pills = document.querySelectorAll('.filter-pill');
        pills.forEach(pill => {
            if (pill.getAttribute('data-filter') === currentFilter) {
                pill.classList.add('active');
                pill.setAttribute('aria-selected', 'true');
            } else {
                pill.classList.remove('active');
                pill.setAttribute('aria-selected', 'false');
            }
        });

        const rows = document.querySelectorAll('#requestsTableBody .request-row');
        let visibleCount = 0;
        rows.forEach(row => {
            const rowStatus = row.getAttribute('data-status');
            const match = (currentFilter === 'all') || (rowStatus === currentFilter);
            row.style.display = match ? '' : 'none';
            if (match) visibleCount++;
        });

        if (emptyState) {
            emptyState.style.display = (visibleCount === 0) ? 'block' : 'none';
        }
    }

    // Attach click listeners to filter pills
    const pills = document.querySelectorAll('.filter-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            const f = pill.getAttribute('data-filter');
            if (f) setFilter(f);
        });
    });

    /**
     * Opens request details modal for a specific request ID.
     */
    function openRequestModal(reqId) {
        const requests = (typeof getRequests === 'function') ? getRequests() : [];
        const req = requests.find(r => r.id && r.id.toLowerCase() === reqId.toLowerCase());
        if (!req || !requestModal) return;

        const modalReqId = document.getElementById('modalReqId');
        const modalStatusBadge = document.getElementById('modalStatusBadge');
        const modalSubmitted = document.getElementById('modalSubmitted');
        const modalDue = document.getElementById('modalDue');
        const modalPurpose = document.getElementById('modalPurpose');
        const modalItemsContainer = document.getElementById('modalItemsContainer');

        if (modalReqId) modalReqId.textContent = req.id;
        if (modalSubmitted) modalSubmitted.textContent = req.submittedDate ? `${req.submittedDate} ${req.submittedTime || ''}` : 'Recent';
        if (modalDue) modalDue.textContent = req.dueDate || '—';

        let purposeFull = req.purpose || 'Laboratory research project';
        if (req.comment) {
            purposeFull += `\n[Teacher Feedback]: ${req.comment}`;
        }
        if (modalPurpose) modalPurpose.textContent = purposeFull;

        if (modalStatusBadge) {
            const badgeClass = getStatusBadgeClass(req.status);
            modalStatusBadge.className = `status-badge ${badgeClass}`;
            modalStatusBadge.textContent = req.status || 'Pending';
        }

        if (modalItemsContainer) {
            modalItemsContainer.innerHTML = '';
            const items = req.items || [];
            items.forEach((item, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'modal-item-row';
                const rackText = item.rack ? ` · ${item.rack}` : '';
                itemDiv.innerHTML = `
                    <span class="modal-item-name">${escapeHtml(item.name || 'Component')} &times; ${item.qty || 1}</span>
                    <span class="modal-item-serial">${escapeHtml(item.status || 'Requested')}${escapeHtml(rackText)}</span>
                `;
                modalItemsContainer.appendChild(itemDiv);
            });
        }

        requestModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Event delegation on table body for View buttons
    if (tbody) {
        tbody.addEventListener('click', (e) => {
            const btn = e.target.closest('.view-btn');
            if (btn) {
                const reqId = btn.getAttribute('data-req-id');
                if (reqId) openRequestModal(reqId);
            }
        });
    }

    // Modal Close Buttons
    const closeButtons = document.querySelectorAll('.modal-overlay .close-btn, .modal-overlay .btn-secondary');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (requestModal) requestModal.classList.remove('active');
            if (unlistedModal) unlistedModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close on overlay backdrop click
    [requestModal, unlistedModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
    });

    // Open Unlisted Requisition Modal
    const openUnlistedBtn = document.querySelector('.btn-open-unlisted-modal');
    if (openUnlistedBtn) {
        openUnlistedBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (unlistedModal) {
                // Set default due date (7 days ahead)
                const dueInput = document.getElementById('unlistedDueDate');
                if (dueInput && !dueInput.value) {
                    const future = new Date();
                    future.setDate(future.getDate() + 7);
                    const yyyy = future.getFullYear();
                    const mm = String(future.getMonth() + 1).padStart(2, '0');
                    const dd = String(future.getDate()).padStart(2, '0');
                    dueInput.value = `${yyyy}-${mm}-${dd}`;
                }
                unlistedModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // Unlisted Form Submission
    if (unlistedForm) {
        unlistedForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const compName = document.getElementById('unlistedCompName')?.value.trim();
            const category = document.getElementById('unlistedCategory')?.value || 'General';
            const qty = parseInt(document.getElementById('unlistedQuantity')?.value, 10) || 1;
            const dueDateRaw = document.getElementById('unlistedDueDate')?.value;
            const priority = document.getElementById('unlistedPriority')?.value || 'Normal';
            const partRef = document.getElementById('unlistedPartRef')?.value.trim() || '';
            const purpose = document.getElementById('unlistedPurpose')?.value.trim();

            if (!compName || !purpose) {
                alert('Please enter both the component name and project purpose.');
                return;
            }

            const requests = (typeof getRequests === 'function') ? getRequests() : [];

            // Generate sequential ID
            let maxNum = 8;
            requests.forEach(r => {
                const m = r.id && r.id.match(/^req(\d+)$/i);
                if (m) {
                    const n = parseInt(m[1], 10);
                    if (n > maxNum) maxNum = n;
                }
            });
            const newId = 'req' + String(maxNum + 1).padStart(3, '0');

            const profile = (typeof getData === 'function') ? getData('tinkerlab_profile', {
                fullName: 'Arjun Sharma',
                rollNumber: 'CS21B001',
                department: 'Computer Science',
                email: 'cse001@bmu.edu.in'
            }) : {
                fullName: 'Arjun Sharma',
                rollNumber: 'CS21B001',
                department: 'Computer Science',
                email: 'cse001@bmu.edu.in'
            };

            const now = new Date();
            const dateFormatted = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(now);
            const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

            let dueDateFormatted = '20 Aug 2026';
            if (dueDateRaw) {
                const parts = dueDateRaw.split('-');
                if (parts.length === 3) {
                    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                    dueDateFormatted = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
                }
            }

            // Save with required fields: id, studentName, studentEmail, items, status "Pending", submittedDate, dueDate
            const newReq = {
                id: newId,
                studentName: profile.fullName || 'Arjun Sharma',
                studentRoll: profile.rollNumber || 'CS21B001',
                studentEmail: profile.email || 'cse001@bmu.edu.in',
                department: profile.department || 'Computer Science',
                items: [
                    {
                        name: compName,
                        qty: qty,
                        available: 0,
                        rack: 'Special Order / Direct Procurement',
                        status: 'Special Order',
                        isUnlisted: true
                    }
                ],
                status: 'Pending',
                submittedDate: dateFormatted,
                submittedTime: timeFormatted,
                dueDate: dueDateFormatted,
                purpose: `[${priority} Priority] ${purpose}${partRef ? ' | Reference: ' + partRef : ''}`,
                comment: ''
            };

            requests.unshift(newReq);
            if (typeof saveRequests === 'function') {
                saveRequests(requests);
            }

            unlistedForm.reset();
            if (unlistedModal) unlistedModal.classList.remove('active');
            document.body.style.overflow = '';

            renderRequestsTable();

            // Toast alert
            const toast = document.getElementById('toastNotice');
            const msgEl = document.getElementById('toastMessage');
            if (toast && msgEl) {
                msgEl.textContent = `Unlisted request ${newId} submitted for faculty review!`;
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 4000);
            }
        });
    }

    // Initial render
    renderRequestsTable();
});
