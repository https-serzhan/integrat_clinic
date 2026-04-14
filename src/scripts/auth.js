(function () {
    const tabs = document.querySelectorAll(".auth-tab");
    const forms = document.querySelectorAll(".auth-form");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    // Tab switching logic
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const target = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            forms.forEach(f => {
                f.classList.remove("active");
                if (f.id === `${target}Form`) {
                    f.classList.add("active");
                }
            });
        });
    });

    // Login logic
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById("loginError");
        errorEl.style.display = "none";

        const email = loginForm.email.value;
        const password = loginForm.password.value;

        try {
            const data = await window.api.post("/auth/login", { email, password });
            localStorage.setItem("token", data.access_token);
            window.location.href = "index.html";
        } catch (error) {
            errorEl.textContent = error.message || "Login failed";
            errorEl.style.display = "block";
        }
    });

    // Register logic
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById("registerError");
        errorEl.style.display = "none";

        const email = registerForm.email.value;
        const password = registerForm.password.value;
        const confirmPassword = registerForm.confirmPassword.value;

        if (password !== confirmPassword) {
            errorEl.textContent = "Passwords do not match";
            errorEl.style.display = "block";
            return;
        }

        try {
            await window.api.post("/auth/register", { email, password });
            // After register, auto-login or show success
            const data = await window.api.post("/auth/login", { email, password });
            localStorage.setItem("token", data.access_token);
            alert("Registration successful! Welcome to Integrat.");
            window.location.href = "index.html";
        } catch (error) {
            errorEl.textContent = error.message || "Registration failed";
            errorEl.style.display = "block";
        }
    });
})();
