document.addEventListener('DOMContentLoaded', () => {
    anime({
        targets: '.archive-screen',
        opacity: [0, 0.5, 1],
        scale: [0.95, 1.02, 1],
        duration: 1200,
        easing: 'easeOutQuad'
    });
    anime({
        targets: '.glitch-title',
        opacity: [0, 1],
        translateX: [
            {value: -50, duration: 100},
            {value: 50, duration: 100},
            {value: -20, duration: 100},
            {value: 0, duration: 400}
        ],
        scale: [0.8, 1],
        duration: 1000,
        delay: 300,
        easing: 'easeOutElastic(1, 0.6)'
    });
    anime({
        targets: '.vcr-timestamp',
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 600,
        delay: 800,
        easing: 'easeOutQuad'
    });
    anime({
        targets: '.game-box',
        opacity: [0, 1],
        translateY: [80, 0],
        scale: [0.85, 1],
        delay: anime.stagger(300, {start: 1000}),
        duration: 1000,
        easing: 'easeOutElastic(1, 0.5)'
    });

    document.querySelectorAll('.game-box').forEach(box => {
        const tvFrame = box.querySelector('.tv-frame');
        const thumbnail = box.querySelector('.game-thumbnail');
        const staticBurst = box.querySelector('.static-burst');

        box.addEventListener('mouseenter', () => {
            anime({
                targets: thumbnail,
                scale: [1, 1.1],
                duration: 400,
                easing: 'easeOutQuad'
            });
            if (staticBurst && !staticBurst.classList.contains('active')) {
                anime({
                    targets: staticBurst,
                    opacity: [0, 0.4, 0],
                    duration: 300,
                    easing: 'linear'
                });
            }
            anime({
                targets: tvFrame,
                boxShadow: [
                    'inset 0 0 50px rgba(0, 255, 65, 0.2)',
                    'inset 0 0 80px rgba(0, 229, 255, 0.4)'
                ],
                duration: 400
            });
        });
        
        box.addEventListener('mouseleave', () => {
            anime({
                targets: thumbnail,
                scale: [1.1, 1],
                duration: 300,
                easing: 'easeOutQuad'
            });
            
            anime({
                targets: tvFrame,
                boxShadow: [
                    'inset 0 0 80px rgba(0, 229, 255, 0.4)',
                    'inset 0 0 50px rgba(0, 255, 65, 0.2)'
                ],
                duration: 300
            });
        });
    });

    document.querySelectorAll('.enter-btn:not(.disabled)').forEach(btn => {
        btn.addEventListener('click', function(e) {
            anime({
                targets: '.archive-screen',
                translateX: [
                    {value: -15, duration: 50},
                    {value: 15, duration: 50},
                    {value: -10, duration: 50},
                    {value: 10, duration: 50},
                    {value: 0, duration: 50}
                ],
                scale: [1, 0.98, 1],
                easing: 'easeInOutSine'
            });
            anime({
                targets: this,
                scale: [1, 0.9, 1],
                duration: 200
            });
        });
    });

    // random static bursts
    setInterval(() => {
        const gameBoxes = document.querySelectorAll('.game-box');
        const randomBox = gameBoxes[Math.floor(Math.random() * gameBoxes.length)];
        const staticBurst = randomBox?.querySelector('.static-burst:not(.active)');
        
        if (staticBurst && Math.random() > 0.6) {
            anime({
                targets: staticBurst,
                opacity: [0, 0.5, 0],
                duration: 150,
                easing: 'linear'
            });
        }
    }, 2500);

    // tracking line glitches
    setInterval(() => {
        if (Math.random() > 0.8) {
            anime({
                targets: '.tracking-line',
                opacity: [0.4, 0.8, 0.4],
                duration: 200,
                easing: 'linear'
            });
        }
    }, 3000);
});
