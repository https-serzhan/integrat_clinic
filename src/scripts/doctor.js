(function doctorCasePage(documentObject) {
  const slides = Array.from(documentObject.querySelectorAll('.slide'));
  const nextButton = documentObject.querySelector('.next');
  const prevButton = documentObject.querySelector('.prev');
  const slider = documentObject.querySelector('.doctor-slider');
  const bookingButton = documentObject.querySelector('.doctor-btn');

  if (!slides.length || !nextButton || !prevButton || !slider) return;

  let currentIndex = 0;
  let autoplayId = null;

  function showSlide(index) {
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === index);
    });
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(currentIndex);
  }

  function startAutoplay() {
    if (autoplayId) clearInterval(autoplayId);
    autoplayId = setInterval(nextSlide, 4000);
  }

  function stopAutoplay() {
    if (autoplayId) {
      clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  nextButton.addEventListener('click', nextSlide);
  prevButton.addEventListener('click', prevSlide);
  bookingButton?.addEventListener('click', () => {
    window.location.href = 'doctors.html';
  });
  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);

  showSlide(currentIndex);
  startAutoplay();
})(document);
