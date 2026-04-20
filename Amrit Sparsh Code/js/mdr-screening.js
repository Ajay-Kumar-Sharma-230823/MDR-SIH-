const questions = [
    {
        en: "Does the patient currently have a fever above 38°C, or did the patient experience high fever in the last 48 hours?",
        hi: "क्या मरीज को अभी 38°C से ऊपर ताप है, या पिछले 48 घंटों में तेज बुखार रहा है?",
        icon: "🌡️"
    },
    {
        en: "Has the patient taken any strong or broad-spectrum antibiotics (like Meropenem, Ceftriaxone, Piperacillin-Tazobactam) in the last 30 days?",
        hi: "क्या मरीज ने पिछले 30 दिनों में कोई तेज या बॉड-स्पेक्ट्रम एंटीबायोटिक (जैसे मेरोपेनम, सेफ्ट्रिएक्सोन, पाइपरासिलिन-टेजोबैक्टम) लिया है?",
        icon: "💊"
    },
    {
        en: "Was the patient admitted to ICU or did the patient undergo any major surgery in the last 14 days?",
        hi: "क्या मरीज पिछले 14 दिनों में ICU में भर्ती हुआ था या उसको कोई बड़ी सर्जरी हुई है?",
        icon: "🏥"
    },
    {
        en: "Does the patient have any underlying medical conditions (diabetes, chronic kidney disease, immunosuppression)?",
        hi: "क्या मरीज को कोई अंतर्निहित चिकित्सा स्थिति है (मधुमेह, क्रॉनिक किडनी रोग, प्रतिरक्षा दमन)?",
        icon: "⚕️"
    },
    {
        en: "Has the patient been hospitalized or received healthcare in the last 90 days?",
        hi: "क्या मरीज को पिछले 90 दिनों में अस्पताल में भर्ती किया गया था या स्वास्थ्यसेवा प्राप्त की थी?",
        icon: "📋"
    },
    {
        en: "Does the patient have any signs of infection (wound infection, urinary tract infection, respiratory infection)?",
        hi: "क्या मरीज को संक्रमण के कोई संकेत हैं (घाव संक्रमण, मूत्र पथ संक्रमण, श्वसन संक्रमण)?",
        icon: "🦠"
    },
    {
        en: "Has the patient been in contact with any confirmed MDR-positive patient in the last 30 days?",
        hi: "क्या मरीज को पिछले 30 दिनों में किसी पुष्टि MDR-सकारात्मक मरीज के साथ संपर्क था?",
        icon: "👥"
    }
];

const advice = {
    low: {
        title: "✓ Continue Routine Monitoring",
        en: [
            "Follow standard infection control measures",
            "Maintain routine hygiene protocols",
            "Document screening results",
            "Rescreen if symptoms develop"
        ],
        hi: [
            "मानक संक्रमण नियंत्रण उपायों का पालन करें",
            "नियमित स्वच्छता प्रोटोकॉल बनाए रखें",
            "स्क्रीनिंग परिणामों को दस्तावेज़ करें",
            "यदि लक्षण विकसित हों तो फिर से जांच करें"
        ]
    },
    medium: {
        title: "⚠️ Medium Risk: Clinical Review Recommended",
        en: [
            "Enhanced surveillance recommended",
            "Review recent antibiotic use",
            "Consider MDR screening if not done",
            "Implement contact precautions",
            "Consult with infectious disease specialist"
        ],
        hi: [
            "उन्नत निगरानी की सिफारिश की जाती है",
            "हाल के एंटीबायोटिक उपयोग की समीक्षा करें",
            "यदि नहीं किया गया तो MDR स्क्रीनिंग पर विचार करें",
            "संपर्क सावधानियां लागू करें",
            "संक्रामक रोग विशेषज्ञ से परामर्श लें"
        ]
    },
    high: {
        title: "🚨 High Risk: Immediate Clinical Review",
        en: [
            "Immediate clinical review recommended",
            "Implement MDR screening and isolation precautions",
            "Review and optimize antibiotic therapy",
            "Implement strict contact isolation measures",
            "Alert infection prevention team immediately"
        ],
        hi: [
            "तत्काल नैदानिक समीक्षा की सिफारिश की जाती है",
            "MDR स्क्रीनिंग और अलगाववास सावधानियां लागू करें",
            "एंटीबायोटिक चिकित्सा की समीक्षा और अनुकूलन करें",
            "कड़ी संपर्क अलगाववास उपायों को लागू करें",
            "संक्रमण रोकथाम टीम को तुरंत सतर्क करें"
        ]
    }
};

let currentLang = localStorage.getItem('lang') || 'en';
// Forces fresh start every time - no pre-selected answers
let answers = new Array(questions.length).fill(null);

function updateLanguage() {
    currentLang = currentLang === 'en' ? 'hi' : 'en';
    localStorage.setItem('lang', currentLang);
    document.getElementById('langToggle').textContent = currentLang === 'en' ? 'EN' : 'HI';
    document.getElementById('mainTitle').textContent = currentLang === 'en' ? 'MDR Self-Screening Checklist' : 'MDR स्व-स्क्रीनिंग चेकलिस्ट';
    document.getElementById('mainSubtitle').textContent = currentLang === 'en'
        ? 'Hospital-Grade Assessment Tool for Multi-Drug Resistant Organism Detection'
        : 'बहु-दवा प्रतिरोधी जीव का पता लगाने के लिए अस्पताल-ग्रेड मूल्यांकन उपकरण';
    document.getElementById('summaryLabel').textContent = currentLang === 'en' ? 'Assessment Summary' : 'मूल्यांकन सारांश';
    document.getElementById('disclaimer').textContent = currentLang === 'en'
        ? 'ℹ️ This is a screening aid, not a diagnosis. Always consult clinical guidelines and medical professionals.'
        : 'ℹ️ यह एक स्क्रीनिंग सहायता है, निदान नहीं। हमेशा नैदानिक दिशानिर्देशों और चिकित्सा पेशेवरों से परामर्श लें।';

    renderQuestions();
    updateRiskAssessment();
}

function renderQuestions() {
    const container = document.querySelector('.questions-container');
    const disclaimerDiv = container.querySelector('.disclaimer');
    container.innerHTML = '';
    container.appendChild(disclaimerDiv);

    questions.forEach((q, idx) => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.id = `card-${idx}`; // Add ID for scrolling/highlighting
        card.innerHTML = `
            <div class="question-number">${idx + 1}</div>
            <div class="question-icon">${q.icon}</div>
            <div class="question-text">${q[currentLang]}</div>
            <div class="button-group">
                <button class="answer-btn yes" data-index="${idx}" data-value="2">✓ Yes / हाँ</button>
                <button class="answer-btn no" data-index="${idx}" data-value="0">✕ No / नहीं</button>
                <button class="answer-btn unsure" data-index="${idx}" data-value="1">? Unsure / पता नहीं</button>
            </div>
        `;
        container.appendChild(card);

        // Set active button for this question
        const buttons = card.querySelectorAll('.answer-btn');
        buttons.forEach(btn => {
            if (parseInt(btn.dataset.value) === answers[idx]) {
                btn.classList.add('active');
            }
            btn.addEventListener('click', () => selectAnswer(idx, parseInt(btn.dataset.value), buttons));
        });
    });
}

function selectAnswer(questionIdx, value, buttons) {
    answers[questionIdx] = value;
    // Removed localStorage.setItem('answers', ...) to prevent persistence confusion

    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.closest('.answer-btn').classList.add('active');

    // Remove error state if present
    const card = document.getElementById(`card-${questionIdx}`);
    if (card) card.classList.remove('error');

    updateRiskAssessment();
}

function updateRiskAssessment() {
    // Only show score if at least one answer is selected, otherwise 0 is fine.
    // Logic remains same, just calculates based on current answers.
    const totalScore = answers.reduce((sum, ans) => sum + (ans !== null ? ans : 0), 0);
    const maxPossible = 14;
    // <CHANGE> Cap the score at 100 - ensure it never exceeds 100
    const score = Math.min(Math.round((totalScore / maxPossible) * 100), 100);

    document.getElementById('scoreDisplay').textContent = score;

    let riskLevel = 'low';
    if (score >= 71) riskLevel = 'high';
    else if (score >= 43) riskLevel = 'medium';

    const riskBadge = document.getElementById('riskBadge');
    riskBadge.className = `risk-badge ${riskLevel}`;
    riskBadge.textContent = riskLevel === 'low' ? 'Low Risk' : riskLevel === 'medium' ? 'Medium Risk' : 'High Risk';

    const advicePanel = document.getElementById('advicePanel');
    advicePanel.className = `advice-panel ${riskLevel}`;
    const adviceData = advice[riskLevel];
    document.getElementById('adviceTitle').textContent = adviceData.title;
    const adviceList = document.getElementById('adviceList');
    adviceList.innerHTML = '';
    const currentAdvice = currentLang === 'en' ? adviceData.en : adviceData.hi;
    currentAdvice.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        adviceList.appendChild(li);
    });
}

function evaluate() {
    const unansweredIndices = answers.map((val, idx) => val === null ? idx : null).filter(val => val !== null);

    if (unansweredIndices.length > 0) {
        showToast(currentLang === 'en' ? '⚠️ Please answer all questions to evaluate.' : '⚠️ मूल्यांकन के लिए कृपया सभी सवालों का जवाब दें।');

        // Highlight unanswered questions
        unansweredIndices.forEach(idx => {
            const card = document.getElementById(`card-${idx}`);
            if (card) {
                card.classList.add('error');
                // Optional: scroll to first error
                if (idx === unansweredIndices[0]) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        return;
    }
    showToast(currentLang === 'en' ? '✓ Assessment evaluated successfully' : '✓ मूल्यांकन सफलतापूर्वक मूल्यांकित किया गया');
}

function downloadReport() {
    const totalScore = answers.reduce((sum, ans) => sum + (ans !== null ? ans : 0), 0);
    const maxPossible = 14;
    const score = Math.min(Math.round((totalScore / maxPossible) * 100), 100);

    let riskLevel = 'Low';
    if (score >= 71) riskLevel = 'High';
    else if (score >= 43) riskLevel = 'Medium';

    const reportData = {
        title: 'MDR Self-Screening Checklist Report',
        timestamp: new Date().toLocaleString(),
        score: score,
        riskLevel: riskLevel,
        responses: questions.map((q, idx) => ({
            question: q.en,
            questionHi: q.hi,
            answer: answers[idx] === 0 ? 'No' : answers[idx] === 1 ? 'Unsure' : answers[idx] === 2 ? 'Yes' : 'Not answered'
        }))
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MDR-Screening-Report-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showToast(currentLang === 'en' ? '✓ Report downloaded' : '✓ रिपोर्ट डाउनलोड की गई');
}

function reset() {
    if (confirm(currentLang === 'en' ? 'Reset all answers?' : 'सभी उत्तर रीसेट करें?')) {
        answers = new Array(questions.length).fill(null);
        localStorage.setItem('answers', JSON.stringify(answers));
        renderQuestions();
        updateRiskAssessment();
        showToast(currentLang === 'en' ? '🔄 Checklist reset' : '🔄 चेकलिस्ट रीसेट की गई');
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

document.getElementById('langToggle').addEventListener('click', updateLanguage);
document.getElementById('evaluateBtn').addEventListener('click', evaluate);
document.getElementById('downloadBtn').addEventListener('click', downloadReport);
document.getElementById('resetBtn').addEventListener('click', reset);

renderQuestions();
updateRiskAssessment();