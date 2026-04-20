if (!sessionStorage.getItem('authToken')) {
    window.location.href = 'index.html';
}

document.addEventListener("DOMContentLoaded", function () {
    const greetingBold = document.getElementById("greeting-bold");
    if (greetingBold) {
        let displayName = "Doctor";

        // Try to get full name from profile
        const profileStr = sessionStorage.getItem("profile");
        if (profileStr) {
            try {
                const profile = JSON.parse(profileStr);
                if (profile.full_name) {
                    displayName = profile.full_name;
                }
            } catch (e) {
                console.error("Error parsing profile from sessionStorage", e);
            }
        }

        // Fallback to userFirstName if profile parsing failed or full_name missing
        if (displayName === "Doctor") {
            const firstName = sessionStorage.getItem("userFirstName");
            if (firstName) displayName = firstName;
        }

        greetingBold.textContent = displayName.toUpperCase();
    }
});
