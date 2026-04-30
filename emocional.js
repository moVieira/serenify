document.addEventListener('DOMContentLoaded', () => {

    // Fade-in ao entrar
    document.body.style.opacity = "1";

    const nextBtn = document.getElementById('nextBtn');
    const radioButtons = document.querySelectorAll('input[type="radio"]');

    // Toggle para desmarcar radio
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

    if (!nextBtn) return;

    nextBtn.addEventListener('click', () => {

        const names = ['e1', 'e2', 'e3', 'e4'];
        const allAnswered = names.every(name =>
            document.querySelector(`input[name="${name}"]:checked`)
        );

        if (!allAnswered) {
            alert("Por favor, responda todas as perguntas de frequência emocional.");
            return;
        }

        nextBtn.textContent = "Salvando...";
        nextBtn.style.opacity = "0.7";

        document.body.style.opacity = "0";

        setTimeout(() => {
            window.location.href = "apoio.html";
        }, 500);
    });

});