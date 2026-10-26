/**
 * teacher-requests.js - Teacher Requests Review Queue Controller
 * 
 * Loads pending student requests from localStorage, renders interactive cards,
 * and provides live search filtering for lab administrators.
 */

document.addEventListener('DOMContentLoaded', () => {
    try {
        const custom = getData('tinkerlab_custom_requests', []);
        const pendingCustom = custom.filter(r => (r.status || 'Pending').toLowerCase() === 'pending');
        const list = document.querySelector('.requests-list');
        const subtitle = document.querySelector('.page-subtitle');

        if (pendingCustom.length > 0 && subtitle) {
            subtitle.textContent = `${3 + pendingCustom.length} requests awaiting review`;
        }

        /**
         * Extracts 2-letter uppercase initials from student name.
         * @param {string} name - Student name.
         * @returns {string} Initials.
         */
        function getInitials(name) {
            if (!name) return 'ST';
            const parts = name.trim().split(/\s+/);
            if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            return name.substring(0, 2).toUpperCase();
        }

        // Render each custom pending request as a review card
        if (list) {
            pendingCustom.forEach(req => {
                const card = document.createElement('div');
                card.className = 'request-card';
                card.innerHTML = `
                    <div class="card-left">
                        <div class="student-avatar">${getInitials(req.studentName || 'Arjun Sharma')}</div>
                        <div class="student-details">
                            <div class="student-header">
                                <span class="student-name">${req.studentName || 'Arjun Sharma'}</span>
                                <span class="separator">·</span>
                                <span class="student-roll">${req.studentRoll || 'CS21B001'}</span>
                            </div>
                            <div class="student-dept">${req.studentDept || 'Computer Science'}</div>
                            <div class="component-pills">
                                <span class="comp-pill">${req.componentName} &times;${req.quantity || 1}</span>
                                <span class="comp-pill" style="background:#fef3c7; color:#92400e; border:1px solid #fde68a; font-weight:600;">Unlisted Special Order</span>
                            </div>
                            <p class="project-quote">&ldquo;${req.purpose}&rdquo;</p>
                        </div>
                    </div>
                    <div class="card-right">
                        <span class="badge-pending">Pending</span>
                        <span class="request-date">${req.submitted}</span>
                        <span class="due-date">Due ${req.due || '—'}</span>
                        <a href="review-request.html?id=${req.id}&from=requests" class="btn-review">Review</a>
                    </div>
                `;
                if (list.firstChild) {
                    list.insertBefore(card, list.firstChild);
                } else {
                    list.appendChild(card);
                }
            });
        }

        // Live search filter across all request cards
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const q = e.target.value.toLowerCase().trim();
                document.querySelectorAll('.request-card').forEach(c => {
                    c.style.display = c.textContent.toLowerCase().includes(q) ? 'flex' : 'none';
                });
            });
        }
    } catch (e) {
        console.error('[teacher-requests.js] Error initializing requests queue:', e);
    }
});
