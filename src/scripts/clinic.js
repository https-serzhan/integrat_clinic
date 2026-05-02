

(function clinicPage() {
  const slider = document.querySelector('.treatments-slider');
  const track = document.querySelector('.treatments-track');
  const slides = Array.from(document.querySelectorAll('.treat-slide'));
  const prev = document.querySelector('.treat-arrow.prev');
  const next = document.querySelector('.treat-arrow.next');
  const seeAllCasesLinks = document.querySelectorAll('.treat-overlay-left, .treat-overlay-right');

  if (slider && track && slides.length) {
    let index = 1;
    let timer = null;

    function setActive(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, itemIndex) => slide.classList.toggle('is-active', itemIndex === index));
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

    prev?.addEventListener('click', () => {
      setActive(index - 1);
      startAutoplay();
    });

    next?.addEventListener('click', () => {
      setActive(index + 1);
      startAutoplay();
    });

    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    window.addEventListener('resize', () => setActive(index));

    setActive(index);
    startAutoplay();
  }

  document.querySelectorAll('.service-card').forEach((card) => {
    const button = card.querySelector('.service-plus');
    if (!button) return;

    button.type = 'button';
    button.addEventListener('click', () => {
      const active = card.classList.toggle('is-active');
      button.textContent = active ? '−' : '+';
    });
  });

  seeAllCasesLinks.forEach((control) => {
    control.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = 'doctors.html';
    });
  });
})();
