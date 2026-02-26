/* ================= GLOBAL NAVIGATION & ACTIONS ================= */

(function () {
    const initGlobalActions = () => {
        // Login/Logout button logic
        const authBtn = document.querySelector(".header-right .btn-black:first-child");
        if (authBtn) {
            const token = localStorage.getItem("token");
            if (token) {
                authBtn.textContent = "LOGOUT";
                
                // Add Dashboard link
                const nav = document.querySelector(".nav-pill");
                if (nav && !nav.querySelector('a[href="dashboard.html"]')) {
                    const dashLink = document.createElement("a");
                    dashLink.href = "dashboard.html";
                    dashLink.className = "pill";
                    dashLink.textContent = "DASHBOARD";
                    nav.appendChild(dashLink);
                }

                authBtn.addEventListener("click", () => {
                    localStorage.removeItem("token");
                    window.location.reload();
                });
            } else {
                authBtn.addEventListener("click", () => {
                    // Check if current path is already pages/auth.html
                    if (!window.location.pathname.includes("auth.html")) {
                        window.location.href = "auth.html";
                    }
                });
            }
        }

        // Header GET IN TOUCH / Book button logic
        const headerActionBtn = document.querySelector(".header .header-right .btn-black:last-child");
        if (headerActionBtn && (headerActionBtn.textContent.includes("GET IN TOUCH") || headerActionBtn.textContent.includes("Book"))) {
            headerActionBtn.addEventListener("click", (e) => {
                const contactForm = document.getElementById("contactForm");
                if (contactForm) {
                    e.preventDefault();
                    contactForm.scrollIntoView({ behavior: "smooth", block: "center" });
                    contactForm.classList.add("highlight-flash");
                    setTimeout(() => contactForm.classList.remove("highlight-flash"), 1500);
                } else {
                    // If no contact form on page, redirect to home
                    window.location.href = "index.html#contactForm";
                }
            });
        }

        // Global "Book an appointment" buttons
        document.querySelectorAll(".book-pill, .academy-btn, .btn-black").forEach(btn => {
            if (btn.textContent.includes("Book") || btn.textContent.includes("Записаться")) {
                btn.addEventListener("click", (e) => {
                    // Skip if it's the doctor modal button (handled in doctor-modal.js)
                    if (btn.closest(".doctor-modal") || btn.closest(".doctor-card")) return;

                    const contactForm = document.getElementById("contactForm");
                    if (contactForm) {
                        e.preventDefault();
                        contactForm.scrollIntoView({ behavior: "smooth", block: "center" });
                    } else {
                        // If no contact form, maybe go to doctors list
                        if (!window.location.pathname.includes("doctors.html")) {
                            window.location.href = "doctors.html";
                        }
                    }
                });
            }
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initGlobalActions);
    } else {
        initGlobalActions();
    }
})();
