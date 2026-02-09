(function () {
    const root = document.documentElement;
    root.classList.add("js");

    const selectors = [
        "header",
        "section",
        ".hero-card",
        ".hero-actions",
        ".hero-visual",
        ".contact-form",
        ".contact-info",
        ".why-card",
        ".course-card",
        ".video-slider",
        ".academy-card",
        ".doctor-card",
        ".clinic-card",
        ".service-card",
        ".review-card",
        ".faq-card-primary",
        ".faq-card-secondary",
        ".faq-testimonial-card",
        ".videos-card",
        ".videos-player",
        ".videos-list__item"
    ];

    const elements = Array.from(document.querySelectorAll(selectors.join(",")));
    if (elements.length === 0) return;

    elements.forEach((el, index) => {
        el.classList.add("reveal");
        el.style.setProperty("--reveal-delay", `${Math.min(index * 60, 360)}ms`);
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -10% 0px"
        }
    );

    elements.forEach((el) => observer.observe(el));
})();
