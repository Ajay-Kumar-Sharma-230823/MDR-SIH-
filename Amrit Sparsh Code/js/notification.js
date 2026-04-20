document.addEventListener('DOMContentLoaded', function () {
    const notificationContainer = document.getElementById('notification-container');
    const bellIcon = document.querySelector('.fa-bell').closest('a');

    // Load the notification dropdown HTML
    fetch('notification-dropdown.html')
        .then(response => response.text())
        .then(html => {
            notificationContainer.innerHTML = html;
            initializeDropdown();
            loadNotifications();
            setInterval(loadNotifications, 10000); // auto refresh every 10 seconds
        })
        .catch(error => {
            console.error('Error loading notification dropdown:', error);
        });

    function initializeDropdown() {
        const dropdown = document.getElementById('notificationDropdown');

        bellIcon.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        document.addEventListener('click', function (e) {
            if (!dropdown.contains(e.target) && !bellIcon.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }

    // Load alerts dynamically
    function loadNotifications() {
        fetch('http://localhost:8000/notifications/', {
            mode: 'cors'
        })
            .then(res => res.json())
            .then(alerts => {
                const notifList = document.getElementById('notif-list');
                const notifCount = document.getElementById('notif-count');

                notifList.innerHTML = "";

                if (alerts.length === 0) {
                    notifList.innerHTML = `
                        <li class="notification-item">
                            <span>No alerts found.</span>
                        </li>
                    `;
                    notifCount.innerText = "0 New";
                    return;
                }

                notifCount.innerText = `${alerts.length} New`;

                alerts.forEach(alert => {
                    notifList.innerHTML += `
                        <li class="notification-item">
                            <div class="patient-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="notification-content">
                                <span class="patient-name">${alert.patient_name}</span>
                                <span class="ward-info">Ward: ${alert.ward}</span>
                            </div>
                            <span class="risk-badge">${alert.risk_level}</span>
                        </li>
                    `;
                });
            })
            .catch(err => {
                console.error("Error fetching notifications:", err);
            });
    }
});
