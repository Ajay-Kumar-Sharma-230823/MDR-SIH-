// MDR QuantumMesh - National Command Center Logic

const hospitals = [
    { id: 'h1', name: 'City General Hospital', type: 'Govt', risk: 'high', cases: 142, beds: 5, lat: 20, lng: 30 },
    { id: 'h2', name: 'Apollo Spectra', type: 'Pvt', risk: 'low', cases: 12, beds: 45, lat: 60, lng: 70 },
    { id: 'h3', name: 'Max Super Speciality', type: 'Pvt', risk: 'med', cases: 45, beds: 18, lat: 40, lng: 80 },
    { id: 'h4', name: 'AIIMS Trauma Center', type: 'Govt', risk: 'critical', cases: 89, beds: 0, lat: 70, lng: 20 },
    { id: 'h5', name: 'Fortis Escorts', type: 'Pvt', risk: 'low', cases: 8, beds: 32, lat: 30, lng: 60 },
    { id: 'h6', name: 'Safdarjung Hospital', type: 'Govt', risk: 'high', cases: 110, beds: 2, lat: 80, lng: 40 }
];

const alerts = [
    { type: 'critical', msg: 'OUTBREAK ALERT: Zone C reporting 5 new NDM-1 cases.', time: 'Just now' },
    { type: 'info', msg: 'TRANSFER: Patient #4928 moved to Apollo Spectra.', time: '2 mins ago' },
    { type: 'warning', msg: 'LOAD WARNING: AIIMS Trauma Center at 98% ICU capacity.', time: '5 mins ago' },
    { type: 'info', msg: 'LAB SYNC: 420 new reports processed successfully.', time: '10 mins ago' }
];

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    renderSidebar();
    renderAlerts();
    setupModal();
    startSimulation();
});

// 1. MAP VISUALIZATION
function initMap() {
    const mapContainer = document.getElementById('networkMap');

    hospitals.forEach(h => {
        const node = document.createElement('div');
        node.className = `hospital-node risk-${h.risk}`;
        node.style.left = `${h.lat}%`;
        node.style.top = `${h.lng}%`;
        node.style.width = `${30 + (h.cases / 5)}px`; // Size based on cases
        node.style.height = `${30 + (h.cases / 5)}px`;

        node.innerHTML = `
            <div class="node-ring"></div>
            ${h.risk === 'critical' || h.risk === 'high' ? '<div class="node-pulse"></div>' : ''}
            <i class="fas fa-hospital" style="color: ${getRiskColor(h.risk)}; font-size: 0.8rem;"></i>
        `;

        // Hover Tooltip
        node.title = `${h.name} (${h.cases} Active Cases)`;

        node.addEventListener('click', () => openCommandCard(h));

        mapContainer.appendChild(node);
    });

    drawConnections();
}

function drawConnections() {
    // Simplified connection drawing logic (visual only)
    const mapContainer = document.getElementById('networkMap');
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.position = 'absolute';
    svg.style.top = 0;
    svg.style.left = 0;
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';

    // Draw some random connections
    const connections = [
        [0, 1], [0, 3], [1, 2], [3, 5], [4, 2], [5, 0]
    ];

    connections.forEach(pair => {
        const h1 = hospitals[pair[0]];
        const h2 = hospitals[pair[1]];

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", `${h1.lat}%`);
        line.setAttribute("y1", `${h1.lng}%`);
        line.setAttribute("x2", `${h2.lat}%`);
        line.setAttribute("y2", `${h2.lng}%`);
        line.setAttribute("stroke", "rgba(0, 102, 255, 0.1)");
        line.setAttribute("stroke-width", "1");
        line.setAttribute("stroke-dasharray", "5,5");

        // Animate line
        const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        animate.setAttribute("attributeName", "stroke-dashoffset");
        animate.setAttribute("from", "100");
        animate.setAttribute("to", "0");
        animate.setAttribute("dur", "2s");
        animate.setAttribute("repeatCount", "indefinite");

        line.appendChild(animate);
        svg.appendChild(line);
    });

    mapContainer.appendChild(svg);
}

function getRiskColor(risk) {
    if (risk === 'low') return '#10b981';
    if (risk === 'med') return '#f59e0b';
    if (risk === 'high') return '#ef4444';
    return '#7f1d1d';
}

// 2. SIDEBAR
function renderSidebar() {
    const list = document.getElementById('hospitalList');
    list.innerHTML = '';

    hospitals.forEach(h => {
        const item = document.createElement('div');
        item.className = 'hospital-list-item';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-weight: 600; font-size: 0.9rem;">${h.name}</span>
                <span class="h-tag tag-${h.type.toLowerCase()}">${h.type}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b;">
                <span><i class="fas fa-procedures"></i> ${h.beds} Beds</span>
                <span style="color: ${getRiskColor(h.risk)}; font-weight: 600;">${h.risk.toUpperCase()} RISK</span>
            </div>
        `;
        item.addEventListener('click', () => openCommandCard(h));
        list.appendChild(item);
    });
}

// 3. ALERTS
function renderAlerts() {
    const feed = document.getElementById('alertsFeed');
    feed.innerHTML = '';

    alerts.forEach(a => {
        const item = document.createElement('div');
        item.className = `alert-item alert-${a.type}`;
        item.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 2px;">${a.msg}</div>
            <div style="font-size: 0.7rem; color: #64748b;">${a.time}</div>
        `;
        feed.appendChild(item);
    });
}

// 4. MODAL & AI
function setupModal() {
    const modal = document.getElementById('commandModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const tabs = document.querySelectorAll('.cc-tab');

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            // Hide all tab content
            document.getElementById('tab-analytics').style.display = 'none';
            document.getElementById('tab-load').style.display = 'none';

            // Show selected tab content
            const targetId = `tab-${tab.dataset.tab}`;
            const targetEl = document.getElementById(targetId);
            if (targetEl) targetEl.style.display = 'block';
        });
    });
}

function openCommandCard(hospital) {
    const modal = document.getElementById('commandModal');
    document.getElementById('modalHospitalName').textContent = hospital.name;

    // Reset to first tab
    document.querySelector('.cc-tab[data-tab="analytics"]').click();

    // Render AI Recommendations (Mock)
    renderAIRecommendations();

    modal.style.display = 'flex';
}

function renderAIRecommendations() {
    const container = document.getElementById('aiRecommendations');
    container.innerHTML = `
        <div class="ai-rec-card">
            <div class="ai-badge">98% MATCH</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="font-weight: 700; color: #1e293b;">Apollo Spectra</div>
                <div style="font-size: 0.8rem; color: #10b981; font-weight: 600;">LOW RISK</div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.8rem; color: #64748b; margin-bottom: 10px;">
                <div><i class="fas fa-map-marker-alt"></i> 5.2 km away</div>
                <div><i class="fas fa-bed"></i> 45 Beds Avail</div>
                <div><i class="fas fa-user-md"></i> Staff: High</div>
                <div><i class="fas fa-flask"></i> Lab: Normal</div>
            </div>
            <button style="width: 100%; padding: 8px; border: 1px solid #0066ff; color: #0066ff; background: white; border-radius: 6px; font-weight: 600; cursor: pointer;">Select for Transfer</button>
        </div>
        
        <div class="ai-rec-card" style="margin-top: 10px;">
            <div class="ai-badge" style="background: #64748b; box-shadow: none;">85% MATCH</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="font-weight: 700; color: #1e293b;">Fortis Escorts</div>
                <div style="font-size: 0.8rem; color: #10b981; font-weight: 600;">LOW RISK</div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.8rem; color: #64748b; margin-bottom: 10px;">
                <div><i class="fas fa-map-marker-alt"></i> 8.4 km away</div>
                <div><i class="fas fa-bed"></i> 32 Beds Avail</div>
            </div>
            <button style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; color: #64748b; background: white; border-radius: 6px; font-weight: 600; cursor: pointer;">Select for Transfer</button>
        </div>
    `;
}

// 5. SIMULATION
function startSimulation() {
    setInterval(() => {
        // Randomly update a status value to make it feel live
        const randomHospital = hospitals[Math.floor(Math.random() * hospitals.length)];
        // In a real app, this would fetch live data
    }, 3000);
}