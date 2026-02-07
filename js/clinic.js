/* ================= TREATMENTS CENTER CAROUSEL ================= */

(function () {
    const slider = document.querySelector(".treatments-slider");
    const track = document.querySelector(".treatments-track");
    const slides = Array.from(document.querySelectorAll(".treat-slide"));
    const prev = document.querySelector(".treat-arrow.prev");
    const next = document.querySelector(".treat-arrow.next");

    if (!slider || !track || slides.length === 0) return;

    let index = 1; // center slide by default (like your design)
    let timer = null;

    function setActive(i) {
        index = (i + slides.length) % slides.length;

        slides.forEach((s, k) => s.classList.toggle("is-active", k === index));

        // center active slide
        const active = slides[index];
        const sliderCenter = slider.clientWidth / 2;
        const activeCenter = active.offsetLeft + active.offsetWidth / 2;

        const translate = sliderCenter - activeCenter;
        track.style.transform = `translateX(${translate}px)`;
    }

    function startAutoplay() {
        stopAutoplay();
        timer = setInterval(() => setActive(index + 1), 4500);
    }

    function stopAutoplay() {
        if (timer) clearInterval(timer);
        timer = null;
    }

    prev.addEventListener("click", () => {
        setActive(index - 1);
        startAutoplay();
    });

    next.addEventListener("click", () => {
        setActive(index + 1);
        startAutoplay();
    });

    // pause autoplay when hovering this section (optional but nice)
    slider.addEventListener("mouseenter", stopAutoplay);
    slider.addEventListener("mouseleave", startAutoplay);

    // keep centered on resize
    window.addEventListener("resize", () => setActive(index));

    // init
    setActive(index);
    startAutoplay();
})();


const modal = document.getElementById('doctorModal');
const closeBtn = modal.querySelector('.doctor-modal-close');

const nameEl = modal.querySelector('.doctor-name');
const roleEl = modal.querySelector('.doctor-role');
const expEl = modal.querySelector('.doctor-exp');
const textEl = modal.querySelector('.doctor-text');
const imgs = modal.querySelectorAll('.doctor-modal-top .doctor-photo');


document.querySelectorAll('.doctor-card').forEach(card => {
    card.addEventListener('click', () => {

        nameEl.textContent = card.dataset.name;
        roleEl.textContent = card.dataset.role;
        expEl.textContent = `Стаж работы: ${card.dataset.exp} лет`;

        textEl.innerHTML = `
            <p><strong>Образование:</strong><br>${card.dataset.edu}</p>
            <p><strong>Специализация:</strong><br>${card.dataset.spec}</p>
        `;

        imgs.forEach(el => {
            el.style.backgroundImage = `url(${card.dataset.img})`;
            el.style.backgroundSize = 'cover';
            el.style.backgroundPosition = 'center';
        });


        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

closeBtn.addEventListener('click', closeModal);

modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
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


