/* ================= DOCTOR MODAL (SHARED) ================= */

(function () {
    const setupDoctorModal = () => {
        const modal = document.getElementById("doctorModal");
        if (!modal) return;

        const closeBtn = modal.querySelector(".doctor-modal-close");
        const nameEl = modal.querySelector(".doctor-name");
        const roleEl = modal.querySelector(".doctor-role");
        const expEl  = modal.querySelector(".doctor-exp");
        const textEl = modal.querySelector(".doctor-text");
        const imgs   = modal.querySelectorAll(".doctor-modal-img, .doctor-photo");
        const body = document.body;

        const openModal = (data) => {
            if (nameEl) nameEl.textContent = data.name;
            if (roleEl) roleEl.textContent = data.role || data.specialty;
            if (expEl) expEl.textContent  = `Стаж работы: ${data.exp || 10} лет`;

            if (textEl) {
                textEl.innerHTML = `
                    <p><strong>Образование:</strong><br>${data.edu || 'Medical University'}</p>
                    <p><strong>Специализация:</strong><br>${data.spec || data.specialty}</p>
                `;
            }

            if (imgs && imgs.length > 0) {
                imgs.forEach(img => {
                    const url = data.img || '../../assets/images/orange-doctor.png';
                    if (img.tagName === 'IMG') {
                        img.src = url;
                    } else {
                        img.style.backgroundImage = `url(${url})`;
                        img.style.backgroundSize = 'cover';
                    }
                });
            }

            modal.classList.add("active");
            body.style.overflow = "hidden";
            modal.dataset.doctorId = data.id;
        };

        const closeModal = () => {
            modal.classList.remove("active");
            body.style.overflow = "";
        };

        document.addEventListener("click", e => {
            const card = e.target.closest(".doctor-card");
            if (card) {
                openModal({
                    id: card.dataset.id,
                    name: card.dataset.name,
                    role: card.dataset.role,
                    exp: card.dataset.exp,
                    edu: card.dataset.edu,
                    spec: card.dataset.spec,
                    img: card.dataset.img
                });
            }
        });

        if (closeBtn) closeBtn.addEventListener("click", closeModal);
        modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
        document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

        const bookBtn = modal.querySelector(".btn-black:last-child");
        if (bookBtn && bookBtn.textContent.includes("Записаться")) {
            bookBtn.addEventListener("click", async () => {
                const doctorId = modal.dataset.doctorId;
                if (!doctorId) return;
                try {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    await window.api.post("/appointments", {
                        doctor_id: parseInt(doctorId),
                        datetime: tomorrow.toISOString()
                    });
                    alert("Вы успешно записаны!");
                    closeModal();
                } catch (e) {
                    alert(e.message.includes("401") || e.message.includes("Unauthorized") ? "Пожалуйста, войдите в систему." : "Ошибка: " + e.message);
                }
            });
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupDoctorModal);
    } else {
        setupDoctorModal();
    }
})();
