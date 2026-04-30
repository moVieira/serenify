document.addEventListener('DOMContentLoaded', () => {

    //  Fade-in ao entrar
    document.body.style.opacity = '1';

    const nextBtn = document.getElementById('nextBtn');
    const radioButtons = document.querySelectorAll('input[type="radio"]');

    // Toggle nos radios
    radioButtons.forEach(radio => {
        radio.addEventListener('mousedown', function() {
            this.wasChecked = this.checked;
        });

        radio.addEventListener('click', function(e) {
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

    // Botão Próximo
    nextBtn.addEventListener('click', () => {

        const age = document.querySelector('input[name="age"]:checked')?.value;
        const gender = document.querySelector('input[name="gender"]:checked')?.value;

        //  Mantém apenas alerta de validação
        if (!age || !gender) {
            alert("Por favor, selecione sua idade e seu gênero antes de continuar.");
            return;
        }

        nextBtn.textContent = "Carregando...";
        nextBtn.style.opacity = "0.7";

        //  Fade-out antes de trocar de página
        document.body.style.opacity = "0";

        setTimeout(() => {
            window.location.href = "rotina.html";
        }, 500);
    });

});