document.addEventListener('DOMContentLoaded', () => {

    // 1. Get all buttons
    const buttons = document.querySelectorAll('.lang-btn');

    // 2. Add Click Event to each button
    buttons.forEach(btn => {
        btn.addEventListener('click', function () {
            // Get the language (en or hi) from the clicked button
            const lang = this.getAttribute('data-lang');

            if (lang) {
                // Change Language
                setLanguage(lang);

                // Change Button Color
                buttons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Default: Load saved language or English
    const currentLang = localStorage.getItem('mdrLanguage') || 'en';
    setLanguage(currentLang);

    // Set default active button
    buttons.forEach(btn => {
        if (btn.getAttribute('data-lang') === currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
});

// Function to Show/Hide Text
function setLanguage(lang) {
    localStorage.setItem('mdrLanguage', lang);
    const hindiTexts = document.querySelectorAll('.lang-hi');
    const englishTexts = document.querySelectorAll('.lang-en');

    if (lang === 'hi') {
        // Show Hindi, Hide English
        hindiTexts.forEach(el => el.style.display = 'inline');
        englishTexts.forEach(el => el.style.display = 'none');
    } else {
        // Hide Hindi, Show English
        hindiTexts.forEach(el => el.style.display = 'none');
        englishTexts.forEach(el => el.style.display = 'inline');
    }
}