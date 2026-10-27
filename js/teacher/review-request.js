/**
 * review-request.js - Request Review & Approval Controller
 * 
 * Loads student borrowing requests by ID from localStorage (JSON),
 * allows approving or rejecting with teacher comments, and updates the shared state.
 */

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const reqId = (urlParams.get('id') || 'req001').toLowerCase();
    const fromParam = (urlParams.get('from') || 'requests').toLowerCase();

    // Adjust breadcrumb and back-link navigation target based on 'from' query parameter
    const backLink = document.getElementById('backLink');
    const breadcrumbRequests = document.getElementById('breadcrumbRequests');

    if (fromParam === 'history') {
        if (backLink) {
            backLink.href = 'history.html';
            backLink.innerHTML = '&larr; Back to History';
        }
        if (breadcrumbRequests) {
            breadcrumbRequests.href = 'history.html';
            breadcrumbRequests.textContent = 'History';
        }
    } else if (fromParam === 'dashboard') {
        if (backLink) {
            backLink.href = 'dashboard.html';
            backLink.innerHTML = '&larr; Back to Dashboard';
        }
        if (breadcrumbRequests) {
            breadcrumbRequests.href = 'dashboard.html';
            breadcrumbRequests.textContent = 'Dashboard';
        }
    } else {
        if (backLink) {
            backLink.href = 'requests.html';
            backLink.innerHTML = '&larr; Back to Requests';
        }
        if (breadcrumbRequests) {
            breadcrumbRequests.href = 'requests.html';
            breadcrumbRequests.textContent = 'Requests';
        }
    }

    // Retrieve requests from shared data.js
    const requests = (typeof getRequests === 'function') ? getRequests() : [];
    let currentReq = requests.find(r => r.id && r.id.toLowerCase() === reqId);

    // Fallback if not found
    if (!currentReq && requests.length > 0) {
        currentReq = requests[0];
    }

    if (!currentReq) return;

    // Helper: extracts initials
    function getInitials(name) {
        if (!name) return 'ST';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return parts[0].substring(0, 2).toUpperCase();
    }

    // Populate header & student details
    const displayId = document.getElementById('displayReqId');
    const avatar = document.getElementById('studentAvatar');
    const nameEl = document.getElementById('studentName');
    const metaEl = document.getElementById('studentMeta');
    const timestampEl = document.getElementById('studentTimestamp');
    const purposeEl = document.getElementById('purposeText');
    const requiredDate = document.getElementById('requiredDate');
    const statusBadge = document.getElementById('displayReqStatus');

    if (displayId) displayId.textContent = currentReq.id;
    if (avatar) avatar.textContent = getInitials(currentReq.studentName);
    if (nameEl) nameEl.textContent = currentReq.studentName;
    if (metaEl) metaEl.textContent = `${currentReq.studentRoll || 'N/A'} · ${currentReq.department || 'Engineering'}`;
    if (timestampEl) timestampEl.textContent = `Submitted ${currentReq.submittedDate || 'Recent'} at ${currentReq.submittedTime || '09:00 am'}`;
    if (purposeEl) {
        let purposeText = currentReq.purpose || 'Laboratory Project';
        if (currentReq.comment) {
            purposeText += `\n\n[Teacher Comment]: ${currentReq.comment}`;
        }
        purposeEl.textContent = purposeText;
    }
    if (requiredDate) requiredDate.textContent = currentReq.dueDate || '20 Aug 2026';

    function updateBadge(status) {
        if (!statusBadge) return;
        const s = (status || '').toLowerCase();
        let cls = 'badge-pending';
        if (s === 'approved') cls = 'badge-approved';
        else if (s === 'rejected') cls = 'badge-rejected';
        else if (s === 'completed') cls = 'badge-completed';

        statusBadge.className = `status-pill ${cls}`;
        statusBadge.textContent = status;
    }
    updateBadge(currentReq.status || 'Pending');

    // Populate requested components list
    const compContainer = document.getElementById('componentsList');
    if (compContainer) {
        compContainer.innerHTML = '';
        const items = currentReq.items || [];
        items.forEach(comp => {
            const row = document.createElement('div');
            row.className = 'component-row';

            const safeName = escapeHtml(comp.name);
            const reqQty = comp.qty || 1;
            const available = (comp.available !== undefined) ? comp.available : 10;
            const rack = escapeHtml(comp.rack || 'Rack A-1');
            const compStatus = comp.status || (available > 0 ? 'Available' : 'Out of Stock');
            const availClass = (compStatus.toLowerCase() === 'available') ? 'badge-available' : 'badge-low';

            row.innerHTML = `
                <div class="comp-info">
                    <span class="comp-title">${safeName}</span>
                    <span class="comp-meta">Requested: ${reqQty} · Available: ${available} · ${rack}</span>
                </div>
                <div class="comp-badge">
                    <span class="badge ${availClass}">${escapeHtml(compStatus)}</span>
                </div>
            `;
            compContainer.appendChild(row);
        });
    }

    // Adjust button availability if already completed/approved/rejected
    const actions = document.getElementById('reviewActions');
    if (actions) {
        const s = (currentReq.status || '').toLowerCase();
        if (s === 'approved' || s === 'rejected' || s === 'completed') {
            actions.innerHTML = `
                <div style="padding: 14px 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; text-align: center; color: #475569; font-weight: 500;">
                    This request was marked as <strong>${escapeHtml(currentReq.status)}</strong>.
                </div>
            `;
        }
    }

    /**
     * Handles decision approval/rejection with optional teacher comment.
     * @param {string} decision - 'Approved' or 'Rejected'
     */
    function handleDecision(decision) {
        let comment = '';
        if (decision === 'Rejected') {
            comment = window.prompt(`Please enter the rejection reason for ${currentReq.studentName}:`, 'Component not available for this project duration');
            if (comment === null) return; // user cancelled prompt
        } else {
            const addComment = window.prompt(`Optional approval note for ${currentReq.studentName} (e.g. collection instructions):`, 'Approved for collection from Tinkering Lab counter');
            if (addComment !== null) {
                comment = addComment;
            }
        }

        // Update currentReq object
        currentReq.status = decision;
        currentReq.comment = comment.trim();

        // Update in shared storage
        const allReqs = (typeof getRequests === 'function') ? getRequests() : [];
        const idx = allReqs.findIndex(r => r.id && r.id.toLowerCase() === currentReq.id.toLowerCase());
        if (idx !== -1) {
            allReqs[idx].status = decision;
            allReqs[idx].comment = comment.trim();
            if (typeof saveRequests === 'function') {
                saveRequests(allReqs);
            }
        }

        // Update UI badge and review action area
        updateBadge(decision);

        if (purposeEl) {
            let purposeText = currentReq.purpose || 'Laboratory Project';
            if (currentReq.comment) {
                purposeText += `\n\n[Teacher Comment]: ${currentReq.comment}`;
            }
            purposeEl.textContent = purposeText;
        }

        if (actions) {
            actions.innerHTML = `
                <div style="padding: 14px 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; text-align: center; color: #475569; font-weight: 500;">
                    Request successfully marked as <strong>${escapeHtml(decision)}</strong>. Status updated in storage.
                </div>
            `;
        }

        if (decision === 'Approved') {
            showToast(`Request ${currentReq.id} has been Approved! Allocation saved.`, true);
        } else {
            showToast(`Request ${currentReq.id} has been Rejected with comment saved.`, false);
        }
    }

    let toastTimer = null;
    function showToast(msg, isSuccess = true) {
        const toast = document.getElementById('toastNotice');
        const icon = document.getElementById('toastIcon');
        const msgEl = document.getElementById('toastMessage');
        if (!toast || !msgEl) return;

        msgEl.textContent = msg;
        if (icon) {
            icon.style.background = isSuccess ? '#10b981' : '#ef4444';
        }
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    const rejectBtn = document.getElementById('btnReject');
    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => handleDecision('Rejected'));
    }

    const approveBtn = document.getElementById('btnApprove');
    if (approveBtn) {
        approveBtn.addEventListener('click', () => handleDecision('Approved'));
    }
});
