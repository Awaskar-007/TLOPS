/**
 * teacher-dashboard.js - Teacher & Lab Admin Dashboard Controller
 * 
 * Formats and displays the live university laboratory header date.
 */

document.addEventListener('DOMContentLoaded', () => {
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
});
