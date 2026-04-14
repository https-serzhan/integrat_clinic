/* ================= DOCTORS PAGE LOGIC ================= */

const setupFilters = () => {
    document.addEventListener("click", e => {
        if (e.target.classList.contains("filter-btn")) {
            const btn = e.target;
            const filter = btn.dataset.filter;
            const filterButtons = document.querySelectorAll(".filter-btn");
            const doctorCards = document.querySelectorAll(".doctor-card");

            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            doctorCards.forEach(card => {
                const categories = card.dataset.category ? card.dataset.category.split(" ") : [];
                if (filter === "all" || categories.includes(filter)) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        }
        
        if (e.target.classList.contains("treatment-filter")) {
            const btn = e.target;
            const filter = btn.dataset.filter;
            const treatmentFilters = document.querySelectorAll(".treatment-filter");
            const treatmentCards = document.querySelectorAll(".treatment-card");

            treatmentFilters.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            treatmentCards.forEach(card => {
                const categories = card.dataset.category ? card.dataset.category.split(" ") : [];
                if (filter === "all" || categories.includes(filter)) {
                    card.style.display = "";
                } else {
                    card.style.display = "none";
                }
            });
        }
    });
};

const loadDoctors = async () => {
    const grid = document.querySelector(".doctors-grid");
    if (!grid) return;

    try {
        const doctors = await window.api.get("/doctors");
        if (doctors.length > 0) {
            grid.innerHTML = "";
            doctors.forEach(dr => {
                const card = document.createElement("article");
                card.className = "doctor-card";
                card.dataset.id = dr.id;
                card.dataset.name = dr.name;
                card.dataset.role = dr.specialty;
                card.dataset.category = "all " + dr.specialty.toLowerCase();
                card.dataset.img = "../../assets/images/orange-doctor.png";
                card.dataset.exp = "10";
                card.dataset.edu = "Medical University graduation";
                card.dataset.spec = dr.specialty;

                card.innerHTML = `
                    <div class="doctor-photo">
                        <img src="../../assets/images/orange-doctor.png" alt="">
                    </div>
                    <h4>${dr.name}</h4>
                    <p>${dr.specialty}</p>
                `;
                grid.appendChild(card);
            });
        }
    } catch (e) {
        console.error("Failed to load doctors:", e);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    setupFilters();
    loadDoctors();
});