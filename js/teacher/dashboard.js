/**
 * teacher-dashboard.js - Teacher & Lab Admin Dashboard Controller
 * 
 * Formats live university date header and dynamically updates
 * KPI stat cards and pending requests panel from shared localStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Live Header Date
    const dashboardDateLabel = document.getElementById('dashboardDateLabel');
    if (dashboardDateLabel) {
        const now = new Date();
        const formattedDate = new Intl.DateTimeFormat('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(now);

        dashboardDateLabel.textContent = `${formattedDate} · BML MUNJAL TINKERING LAB`;
    }

    // 2. Dynamic KPI Counts & Pending Queue from localStorage
    const requests = (typeof getRequests === 'function') ? getRequests() : [];
    const inventory = (typeof getInventory === 'function') ? getInventory() : [];

    const pendingCount = requests.filter(r => (r.status || 'Pending').toLowerCase() === 'pending').length;
    const approvedCount = requests.filter(r => (r.status || '').toLowerCase() === 'approved').length;
    const rejectedCount = requests.filter(r => (r.status || '').toLowerCase() === 'rejected').length;
    const totalComponents = inventory.length;
    const lowStockCount = inventory.filter(c => (c.qty > 0 && c.qty <= (c.minThreshold || 5))).length;
    const outOfStockCount = inventory.filter(c => (c.qty <= 0)).length;

    // Update stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        const labelEl = card.querySelector('.stat-label');
        const valEl = card.querySelector('.stat-value');
        if (!labelEl || !valEl) return;

        const label = labelEl.textContent.trim().toLowerCase();
        if (label === 'pending requests') {
            valEl.textContent = pendingCount;
        } else if (label === 'approved') {
            valEl.textContent = approvedCount;
        } else if (label === 'rejected') {
            valEl.textContent = rejectedCount;
        } else if (label === 'total components') {
            valEl.textContent = totalComponents;
        } else if (label === 'low stock') {
            valEl.textContent = lowStockCount;
        } else if (label === 'out of stock') {
            valEl.textContent = outOfStockCount;
        }
    });

    // Update Pending Requests Panel List
    const pendingListPanel = document.querySelector('.requests-panel .panel-list');
    if (pendingListPanel) {
        const pendingRequests = requests.filter(r => (r.status || 'Pending').toLowerCase() === 'pending').slice(0, 3);
        pendingListPanel.innerHTML = '';

        if (pendingRequests.length === 0) {
            pendingListPanel.innerHTML = `
                <div style="padding: 24px; text-align: center; color: #64748b; font-size: 14px;">
                    No pending requests awaiting review.
                </div>
            `;
        } else {
            pendingRequests.forEach(req => {
                const safeName = escapeHtml(req.studentName || 'Student');
                const safeRoll = escapeHtml(req.studentRoll ? `(${req.studentRoll})` : '');
                const safeDate = escapeHtml(req.submittedDate || 'Recent');
                const safeDept = escapeHtml(req.department || 'Engineering');
                const safeId = escapeHtml(req.id);

                const compNames = (req.items || []).map(i => i.name).join(', ') || 'Custom Component';
                const safeCompNames = escapeHtml(compNames);

                const card = document.createElement('div');
                card.className = 'request-item-card';
                card.innerHTML = `
                    <div class="item-left">
                        <div class="item-icon-box hourglass-box">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M5 22h14"></path>
                                <path d="M5 2h14"></path>
                                <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path>
                                <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
                            </svg>
                        </div>
                        <div class="item-details">
                            <div class="student-heading">
                                <span class="student-name">${safeName}</span>
                                <span class="student-roll">${safeRoll}</span>
                            </div>
                            <div class="component-text">${safeCompNames}</div>
                            <div class="meta-text">${safeDate} &middot; ${safeDept}</div>
                        </div>
                    </div>
                    <div class="item-right">
                        <a href="review-request.html?id=${encodeURIComponent(safeId)}&from=dashboard" class="review-link">Review &rarr;</a>
                    </div>
                `;
                pendingListPanel.appendChild(card);
            });
        }
    }
});
