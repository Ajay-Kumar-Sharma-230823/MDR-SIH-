// --------------------------------------------
// Hospital Data
// --------------------------------------------
const hospitalData = {
    "Bhopal": ["Bansal Hospital", "Apollo Sage Hospital", "Galaxy Hospital", "Malti Hospital"],
    "Gwalior": ["BIMR Hospitals", "Global Speciality Hospital", "Kalyan Multi Speciality Hospital", "Suyash Hospital"],
    "Mumbai": ["Bombay Hospital", "SevenHills Hospital", "Wockhardt Hospitals", "Apollo Hospitals"],
    "Pune": ["Sahyadri Hospitals", "Ruby Hall Clinic", "Jehangir Hospital", "Noble Hospital"],
    "Nagpur": ["Wockhardt Super Specialty Hospital", "Orange City Hospital", "Alexis Hospital", "CIIMS Hospital"]
};


// --------------------------------------------
// DOM READY
// --------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

    const citySelect = document.getElementById('city');
    const hospitalSelect = document.getElementById('hospital');
    const profilePhotoInput = document.getElementById('profilePhoto');
    const uploadPreview = document.getElementById('uploadPreview');


    // --------------------------------------------
    // City -> Hospital Mapping
    // --------------------------------------------
    citySelect.addEventListener('change', function () {
        const selectedCity = this.value;

        hospitalSelect.innerHTML = '<option value="" disabled selected>Select Hospital</option>';
        hospitalSelect.disabled = true;

        if (selectedCity && hospitalData[selectedCity]) {
            hospitalSelect.disabled = false;
            hospitalData[selectedCity].forEach(hospital => {
                const option = document.createElement('option');
                option.value = hospital;
                option.textContent = hospital;
                hospitalSelect.appendChild(option);
            });
        }
    });


    // --------------------------------------------
    // Profile Photo Preview
    // --------------------------------------------
    profilePhotoInput.addEventListener('change', function (e) {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                uploadPreview.innerHTML = `<img src="${e.target.result}" alt="Profile Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });


    // --------------------------------------------
    // FORM SUBMIT — REAL API CALL
    // --------------------------------------------
    document.getElementById('createAccountForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const data = {
            full_name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            gender: document.getElementById('gender').value,
            dob: document.getElementById('dob').value,
            phone: document.getElementById('mobile').value,

            // EXTRA VALUES — backend requires them
            department: document.getElementById('hospital').value || "General",
            designation: "Doctor",
            employee_id: "AUTO",
            shift: "General",
            abha: "N/A",
            emergency_contact: "N/A"
        };

        console.log("Sending:", data);

        try {
            const res = await fetch("http://127.0.0.1:8000/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await res.json();
            console.log("Server Response:", result);

            if (!res.ok || result.success === false) {
                alert(result.detail || result.message || "Failed to create account");
                return;
            }

            alert("Account created successfully! Please login.");
            window.location.href = "../index.html";

        } catch (err) {
            console.error("Registration Error:", err);
            alert("Server error. Please try again.");
        }
    });
});


// --------------------------------------------
// PASSWORD SHOW / HIDE
// --------------------------------------------
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.textContent = '🙈'; // hide icon
    } else {
        passwordInput.type = 'password';
        toggleIcon.textContent = '👁️'; // show icon
    }
}
