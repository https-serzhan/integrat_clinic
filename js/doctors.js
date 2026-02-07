/* ================= DOCTOR MODAL ================= */

const modal = document.getElementById("doctorModal");
const closeBtn = modal.querySelector(".doctor-modal-close");

const nameEl = modal.querySelector(".doctor-name");
const roleEl = modal.querySelector(".doctor-role");
const expEl  = modal.querySelector(".doctor-exp");
const textEl = modal.querySelector(".doctor-text");
const imgs   = modal.querySelectorAll(".doctor-modal-img");

const body = document.body;

/* Open modal */
document.querySelectorAll(".doctor-card").forEach(card => {
    card.addEventListener("click", () => {
        nameEl.textContent = card.dataset.name;
        roleEl.textContent = card.dataset.role;
        expEl.textContent  = `Стаж работы: ${card.dataset.exp} лет`;

        textEl.innerHTML = `
            <p><strong>Образование:</strong><br>${card.dataset.edu}</p>
            <p><strong>Специализация:</strong><br>${card.dataset.spec}</p>
        `;

        // image handling (same image duplicated if only one provided)
        imgs[0].src = card.dataset.img;
        imgs[1].src = card.dataset.img;

        modal.classList.add("active");
        body.style.overflow = "hidden";
    });
});

/* Close modal */
function closeModal() {
    modal.classList.remove("active");
    body.style.overflow = "";
}

closeBtn.addEventListener("click", closeModal);

modal.addEventListener("click", e => {
    if (e.target === modal) closeModal();
});

document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
});


/* ================= FILTERS ================= */

const filterButtons = document.querySelectorAll(".filter-btn");
const doctorCards = document.querySelectorAll(".doctor-card");

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const filter = btn.dataset.filter;

        // active state
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        doctorCards.forEach(card => {
            const categories = card.dataset.category.split(" ");

            if (filter === "all" || categories.includes(filter)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const filterButtons = document.querySelectorAll(".treatment-filter");
    const cards = document.querySelectorAll(".treatment-card");

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const filter = btn.dataset.filter;

            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            cards.forEach(card => {
                const categories = card.dataset.category.split(" ");

                if (filter === "all" || categories.includes(filter)) {
                    card.style.display = "";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });
});

/* ================= PHONE MASK ================= */
const phoneInput = document.getElementById("phoneInput");
const form = document.getElementById("contactForm");

/* PHONE MASK: +7 (XXX) XXX XX-XX */
phoneInput.addEventListener("input", () => {
    let digits = phoneInput.value.replace(/\D/g, "");

    if (digits.startsWith("7")) digits = digits.slice(1);
    digits = digits.slice(0, 10);

    let formatted = "+7";

    if (digits.length > 0) formatted += " (" + digits.slice(0, 3);
    if (digits.length >= 3) formatted += ")";
    if (digits.length > 3) formatted += " " + digits.slice(3, 6);
    if (digits.length > 6) formatted += " " + digits.slice(6, 8);
    if (digits.length > 8) formatted += "-" + digits.slice(8, 10);

    phoneInput.value = formatted;
});

/* FORM VALIDATION */
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = form.fullname.value.trim();
    const phone = phoneInput.value.replace(/\D/g, "");
    const comment = form.comment.value.trim();
    const agree = document.getElementById("agree").checked;

    if (!name || !comment || phone.length !== 11 || !agree) {
        alert("Пожалуйста, заполните все поля корректно.");
        return;
    }

    alert("Форма успешно отправлена ✅");

    // BACKEND READY:
    // fetch("/api/send", { method: "POST", body: new FormData(form) })
});