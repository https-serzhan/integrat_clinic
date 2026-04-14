const slides = document.querySelectorAll(".course-slide");
const dots = document.querySelectorAll(".course-progress .seg");
const track = document.querySelector(".course-track");

let current = 0;
let autoplay;
let startX = 0;
let dragging = false;

/* ---------- CORE ---------- */
function showSlide(index) {
    current = index;

    slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
        dots[i].classList.toggle("active", i === index);
    });
}

/* ---------- AUTOPLAY ---------- */
function startAutoplay() {
    stopAutoplay();
    autoplay = setInterval(() => {
        showSlide((current + 1) % slides.length);
    }, 5000);
}

function stopAutoplay() {
    if (autoplay) clearInterval(autoplay);
}

/* ---------- CLICK ---------- */
dots.forEach(dot => {
    dot.addEventListener("click", () => {
        showSlide(Number(dot.dataset.index));
        startAutoplay();
    });
});

/* ---------- DRAG / SWIPE ---------- */
track.addEventListener("mousedown", e => {
    startX = e.clientX;
    dragging = true;
    stopAutoplay();
});

track.addEventListener("mouseup", e => {
    if (!dragging) return;
    handleSwipe(e.clientX);
});

track.addEventListener("mouseleave", () => dragging = false);

track.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    stopAutoplay();
});

track.addEventListener("touchend", e => {
    handleSwipe(e.changedTouches[0].clientX);
});

function handleSwipe(endX) {
    dragging = false;
    const diff = endX - startX;

    if (Math.abs(diff) < 60) return;

    if (diff < 0) {
        showSlide((current + 1) % slides.length);
    } else {
        showSlide((current - 1 + slides.length) % slides.length);
    }

    startAutoplay();
}

/* ---------- INIT ---------- */
showSlide(0);
startAutoplay();

const videoSlides = document.querySelectorAll(".video-slide");
const prevBtn = document.querySelector(".arrow.prev");
const nextBtn = document.querySelector(".arrow.next");

let currentVideo = 0;

/* ---------- SLIDE SWITCH ---------- */
function showVideo(index) {
    videoSlides.forEach((slide, i) => {
        const video = slide.querySelector("video");
        const overlay = slide.querySelector(".play-overlay");

        slide.classList.toggle("active", i === index);
        video.pause();
        overlay.classList.remove("hidden");
    });

    currentVideo = index;
}

prevBtn.addEventListener("click", () => {
    showVideo((currentVideo - 1 + videoSlides.length) % videoSlides.length);
});

nextBtn.addEventListener("click", () => {
    showVideo((currentVideo + 1) % videoSlides.length);
});

/* ---------- PLAY / PAUSE ---------- */
videoSlides.forEach(slide => {
    const video = slide.querySelector("video");
    const overlay = slide.querySelector(".play-overlay");

    overlay.addEventListener("click", () => {
        video.play();
        overlay.classList.add("hidden");
    });

    video.addEventListener("pause", () => {
        overlay.classList.remove("hidden");
    });

    video.addEventListener("ended", () => {
        overlay.classList.remove("hidden");
    });
});

/* ---------- INIT ---------- */
showVideo(0);
