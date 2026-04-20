/**
 * Amrit Sparsh – Patient Status Panel
 * Fully dynamic version connected to backend
 */

const API_BASE = "http://127.0.0.1:8000";

// DOM Elements
const tableBody = document.getElementById("patient-table-body");
const searchInput = document.getElementById("patient-search");
const searchDropdown = document.getElementById("search-dropdown");
const searchClear = document.getElementById("search-clear");
const mdrToggle = document.getElementById("mdr-toggle");
const filterStatus = document.getElementById("filter-status");

let allPatients = [];
let deletedPatients = JSON.parse(localStorage.getItem("deleted_patient_ids") || "[]");
let isFilterActive = false;

/* -------------------------------------------------------------
   1. Fetch Patients On Load
--------------------------------------------------------------*/
document.addEventListener("DOMContentLoaded", async () => {
    await loadPatients();
    renderTable(allPatients);
});

/* -------------------------------------------------------------
   2. Fetch from Backend
--------------------------------------------------------------*/
async function loadPatients() {
    try {
        const res = await fetch(`${API_BASE}/patients`);
        allPatients = await res.json();

        // Normalize for UI & Filter Deleted
        allPatients = allPatients.filter(p => !deletedPatients.includes(p.id));

        allPatients.forEach(p => {
            const mdr = p.mdr_details || {};
            const riskScore = parseFloat(mdr.mdr_spread_risk || 0);

            // Strict High Risk Filter
            p.isMDR = (riskScore >= 6) || ["Critical", "High"].includes(mdr.mdr_status);
        });
    } catch (e) {
        console.error("Error loading patients:", e);
        alert("Unable to fetch patient data from backend");
    }
}

/* -------------------------------------------------------------
   3. Build Table Rows
--------------------------------------------------------------*/
function renderTable(patients) {
    tableBody.innerHTML = "";

    if (!patients.length) {
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-5">No patients found</td></tr>`;
        return;
    }

    patients.forEach(p => {
        const mdr = p.mdr_details || {};
        const astSummary = calculateAST(mdr.ast_panel);
        const resistanceHTML = buildResistanceMarkers(mdr);

        const row = document.createElement("tr");
        row.setAttribute("data-mdr", p.isMDR);

        row.innerHTML = `
            <td class="room-bed">${p.ward || "-"}</td>

            <td class="patient-info">
                <span class="patient-name">${p.full_name}</span>
                <div class="patient-meta">${p.gender}, ${p.age} yrs</div>
                <div class="patient-meta">Adm: ${p.admission_date} ${p.admission_time}</div>
                <span class="sample-badge">${mdr.sample_id || "Routine"}</span>
            </td>

            <td class="doctor-info">${p.assigned_doctor || "-"}</td>

            <td>
                ${buildMDRBadge(mdr.mdr_status)}
                ${resistanceHTML}
            </td>

            <td class="infection-site">
                ${mdr.infection_site || "None"}
                <br>
                <span style="font-size: 11px; color: #666;">
                    ${mdr.infection_source || ""}
                </span>
            </td>

            <td>
                ${buildRiskScore(mdr.mdr_spread_risk)}
                <div class="ast-summary">${astSummary}</div>
            </td>

            <td class="notes-cell">${mdr.clinical_notes || "-"}</td>

            <td>
                <button class="btn-delete" onclick="deletePatient(${p.id})">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    applyFilter();
}

/* -------------------------------------------------------------
   4. Helpers – UI Components
--------------------------------------------------------------*/

function buildMDRBadge(status) {
    if (!status) return `<span class="status-badge status-clear">Not Detected</span>`;

    const cls =
        status === "Critical" ? "status-critical" :
            status === "High" ? "status-high" :
                status === "Moderate" ? "status-moderate" :
                    status === "Low" ? "status-low" :
                        "status-clear";

    return `<span class="status-badge ${cls}">${status}</span>`;
}

function buildRiskScore(value) {
    const score = parseFloat(value || 0);
    let cls =
        score >= 8 ? "critical" :
            score >= 6 ? "high" :
                score >= 4 ? "moderate" :
                    score >= 1 ? "low" :
                        "clear";

    return `
        <div class="risk-score-container">
            <div class="risk-score-bar">
                <div class="risk-score-fill ${cls}" style="width:${score * 10}%;"></div>
            </div>
            <span class="risk-score-value">${score}/10</span>
        </div>
    `;
}

function buildResistanceMarkers(mdr) {
    if (!mdr) return "";

    const markers = [];

    if (mdr.esbl_markers) markers.push(...mdr.esbl_markers.split(","));
    if (mdr.carbapenemase) markers.push(...mdr.carbapenemase.split(","));
    if (mdr.mrsa_marker) markers.push(mdr.mrsa_marker);
    if (mdr.vre_markers) markers.push(...mdr.vre_markers.split(","));

    if (!markers.length) return "";

    return `
        <div class="resistance-markers">
            ${markers
            .map(m => `<span class="marker-pill">${m.trim()}</span>`)
            .join("")}
        </div>
    `;
}

function calculateAST(astPanel) {
    if (!astPanel || !astPanel.length) return "No AST available";

    let S = 0, I = 0, R = 0;
    astPanel.forEach(a => {
        if (a.result === "S") S++;
        if (a.result === "I") I++;
        if (a.result === "R") R++;
    });

    return `S:${S} I:${I} R:${R}`;
}

/* -------------------------------------------------------------
   5. MDR FILTER LOGIC
--------------------------------------------------------------*/
mdrToggle.addEventListener("click", () => {
    isFilterActive = !isFilterActive;

    if (isFilterActive) {
        mdrToggle.classList.add("active");
        filterStatus.textContent = "ON";
        filterStatus.classList.add("active");
    } else {
        mdrToggle.classList.remove("active");
        filterStatus.textContent = "OFF";
        filterStatus.classList.remove("active");
    }

    applyFilter();
});

function applyFilter() {
    const rows = tableBody.querySelectorAll("tr");

    rows.forEach(r => {
        const isMDR = r.getAttribute("data-mdr") === "true";
        r.style.display = (!isFilterActive || isMDR) ? "" : "none";
    });
}

/* -------------------------------------------------------------
   6. SEARCH ENGINE
--------------------------------------------------------------*/
searchInput?.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
        renderTable(allPatients);
        searchClear.classList.remove("visible");
        searchDropdown.classList.remove("visible");
        return;
    }

    searchClear.classList.add("visible");

    const filtered = allPatients.filter(p =>
        p.full_name.toLowerCase().includes(query) ||
        (p.ward || "").toLowerCase().includes(query) ||
        (p.assigned_doctor || "").toLowerCase().includes(query) ||
        (p.mdr_details?.sample_id || "").toLowerCase().includes(query)
    );

    renderTable(filtered);

    buildSearchDropdown(filtered, query);
});

function buildSearchDropdown(matches, query) {
    searchDropdown.innerHTML = "";

    if (!matches.length) {
        searchDropdown.classList.add("visible");
        searchDropdown.innerHTML =
            `<div class='search-empty'>No matching patients found</div>`;
        return;
    }

    matches.slice(0, 6).forEach(p => {
        const div = document.createElement("div");
        div.className = "search-result-item";
        div.innerHTML = `
            <div class="search-result-room">${p.ward}</div>

            <div class="search-result-info">
                <div class="search-result-name">
                    ${highlight(p.full_name, query)}
                </div>
                <div class="search-result-meta">
                    ${p.gender}, ${p.age} yrs | ${p.assigned_doctor}
                </div>
            </div>

            <div class="search-result-badges">
                <div class="search-result-mdr-badge">${p.isMDR ? "MDR+" : "Clear"}</div>
                <div class="search-result-sample">${p.mdr_details?.sample_id || "-"}</div>
            </div>
        `;

        div.addEventListener("click", () => {
            scrollToRow(p.ward);
            searchDropdown.classList.remove("visible");
        });

        searchDropdown.appendChild(div);
    });

    searchDropdown.classList.add("visible");
}

function highlight(text, q) {
    const reg = new RegExp(`(${q})`, "gi");
    return text.replace(reg, `<span class="highlight">$1</span>`);
}

searchClear?.addEventListener("click", () => {
    searchInput.value = "";
    searchClear.classList.remove("visible");
    searchDropdown.classList.remove("visible");
    renderTable(allPatients);
});

/* -------------------------------------------------------------
   7. Scroll to Patient Row
--------------------------------------------------------------*/
function scrollToRow(room) {
    const rows = tableBody.querySelectorAll("tr");

    rows.forEach(r => {
        if (r.children[0].textContent === room) {
            r.scrollIntoView({ behavior: "smooth", block: "center" });
            r.style.background = "#FFF3CD";

            setTimeout(() => (r.style.background = ""), 2000);
        }
    });
}
/* -------------------------------------------------------------
   8. DELETE PATIENT (Frontend Only)
--------------------------------------------------------------*/
window.deletePatient = function (id) {
    if (confirm("Are you sure you want to delete this patient? This will hide them from your view.")) {
        deletedPatients.push(id);
        localStorage.setItem("deleted_patient_ids", JSON.stringify(deletedPatients));

        // Remove from local array and re-render
        allPatients = allPatients.filter(p => p.id !== id);
        renderTable(allPatients);
    }
};

/* -------------------------------------------------------------
   9. REAL-TIME CLOCK
--------------------------------------------------------------*/
function updateClock() {
    const now = new Date();

    // Format Date: January 15, 2025
    const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', dateOptions);

    // Format Time: 14:30:45 hrs
    const timeString = now.toLocaleTimeString('en-US', { hour12: false }) + " hrs";

    const dateEl = document.getElementById("current-date");
    const timeEl = document.getElementById("current-time");

    if (dateEl) dateEl.textContent = dateString;
    if (timeEl) timeEl.textContent = timeString;
}

// Start Clock
setInterval(updateClock, 1000);
updateClock();
