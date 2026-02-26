/* ================= TREATMENTS CENTER CAROUSEL ================= */

(function () {
    const slider = document.querySelector(".treatments-slider");
    const track = document.querySelector(".treatments-track");
    const slides = Array.from(document.querySelectorAll(".treat-slide"));
    const prev = document.querySelector(".treat-arrow.prev");
    const next = document.querySelector(".treat-arrow.next");

    if (!slider || !track || slides.length === 0) return;

    let index = 1; // center slide by default
    let timer = null;

    function setActive(i) {
        index = (i + slides.length) % slides.length;
        slides.forEach((s, k) => s.classList.toggle("is-active", k === index));
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

    if (prev) prev.addEventListener("click", () => { setActive(index - 1); startAutoplay(); });
    if (next) next.addEventListener("click", () => { setActive(index + 1); startAutoplay(); });

    slider.addEventListener("mouseenter", stopAutoplay);
    slider.addEventListener("mouseleave", startAutoplay);
    window.addEventListener("resize", () => setActive(index));

    setActive(index);
    startAutoplay();
})();
