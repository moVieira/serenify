document.addEventListener('DOMContentLoaded', () => {
    const discoverBtn = document.getElementById('discoverBtn');
    const backgroundDecos = document.querySelectorAll('.deco');
    const plant = document.querySelector('.plant-image');

    // Efeito Parallax suave para os elementos visuais
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        // Background redemoinhos e flores
        backgroundDecos.forEach((deco, index) => {
            const speed = (index + 1) * 15;
            const moveX = (x * speed) - (speed / 2);
            const moveY = (y * speed) - (speed / 2);
            
            deco.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        
        // Elemento central (planta) tem uma movimentação muito sutil
        if(plant) {
            const plantX = (x * -10);
            const plantY = (y * -10);
            plant.style.transform = `translate(${plantX}px, ${plantY}px)`;
        }
    });

    // Interação do botão principal
    if(discoverBtn) {
        discoverBtn.addEventListener('click', () => {
            // Feedback do botão
            discoverBtn.style.transform = 'scale(0.9) translateY(4px)';
            
            setTimeout(() => {
                discoverBtn.style.transform = '';
                
                // Animação de saída antes de avançar na jornada
                document.body.style.opacity = '0';
                document.body.style.transition = 'opacity 0.5s ease';
                
                setTimeout(() => {
                    alert('Navegando para a próxima etapa...');
                    // location.href = "proxima-pagina.html"; 
                    
                    // Restaura a opacidade para o alert
                    document.body.style.opacity = '1';
                }, 500);
            }, 150);
        });
    }

    // Criação de partículas (luzes brilhantes douradas)
    const createParticles = () => {
        const container = document.querySelector('.background-elements');
        const particleCount = 35; // quantidade de luzes

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Randomiza tamanho, posição X e duração
            const size = Math.random() * 8 + 3; // de 3px a 11px
            const posX = Math.random() * 100; // 0% a 100% da tela horizontalmente
            const delay = Math.random() * 15; // atraso para não caírem todas juntas
            const duration = Math.random() * 15 + 10; // tempo para cair (10s a 25s)
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}vw`;
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;
            
            container.appendChild(particle);
        }
    };
    
    createParticles();
});
