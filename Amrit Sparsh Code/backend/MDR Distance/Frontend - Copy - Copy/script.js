// ELEMENTS
const uploadArea = document.getElementById("uploadArea");
const videoInput = document.getElementById("videoInput");
const uploadStatus = document.getElementById("uploadStatus");

const originalSection = document.getElementById("originalSection");
const originalVideo = document.getElementById("originalVideo");

const analyzeBtn = document.getElementById("analyzeBtn");
const analysisLoader = document.getElementById("analysisLoader");
const processedSection = document.getElementById("processedSection");
const processedVideo = document.getElementById("processedVideo");
const analysisStatus = document.getElementById("analysisStatus");

// SUMMARY FIELDS
const mdrPatientName = document.getElementById("mdrPatientName");
const closeContactsNames = document.getElementById("closeContactsNames");
const moderateContactsNames = document.getElementById("moderateContactsNames");

let selectedFile = null;

// Upload interaction
uploadArea.addEventListener("click", () => videoInput.click());

videoInput.addEventListener("change", () => {
  const file = videoInput.files[0];
  if (!file) return;

  selectedFile = file;
  uploadArea.classList.add("upload-box--done");
  uploadStatus.textContent = `Selected file: ${file.name}`;

  const url = URL.createObjectURL(file);
  originalVideo.src = url;
  originalSection.classList.remove("card--hidden");

  processedSection.classList.add("video-frame--hidden");
});

// Run Analysis
analyzeBtn.addEventListener("click", () => {
  if (!selectedFile) {
    alert("Please upload a CCTV video first.");
    return;
  }

  analyzeBtn.disabled = true;
  analysisLoader.classList.remove("loader--hidden");
  analysisStatus.textContent = "Running MDR analysis…";

  setTimeout(() => {
    processedVideo.src = processedVideo.dataset.processedSrc;
    processedSection.classList.remove("video-frame--hidden");

    // SIMPLE summary
    mdrPatientName.textContent = "Radhika";     // MDR Positive
    closeContactsNames.textContent = "Ujala";   // Close contact
    moderateContactsNames.textContent = "Krishna"; // Away

    analysisLoader.classList.add("loader--hidden");
    analyzeBtn.disabled = false;
    analysisStatus.textContent = "Analysis complete.";
  }, 1000);
});
