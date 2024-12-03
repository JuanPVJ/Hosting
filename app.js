window.addEventListener('load', initScene);

const slendermanPositions = [
    { x: 5, y: -2, z: -10 },
    { x: -5, y: -2, z: -10 },
    { x: 10, y: -2, z: 5 },
    { x: -10, y: -2, z: 5 },
    { x: 15, y: -2, z: 0 },
    { x: -15, y: -2, z: 0 }
];

let score = 0;
let bossHits = 0;
let boss = null;
let bossInterval = null;
let gameOverState = false;  // Variable para verificar si el juego está en estado final

function initScene() {
    const container = document.querySelector('#slenderman-container');

    // Crea los Slenderman
    slendermanPositions.forEach((pos, index) => {
        const slenderman = document.createElement('a-entity');
        slenderman.setAttribute('gltf-model', '#slenderman');
        slenderman.setAttribute('class', 'slenderman');
        slenderman.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`);
        slenderman.setAttribute('scale', '0.007 0.009 0.007');

        // Velocidades individuales y direcciones alternadas
        const rotationSpeed = (index % 2 === 0 ? 1 : -1) * (0.0003 + index * 0.0002);
        slenderman.setAttribute('orbit', `radius: ${10 + index * 2}; speed: ${rotationSpeed}`);
        slenderman.setAttribute('shootable', '');  // Agregar el componente shootable
        container.appendChild(slenderman);
    });

    // Componente para movimiento en órbita
    AFRAME.registerComponent('orbit', {
        schema: {
            radius: { type: 'number', default: 10 },
            speed: { type: 'number', default: 0.01 }
        },
        tick: function (time) {
            const angle = (time * this.data.speed) % (Math.PI * 2);
            this.el.object3D.position.set(
                Math.cos(angle) * this.data.radius,
                -2, // Altura fija en -2
                Math.sin(angle) * this.data.radius
            );
        }
    });

    // Componente para detectar disparos
    AFRAME.registerComponent('shootable', {
        init: function () {
            this.el.addEventListener('click', () => {
                if (gameOverState) return; // Si el juego terminó, no se puede disparar

                if (this.el.classList.contains('boss')) {
                    bossHits++;
                    updateBossHits();
                    if (bossHits >= 6) {
                        victory();
                    }
                } else {
                    this.el.parentNode.removeChild(this.el);
                    updateScore();
                }
            });
        }
    });
}

function updateScore() {
    score++;
    const scoreText = document.querySelector('#score-text');
    scoreText.setAttribute('value', `${score} SLENDERMAN ELIMINADOS`);

    if (score === 6) {
        spawnBoss();
    }
}

function updateBossHits() {
    const scoreText = document.querySelector('#score-text');
    scoreText.setAttribute('value', `${bossHits} GOLPES AL BOSS`);
}

function spawnBoss() {
    boss = document.createElement('a-entity');
    boss.setAttribute('gltf-model', '#boss');
    boss.setAttribute('class', 'boss');
    boss.setAttribute('position', '0 -2 -15');
    boss.setAttribute('scale', '0.01 0.012 0.01');
    boss.setAttribute('shootable', '');  // Aseguramos que el boss también sea "shootable"
    document.querySelector('a-scene').appendChild(boss);

    let timer = 6; // Incrementado el tiempo del boss activo
    bossInterval = setInterval(() => {
        boss.object3D.position.z += 1.5; // Mayor velocidad de acercamiento

        if (timer <= 0) {
            clearInterval(bossInterval); // Detener el movimiento
            gameOver();
        }
        timer--;
    }, 1000);

    updateBossHits(); // Cambiar el texto inicial del contador al aparecer el boss
}

function gameOver() {
    gameOverState = true; // Marcar que el juego ha terminado
    const scene = document.querySelector('a-scene');
    const gameOverImg = document.createElement('a-image');
    gameOverImg.setAttribute('src', '#game-over');
    gameOverImg.setAttribute('position', '0 0 -1');
    scene.appendChild(gameOverImg);
}

function victory() {
    gameOverState = true; // Marcar que el juego ha terminado
    clearInterval(bossInterval); // Detener el movimiento del boss al ganar
    const scene = document.querySelector('a-scene');
    const winImg = document.createElement('a-image');
    winImg.setAttribute('src', '#you-win');
    winImg.setAttribute('position', '0 0 -1');
    scene.appendChild(winImg);

    if (boss) boss.parentNode.removeChild(boss);
}
