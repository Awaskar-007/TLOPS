/**
 * review-request.js - Request Review & Approval Controller
 * 
 * Loads detailed student borrowing requests by ID from URL query parameters,
 * handles one-click Approve / Reject decisions, updates request state in localStorage,
 * and gives real-time visual feedback via toasts and status badges.
 */

const REQUEST_DATABASE = {
    'req001': {
        id: 'req001',
        studentName: 'Arjun Sharma',
        studentRoll: 'CS21B001',
        department: 'Computer Science',
        submitted: '14 Aug 2026 at 09:15 am',
        status: 'Pending',
        components: [
            { name: 'Arduino Uno R3', requested: 2, available: 18, rack: 'Rack A-1', status: 'Available' },
            { name: 'HC-SR04 Ultrasonic Sensor', requested: 3, available: 35, rack: 'Rack B-1', status: 'Available' }
        ],
        purpose: 'Final year project: Obstacle avoidance robot',
        requiredBy: '20 Aug 2026'
    },
    'req002': {
        id: 'req002',
        studentName: 'Priya Nair',
        studentRoll: 'EC21B014',
        department: 'Electronics & Communication',
        submitted: '14 Aug 2026 at 10:45 am',
        status: 'Pending',
        components: [
            { name: 'ESP32 Dev Board', requested: 1, available: 24, rack: 'Rack A-3', status: 'Available' },
            { name: 'NRF24L01 RF Module', requested: 2, available: 12, rack: 'Rack C-2', status: 'Available' }
        ],
        purpose: 'IoT Smart Home project for mini project exhibition',
        requiredBy: '22 Aug 2026'
    },
    'req003': {
        id: 'req003',
        studentName: 'Rahul Mehta',
        studentRoll: 'ME21B007',
        department: 'Mechanical Engineering',
        submitted: '13 Aug 2026 at 03:20 pm',
        status: 'Pending',
        components: [
            { name: 'SG90 Servo Motor', requested: 2, available: 0, rack: 'Rack D-1', status: 'Out of Stock' },
            { name: 'L298N Motor Driver', requested: 1, available: 15, rack: 'Rack B-2', status: 'Available' }
        ],
        purpose: 'Robotics arm gripper mechanism',
        requiredBy: '19 Aug 2026'
    },
    'req004': {
        id: 'req004',
        studentName: 'Sneha Kulkarni',
        studentRoll: 'CS21B023',
        department: 'Computer Science',
        submitted: '12 Aug 2026 at 11:10 am',
        status: 'Approved',
        components: [
            { name: 'Raspberry Pi 4 Model B', requested: 1, available: 6, rack: 'Rack A-2', status: 'Available' }
        ],
        purpose: 'Edge AI inference testing for smart attendance system',
        requiredBy: '25 Aug 2026'
    },
    'req005': {
        id: 'req005',
        studentName: 'Vikram Joshi',
        studentRoll: 'EE21B009',
        department: 'Electrical Engineering',
        submitted: '10 Aug 2026 at 02:40 pm',
        status: 'Completed',
        components: [
            { name: 'INA219 Current Sensor', requested: 2, available: 8, rack: 'Rack C-1', status: 'Available' }
        ],
        purpose: 'Solar inverter efficiency monitoring benchmark',
        requiredBy: '17 Aug 2026'
    },
    'req006': {
        id: 'req006',
        studentName: 'Ananya Deshmukh',
        studentRoll: 'EC21B031',
        department: 'Electronics & Communication',
        submitted: '09 Aug 2026 at 04:15 pm',
        status: 'Rejected',
        components: [
            { name: 'FPGA Spartan-7 Board', requested: 1, available: 2, rack: 'Rack E-1', status: 'Low Stock' }
        ],
        purpose: 'Digital Signal Processing hardware acceleration test',
        requiredBy: '16 Aug 2026'
    },
    'req007': {
        id: 'req007',
        studentName: 'Arjun Sharma',
        studentRoll: 'CS21B001',
        department: 'Computer Science',
        submitted: '08 Aug 2026 at 10:00 am',
        status: 'Completed',
        components: [
            { name: 'Jumper Wires M-M 40pcs', requested: 1, available: 50, rack: 'Rack F-1', status: 'Available' },
            { name: 'Breadboard 830 Points', requested: 1, available: 30, rack: 'Rack F-2', status: 'Available' }
        ],
        purpose: 'Breadboard Prototyping Workshop',
        requiredBy: '13 Aug 2026'
    },
    'req008': {
        id: 'req008',
        studentName: 'Pooja Iyer',
        studentRoll: 'ME21B042',
        department: 'Mechanical Engineering',
        submitted: '05 Aug 2026 at 01:25 pm',
        status: 'Completed',
        components: [
            { name: 'Digital Caliper 150mm', requested: 1, available: 5, rack: 'Tool Cabinet 2', status: 'Available' }
        ],
        purpose: 'Chassis dimensional verification for Formula Student design',
        requiredBy: '08 Aug 2026'
    }
};

let currentReq = null;

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

/**
 * Loads request data based on URL query parameter ?id=... and renders page details.
 */
function loadRequestData() {
    const urlParams = new URLSearchParams(window.location.search);
    const reqId = (urlParams.get('id') || 'req001').toLowerCase();
    const fromParam = (urlParams.get('from') || 'requests').toLowerCase();

    // Check localStorage custom requests first
    const customList = getData('tinkerlab_custom_requests', []);
    let data = customList.find(r => r.id && r.id.toLowerCase() === reqId);

    if (data) {
        // Format custom request structure for review display
        data = {
            id: data.id,
            studentName: data.studentName || 'Arjun Sharma',
            studentRoll: data.studentRoll || 'CS21B001',
            department: data.studentDept || 'Computer Science',
            submitted: data.submitted ? `${data.submitted}` : 'Recently',
            status: data.status || 'Pending',
            components: (data.items || []).map(item => ({
                name: item.name,
                requested: item.qty || 1,
                available: 10,
                rack: item.isUnlisted ? 'Special Order / Direct Allotment' : 'Rack A-2',
                status: item.isUnlisted ? 'Special Order' : 'Available'
            })),
            purpose: data.purpose || 'Component request for lab project',
            requiredBy: data.due || 'Upcoming'
        };
    } else {
        // Fall back to built-in mock database
        data = REQUEST_DATABASE[reqId] || REQUEST_DATABASE['req001'];
    }

    currentReq = data;

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

    // Populate Request Header
    const displayId = document.getElementById('displayReqId');
    if (displayId) displayId.textContent = data.id;
    updateStatusBadge(data.status);

    // Populate Student Card
    const avatar = document.getElementById('studentAvatar');
    const nameEl = document.getElementById('studentName');
    const metaEl = document.getElementById('studentMeta');
    const timestampEl = document.getElementById('studentTimestamp');

    if (avatar) avatar.textContent = getInitials(data.studentName);
    if (nameEl) nameEl.textContent = data.studentName;
    if (metaEl) metaEl.innerHTML = `${data.studentRoll} &middot; ${data.department}`;
    if (timestampEl) timestampEl.textContent = `Submitted ${data.submitted}`;

    // Populate Components List
    const compList = document.getElementById('componentsList');
    if (compList) {
        compList.innerHTML = '';
        data.components.forEach(c => {
            const isAvailable = c.status === 'Available';
            const pillClass = isAvailable ? 'pill-available' : (c.status === 'Low Stock' ? 'pill-low' : 'pill-out');
            const row = document.createElement('div');
            row.className = 'component-row';
            row.innerHTML = `
                <div class="comp-info">
                    <div class="comp-title">${c.name}</div>
                    <div class="comp-sub">Requested: ${c.requested} &middot; Available: ${c.available} &middot; ${c.rack}</div>
                </div>
                <div class="comp-status">
                    <span class="${pillClass}">${c.status}</span>
                </div>
            `;
            compList.appendChild(row);
        });
    }

    // Populate Purpose & Required By
    const purposeText = document.getElementById('purposeText');
    const requiredDate = document.getElementById('requiredDate');
    if (purposeText) purposeText.textContent = data.purpose;
    if (requiredDate) requiredDate.textContent = data.requiredBy;

    // Adjust button availability if already processed
    const actions = document.getElementById('reviewActions');
    if (actions) {
        if (data.status === 'Approved' || data.status === 'Rejected' || data.status === 'Completed') {
            actions.style.opacity = '0.6';
            actions.style.pointerEvents = 'none';
        } else {
            actions.style.opacity = '1';
            actions.style.pointerEvents = 'auto';
        }
    }
}

/**
 * Updates status badge styling and text.
 * @param {string} status - 'Pending', 'Approved', 'Rejected', or 'Completed'.
 */
function updateStatusBadge(status) {
    const badge = document.getElementById('displayReqStatus');
    if (!badge) return;
    badge.textContent = status;
    badge.className = 'badge-status';

    if (status === 'Pending') {
        badge.classList.add('badge-pending');
    } else if (status === 'Approved') {
        badge.classList.add('badge-approved');
    } else if (status === 'Rejected') {
        badge.classList.add('badge-rejected');
    } else {
        badge.classList.add('badge-completed');
    }
}

/**
 * Handles teacher decision to Approve or Reject the active request.
 * @param {string} decision - 'Approved' or 'Rejected'.
 */
function handleDecision(decision) {
    if (!currentReq) return;
    currentReq.status = decision;
    updateStatusBadge(decision);

    // Persist status change to localStorage if this is a custom student request
    try {
        const customList = getData('tinkerlab_custom_requests', []);
        const idx = customList.findIndex(r => r.id === currentReq.id);
        if (idx !== -1) {
            customList[idx].status = decision;
            customList[idx].statusClass = decision === 'Approved' ? 'badge-approved' : 'badge-rejected';
            saveData('tinkerlab_custom_requests', customList);
        }
    } catch (e) {
        console.error('[review-request.js] Error updating decision state:', e);
    }

    const actions = document.getElementById('reviewActions');
    if (actions) {
        actions.style.opacity = '0.6';
        actions.style.pointerEvents = 'none';
    }

    if (decision === 'Approved') {
        showToast(`Request ${currentReq.id} has been Approved! Component allocation saved.`, true);
    } else {
        showToast(`Request ${currentReq.id} has been Rejected. Student will be notified.`, false);
    }
}

let toastTimer = null;
/**
 * Displays a toast alert with custom green check or red cross icon.
 * @param {string} msg - Message to display.
 * @param {boolean} [isSuccess=true] - Whether message indicates success.
 */
function showToast(msg, isSuccess = true) {
    const toast = document.getElementById('toastNotice');
    const icon = document.getElementById('toastIcon');
    const msgEl = document.getElementById('toastMessage');
    if (!toast || !msgEl) return;

    msgEl.textContent = msg;

    if (icon) {
        if (isSuccess) {
            icon.style.color = '#22c55e';
            icon.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
        } else {
            icon.style.color = '#ef4444';
            icon.innerHTML = '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>';
        }
    }

    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// Wire up event listeners upon DOM load
document.addEventListener('DOMContentLoaded', () => {
    loadRequestData();

    // Attach click listeners to Reject & Approve buttons (replaces inline onclick)
    const rejectBtn = document.getElementById('btnReject');
    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => handleDecision('Rejected'));
    }

    const approveBtn = document.getElementById('btnApprove');
    if (approveBtn) {
        approveBtn.addEventListener('click', () => handleDecision('Approved'));
    }
});

// Export functions to window
window.handleDecision = handleDecision;
window.loadRequestData = loadRequestData;
