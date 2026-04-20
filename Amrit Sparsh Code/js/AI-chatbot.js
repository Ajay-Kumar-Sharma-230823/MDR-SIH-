// ----------------------------------------------
//  MEDIMIND AI — BACKEND-INTEGRATED (REWRITTEN, SAFE)
// ----------------------------------------------

// DOM Elements
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatHistory = document.getElementById('chatHistory');

// Logged-in user email
const loggedInEmail = localStorage.getItem("logged_in_email");

// Attach Events
if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });
}

// --------------------------
// SEND MESSAGE TO BACKEND
// --------------------------
async function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    chatInput.value = "";
    showTypingIndicator();

    try {
        const res = await fetch("http://127.0.0.1:8000/chat/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: text,
                user_email: loggedInEmail || null
            })
        });

        removeTypingIndicator();
        const resp = await res.json();

        if (resp.error) {
            appendMessage(resp.error, "ai", "warning");
            return;
        }

        renderAIResponse(resp);

    } catch (e) {
        removeTypingIndicator();
        appendMessage("Server unavailable. Try again.", "ai", "critical");
    }
}

// --------------------------
// RENDER RESPONSE (Unified)
// --------------------------
function renderAIResponse(resp) {

    // ============================================================
    // SAFE NORMALIZATION FIXES (ADDED — NO OLD LOGIC CHANGED)
    // ============================================================

    // Fix 1: Alerts returned directly as an array (backend/ML)
    if (Array.isArray(resp) && resp.length > 0 && resp[0].risk) {
        resp = { alerts: resp };
    }

    // Fix 2: Patients returned directly as an array (backend/ML)
    if (Array.isArray(resp) && resp.length > 0 && resp[0].name) {
        resp = { patients: resp };
    }

    // ------------------------------------------
    // PATIENT DETAILS
    // ------------------------------------------
    if (
        resp.patient &&
        resp.age !== undefined &&
        !resp.mdr_probability &&
        !resp.antibiotic_predictions &&
        !resp.severity_level
    ) {
        let t = `
            <strong>${resp.patient}</strong><br>
            Age: ${resp.age || '-'} | Gender: ${resp.gender || '-'}<br>
            Ward: <b>${resp.ward || '-'}</b><br>
            Doctor: ${resp.doctor || '-'}<br>
            Reason: ${resp.reason || '-'}<br>
            Admission: ${resp.admission_date || '-'}<br><br>
        `;

        if (resp.mdr_details) {
            t += `
                <div class="highlight-text">
                    <b>MDR Status:</b> ${resp.mdr_details.mdr_status || '-'}
                </div>
                Infection Source: ${resp.mdr_details.infection_source || '-'}<br>
                Infection Site: ${resp.mdr_details.infection_site || '-'}<br>
                Severity: ${resp.mdr_details.severity_level || '-'}<br>
                Spread Risk: ${resp.mdr_details.mdr_spread_risk || '-'}<br><br>
            `;
        }

        appendMessage(t, "ai", "warning");
        return;
    }

    // ------------------------------------------
    // LAB REPORTS
    // ------------------------------------------
    if (resp.lab_reports) {
        let t = `<strong>Lab Reports:</strong><br><br>`;

        resp.lab_reports.forEach(r => {
            t += `
                <div class="msg-card">
                    <b>${r.sample_type || '-'}</b> (${r.lab_report_date || '-'})<br>
                    Sample ID: ${r.sample_id || '-'}<br><br>

                    <b>Organism:</b> ${r.organism_detected || '-'}<br>
                    <b>Gram Stain:</b> ${r.gram_stain || '-'}<br>
                    <b>Growth Pattern:</b> ${r.growth_pattern || '-'}<br><br>

                    <b>Infection:</b> ${r.infection_source || '-'} / ${r.infection_site || '-'}<br><br>

                    <b>ESBL:</b> ${r.esbl_markers || '-'}<br>
                    <b>Carbapenemase:</b> ${r.carbapenemase || '-'}<br>
                    <b>MRSA:</b> ${r.mrsa_marker || '-'}<br>
                    <b>VRE:</b> ${r.vre_markers || '-'}<br><br>

                    <b>Severity:</b> ${r.severity_level || '-'}<br>
                    <b>Spread Risk Score:</b> ${r.spread_risk_score || '-'}<br>
                    <b>Antibiotic Failure Prob:</b> ${r.antibiotic_failure_probability || '-'}<br>
                    <b>Predicted Cluster:</b> ${r.predicted_cluster || '-'}<br><br>

                    <b>Notes:</b> ${r.lab_notes || '-'}<br>
                </div><br>
            `;
        });

        appendMessage(t, "ai");
        return;
    }

    // ------------------------------------------
    // AST PANEL
    // ------------------------------------------
    if (resp.ast_panel) {
        let t = `<strong>AST Panel:</strong><br><br>`;

        resp.ast_panel.forEach(a => {
            t += `
                <div class="msg-card">
                    <b>${a.antibiotic || '-'}</b> — Result: ${a.result || '-'}
                </div>
            `;
        });

        appendMessage(t, "ai");
        return;
    }

    // ------------------------------------------
    // VISITOR LOGS
    // ------------------------------------------
    if (resp.visitors) {
        let t = `<strong>Visitor Logs:</strong><br><br>`;

        resp.visitors.forEach(v => {
            t += `
                <div class="msg-card">
                    <b>${v.name}</b> (${v.role || '-'})<br>
                    Time: ${v.time}<br>
                    Notes: ${v.notes || '-'}
                </div>
            `;
        });

        appendMessage(t, "ai");
        return;
    }

    // ------------------------------------------
    // ALERTS
    // ------------------------------------------
    if (Array.isArray(resp.alerts)) {
        if (resp.alerts.length === 0) {
            appendMessage("<strong>No High-Risk Alerts Found.</strong>", "ai", "safe");
            return;
        }

        let t = `<strong>High Risk Alerts:</strong><br><br>`;

        resp.alerts.forEach(a => {
            t += `
                <div class="msg-card">
                    <b>${a.patient}</b><br>
                    Ward: ${a.ward || '-'}<br>
                    Risk: <span class="highlight-text">${a.risk}</span><br>
                </div>
            `;
        });

        appendMessage(t, "ai", "critical");
        return;
    }

    // ------------------------------------------
    // PATIENT LIST
    // ------------------------------------------
    if (Array.isArray(resp.patients)) {

        if (resp.patients.length === 0) {
            appendMessage("<strong>No matching patients found.</strong>", "ai", "warning");
            return;
        }

        let t = `<strong>Patients Found:</strong><br><br>`;
        resp.patients.forEach(p => {
            t += `
                <div class="msg-card">
                    <b>${p.name}</b> (ID: ${p.id})<br>
                    Age: ${p.age || '-'} | Gender: ${p.gender || '-'}<br>
                    Ward: ${p.ward || '-'}<br>
                    Doctor: ${p.doctor || '-'}
                </div><br>
            `;
        });

        appendMessage(t, "ai");
        return;
    }

    // ------------------------------------------
    // AI PREDICTION ENGINE RESULTS
    // ------------------------------------------
    if (resp.antibiotic_predictions || resp.mdr_probability || resp.severity_level) {
        let t = "<strong>AI Infection-Control Analysis</strong><br><br>";

        if (resp.mdr_probability !== undefined)
            t += `<b>MDR Probability:</b> ${resp.mdr_probability}%<br>`;

        if (resp.severity_level)
            t += `<b>Severity Level:</b> ${resp.severity_level}<br>`;

        if (resp.spread_risk_score !== undefined)
            t += `<b>Spread Risk Score:</b> ${resp.spread_risk_score}/10<br><br>`;

        if (resp.antibiotic_predictions) {
            t += `<strong>Antibiotic Effectiveness:</strong><br><br>`;
            resp.antibiotic_predictions.forEach(p => {
                t += `
                    <div class="msg-card">
                        <b>${p.antibiotic}</b><br>
                        Prediction: ${p.prediction}<br>
                        Result: ${p.result || '-'}<br>
                        MIC: ${p.mic || '-'} | Zone: ${p.zone || '-'}<br>
                        <i>${p.explanation || ''}</i>
                    </div><br>
                `;
            });
        }

        if (Array.isArray(resp.high_risk_alerts) && resp.high_risk_alerts.length > 0) {
            t += `<strong>High Risk Alerts:</strong><br>`;
            resp.high_risk_alerts.forEach(a => {
                t += `
                    <div class="msg-card">
                        <b>${a.type}</b>: ${a.message}
                    </div>
                `;
            });
            t += "<br>";
        }

        if (Array.isArray(resp.clinical_insights)) {
            t += `<strong>Clinical Insights:</strong><br>`;
            resp.clinical_insights.forEach(c => t += `• ${c}<br>`);
            t += "<br>";
        }

        if (resp.outbreak_hint) {
            t += `<div class="msg-card">${resp.outbreak_hint}</div>`;
        }

        appendMessage(t, "ai", "warning");
        return;
    }

    // ------------------------------------------
    // HELP + FALLBACK
    // ------------------------------------------
    if (resp.help) {
        let t = resp.error + "<br><br>";
        resp.help.forEach(h => t += h + "<br>");
        appendMessage(t, "ai", "warning");
        return;
    }

    // Last fallback
    appendMessage("I have data but cannot display it.", "ai");
}

// =====================================================================================
// UI MESSAGE SYSTEM
// =====================================================================================

function appendMessage(text, sender, risk = null) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message-row', sender === 'user' ? 'user-row' : 'ai-row');

    let riskBadgeHtml = '';
    if (risk) {
        const riskColors = {
            critical: "Critical Alert",
            warning: "Caution",
            safe: "Action Confirmed"
        };
        riskBadgeHtml = `<span class="risk-badge ${risk}">${riskColors[risk]}</span>`;
    }

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    let content = "";

    if (sender === "ai") {
        content = `
            <div class="ai-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="message-bubble ai-bubble">
                <div class="message-header">
                    <span class="sender-name">MediMind System</span>
                    ${riskBadgeHtml}
                </div>
                <p>${text}</p>
                <div class="message-meta"><span>${time}</span></div>
            </div>
        `;
    } else {
        content = `
            <div class="message-bubble user-bubble">
                <p>${text}</p>
            </div>
        `;
    }

    messageDiv.innerHTML = content;
    chatHistory.appendChild(messageDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.classList.add('message-row', 'ai-row');
    typingDiv.innerHTML = `
        <div class="ai-avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="message-bubble ai-bubble" style="padding: 12px;">
            <span style="font-size: 12px; color: #64748B;">Processing...</span>
        </div>
    `;
    chatHistory.appendChild(typingDiv);
    scrollToBottom();
}

function removeTypingIndicator() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
}

function scrollToBottom() {
    chatHistory.scrollTop = chatHistory.scrollHeight;
}
