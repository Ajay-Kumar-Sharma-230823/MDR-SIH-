/**
 * lab-report.js
 * Complete frontend wiring for LabSync page (search, load, render, upload)
 *
 * Assumptions:
 *  - Backend base URL (change if needed): http://localhost:8000
 *  - Upload endpoint: POST /lab/{patient_id}/upload (multipart/form-data)
 *  - Search endpoint: GET /lab/search?q=
 *  - Reports listing: GET /lab/{patient_id}/reports
 *  - Patient details: GET /patients/{patient_id}
 *
 * Replace BASE_URL if your backend is hosted elsewhere.
 */

(function () {
  // ========== CONFIG ==========
  const BASE_URL = "http://localhost:8000"; // <-- change this if your backend URL differs
  const SEARCH_MIN_CHARS = 2;
  const SEARCH_DEBOUNCE_MS = 250;

  // ========== DOM ==========
  const searchInput = document.getElementById("patientSearchInput");
  const searchResults = document.getElementById("patientSearchResults");
  const lastSyncTimeEl = document.getElementById("lastSyncTime");
  const refreshBtn = document.getElementById("refreshBtn");

  // Upload modal elements
  const uploadModalEl = document.getElementById("uploadLabModal");
  const uploadForm = document.getElementById("uploadLabForm");
  const submitUploadBtn = document.getElementById("submitUploadBtn");
  const formPatientId = document.getElementById("form_patient_id");
  const astInputBody = document.getElementById("ast_input_body");
  const addAstRowBtn = document.getElementById("addAstRowBtn");
  const importAstCsvBtn = document.getElementById("importAstCsvBtn");
  const formFileInput = document.getElementById("form_file");

  // Page fields for dynamic population
  const FIELD = {
    ps_name: document.getElementById("ps_name"),
    ps_age_gender: document.getElementById("ps_age_gender"),
    ps_uhid: document.getElementById("ps_uhid"),
    ps_ward_bed: document.getElementById("ps_ward_bed"),
    ps_doctor: document.getElementById("ps_doctor"),

    ov_sample_type: document.getElementById("ov_sample_type"),
    ov_sample_id: document.getElementById("ov_sample_id"),
    ov_report_date: document.getElementById("ov_report_date"),
    ov_collection_dt: document.getElementById("ov_collection_dt"),
    ov_processing_dt: document.getElementById("ov_processing_dt"),
    ov_time_to_processing: document.getElementById("ov_time_to_processing"),

    org_organism: document.getElementById("org_organism"),
    org_gram: document.getElementById("org_gram"),
    org_growth: document.getElementById("org_growth"),
    org_site: document.getElementById("org_site"),
    org_source: document.getElementById("org_source"),
    org_notes: document.getElementById("org_notes"),

    gm_esbl: document.getElementById("gm_esbl"),
    gm_carb: document.getElementById("gm_carb"),
    gm_vre: document.getElementById("gm_vre"),
    gm_mrsa: document.getElementById("gm_mrsa"),
    gm_notes: document.getElementById("gm_notes"),

    ast_table_body: document.getElementById("ast_table_body"),

    risk_severity: document.getElementById("risk_severity"),
    risk_action_badge: document.getElementById("risk_action_badge"),
    risk_mdr_status: document.getElementById("risk_mdr_status"),
    risk_mdr_text: document.getElementById("risk_mdr_text"),
    risk_score: document.getElementById("risk_score"),
    risk_failure_prob: document.getElementById("risk_failure_prob"),
    risk_cluster: document.getElementById("risk_cluster"),
    risk_seg_low: document.getElementById("risk_seg_low"),
    risk_seg_med: document.getElementById("risk_seg_med"),
    risk_seg_high: document.getElementById("risk_seg_high"),

    docs_container: document.getElementById("docs_container"),
  };

  // Keep currently selected patient state
  let CURRENT_PATIENT = null;
  let CURRENT_REPORTS = [];

  // ========== UTILITIES ==========
  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  function isoToLocalDate(iso) {
    if (!iso) return "--";
    const d = new Date(iso);
    if (isNaN(d)) return "--";
    return d.toLocaleDateString();
  }
  function isoToLocalDateTime(iso) {
    if (!iso) return "--";
    const d = new Date(iso);
    if (isNaN(d)) return "--";
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  function timeDiffHuman(startIso, endIso) {
    if (!startIso || !endIso) return "--";
    const s = new Date(startIso);
    const e = new Date(endIso);
    if (isNaN(s) || isNaN(e)) return "--";
    const diffMs = e - s;
    if (diffMs < 0) return "--";
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const rbMins = mins % 60;
    if (hours > 0) return `${hours} hr ${rbMins} mins`;
    return `${mins} mins`;
  }

  function clearChildren(el) {
    while (el && el.firstChild) el.removeChild(el.firstChild);
  }

  function showAlert(msg) {
    // lightweight: use native alert for now
    alert(msg);
  }

  async function safeJson(res) {
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  // ========== SEARCH ==========
  async function doSearch(query) {
    if (!query || query.length < SEARCH_MIN_CHARS) {
      searchResults.style.display = "none";
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/lab/search?q=${encodeURIComponent(query)}`);
      const data = await safeJson(res) || [];
      renderSearchResults(data);
    } catch (err) {
      console.error("Search error:", err);
      searchResults.style.display = "none";
    }
  }

  function renderSearchResults(results) {
    clearChildren(searchResults);
    if (!results || results.length === 0) {
      searchResults.style.display = "none";
      return;
    }
    results.forEach(p => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.style.cursor = "pointer";
      // show name + ward (fallback)
      const ward = p.ward ? ` — ${p.ward}` : "";
      li.innerHTML = `<strong>${escapeHtml(p.name)}</strong><span class="text-muted ms-2">${escapeHtml(ward)}</span>`;
      li.addEventListener("click", () => {
        onPatientSelect(p);
      });
      searchResults.appendChild(li);
    });
    // position and show
    searchResults.style.display = "block";
  }

  function escapeHtml(s) {
    if (s === null || s === undefined) return "";
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  // Debounced search
  const debouncedSearch = debounce((q) => doSearch(q), SEARCH_DEBOUNCE_MS);

  // ========== SELECT PATIENT ==========
  async function onPatientSelect(patient) {
    // hide dropdown and set input
    searchResults.style.display = "none";
    searchInput.value = patient.name || "";

    CURRENT_PATIENT = patient;
    // set hidden form patient id for upload
    if (formPatientId) formPatientId.value = patient.id;

    // fetch patient details
    await loadPatientDetails(patient.id);
    // fetch reports & render
    await loadAndRenderReports(patient.id);
  }

  async function loadPatientDetails(patientId) {
    try {
      const res = await fetch(`${BASE_URL}/patients/${patientId}`);
      const data = await safeJson(res);
      if (!data) return;
      // populate summary
      FIELD.ps_name.textContent = data.full_name || "--";
      FIELD.ps_age_gender.textContent = (data.age ? data.age : "--") + (data.gender ? ` / ${data.gender}` : "");
      FIELD.ps_uhid.textContent = data.id ? `UHID-${data.id}` : "--";
      FIELD.ps_ward_bed.textContent = data.ward || "--";
      FIELD.ps_doctor.textContent = data.assigned_doctor || "--";
    } catch (err) {
      console.error("Error loadPatientDetails", err);
    }
  }

  // ========== LOAD & RENDER REPORTS ==========
  async function loadAndRenderReports(patientId) {
    try {
      const res = await fetch(`${BASE_URL}/lab/${patientId}/reports`);
      const reports = await safeJson(res) || [];
      CURRENT_REPORTS = reports;
      if (reports.length === 0) {
        // clear UI
        resetReportUI();
        return;
      }
      // Use latest report (first in returned order per backend)
      const latest = reports[0];
      renderOverview(latest);
      renderOrganism(latest);
      renderGeneMarkers(latest);
      renderASTTable(latest);
      renderRiskPanel(latest);
      renderDocuments(reports);
    } catch (err) {
      console.error("loadAndRenderReports error", err);
    }
  }

  function resetReportUI() {
    // set placeholders
    FIELD.ov_sample_type.textContent = "--";
    FIELD.ov_sample_id.textContent = "--";
    FIELD.ov_report_date.textContent = "--";
    FIELD.ov_collection_dt.textContent = "--";
    FIELD.ov_processing_dt.textContent = "--";
    FIELD.ov_time_to_processing.textContent = "--";

    FIELD.org_organism.textContent = "--";
    FIELD.org_gram.textContent = "--";
    FIELD.org_growth.textContent = "--";
    FIELD.org_site.textContent = "--";
    FIELD.org_source.textContent = "--";
    FIELD.org_notes.textContent = "--";

    clearChildren(FIELD.gm_esbl);
    FIELD.gm_esbl.appendChild(document.createTextNode("--"));
    clearChildren(FIELD.gm_carb);
    FIELD.gm_carb.appendChild(document.createTextNode("--"));
    clearChildren(FIELD.gm_vre);
    FIELD.gm_vre.appendChild(document.createTextNode("--"));
    FIELD.gm_mrsa.textContent = "--";
    FIELD.gm_notes.textContent = "--";

    FIELD.ast_table_body.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No AST data available</td></tr>`;

    FIELD.risk_severity.textContent = "--";
    FIELD.risk_action_badge.textContent = "--";
    FIELD.risk_mdr_status.textContent = "--";
    FIELD.risk_mdr_text.textContent = "--";
    FIELD.risk_score.textContent = "--";
    FIELD.risk_failure_prob.textContent = "--";
    FIELD.risk_cluster.textContent = "--";
    FIELD.docs_container.innerHTML = `<div class="text-muted small">No documents available</div>`;
  }

  // ---------- Overview ----------
  function renderOverview(report) {
    FIELD.ov_sample_type.textContent = report.sample_type || "--";
    FIELD.ov_sample_id.textContent = report.sample_id || "--";
    FIELD.ov_report_date.textContent = isoToLocalDate(report.lab_report_date);
    FIELD.ov_collection_dt.textContent = isoToLocalDateTime(report.collection_datetime);
    FIELD.ov_processing_dt.textContent = isoToLocalDateTime(report.processing_datetime);
    FIELD.ov_time_to_processing.textContent = timeDiffHuman(report.collection_datetime, report.processing_datetime);
  }

  // ---------- Organism ----------
  function renderOrganism(report) {
    FIELD.org_organism.textContent = report.organism_detected || "--";
    FIELD.org_gram.textContent = report.gram_stain || "--";
    FIELD.org_growth.textContent = report.growth_pattern || "--";
    FIELD.org_site.textContent = report.infection_site || "--";
    FIELD.org_source.textContent = report.infection_source || "--";
    FIELD.org_notes.textContent = report.lab_notes || "--";
  }

  // ---------- Gene markers ----------
  function renderGeneMarkers(report) {
    // backend may store markers as list or strings; be defensive
    // For this wiring code, we try to parse possible JSON fields inside report (ai_prediction or markers)
    clearChildren(FIELD.gm_esbl);
    clearChildren(FIELD.gm_carb);
    clearChildren(FIELD.gm_vre);

    function addChip(container, text, danger = false) {
      const span = document.createElement("span");
      span.className = "gene-chip";
      if (danger) {
        span.classList.add("text-danger");
        span.style.borderColor = "#f8d7da";
      }
      span.innerHTML = `<i class="fas fa-dna me-1"></i> ${escapeHtml(text)}`;
      container.appendChild(span);
    }

    // Try fields (esbl_markers, carbapenemase, vre_markers, mrsa_marker)
    const esblRaw = report.esbl_markers || "";
    const carbRaw = report.carbapenemase || "";
    const vreRaw = report.vre_markers || "";

    if (esblRaw) {
      const arr = Array.isArray(esblRaw) ? esblRaw : String(esblRaw).split(",").map(s => s.trim()).filter(Boolean);
      arr.forEach(val => addChip(FIELD.gm_esbl, val));
    } else {
      FIELD.gm_esbl.appendChild(document.createTextNode("--"));
    }

    if (carbRaw) {
      const arr = Array.isArray(carbRaw) ? carbRaw : String(carbRaw).split(",").map(s => s.trim()).filter(Boolean);
      arr.forEach(val => addChip(FIELD.gm_carb, val, true));
    } else {
      FIELD.gm_carb.appendChild(document.createTextNode("--"));
    }

    if (vreRaw) {
      const arr = Array.isArray(vreRaw) ? vreRaw : String(vreRaw).split(",").map(s => s.trim()).filter(Boolean);
      arr.forEach(val => addChip(FIELD.gm_vre, val));
    } else {
      FIELD.gm_vre.appendChild(document.createTextNode("--"));
    }

    FIELD.gm_mrsa.textContent = report.mrsa_marker || "--";
    FIELD.gm_notes.textContent = report.genomic_notes || "--";
  }

  // ---------- AST table ----------
  function renderASTTable(report) {
    clearChildren(FIELD.ast_table_body);

    // Backend might store AST in multiple ways:
    // - as ast_results rows (recommended)
    // - as ast_panel_json in MDRDetails (stringified)
    // Here we expect API returns `ast_results` array OR `ast_panel` in report object
    const rows = report.ast_results || report.ast_panel || report.ast_panel_json || null;

    // If it's a JSON string in report.ast_panel_json, parse it.
    let astArray = null;
    if (Array.isArray(rows)) {
      astArray = rows;
    } else if (typeof rows === "string") {
      try {
        astArray = JSON.parse(rows);
      } catch (e) {
        astArray = null;
      }
    } else if (report.ast_results_server_side) {
      // placeholder for other schemes
      astArray = report.ast_results_server_side;
    }

    if (!astArray || astArray.length === 0) {
      FIELD.ast_table_body.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No AST data available</td></tr>`;
      return;
    }

    astArray.forEach(r => {
      const tr = document.createElement("tr");
      const antibiotic = r.antibiotic || r.antibiotic_name || r.name || "--";
      const result = (r.result || r.value || r.status || "--").toString().toUpperCase();
      const mic = r.mic || r.mic_value || "--";
      const zone = r.zone || r.zone_mm || "--";
      const source = r.source || r.source_note || r.origin || "--";

      const resultClass = result === "S" ? "result-s" : result === "I" ? "result-i" : result === "R" ? "result-r" : "";

      tr.innerHTML = `
        <td><i class="fas fa-capsules text-muted me-2"></i> ${escapeHtml(antibiotic)}</td>
        <td><span class="result-tag ${resultClass}">${escapeHtml(result)}</span></td>
        <td>${escapeHtml(mic)}</td>
        <td>${escapeHtml(zone)}</td>
        <td><span class="imported-tag">${escapeHtml(source)}</span></td>
      `;
      FIELD.ast_table_body.appendChild(tr);
    });
  }

  // ---------- Risk Panel ----------
  function renderRiskPanel(report) {
    // Use values if present, otherwise compute a naive rule:
    FIELD.risk_severity.textContent = report.severity_level || "--";
    FIELD.risk_action_badge.textContent = report.severity_level ? (report.severity_level.toUpperCase()) : "--";
    FIELD.risk_mdr_status.textContent = report.mdr_status || "--";
    FIELD.risk_mdr_text.textContent = report.mdr_status ? "Multi-Drug Resistant" : "--";

    // Spread risk score numeric
    const score = typeof report.spread_risk_score !== "undefined" ? report.spread_risk_score : (report.spread_score || null);
    if (score !== null && score !== undefined) {
      FIELD.risk_score.textContent = String(score);
      const numeric = Number(score);
      // update bar segments simple highlight:
      FIELD.risk_seg_low.style.opacity = numeric <= 3 ? 1 : 0.3;
      FIELD.risk_seg_med.style.opacity = numeric > 3 && numeric <= 7 ? 1 : 0.3;
      FIELD.risk_seg_high.style.opacity = numeric > 7 ? 1 : 0.3;
    } else {
      FIELD.risk_score.textContent = "--";
      FIELD.risk_seg_low.style.opacity = 0.3;
      FIELD.risk_seg_med.style.opacity = 0.3;
      FIELD.risk_seg_high.style.opacity = 0.3;
    }

    FIELD.risk_failure_prob.textContent = report.antibiotic_failure_probability ? `${report.antibiotic_failure_probability}%` : "--";
    FIELD.risk_cluster.textContent = report.predicted_cluster || "--";
  }

  
 // ---------- Documents ----------
function renderDocuments(reports) {
    clearChildren(FIELD.docs_container);

    if (!reports || reports.length === 0) {
        FIELD.docs_container.innerHTML = `<div class="text-muted small">No documents available</div>`;
        return;
    }

         // backend returns files inside latestReport.files
// collect all files from all reports
        let files = [];
        reports.forEach(r => {
            if (r.files && r.files.length > 0) {
                r.files.forEach(f => files.push(f));
            }
        });

        // no files?
        if (files.length === 0) {
            FIELD.docs_container.innerHTML = `<div class="text-muted small">No documents available</div>`;
            return;
        }

    files.forEach(f => {
        const item = document.createElement("div");
        item.className = "file-item-readonly d-flex align-items-center mb-3";

        const isPdf = f.file_name.toLowerCase().endsWith(".pdf");
        const iconClass = isPdf ? "fas fa-file-pdf file-icon-large" : "fas fa-file-csv text-success file-icon-large";

        const fileDetails = document.createElement("div");
        fileDetails.className = "file-details flex-grow-1";
        fileDetails.innerHTML = `
            <span class="fw-bold text-dark d-block" style="font-size: 0.9rem;">${f.file_name}</span>
            <span class="text-muted small">${(f.file_size / 1024).toFixed(1)} KB • ${new Date(f.uploaded_at).toLocaleString()}</span>
            <div class="mt-1"><span class="auto-import-tag">Uploaded</span></div>
        `;

        const icon = document.createElement("i");
        icon.className = iconClass;

        const download = document.createElement("a");
        download.className = "btn btn-sm btn-outline-primary border-0";
        download.href = `${BASE_URL}${f.file_url}`;
        download.target = "_blank";
        download.innerHTML = `<i class="fas fa-download"></i>`;

        item.appendChild(icon);
        item.appendChild(fileDetails);
        item.appendChild(download);

        FIELD.docs_container.appendChild(item);
    });
}


  function formatBytes(bytes) {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
  }

  // ========== UPLOAD FORM HANDLING ==========
  function addAstRow(templateValues = {}) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="text" name="ast_antibiotic[]" class="form-control form-control-sm" value="${escapeAttr(templateValues.antibiotic)}"></td>
      <td><input type="text" name="ast_result[]" class="form-control form-control-sm" value="${escapeAttr(templateValues.result)}"></td>
      <td><input type="text" name="ast_mic[]" class="form-control form-control-sm" value="${escapeAttr(templateValues.mic)}"></td>
      <td><input type="text" name="ast_zone[]" class="form-control form-control-sm" value="${escapeAttr(templateValues.zone)}"></td>
      <td><input type="text" name="ast_source[]" class="form-control form-control-sm" value="${escapeAttr(templateValues.source || 'Manual')}"></td>
    `;
    astInputBody.appendChild(row);
    return row;
  }

  function escapeAttr(s) {
    if (s === undefined || s === null) return "";
    return String(s).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // CSV import (naive): expects header row with columns 'antibiotic,result,mic,zone,source' (case-insensitive)
  function parseCsvContent(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",");
      if (cols.length < 1) continue;
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = cols[idx] ? cols[idx].trim() : "";
      });
      rows.push(obj);
    }
    return rows;
  }

  // Handle CSV import button
  importAstCsvBtn?.addEventListener("click", () => {
    // use hidden file input to read CSV quickly
    const fileEl = document.createElement("input");
    fileEl.type = "file";
    fileEl.accept = ".csv,text/csv";
    fileEl.onchange = async (ev) => {
      const f = ev.target.files[0];
      if (!f) return;
      const txt = await f.text();
      const parsed = parseCsvContent(txt);
      if (!parsed || parsed.length === 0) {
        showAlert("No rows found in CSV.");
        return;
      }
      // append rows to AST input
      parsed.forEach(r => {
        addAstRow({
          antibiotic: r.antibiotic || "",
          result: r.result || "",
          mic: r.mic || r.minimum_inhibitory_concentration || "",
          zone: r.zone || "",
          source: r.source || "Imported"
        });
      });
    };
    fileEl.click();
  });

  // Add AST row button
  addAstRowBtn?.addEventListener("click", () => addAstRow({}));

  // Upload submit handler
  submitUploadBtn?.addEventListener("click", async (e) => {
    if (!CURRENT_PATIENT) {
      showAlert("Please select a patient first using the search bar.");
      return;
    }
    // collect form data
    const patientId = formPatientId.value || CURRENT_PATIENT.id;
    const sample_type = document.getElementById("form_sample_type").value;
    const sample_id = document.getElementById("form_sample_id").value;
    const lab_report_date = document.getElementById("form_report_date").value;
    const collection_datetime = document.getElementById("form_collection_dt").value;
    const processing_datetime = document.getElementById("form_processing_dt").value;
    const organism_detected = document.getElementById("form_organism").value;
    const lab_notes = document.getElementById("form_lab_notes").value;
    const esbl_markers = document.getElementById("form_esbl").value;
    const carbapenemase = document.getElementById("form_carb").value;
    const vre_markers = document.getElementById("form_vre").value;
    const mrsa_marker = document.getElementById("form_mrsa").value;
    const genomic_notes = document.getElementById("form_gnotes").value;
    const file = formFileInput.files[0];

    // collect AST rows from inputs
    const ast_antibiotic = Array.from(document.getElementsByName("ast_antibiotic[]")).map(i => i.value);
    const ast_result = Array.from(document.getElementsByName("ast_result[]")).map(i => i.value);
    const ast_mic = Array.from(document.getElementsByName("ast_mic[]")).map(i => i.value);
    const ast_zone = Array.from(document.getElementsByName("ast_zone[]")).map(i => i.value);
    const ast_source = Array.from(document.getElementsByName("ast_source[]")).map(i => i.value);

    const astArray = [];
    for (let i = 0; i < ast_antibiotic.length; i++) {
      if (!ast_antibiotic[i]) continue; // skip empty
      astArray.push({
        antibiotic: ast_antibiotic[i],
        result: ast_result[i] || "",
        mic: ast_mic[i] || "",
        zone: ast_zone[i] || "",
        source: ast_source[i] || "Manual"
      });
    }

    // Build FormData
    const fd = new FormData();
    fd.append("sample_type", sample_type);
    fd.append("sample_id", sample_id);
    fd.append("lab_report_date", lab_report_date ? new Date(lab_report_date).toISOString() : "");
    fd.append("collection_datetime", collection_datetime ? new Date(collection_datetime).toISOString() : "");
    fd.append("processing_datetime", processing_datetime ? new Date(processing_datetime).toISOString() : "");
    fd.append("organism_detected", organism_detected);
    fd.append("lab_notes", lab_notes);
    fd.append("esbl_markers", esbl_markers);
    fd.append("carbapenemase", carbapenemase);
    fd.append("vre_markers", vre_markers);
    fd.append("mrsa_marker", mrsa_marker);
    fd.append("genomic_notes", genomic_notes);

    fd.append("ast_json", JSON.stringify(astArray));
    if (file) fd.append("file", file, file.name);

    // small UX
    submitUploadBtn.disabled = true;
    const originalText = submitUploadBtn.innerHTML;
    submitUploadBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading...`;

    try {
      const res = await fetch(`${BASE_URL}/lab/${patientId}/upload`, {
        method: "POST",
        body: fd
      });
      const data = await safeJson(res);
      if (res.ok && data && data.success) {
        // success - close modal and reload
        // hide bootstrap modal
        const modal = bootstrap.Modal.getInstance(uploadModalEl);
        if (modal) modal.hide();
        showAlert("Lab report uploaded successfully.");
        // refresh data for current patient
        await loadAndRenderReports(patientId);
      } else {
        console.error("Upload failed", data);
        showAlert("Upload failed: " + (data?.message || "Server error"));
      }
    } catch (err) {
      console.error("Upload error", err);
      showAlert("Upload failed: network error");
    } finally {
      submitUploadBtn.disabled = false;
      submitUploadBtn.innerHTML = originalText;
    }
  });

  // ========== BOOTSTRAP & REFRESH LOGIC ==========
  // Refresh button small simulation (also refresh data)
  refreshBtn?.addEventListener("click", async () => {
    const btn = refreshBtn;
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
    btn.disabled = true;
    try {
      // just update timestamp and if patient selected, reload reports
      lastSyncTimeEl.textContent = "Just now";
      if (CURRENT_PATIENT) await loadAndRenderReports(CURRENT_PATIENT.id);
    } catch (e) {
      console.error("Refresh error", e);
    } finally {
      btn.disabled = false;
      btn.innerHTML = orig;
    }
  });

  // ========== INITIAL DOM HOOKS ==========
  // Search input
  searchInput?.addEventListener("input", (ev) => {
    const q = ev.target.value.trim();
    debouncedSearch(q);
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (ev) => {
    if (!searchInput.contains(ev.target) && !searchResults.contains(ev.target)) {
      searchResults.style.display = "none";
    }
  });

  // Add initial empty AST row
  (function initAstInputs() {
    clearChildren(astInputBody);
    addAstRow({});
  })();

  // If there is a patient id already in the hidden field (server-side preselected), load it
  (async function boot() {
    const preId = formPatientId?.value;
    if (preId) {
      // fetch patient briefly
      try {
        const res = await fetch(`${BASE_URL}/patients/${preId}`);
        const p = await safeJson(res);
        if (p) {
          CURRENT_PATIENT = { id: p.id, name: p.full_name, ward: p.ward };
          searchInput.value = p.full_name;
          await loadPatientDetails(p.id);
          await loadAndRenderReports(p.id);
        }
      } catch (e) {
        console.warn("Bootload error", e);
      }
    }
    // set last sync if empty
    if (lastSyncTimeEl && !lastSyncTimeEl.textContent) {
      lastSyncTimeEl.textContent = "--";
    }
  })();

  // ========== HELPERS: small things ==========
  function htmlToElement(html) {
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstChild;
  }

  // End of module
})();

//---------------------------------------------
// LOAD SYNCED DOCUMENTS (PDF / CSV)
//---------------------------------------------
function loadSyncedDocuments(files) {
    const docBox = document.querySelector(".synced-documents-container");

    if (!docBox) return;

    if (!files || files.length === 0) {
        docBox.innerHTML = `
            <div class="text-muted small p-3">No documents available</div>
        `;
        return;
    }

    docBox.innerHTML = "";

    files.forEach(f => {
        const item = document.createElement("div");
        item.classList.add("file-item-readonly");

        item.innerHTML = `
            <i class="fas fa-file-${f.file_name.toLowerCase().endsWith(".pdf") ? "pdf" : "csv"} file-icon-large"></i>

            <div class="file-details flex-grow-1">
                <span class="fw-bold text-dark d-block" style="font-size: 0.9rem;">
                    ${f.file_name}
                </span>
                <span class="text-muted small">
                    ${(f.file_size / 1024).toFixed(1)} KB • ${new Date(f.uploaded_at).toLocaleString()}
                </span>
                <div class="mt-1">
                    <span class="auto-import-tag">Uploaded</span>
                </div>
            </div>

            <a href="http://localhost:8000${f.file_url}" 
               class="btn btn-sm btn-outline-primary border-0" 
               target="_blank">
               <i class="fas fa-download"></i>
            </a>
        `;

        docBox.appendChild(item);
    });
}
