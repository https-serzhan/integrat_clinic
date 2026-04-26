(function () {
    const form = document.getElementById("contactForm");
    const phoneInput = document.getElementById("phoneInput");

    if (!form || !phoneInput) return;

    const agreeInput = form.querySelector('input[name="agree"]') || document.getElementById("agree");

    phoneInput.addEventListener("input", () => {
        let digits = phoneInput.value.replace(/\D/g, "");

        if (digits.startsWith("7")) digits = digits.slice(1);
        digits = digits.slice(0, 10);

        let formatted = "+7";

        if (digits.length > 0) formatted += " (" + digits.slice(0, 3);
        if (digits.length >= 3) formatted += ")";
        if (digits.length > 3) formatted += " " + digits.slice(3, 6);
        if (digits.length > 6) formatted += " " + digits.slice(6, 8);
        if (digits.length > 8) formatted += "-" + digits.slice(8, 10);

        phoneInput.value = formatted;
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = form.fullname.value.trim();
        const phone = phoneInput.value.replace(/\D/g, "");
        const comment = form.comment.value.trim();
        const agree = agreeInput ? agreeInput.checked : true;

        if (!name || !comment || phone.length !== 11 || !agree) {
            alert("Пожалуйста, заполните все поля корректно.");
            return;
        }

        alert("Форма успешно отправлена ✅");

        const modal = form.closest("[data-modal]");
        if (modal) {
            modal.classList.remove("is-active");
            document.body.style.overflow = "";
        }

        // BACKEND READY:
        // fetch("/api/send", { method: "POST", body: new FormData(form) })
    });
})();
