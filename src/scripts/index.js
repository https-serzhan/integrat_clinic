(function homePage(documentObject) {
  const slides = Array.from(documentObject.querySelectorAll('.course-slide'));
  const dots = Array.from(documentObject.querySelectorAll('.course-progress .seg'));
  const track = documentObject.querySelector('.course-track');

  if (slides.length && dots.length && track) {
    let current = 0;
    let autoplayId = null;
    let startX = 0;
    let dragging = false;

    function showSlide(index) {
      current = index;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function stopAutoplay() {
      if (autoplayId) {
        clearInterval(autoplayId);
        autoplayId = null;
      }
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayId = setInterval(() => {
        showSlide((current + 1) % slides.length);
      }, 5000);
    }

    function handleSwipe(endX) {
      dragging = false;
      const diff = endX - startX;
      if (Math.abs(diff) < 60) return;
      showSlide(diff < 0 ? (current + 1) % slides.length : (current - 1 + slides.length) % slides.length);
      startAutoplay();
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        showSlide(Number(dot.dataset.index || 0));
        startAutoplay();
      });
    });

    track.addEventListener('mousedown', (event) => {
      startX = event.clientX;
      dragging = true;
      stopAutoplay();
    });

    track.addEventListener('mouseup', (event) => {
      if (!dragging) return;
      handleSwipe(event.clientX);
    });

    track.addEventListener('mouseleave', () => {
      dragging = false;
    });

    track.addEventListener('touchstart', (event) => {
      startX = event.touches[0].clientX;
      stopAutoplay();
    });

    track.addEventListener('touchend', (event) => {
      handleSwipe(event.changedTouches[0].clientX);
    });

    showSlide(0);
    startAutoplay();
  }

  const videoSlides = Array.from(documentObject.querySelectorAll('.video-slide'));
  const prevBtn = documentObject.querySelector('.arrow.prev');
  const nextBtn = documentObject.querySelector('.arrow.next');

  if (videoSlides.length && prevBtn && nextBtn) {
    let currentVideo = 0;

    function showVideo(index) {
      videoSlides.forEach((slide, slideIndex) => {
        const video = slide.querySelector('video');
        const overlay = slide.querySelector('.play-overlay');
        slide.classList.toggle('active', slideIndex === index);
        video?.pause();
        overlay?.classList.remove('hidden');
      });
      currentVideo = index;
    }

    prevBtn.addEventListener('click', () => {
      showVideo((currentVideo - 1 + videoSlides.length) % videoSlides.length);
    });

    nextBtn.addEventListener('click', () => {
      showVideo((currentVideo + 1) % videoSlides.length);
    });

    videoSlides.forEach((slide) => {
      const video = slide.querySelector('video');
      const overlay = slide.querySelector('.play-overlay');
      if (!video || !overlay) return;

      overlay.addEventListener('click', () => {
        video.play();
        overlay.classList.add('hidden');
      });

      video.addEventListener('pause', () => overlay.classList.remove('hidden'));
      video.addEventListener('ended', () => overlay.classList.remove('hidden'));
    });

    showVideo(0);
  }
})(document);
