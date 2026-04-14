const slides = document.querySelectorAll('.slide');
const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.prev');
const slider = document.querySelector('.doctor-slider');

let currentIndex = 0;
let autoPlayInterval;

/* SHOW SLIDE */
function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[index].classList.add('active');
}

/* NEXT */
function nextSlide() {
    currentIndex++;
    if (currentIndex >= slides.length) {
        currentIndex = 0;
    }
    showSlide(currentIndex);
}

/* PREVIOUS */
function prevSlide() {
    currentIndex--;
    if (currentIndex < 0) {
        currentIndex = slides.length - 1;
    }
    showSlide(currentIndex);
}

/* AUTOPLAY */
function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
        nextSlide();
    }, 4000); // change every 4 seconds
}

function stopAutoPlay() {
    clearInterval(autoPlayInterval);
}

/* EVENTS */
nextBtn.addEventListener('click', () => {
    nextSlide();
});

prevBtn.addEventListener('click', () => {
    prevSlide();
});

slider.addEventListener('mouseenter', stopAutoPlay);
slider.addEventListener('mouseleave', startAutoPlay);

/* INIT */
startAutoPlay();
