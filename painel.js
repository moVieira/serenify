document.addEventListener('DOMContentLoaded', () => {

    // Fade-in ao entrar
    document.body.style.opacity = "1";

    const stressScore = 20;

    const ptrStress = document.getElementById('ptrStress');
    const ptrScore = document.getElementById('ptrScore');

    const btnFinalizar = document.getElementById('btnFinalizar');
    const btnVoltar = document.getElementById('btnVoltar');

    function updateGauges() {
        const rotationValue = (stressScore * 3.6) + 180;

        if (ptrStress) {
            ptrStress.style.transform = `rotate(${rotationValue}deg)`;
        }

        if (ptrScore) {
            ptrScore.style.transform = `rotate(${rotationValue}deg)`;
        }
    }

    setTimeout(updateGauges, 300);

    // Botão Finalizar → vai para index
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', () => {

            btnFinalizar.style.opacity = "0.7";
            document.body.style.opacity = "0";

            setTimeout(() => {
                window.location.href = "index.html";
            }, 500);
        });
    }

    // Botão Voltar → vai para avaliação
    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => {

            btnVoltar.style.opacity = "0.7";
            document.body.style.opacity = "0";

            setTimeout(() => {
                window.location.href = "avaliacao.html";
            }, 500);
        });
    }

});