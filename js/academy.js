const academySliderInit = () => {
    const cards = document.querySelectorAll('.academy-card');
    const setActiveSlide = (card, index) => {
        const dots = card.querySelectorAll('.academy-card__dot');
        const images = card.querySelectorAll('.academy-card__image');
        dots.forEach((item) => item.classList.remove('active'));
        images.forEach((img) => img.classList.remove('active'));
        if (dots[index]) dots[index].classList.add('active');
        if (images[index]) images[index].classList.add('active');
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
};

const academyFiltersInit = () => {
    const filterButtons = document.querySelectorAll('.academy-filter');
    const cards = document.querySelectorAll('.academy-card');

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
};

document.addEventListener("DOMContentLoaded", () => {
    academySliderInit();
    academyFiltersInit();
});