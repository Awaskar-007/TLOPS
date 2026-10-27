/**
 * teacher-requests.js - Teacher Requests Review Queue Controller
 * 
 * Dynamically displays all pending requests from shared localStorage,
 * provides live student/component search, and routes to review-request.html.
 */

document.addEventListener('DOMContentLoaded', () => {
    const list = document.querySelector('.requests-list');
    const subtitle = document.querySelector('.page-subtitle');
    const searchInput = document.querySelector('.search-input');

    /**
     * Extracts uppercase 2-letter initials from student name.
     */
    function getInitials(name) {
        if (!name) return 'ST';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return parts[0].substring(0, 2).toUpperCase();
    }

    /**
     * Renders all pending request cards dynamically from localStorage.
     */
    function renderTeacherRequests() {
        if (!list) return;

        const requests = (typeof getRequests === 'function') ? getRequests() : [];
        const pending = requests.filter(r => (r.status || 'Pending').toLowerCase() === 'pending');

        if (subtitle) {
            subtitle.textContent = `${pending.length} ${pending.length === 1 ? 'request' : 'requests'} awaiting review`;
        }

        list.innerHTML = '';

        if (pending.length === 0) {
            list.innerHTML = `
                <div class="empty-state" style="padding: 48px; text-align: center; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <p style="color: #64748b; font-size: 15px; margin: 0;">No pending requests at this time. All requests have been reviewed!</p>
                </div>
            `;
            return;
        }

        pending.forEach(req => {
            const card = document.createElement('div');
            card.className = 'request-card';
            card.setAttribute('data-id', req.id);

            const initials = getInitials(req.studentName);
            const safeName = escapeHtml(req.studentName || 'Student');
            const safeRoll = escapeHtml(req.studentRoll || 'N/A');
            const safeDept = escapeHtml(req.department || 'Engineering');
            const safePurpose = escapeHtml(req.purpose || 'Laboratory Project');
            const safeSubDate = escapeHtml(req.submittedDate || 'Recent');
            const safeDueDate = escapeHtml(req.dueDate || '—');
            const safeId = escapeHtml(req.id);

            const items = req.items || [];
            const pillsHtml = items.map(item => {
                return `<span class="comp-pill">${escapeHtml(item.name)} &times;${item.qty || 1}</span>`;
            }).join(' ');

            card.innerHTML = `
                <div class="card-left">
                    <div class="student-avatar">${initials}</div>
                    <div class="student-details">
                        <div class="student-header">
                            <span class="student-name">${safeName}</span>
                            <span class="separator">·</span>
                            <span class="student-roll">${safeRoll}</span>
                        </div>
                        <div class="student-dept">${safeDept}</div>
                        <div class="component-pills">
                            ${pillsHtml}
                        </div>
                        <p class="project-quote">&ldquo;${safePurpose}&rdquo;</p>
                    </div>
                </div>
                <div class="card-right">
                    <span class="badge-pending">Pending</span>
                    <span class="request-date">${safeSubDate}</span>
                    <span class="due-date">Due ${safeDueDate}</span>
                    <a href="review-request.html?id=${encodeURIComponent(safeId)}&from=requests" class="btn-review">Review</a>
                </div>
            `;

            list.appendChild(card);
        });
    }

    // Real-time live search filter across all cards
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            document.querySelectorAll('.request-card').forEach(c => {
                c.style.display = c.textContent.toLowerCase().includes(q) ? 'flex' : 'none';
            });
        });
    }

    renderTeacherRequests();
});
