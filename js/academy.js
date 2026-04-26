const filterButtons = document.querySelectorAll('.academy-filter');
const cards = document.querySelectorAll('.academy-card');

const setActiveSlide = (card, index) => {
    const dots = card.querySelectorAll('.academy-card__dot');
    const images = card.querySelectorAll('.academy-card__image');

    dots.forEach((item) => item.classList.remove('active'));
    images.forEach((img) => img.classList.remove('active'));

    if (dots[index]) {
        dots[index].classList.add('active');
    }
    if (images[index]) {
        images[index].classList.add('active');
    }
};

cards.forEach((card) => {
    const dots = card.querySelectorAll('.academy-card__dot');
    const images = card.querySelectorAll('.academy-card__image');
    let currentIndex = 0;
    const slideCount = images.length;

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            setActiveSlide(card, currentIndex);
        });
    });

    if (slideCount > 1) {
        setInterval(() => {
            currentIndex = (currentIndex + 1) % slideCount;
            setActiveSlide(card, currentIndex);
        }, 4000);
    }
});

filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const filter = button.textContent.trim().toLowerCase();

        filterButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');

        cards.forEach((card) => {
            const category = card.dataset.category;
            const shouldShow = filter === 'all' || category === filter;
            card.style.display = shouldShow ? '' : 'none';
        });
    });
});




const fb = document.querySelectorAll(".filter-btn");
const doctorCards = document.querySelectorAll(".doctor-card");

fb.forEach(btn => {
    btn.addEventListener("click", () => {
        const filter = btn.dataset.filter;

        // active state
        fb.forEach(b => b.classList.remove("active"));
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