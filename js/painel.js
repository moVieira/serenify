document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = "1";

    const ptrStress = document.getElementById('ptrStress');
    const ptrScore = document.getElementById('ptrScore');
    const statusText = document.querySelector('.status-text');
    const scoreNum = document.querySelector('.score-num');
    const cardFooters = document.querySelectorAll('.card-footer');

    const btnFinalizar = document.getElementById('btnFinalizar');
    const btnVoltar = document.getElementById('btnVoltar');

    function rotatePointer(el, scoreOutOf100) {
        if (!el) return;
        const rotationValue = (scoreOutOf100 * 3.6) + 180;
        el.style.transform = `rotate(${rotationValue}deg)`;
    }

    function describeLevel(label, score) {
        if (score < 33) return { card1: 'Calmo', card2: 'Muito bom' };
        if (score < 66) return { card1: label, card2: 'Atenção' };
        return { card1: label, card2: 'Procure apoio' };
    }

    function applyResult(result) {
        const score = result.score;
        if (statusText) statusText.textContent = result.label;
        if (scoreNum) scoreNum.textContent = score.toFixed(1);
        const desc = describeLevel(result.label, score);
        if (cardFooters[0]) cardFooters[0].textContent = desc.card1;
        if (cardFooters[1]) cardFooters[1].textContent = desc.card2;
        setTimeout(() => {
            rotatePointer(ptrStress, score);
            rotatePointer(ptrScore, score);
        }, 200);
    }

    function showError(msg) {
        if (statusText) statusText.textContent = 'Erro';
        if (scoreNum) scoreNum.textContent = '--';
        console.error(msg);
    }

    const form = JSON.parse(localStorage.getItem('serenify_form') || '{}');
    fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
    })
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(applyResult)
        .catch(err => showError('Falha ao consultar /predict: ' + err));

    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', () => {
            btnFinalizar.style.opacity = "0.7";
            document.body.style.opacity = "0";
            setTimeout(() => {
                localStorage.removeItem('serenify_form');
                window.location.href = "../index.html";
            }, 500);
        });
    }

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
