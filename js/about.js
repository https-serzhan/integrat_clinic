const videoSlides = document.querySelectorAll(".video-slide");
const prevBtn = document.querySelector(".arrow.prev");
const nextBtn = document.querySelector(".arrow.next");

if (videoSlides.length && prevBtn && nextBtn) {
    let currentVideo = 0;

    const showVideo = (index) => {
        videoSlides.forEach((slide, i) => {
            const video = slide.querySelector("video");
            const overlay = slide.querySelector(".play-overlay");

            slide.classList.toggle("active", i === index);
            if (video) {
                video.pause();
            }
            if (overlay) {
                overlay.classList.remove("hidden");
            }
        });

        currentVideo = index;
    };

    prevBtn.addEventListener("click", () => {
        showVideo((currentVideo - 1 + videoSlides.length) % videoSlides.length);
    });

    nextBtn.addEventListener("click", () => {
        showVideo((currentVideo + 1) % videoSlides.length);
    });

    videoSlides.forEach((slide) => {
        const video = slide.querySelector("video");
        const overlay = slide.querySelector(".play-overlay");

        if (!video || !overlay) {
            return;
        }

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

    showVideo(0);
}
