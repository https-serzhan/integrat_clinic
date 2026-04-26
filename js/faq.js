(function () {
    const modal = document.querySelector("[data-modal]");
    const openButton = document.querySelector("[data-modal-open]");
    const closeButton = document.querySelector("[data-modal-close]");

    if (!modal || !openButton || !closeButton) return;

    function openModal() {
        modal.classList.add("is-active");
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        modal.classList.remove("is-active");
        document.body.style.overflow = "";
    }

    openButton.addEventListener("click", openModal);
    closeButton.addEventListener("click", closeModal);

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeModal();
        }
    });
})();