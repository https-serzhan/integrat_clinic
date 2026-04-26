const accordions = document.querySelectorAll("[data-accordion]");

accordions.forEach((accordion) => {
    const toggle = accordion.querySelector(".videos-card__toggle");
    const chevron = accordion.querySelector(".videos-card__chevron");

    if (!toggle && !chevron) {
        return;
    }

    const button = toggle || chevron;
    if (button.tagName !== "BUTTON") {
        button.setAttribute("role", "button");
        button.setAttribute("tabindex", "0");
    }

    const toggleAccordion = () => {
        accordion.classList.toggle("active");
    };

    button.addEventListener("click", toggleAccordion);
    button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleAccordion();
        }
    });
});