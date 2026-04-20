// Config (expand later if needed)
const defaultConfig = {
  app_title: "Amrit Sparsh",
  subtitle: "MDR TRACKING",
  process_button_text: "Process Uploads",
  sync_status_label: "Last synced",
  alerts_delivered_label: "alerts delivered",
};

let config = { ...defaultConfig };

// State
let friendImageUploaded = false;

// Toast
function showToast(title, message) {
  const toast = document.getElementById("toast");
  document.getElementById("toastTitle").textContent = title;
  document.getElementById("toastMessage").textContent = message;

  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 4000);
}

// Simulated Upload
function simulateUpload(progressEl, fileName) {
  if (!progressEl) return;

  progressEl.classList.add("active");
  const bar = progressEl.querySelector(".upload-progress-bar");
  if (!bar) return;

  bar.style.width = "0%";
  let pct = 0;

  const iv = setInterval(() => {
    pct += 20 + Math.round(Math.random() * 10);
    if (pct >= 100) pct = 100;
    bar.style.width = pct + "%";

    if (pct >= 100) {
      clearInterval(iv);
      setTimeout(() => {
        progressEl.classList.remove("active");
        bar.style.width = "0%";
        showToast("Upload Complete", `${fileName} uploaded`);
      }, 500);
    }
  }, 250);
}

// Upload Zone (only photo)
function setupUploadZone(zoneId, progressId, inputId, maxSizeMB = 10) {
  const zone = document.getElementById(zoneId);
  const progress = document.getElementById(progressId);
  const input = document.getElementById(inputId);
  if (!zone || !input || !progress) return;

  const previewContainer = document.getElementById("imagePreview");
  const previewImg = document.getElementById("previewImg");
  const processBtn = document.getElementById("processBtn");

  async function handleFiles(files) {
    if (!files || files.length === 0) return;
    const file = files[0];

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      showToast("File Too Large", `Max size is ${maxSizeMB} MB`);
      return;
    }

    simulateUpload(progress, file.name);

    // Mark image uploaded
    friendImageUploaded = true;
    showToast(
      "Patient Image Saved",
      "MDR+ patient (Radhika) image is ready for analysis."
    );

    // Show small preview
    if (previewContainer && previewImg) {
      const url = URL.createObjectURL(file);
      previewImg.src = url;
      previewContainer.hidden = false;
    }

    // Enable process button
    if (processBtn) processBtn.disabled = false;
  }

  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("dragging");
  });

  zone.addEventListener("dragleave", () => zone.classList.remove("dragging"));

  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("dragging");
    handleFiles(e.dataTransfer.files);
  });

  zone.addEventListener("click", () => input.click());

  zone.addEventListener("keypress", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      input.click();
    }
  });

  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleFiles([file]);
  });
}

// Fake AI processing
async function runFaceRecognition() {
  if (!friendImageUploaded) {
    showToast("Missing Data", "Upload MDR patient image first.");
    return;
  }

  showToast(
    "Analyzing Evidence",
    "System is locating handshake contact in ward CCTV video..."
  );

  await new Promise((resolve) => setTimeout(resolve, 1800));

  // Show analysis section with video + graph
  const section = document.getElementById("analysisSection");
  const video = document.getElementById("evidenceVideo");

  if (section) {
    section.hidden = false;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (video) {
    video.currentTime = 0;
    video.play().catch(() => {
      // Autoplay may fail on some browsers, it's fine.
    });
  }

  showToast(
    "Processing Complete",
    "Handshake exposure detected between Radhika and Ujala. Graph updated."
  );
}

// Timeline Slider
function setupTimelineSlider() {
  const slider = document.getElementById("timelineSlider");
  const label = document.getElementById("timeDisplay");
  if (!slider || !label) return;

  slider.addEventListener("input", (e) => {
    const hours = e.target.value;
    label.textContent = `Last ${hours} hours`;
  });
}

// Sync Timer
function setupSyncTimer() {
  let syncSeconds = 12;
  setInterval(() => {
    syncSeconds++;
    const minutes = Math.floor(syncSeconds / 60);
    const secs = syncSeconds % 60;

    const timeStr =
      minutes > 0
        ? `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
            2,
            "0"
          )} ago`
        : `00:00:${String(secs).padStart(2, "0")} ago`;

    const headerTime = document.getElementById("syncTime");
    const footerTime = document.getElementById("syncTimeFooter");
    if (headerTime) headerTime.textContent = timeStr;
    if (footerTime) footerTime.textContent = timeStr;
  }, 1000);
}

// Static Graph
const demoNodes = [
  { id: "R", x: 180, y: 200, label: "Radhika", sublabel: "MDR+ Patient", risk: "high", score: 9 },
  { id: "U", x: 380, y: 120, label: "Ujala", sublabel: "Exposed", risk: "high", score: 7 },
  { id: "S", x: 380, y: 280, label: "Staff 3A", sublabel: "Nurse", risk: "low", score: 3 },
];

const demoEdges = [
  { from: "R", to: "U", risk: "high" },
  { from: "U", to: "S", risk: "medium" },
];

function initializeGraph() {
  const svg = document.getElementById("graphSvg");
  if (!svg) return;

  svg.innerHTML = "";

  const totalContactsEl = document.getElementById("totalContacts");
  if (totalContactsEl) {
    totalContactsEl.textContent = String(demoEdges.length);
  }

  // edges
  demoEdges.forEach((edge) => {
    const fromNode = demoNodes.find((n) => n.id === edge.from);
    const toNode = demoNodes.find((n) => n.id === edge.to);
    if (!fromNode || !toNode) return;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", fromNode.x);
    line.setAttribute("y1", fromNode.y);
    line.setAttribute("x2", toNode.x);
    line.setAttribute("y2", toNode.y);
    line.classList.add("edge-line");
    if (edge.risk === "high") line.classList.add("high-risk");
    svg.appendChild(line);
  });

  // nodes
  demoNodes.forEach((node, index) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.classList.add("node-group");
    group.style.animationDelay = `${index * 0.15}s`;

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.classList.add("node-circle");
    circle.setAttribute("cx", node.x);
    circle.setAttribute("cy", node.y);
    circle.setAttribute("r", "36");

    let fillColor = "#10b981";
    let strokeColor = "#059669";
    if (node.risk === "high") {
      fillColor = "#ef4444";
      strokeColor = "#dc2626";
    } else if (node.risk === "medium") {
      fillColor = "#3b82f6";
      strokeColor = "#2563eb";
    }

    circle.setAttribute("fill", fillColor);
    circle.setAttribute("stroke", strokeColor);
    circle.setAttribute("stroke-width", "3");

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.classList.add("node-label");
    label.setAttribute("x", node.x);
    label.setAttribute("y", node.y - 2);
    label.textContent = node.label;

    const sublabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    sublabel.classList.add("node-sublabel");
    sublabel.setAttribute("x", node.x);
    sublabel.setAttribute("y", node.y + 10);
    sublabel.textContent = node.sublabel;

    group.appendChild(circle);
    group.appendChild(label);
    group.appendChild(sublabel);
    svg.appendChild(group);

    group.addEventListener("click", () => showNodeDetail(node));
  });
}

// Detail card
function showNodeDetail(node) {
  const detailCard = document.getElementById("nodeDetail");
  const detailTitle = document.getElementById("detailTitle");
  const detailContent = document.getElementById("detailContent");
  if (!detailCard || !detailTitle || !detailContent) return;

  detailTitle.textContent = `${node.label} (${node.sublabel})`;

  let mdrStatus = "Pending";
  if (node.risk === "high") mdrStatus = "MDR+ Confirmed";
  else if (node.risk === "low") mdrStatus = "Negative";

  detailContent.innerHTML = `
    <div class="detail-row">
      <span class="detail-label">Role</span>
      <span class="detail-value">${node.sublabel}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Risk Level</span>
      <span class="risk-badge ${node.risk}">
        ${node.risk.charAt(0).toUpperCase() + node.risk.slice(1)}
      </span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Risk Score</span>
      <span class="detail-value">${node.score}/10</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Last Contact</span>
      <span class="detail-value">45 minutes ago</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">MDR Status</span>
      <span class="detail-value">${mdrStatus}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Direct Exposures</span>
      <span class="detail-value">
        ${
          demoEdges.filter((e) => e.from === node.id || e.to === node.id)
            .length
        }
      </span>
    </div>
  `;

  detailCard.classList.add("visible");
  detailCard.setAttribute("aria-hidden", "false");
}

function setupDetailClose() {
  const closeBtn = document.getElementById("detailClose");
  const detailCard = document.getElementById("nodeDetail");
  if (!closeBtn || !detailCard) return;

  closeBtn.addEventListener("click", () => {
    detailCard.classList.remove("visible");
    detailCard.setAttribute("aria-hidden", "true");
  });
}

// Init
window.addEventListener("DOMContentLoaded", () => {
  setupUploadZone("photoZone", "photoProgress", "photoInput", 10);

  const processBtn = document.getElementById("processBtn");
  if (processBtn) {
    processBtn.addEventListener("click", async function () {
      this.disabled = true;
      this.classList.add("processing");
      await runFaceRecognition();
      this.disabled = false;
      this.classList.remove("processing");
    });
  }

  setupTimelineSlider();
  setupSyncTimer();
  initializeGraph();
  setupDetailClose();
});
