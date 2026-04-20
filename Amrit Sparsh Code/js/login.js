document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");
    const loginBtn = document.querySelector(".login-btn");

    // Use your existing backend login endpoint
    const API_URL = "http://127.0.0.1:8000/auth/login";

    // Toggle password eye icon
    togglePassword.addEventListener("click", function () {
        const type = passwordInput.type === "password" ? "text" : "password";
        passwordInput.type = type;
        this.classList.toggle("fa-eye");
        this.classList.toggle("fa-eye-slash");
    });

    // Login submit handler
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        loginBtn.classList.add("loading");
        loginBtn.disabled = true;

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const text = await res.text();
                alert("Invalid Email or Password");
                loginBtn.classList.remove("loading");
                loginBtn.disabled = false;
                return;
            }

            const data = await res.json();

// Save session  
sessionStorage.setItem("authToken", data.token);
sessionStorage.setItem("userRole", data.role);

// SAVE USER FIRST NAME for navbar
if (data.profile && data.profile.full_name) {
    const firstName = data.profile.full_name.split(" ")[0];
    sessionStorage.setItem("userFirstName", firstName);

}

// Save full profile JSON for profile page
if (data.profile) {
    sessionStorage.setItem("profile", JSON.stringify(data.profile));
}

            // Save profile object returned by backend (may be null)
            if (data.profile) {
                sessionStorage.setItem("profile", JSON.stringify(data.profile));
                // store convenient first name for navbar quick access
                const firstName = (data.profile.full_name || "").split(" ")[0] || "";
                if (firstName) sessionStorage.setItem("userFirstName", firstName);
                // ⭐ REQUIRED FOR AI CHATBOT (Stores logged-in email)
                if (data.profile && data.profile.user_email) {
                    localStorage.setItem("logged_in_email", data.profile.user_email);
                }
            } else {
                // fallback: store email so front-end can still show something if needed
                sessionStorage.setItem("profile", JSON.stringify({ email }));
                sessionStorage.setItem("userFirstName", email.split("@")[0]);
            }

            // Redirect to home page
            window.location.href = "pages/home.html";

        } catch (error) {
            console.error(error);
            alert("Failed to connect to server");
        }

        loginBtn.classList.remove("loading");
        loginBtn.disabled = false;
    });
});
