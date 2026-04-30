document.addEventListener('DOMContentLoaded', () => {

    // Fade-in ao entrar
    document.body.style.opacity = '1';

    const nextBtn = document.getElementById('nextBtn');
    const radioButtons = document.querySelectorAll('input[type="radio"]');

    // Toggle nos radios
    radioButtons.forEach(radio => {
        radio.addEventListener('mousedown', function () {
            this.wasChecked = this.checked;
        });

        radio.addEventListener('click', function (e) {
            if (this.wasChecked) {
                this.checked = false;
                this.wasChecked = false;
                e.preventDefault();
            } else {
                this.checked = true;
                this.wasChecked = true;
            }
        });
    });

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const questions = ['study', 'sleep', 'screens', 'exercise'];
            let allAnswered = true;

            questions.forEach(q => {
                if (!document.querySelector(`input[name="${q}"]:checked`)) {
                    allAnswered = false;
                }
            });

            if (!allAnswered) {
                alert("Por favor, responda todas as perguntas antes de continuar.");
                return;
            }

            nextBtn.textContent = "Salvando...";
            nextBtn.style.opacity = "0.7";

            document.body.style.opacity = "0";

            setTimeout(() => {
                window.location.href = "escala.html";
            }, 500);
        });
    }

});