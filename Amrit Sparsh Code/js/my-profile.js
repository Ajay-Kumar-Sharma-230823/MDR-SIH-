const defaultConfig = {
    background_color: "#0066cc",
    surface_color: "#ffffff",
    text_color: "#1a2332",
    primary_action_color: "#0066cc",
    secondary_action_color: "#f0f7ff",
    font_family: "Inter",
    font_size: 15,
    user_name: "Dr. Anjali Sharma",
    user_role: "Senior Physician",
    hospital_name: "Amrit Sparsh Healthcare",
    gender: "Female",
    dob: "15 March 1985 (39 years)",
    mobile: "+91 98765 43210",
    email: "anjali.sharma@amritsparsh.in",
    emergency_contact: "+91 98765 00000",
    employee_id: "EMP-2024-1234",
    department: "Cardiology",
    designation: "Senior Consultant",
    shift_timing: "09:00 AM - 05:00 PM",
    abha_number: "12-3456-7890-1234",
    health_id_status: "Verified",
    login_email: "anjali.sharma@amritsparsh.in",
    last_login: "24 Dec 2024, 09:15 AM"
};

// --------------------------------------------------
// Helper: try to read profile from sessionStorage
// and map fields to our defaultConfig keys.
// This allows backend-sent profiles to populate the page.
// --------------------------------------------------
function applyProfileFromSession() {
    try {
        const raw = sessionStorage.getItem('profile');
        if (!raw) return;
        const profile = JSON.parse(raw);

        // Map common backend field names to the front-end config.
        // Only overwrite if field exists in profile.
        if (profile.full_name) defaultConfig.user_name = profile.full_name;
        if (profile.name) defaultConfig.user_name = profile.name; // alternate
        if (profile.designation) defaultConfig.user_role = profile.designation;
        if (profile.role && !defaultConfig.user_role) defaultConfig.user_role = profile.role;
        if (profile.hospital_name) defaultConfig.hospital_name = profile.hospital_name;
        if (profile.gender) defaultConfig.gender = profile.gender;
        if (profile.dob) defaultConfig.dob = profile.dob;
        if (profile.mobile) defaultConfig.mobile = profile.mobile;
        if (profile.phone) defaultConfig.mobile = profile.phone; // alternate
        if (profile.email) defaultConfig.email = profile.email;
        if (profile.employee_id) defaultConfig.employee_id = profile.employee_id;
        if (profile.employeeId) defaultConfig.employee_id = profile.employeeId; // alternate
        if (profile.department) defaultConfig.department = profile.department;
        if (profile.designation) defaultConfig.designation = profile.designation;
        if (profile.shift_timing) defaultConfig.shift_timing = profile.shift_timing;
        if (profile.shift) defaultConfig.shift_timing = profile.shift;
        if (profile.abha_number) defaultConfig.abha_number = profile.abha_number;
        if (profile.abha) defaultConfig.abha_number = profile.abha;
        if (profile.login_email) defaultConfig.login_email = profile.login_email;
        if (profile.email) defaultConfig.login_email = profile.email;

        // last_login: use server value if provided, else set to now
        if (profile.last_login) defaultConfig.last_login = profile.last_login;
        else defaultConfig.last_login = new Date().toLocaleString();

        // Save a convenient first name for the navbar to read
        const nameForNav = (profile.full_name || profile.name || profile.email || "").split(" ")[0];
        if (nameForNav) sessionStorage.setItem("userFirstName", nameForNav);

    } catch (e) {
        console.warn("my-profile: failed to parse session profile", e);
    }
}

// Run mapping now (so defaultConfig is updated before UI render)
applyProfileFromSession();

async function onConfigChange(config) {
    const customFont = config.font_family || defaultConfig.font_family;
    const baseSize = config.font_size || defaultConfig.font_size;
    const baseFontStack = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    document.body.style.fontFamily = `${customFont}, ${baseFontStack}`;

    const profileHeader = document.querySelector('.profile-header');
    if (profileHeader) {
        profileHeader.style.background = `linear-gradient(135deg, ${config.background_color || defaultConfig.background_color} 0%, ${adjustColor(config.background_color || defaultConfig.background_color, -20)} 100%)`;
    }

    const infoCards = document.querySelectorAll('.info-card');
    infoCards.forEach(card => {
        card.style.background = config.surface_color || defaultConfig.surface_color;
        card.style.color = config.text_color || defaultConfig.text_color;
    });

    const cardTitles = document.querySelectorAll('.card-title');
    cardTitles.forEach(title => {
        title.style.color = config.text_color || defaultConfig.text_color;
        title.style.fontSize = `${baseSize * 1.2}px`;
    });

    const infoLabels = document.querySelectorAll('.info-label');
    infoLabels.forEach(label => {
        label.style.fontSize = `${baseSize * 0.87}px`;
    });

    const infoValues = document.querySelectorAll('.info-value');
    infoValues.forEach(value => {
        value.style.color = config.text_color || defaultConfig.text_color;
        value.style.fontSize = `${baseSize}px`;
    });

    const userName = document.querySelectorAll('.user-name');
    userName.forEach(name => {
        name.style.fontSize = `${baseSize * 1.87}px`;
    });

    const userRole = document.querySelectorAll('.user-role');
    userRole.forEach(role => {
        role.style.fontSize = `${baseSize * 1.07}px`;
    });

    const hospitalNameElements = document.querySelectorAll('.hospital-name');
    hospitalNameElements.forEach(name => {
        name.style.fontSize = `${baseSize * 0.93}px`;
    });

    const primaryButtons = document.querySelectorAll('.btn-primary');
    primaryButtons.forEach(btn => {
        btn.style.background = config.primary_action_color || defaultConfig.primary_action_color;
        btn.style.fontSize = `${baseSize}px`;
    });

    const secondaryButtons = document.querySelectorAll('.btn-secondary');
    secondaryButtons.forEach(btn => {
        btn.style.color = config.primary_action_color || defaultConfig.primary_action_color;
        btn.style.borderColor = config.primary_action_color || defaultConfig.primary_action_color;
        btn.style.fontSize = `${baseSize}px`;
    });

    const outlineButtons = document.querySelectorAll('.btn-outline');
    outlineButtons.forEach(btn => {
        btn.style.fontSize = `${baseSize}px`;
    });

    // Populate DOM values with config (or fallback defaults)
    if (document.getElementById('userName')) document.getElementById('userName').textContent = config.user_name || defaultConfig.user_name;
    if (document.getElementById('userRole')) document.getElementById('userRole').textContent = config.user_role || defaultConfig.user_role;
    if (document.getElementById('hospitalName')) document.getElementById('hospitalName').textContent = config.hospital_name || defaultConfig.hospital_name;
    if (document.getElementById('fullName')) document.getElementById('fullName').textContent = config.user_name || defaultConfig.user_name;
    if (document.getElementById('gender')) document.getElementById('gender').textContent = config.gender || defaultConfig.gender;
    if (document.getElementById('dob')) document.getElementById('dob').textContent = config.dob || defaultConfig.dob;
    if (document.getElementById('mobile')) document.getElementById('mobile').textContent = config.mobile || defaultConfig.mobile;
    if (document.getElementById('email')) document.getElementById('email').textContent = config.email || defaultConfig.email;
    if (document.getElementById('emergencyContact')) document.getElementById('emergencyContact').textContent = config.emergency_contact || defaultConfig.emergency_contact;
    if (document.getElementById('employeeId')) document.getElementById('employeeId').textContent = config.employee_id || defaultConfig.employee_id;
    if (document.getElementById('department')) document.getElementById('department').textContent = config.department || defaultConfig.department;
    if (document.getElementById('designation')) document.getElementById('designation').textContent = config.designation || defaultConfig.designation;
    if (document.getElementById('shiftTiming')) document.getElementById('shiftTiming').textContent = config.shift_timing || defaultConfig.shift_timing;
    if (document.getElementById('abhaNumber')) document.getElementById('abhaNumber').textContent = config.abha_number || defaultConfig.abha_number;
    if (document.getElementById('healthIdStatus')) document.getElementById('healthIdStatus').innerHTML = `<span class="status-dot"></span>${config.health_id_status || defaultConfig.health_id_status}`;
    if (document.getElementById('loginEmail')) document.getElementById('loginEmail').textContent = config.login_email || defaultConfig.login_email;
    if (document.getElementById('lastLogin')) document.getElementById('lastLogin').textContent = config.last_login || defaultConfig.last_login;

    const initials = (config.user_name || defaultConfig.user_name).split(' ').map(n => n[0]).join('').substring(0, 2);
    if (document.getElementById('profilePhoto')) document.getElementById('profilePhoto').textContent = initials;

    // Also update navbar greeting if navbar fragment exists on page now
    try {
        const firstName = (config.user_name || defaultConfig.user_name).split(' ')[0];
        const greetingBold = document.getElementById('greeting-bold');
        const greetingLight = document.getElementById('greeting-light');
        if (greetingBold) {
            greetingBold.textContent = firstName;
            greetingBold.style.fontWeight = "700";
        }
        if (greetingLight) {
            // keep existing prefix but if it's the default "HEY BHIYAON," we leave it
            // otherwise leave as-is
            // no change required here; optional update if you want:
            // greetingLight.textContent = "HEY,";
        }
    } catch (e) {
        // no-op
    }
}

function adjustColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
}

function mapToCapabilities(config) {
    return {
        recolorables: [
            {
                get: () => config.background_color || defaultConfig.background_color,
                set: (value) => {
                    if (window.elementSdk) {
                        window.elementSdk.config.background_color = value;
                        window.elementSdk.setConfig({ background_color: value });
                    }
                }
            },
            {
                get: () => config.surface_color || defaultConfig.surface_color,
                set: (value) => {
                    if (window.elementSdk) {
                        window.elementSdk.config.surface_color = value;
                        window.elementSdk.setConfig({ surface_color: value });
                    }
                }
            },
            {
                get: () => config.text_color || defaultConfig.text_color,
                set: (value) => {
                    if (window.elementSdk) {
                        window.elementSdk.config.text_color = value;
                        window.elementSdk.setConfig({ text_color: value });
                    }
                }
            },
            {
                get: () => config.primary_action_color || defaultConfig.primary_action_color,
                set: (value) => {
                    if (window.elementSdk) {
                        window.elementSdk.config.primary_action_color = value;
                        window.elementSdk.setConfig({ primary_action_color: value });
                    }
                }
            }
        ],
        borderables: [],
        fontEditable: {
            get: () => config.font_family || defaultConfig.font_family,
            set: (value) => {
                if (window.elementSdk) {
                    window.elementSdk.config.font_family = value;
                    window.elementSdk.setConfig({ font_family: value });
                }
            }
        },
        fontSizeable: {
            get: () => config.font_size || defaultConfig.font_size,
            set: (value) => {
                if (window.elementSdk) {
                    window.elementSdk.config.font_size = value;
                    window.elementSdk.setConfig({ font_size: value });
                }
            }
        }
    };
}

function mapToEditPanelValues(config) {
    return new Map([
        ["user_name", config.user_name || defaultConfig.user_name],
        ["user_role", config.user_role || defaultConfig.user_role],
        ["hospital_name", config.hospital_name || defaultConfig.hospital_name],
        ["gender", config.gender || defaultConfig.gender],
        ["dob", config.dob || defaultConfig.dob],
        ["mobile", config.mobile || defaultConfig.mobile],
        ["email", config.email || defaultConfig.email],
        ["emergency_contact", config.emergency_contact || defaultConfig.emergency_contact],
        ["employee_id", config.employee_id || defaultConfig.employee_id],
        ["department", config.department || defaultConfig.department],
        ["designation", config.designation || defaultConfig.designation],
        ["shift_timing", config.shift_timing || defaultConfig.shift_timing],
        ["abha_number", config.abha_number || defaultConfig.abha_number],
        ["health_id_status", config.health_id_status || defaultConfig.health_id_status],
        ["login_email", config.login_email || defaultConfig.login_email],
        ["last_login", config.last_login || defaultConfig.last_login]
    ]);
}

function handleEditProfile() {
    const message = document.createElement('div');
    message.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#0066cc;color:white;padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:1000;font-size:15px;font-weight:500;';
    message.textContent = 'Edit mode activated. Modify profile details above.';
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
}

function handleSaveChanges() {
    const message = document.createElement('div');
    message.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#0d8a3f;color:white;padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:1000;font-size:15px;font-weight:500;';
    message.textContent = '✓ Profile changes saved successfully';
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
}

function handleChangePassword() {
    const message = document.createElement('div');
    message.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#0066cc;color:white;padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:1000;font-size:15px;font-weight:500;';
    message.textContent = 'Password change dialog would open here';
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
}

if (window.elementSdk) {
    window.elementSdk.init({
        defaultConfig,
        onConfigChange,
        mapToCapabilities,
        mapToEditPanelValues
    });
}

// Initialize styles on load (use the possibly-updated defaultConfig)
document.addEventListener("DOMContentLoaded", () => {

    // get saved profile from login
    const saved = sessionStorage.getItem("profile");
    let profile = null;

    if (saved) {
        profile = JSON.parse(saved);

        // update defaultConfig dynamically
        defaultConfig.user_name = profile.full_name || defaultConfig.user_name;
        defaultConfig.email = profile.user_email || defaultConfig.email;
        defaultConfig.login_email = profile.user_email || defaultConfig.login_email;
        defaultConfig.mobile = profile.phone || defaultConfig.mobile;
        defaultConfig.emergency_contact = profile.emergency_contact || defaultConfig.emergency_contact;
        defaultConfig.abha_number = profile.abha || defaultConfig.abha_number;
        defaultConfig.department = profile.department || defaultConfig.department;
        defaultConfig.designation = profile.designation || defaultConfig.designation;
    }

    // finally update UI
    onConfigChange(defaultConfig);
});
