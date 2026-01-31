const slides = document.querySelectorAll(".course-slide");
const dots = document.querySelectorAll(".course-progress .seg");

let current = 0;

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
        dots[i].classList.toggle("active", i === index);
    });
}

function nextSlide() {
    current = (current + 1) % slides.length;
    showSlide(current);
}

setInterval(nextSlide, 5000);
showSlide(current);
