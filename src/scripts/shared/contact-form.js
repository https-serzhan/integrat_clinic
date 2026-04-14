(function () {
    const setupForm = (form) => {
        const phoneInput = form.querySelector('input[type="tel"]') || document.getElementById("phoneInput");
        const agreeInput = form.querySelector('input[name="agree"]') || form.querySelector('input[type="checkbox"]');

        if (phoneInput) {
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
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = form.fullname ? form.fullname.value.trim() : form.querySelector('input[placeholder="ФИО"]').value.trim();
            const phone = phoneInput.value.replace(/\D/g, "");
            const comment = form.comment ? form.comment.value.trim() : form.querySelector('textarea').value.trim();
            const agree = agreeInput ? agreeInput.checked : true;

            if (!name || !comment || phone.length !== 11 || !agree) {
                alert("Пожалуйста, заполните все поля корректно.");
                return;
            }

            try {
                const payload = {
                    fullname: name,
                    phone: phone,
                    comment: comment
                };

                await window.api.post("/contacts", payload);
                
                alert("Заявка успешно отправлена ✅ Наши менеджеры свяжутся с вами.");
                form.reset();
                
                const modal = form.closest("[data-modal]") || form.closest(".doctor-modal-overlay");
                if (modal) {
                    modal.classList.remove("is-active");
                    modal.classList.remove("active");
                    document.body.style.overflow = "";
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Ошибка при отправке: " + error.message);
            }
        });
    };

    const initAllForms = () => {
        const forms = document.querySelectorAll(".contact-form, #contactForm");
        forms.forEach(setupForm);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAllForms);
    } else {
        initAllForms();
    }
})();
