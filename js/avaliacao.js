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

            const all = JSON.parse(localStorage.getItem('serenify_form') || '{}');
            all.avaliacao = { estresse: Number(selecionado.value) };
            localStorage.setItem('serenify_form', JSON.stringify(all));

            btnFinalizar.textContent = "Finalizando...";
            btnFinalizar.style.opacity = "0.7";

            document.body.style.opacity = "0";

            setTimeout(() => {
                window.location.href = "painel.html";
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