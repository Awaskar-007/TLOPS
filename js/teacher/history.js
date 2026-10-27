/**
 * teacher-history.js - Historical Requests Audit Controller
 * 
 * Dynamically displays all historical requests from shared localStorage,
 * provides clickable status filter pills (All, Pending, Approved, Rejected, Completed),
 * and real-time live search across requests and student names.
 */

document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.querySelector('.history-table tbody');
    const pills = document.querySelectorAll('.filter-pill');
    const searchInput = document.querySelector('.search-input');

    let currentFilter = 'All';

    // Helper: returns badge CSS class according to status
    function getStatusBadgeClass(status) {
        const s = (status || '').toLowerCase();
        if (s === 'approved') return 'badge-approved';
        if (s === 'rejected') return 'badge-rejected';
        if (s === 'completed') return 'badge-completed';
        return 'badge-pending';
    }

    /**
     * Renders history table rows from shared requests array.
     */
    function renderHistoryTable() {
        if (!tbody) return;

        const requests = (typeof getRequests === 'function') ? getRequests() : [];

        tbody.innerHTML = '';

        if (requests.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 32px; color: #64748b;">No historical records found.</td></tr>`;
            return;
        }

        requests.forEach(req => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', req.id);
            tr.setAttribute('data-status', (req.status || 'Pending').toLowerCase());

            const safeId = escapeHtml(req.id);
            const safeName = escapeHtml(req.studentName || 'Student');
            const safeRoll = escapeHtml(req.studentRoll || 'N/A');
            const safeDate = escapeHtml(req.submittedDate || 'Recent');
            const safeStatus = escapeHtml(req.status || 'Pending');
            const badgeClass = getStatusBadgeClass(req.status);

            const items = req.items || [];
            const compNames = items.map(i => i.name).join(', ') || 'Custom Component';
            const safeCompNames = escapeHtml(compNames);

            tr.innerHTML = `
                <td><span class="req-id">${safeId}</span></td>
                <td>
                    <div class="student-col">
                        <span class="student-name">${safeName}</span>
                        <span class="student-roll">${safeRoll}</span>
                    </div>
                </td>
                <td><span class="comp-list">${safeCompNames}</span></td>
                <td><span class="req-date">${safeDate}</span></td>
                <td><span class="badge ${badgeClass}">${safeStatus}</span></td>
                <td><a href="review-request.html?id=${encodeURIComponent(safeId)}&from=history" class="view-link">View &rarr;</a></td>
            `;

            tbody.appendChild(tr);
        });

        applyFilters();
    }

    /**
     * Filters table rows based on active pill and search query.
     */
    function applyFilters() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const rows = document.querySelectorAll('.history-table tbody tr');

        rows.forEach(row => {
            const rowText = row.textContent.toLowerCase();
            const badge = row.querySelector('.badge');
            const badgeText = badge ? badge.textContent.trim().toLowerCase() : '';

            const matchesPill = (currentFilter.toLowerCase() === 'all') || (badgeText === currentFilter.toLowerCase());
            const matchesSearch = !query || rowText.includes(query);

            row.style.display = (matchesPill && matchesSearch) ? '' : 'none';
        });
    }

    // Pill click listeners
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilter = pill.textContent.trim();
            applyFilters();
        });
    });

    // Search input listener
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            applyFilters();
        });
    }

    renderHistoryTable();
});
