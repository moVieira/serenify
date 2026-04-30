document.addEventListener('DOMContentLoaded', () => {

    // Fade-in ao entrar
    document.body.style.opacity = "1";

    const btnFinalizar = document.getElementById('btnFinalizar');
    const scaleOptions = document.querySelectorAll('.scale-option');

    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', function () {

            const selecionado = document.querySelector('input[name="estresse"]:checked');

            if (!selecionado) {
                alert("Por favor, selecione uma opção na escala antes de finalizar.");
                return;
            }

            btnFinalizar.textContent = "Finalizando...";
            btnFinalizar.style.opacity = "0.7";

            document.body.style.opacity = "0";

            setTimeout(() => {
                window.location.href = "painel.html"; 
                // troque pelo nome da sua página final se for diferente
            }, 500);
        });
    }

    // Mantido caso queira usar efeitos extras depois
    scaleOptions.forEach(item => {
        item.addEventListener('click', () => {
            // espaço reservado para efeito sonoro ou vibração
        });
    });

});