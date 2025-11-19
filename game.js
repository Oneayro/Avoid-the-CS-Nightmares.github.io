const player = document.getElementById("player");
const gameArea = document.getElementById("game-area");
const scoreSpan = document.getElementById("score");

const menu = document.getElementById("menu");
const scoreBox = document.getElementById("score-box");
const pauseBtn = document.getElementById("pause-btn");
const stopBtn = document.getElementById("stop-btn");

const gameOverBox = document.getElementById("game-over-box");
const finalScoreSpan = document.getElementById("final-score");
const currentScoreSpan = document.getElementById("current-score");
const bestScoreSpan = document.getElementById("best-score");
const restartButton = document.getElementById("restart-button");

const pauseBox = document.getElementById("game-paused-box");
const continueButton = document.getElementById("continue-button");

const startBox = document.getElementById("game-start-box");
const startFromStartBox = document.getElementById("start-from-startbox");
const menuBtn = document.getElementById("game-ui-buttons");

let playerX = 175;
let score = 0;
let isGameOver = false;
let isPaused = false;
let enemyInterval;
let scoreInterval;

let bestScore = localStorage.getItem("bestScore") || 0;
bestScoreSpan.textContent = bestScore;

let stamina = 100;
let staminaRegenRate = 0.25;
let staminaDrainRate = 0.4;
let playerSpeed = 6;

let bossActive = false;
let bossHP = 0;
let boss;
let bossY = 40;
let bossX = 110;
let bossDirection = 1;
let bossFallSpeed = 0;
let bossMoveSpeed = 0;
let bossProjectileInterval;
let bossNumber = 0;

const nightmares = [];
for (let i = 2; i <= 10; i++) nightmares.push(`codeimg/bad/Illustration_sans_titre-${i}.png`);

const goodItems = [];
for (let i = 12; i <= 16; i++) goodItems.push(`codeimg/good/Illustration_sans_titre-${i}.png`);

const wipeImage = "codeimg/good/Illustration_sans_titre-12.png";

let enemySpeedMultiplier = 1;

function startGame() {
    menu.classList.add("hidden");
    startBox.classList.add("hidden");
    gameOverBox.classList.add("hidden");
    pauseBox.classList.add("hidden");

    gameArea.classList.remove("hidden");
    scoreBox.classList.remove("hidden");
    pauseBtn.classList.remove("hidden");
    stopBtn.classList.remove("hidden");

    document.querySelectorAll(".enemy, .bonus, .player-bullet, .boss").forEach(e => e.remove());

    isGameOver = false;
    isPaused = false;

    score = 0;
    scoreSpan.textContent = score;

    stamina = 100;
    setStamina(stamina);

    enemySpeedMultiplier = 1;
    playerX = 175;
    playerSpeed = 6;
    player.style.left = playerX + "px";

    bossActive = false;
    bossHP = 0;
    clearInterval(bossProjectileInterval);
    document.getElementById("boss-hp-bar").style.display = "none";

    scoreInterval = setInterval(() => {
        if (!isPaused && !isGameOver) {
            score++;
            scoreSpan.textContent = score;
            if (score === 50) spawnBoss(1);
            if (score === 150) spawnBoss(2);
        }
    }, 500);

    enemyInterval = setInterval(() => {
        if (!isPaused && !isGameOver) {
            if (Math.random() < 0.3) spawnEnemyZigzag();
            else spawnEnemy();
            if (Math.random() < 0.20) spawnBonus();
        }
    }, 700);
}

function endGame() {
    if (isGameOver) return;
    isGameOver = true;
    isPaused = false;

    clearInterval(enemyInterval);
    clearInterval(scoreInterval);
    clearInterval(bossProjectileInterval);

    document.getElementById("boss-hp-bar").style.display = "none";

    finalScoreSpan.textContent = score;

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
    }

    bestScoreSpan.textContent = bestScore;
    gameOverBox.classList.remove("hidden");
}

function pauseGame() {
    if (isGameOver || isPaused) return;
    isPaused = true;
    currentScoreSpan.textContent = score;
    pauseBox.classList.remove("hidden");
    pauseBtn.classList.add("hidden");
    menuBtn.classList.add("hidden");
}

function continueGame() {
    isPaused = false;
    pauseBox.classList.add("hidden");
    pauseBtn.classList.remove("hidden");
    menuBtn.classList.remove("hidden");

    document.querySelectorAll(".enemy").forEach(e => restartFall(e));
    document.querySelectorAll(".bonus").forEach(b => restartFall(b));
    document.querySelectorAll(".player-bullet").forEach(b => b.remove());

    resumeBoss();
}

let movingLeft = false;
let movingRight = false;

document.addEventListener("keydown", e => {
    if (!isPaused && !isGameOver) {
        if (e.key === "ArrowLeft") movingLeft = true;
        if (e.key === "ArrowRight") movingRight = true;
        if (e.key === " ") shoot();
    }
});

document.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft") movingLeft = false;
    if (e.key === "ArrowRight") movingRight = false;
});

function spawnEnemy() {
    const enemy = document.createElement("div");
    enemy.classList.add("enemy");
    const img = document.createElement("img");
    img.src = nightmares[Math.floor(Math.random() * nightmares.length)];
    img.classList.add("enemy-img");
    enemy.appendChild(img);
    enemy.style.left = Math.floor(Math.random() * 300) + "px";
    gameArea.appendChild(enemy);

    let y = 40;
    const speed = (6 + score * 0.02) * enemySpeedMultiplier;

    function fall() {
        if (isPaused || isGameOver) return;
        y += speed;
        enemy.style.top = y + "px";
        if (collision(enemy)) return endGame();
        if (y > 600) enemy.remove();
        else requestAnimationFrame(fall);
    }
    fall();
}

function spawnEnemyZigzag() {
    const enemy = document.createElement("div");
    enemy.classList.add("enemy");
    const img = document.createElement("img");
    img.src = nightmares[Math.floor(Math.random() * nightmares.length)];
    img.classList.add("enemy-img");
    enemy.appendChild(img);

    let x = Math.floor(Math.random() * 300);
    let y = 40;
    let dir = 1;

    enemy.style.left = x + "px";
    gameArea.appendChild(enemy);

    function fall() {
        if (isPaused || isGameOver) return;
        y += 4;
        x += dir * 2;
        if (x <= 0 || x >= 250) dir *= -1;
        enemy.style.left = x + "px";
        enemy.style.top = y + "px";
        if (collision(enemy)) return endGame();
        if (y > 600) enemy.remove();
        else requestAnimationFrame(fall);
    }
    fall();
}

function spawnBonus() {
    const good = document.createElement("div");
    good.classList.add("bonus");

    const img = document.createElement("img");
    const chosenImg = goodItems[Math.floor(Math.random() * goodItems.length)];
    img.src = chosenImg;
    img.classList.add("bonus-img");
    good.appendChild(img);

    good.style.left = Math.floor(Math.random() * 300) + "px";
    good.style.top = "30px";
    gameArea.appendChild(good);

    let y = 30;

    function fall() {
        if (isPaused || isGameOver) return;
        y += 3;
        good.style.top = y + "px";

        if (collision(good)) {
            if (chosenImg === wipeImage) {
                document.querySelectorAll(".enemy").forEach(e => e.remove());
            } else {
                score += 5;
                scoreSpan.textContent = score;
                enemySpeedMultiplier += 0.2;
                playerSpeed += 2;
            }
            good.remove();
            return;
        }

        if (y > 600) good.remove();
        else requestAnimationFrame(fall);
    }
    fall();
}

function restartFall(element) {
    let y = parseFloat(element.style.top) || 0;
    function fall() {
        if (isPaused || isGameOver) return;
        y += (4 + score * 0.02) * enemySpeedMultiplier;
        element.style.top = y + "px";
        if (y > 600) element.remove();
        else requestAnimationFrame(fall);
    }
    fall();
}

function setStamina(v) {
    document.getElementById("stamina-bar").style.width = v + "%";
}

function smoothMovement() {
    if (!isGameOver && !isPaused) {
        let moved = false;
        if (movingLeft && playerX > 0 && stamina > 0) {
            playerX -= playerSpeed;
            moved = true;
        }
        if (movingRight && playerX < 350 && stamina > 0) {
            playerX += playerSpeed;
            moved = true;
        }
        if (moved) stamina -= staminaDrainRate;
        else stamina += staminaRegenRate;
        if (stamina < 0) stamina = 0;
        if (stamina > 100) stamina = 100;
        setStamina(stamina);
        player.style.left = playerX + "px";
    }
    requestAnimationFrame(smoothMovement);
}
smoothMovement();

function shoot() {
    const bullet = document.createElement("div");
    bullet.classList.add("player-bullet");
    bullet.style.left = (playerX + 25) + "px";
    bullet.style.top = "480px";
    gameArea.appendChild(bullet);

    let y = 480;
    function fly() {
        if (isPaused || isGameOver) return;
        y -= 8;
        bullet.style.top = y + "px";
        if (bossActive && collision(bullet, boss)) {
            hitBoss(1);
            bullet.remove();
            return;
        }
        if (y < 0) bullet.remove();
        else requestAnimationFrame(fly);
    }
    fly();
}

function collision(a, b = player) {
    const A = a.getBoundingClientRect();
    const B = b.getBoundingClientRect();
    return !(A.right < B.left || A.left > B.right || A.bottom < B.top || A.top > B.bottom);
}

function fallBoss() {
    if (!bossActive || isPaused || isGameOver) return;
    bossY += bossFallSpeed;
    boss.style.top = bossY + "px";
    if (bossY < 220) requestAnimationFrame(fallBoss);
}

function moveBoss() {
    if (!bossActive || isPaused || isGameOver) return;
    bossX += bossMoveSpeed * bossDirection;
    if (bossX <= 0 || bossX >= 240) bossDirection *= -1;
    boss.style.left = bossX + "px";
    if (collision(boss)) return endGame();
    requestAnimationFrame(moveBoss);
}

function spawnBoss(which) {
    if (bossActive) return;
    bossActive = true;
    bossNumber = which;
    bossY = 40;
    bossX = 110;
    bossDirection = 1;

    bossHP = which === 1 ? 3 : 6;
    bossFallSpeed = which === 1 ? 0.5 : 0.8;
    bossMoveSpeed = which === 1 ? 1.5 : 2.5;

    clearInterval(enemyInterval);

    boss = document.createElement("div");
    boss.classList.add("boss");

    const img = document.createElement("img");
    img.src = which === 1 ? "gameBoard/Boss1.GIF" : "gameBoard/Boss2.GIF";
    boss.appendChild(img);

    boss.style.left = "110px";
    boss.style.top = "40px";
    gameArea.appendChild(boss);

    document.getElementById("boss-hp-bar").style.display = "block";
    updateBossHP();

    requestAnimationFrame(moveBoss);
    requestAnimationFrame(fallBoss);

    bossProjectileInterval = setInterval(() => {
        if (!bossActive || isPaused || isGameOver) return;

        const projectile = document.createElement("div");
        projectile.classList.add("enemy");

        const img = document.createElement("img");
        img.src = which === 1 ? "gameBoard/Boss1.GIF" : "gameBoard/Boss2.GIF";
        img.classList.add("enemy-img");
        projectile.appendChild(img);

        projectile.style.left = bossX + "px";
        projectile.style.top = bossY + 60 + "px";
        gameArea.appendChild(projectile);

        let y = bossY + 60;
        function fall() {
            if (isPaused || isGameOver) return;
            y += 5;
            projectile.style.top = y + "px";
            if (collision(projectile)) return endGame();
            if (y > 600) projectile.remove();
            else requestAnimationFrame(fall);
        }
        fall();
    }, which === 1 ? 1200 : 800);
}

function resumeBoss() {
    if (!bossActive) return;
    requestAnimationFrame(moveBoss);
    requestAnimationFrame(fallBoss);
}

function updateBossHP() {
    const bar = document.getElementById("boss-hp-fill");
    const maxHP = bossNumber === 1 ? 3 : 6;
    bar.style.width = (bossHP / maxHP) * 100 + "%";
}

function hitBoss(dmg) {
    if (!bossActive) return;
    bossHP -= dmg;
    updateBossHP();
    if (bossHP <= 0) killBoss();
}

function killBoss() {
    boss.remove();
    bossActive = false;
    clearInterval(bossProjectileInterval);
    document.getElementById("boss-hp-bar").style.display = "none";

    enemyInterval = setInterval(() => {
        if (!isPaused && !isGameOver) {
            if (Math.random() < 0.3) spawnEnemyZigzag();
            else spawnEnemy();
            if (Math.random() < 0.20) spawnBonus();
        }
    }, 700);
}

pauseBtn.addEventListener("click", pauseGame);
continueButton.addEventListener("click", continueGame);
restartButton.addEventListener("click", startGame);
stopBtn.addEventListener("click", endGame);
startFromStartBox.addEventListener("click", startGame);
