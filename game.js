// ---------------- ELEMENTS ----------------
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

// ---------------- GAME STATE ----------------
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

// ---------------- LOAD IMAGES ----------------

// BAD IMAGES
const nightmares = [];
for (let i = 2; i <= 10; i++) {
    nightmares.push(`codeimg/bad/Illustration_sans_titre-${i}.png`);
}

// GOOD IMAGES
const goodItems = [];
for (let i = 12; i <= 16; i++) {
    goodItems.push(`codeimg/good/Illustration_sans_titre-${i}.png`);
}

// BONUS QUI WIPE TOUT
const wipeImage = "codeimg/good/Illustration_sans_titre-12.png";

// ---------------- ENEMY SPEED MULTIPLIER ----------------
let enemySpeedMultiplier = 1;

// ---------------- START GAME ----------------
function startGame() {
    menu.classList.add("hidden");
    startBox.classList.add("hidden");
    gameOverBox.classList.add("hidden");
    pauseBox.classList.add("hidden");

    gameArea.classList.remove("hidden");
    scoreBox.classList.remove("hidden");
    pauseBtn.classList.remove("hidden");
    stopBtn.classList.remove("hidden");

    document.querySelectorAll(".enemy").forEach(e => e.remove());
    document.querySelectorAll(".bonus").forEach(e => e.remove());
    document.querySelectorAll(".player-bullet").forEach(b => b.remove());
    

    isGameOver = false;
    isPaused = false;

    score = 0;
    scoreSpan.textContent = score;

    enemySpeedMultiplier = 1;
    playerX = 175;
    playerSpeed = 6;
    player.style.left = playerX + "px";

    bossActive = false;
    bossHP = 0;
    clearInterval(bossProjectileInterval);
    document.querySelectorAll(".boss").forEach(b => b.remove());
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
        if (!isPaused && !isGameOver) spawnEnemy();
        if (!isPaused && !isGameOver && Math.random() < 0.20) spawnBonus();
    }, 700);
}

// ---------------- END GAME ----------------
function endGame() {
    if (isGameOver) return;

    isGameOver = true;
    isPaused = false;

    clearInterval(enemyInterval);
    clearInterval(scoreInterval);
    clearInterval(bossProjectileInterval);

    document.getElementById("boss-hp-bar").style.display = "none";
    document.querySelectorAll(".player-bullet").forEach(b => b.remove());

    finalScoreSpan.textContent = score;

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
    }

    bestScoreSpan.textContent = bestScore;

    gameOverBox.classList.remove("hidden");
}

// ---------------- PAUSE ----------------
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

// ---------------- MOVEMENT ----------------
let movingLeft = false;
let movingRight = false;

document.addEventListener("keydown", e => {
    if (isGameOver || isPaused) return;
    if (e.key === "ArrowLeft") movingLeft = true;
    if (e.key === "ArrowRight") movingRight = true;
});

document.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft") movingLeft = false;
    if (e.key === "ArrowRight") movingRight = false;
});

// ---------------- ENEMY ----------------
function spawnEnemy() {
    const enemy = document.createElement("div");
    enemy.classList.add("enemy");

    const img = document.createElement("img");
    img.src = nightmares[Math.floor(Math.random() * nightmares.length)];
    img.classList.add("enemy-img");

    enemy.appendChild(img);

    enemy.style.left = Math.floor(Math.random() * 300) + "px";

    gameArea.appendChild(enemy);

    let enemyY = 40;
    const speed = (6 + score * 0.02) * enemySpeedMultiplier;

    function fall() {
        if (isPaused || isGameOver) return;

        enemyY += speed;
        enemy.style.top = enemyY + "px";

        const p = player.getBoundingClientRect();
        const e = enemy.getBoundingClientRect();

        const overlap = !(
            p.right < e.left ||
            p.left > e.right ||
            p.bottom < e.top ||
            p.top > e.bottom
        );

        if (overlap) return endGame();

        if (enemyY > 600) enemy.remove();
        else requestAnimationFrame(fall);
    }

    fall();
}

// ---------------- BONUS ----------------
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
    const speed = 3;

    function fall() {
        if (isPaused || isGameOver) return;

        y += speed;
        good.style.top = y + "px";

        const p = player.getBoundingClientRect();
        const g = good.getBoundingClientRect();

        const overlap = !(
            p.right < g.left ||
            p.left > g.right ||
            p.bottom < g.top ||
            p.top > g.bottom
        );

        if (overlap) {

            // BONUS WIPE = détruit tous les ennemis
            if (chosenImg === wipeImage) {
                document.querySelectorAll(".enemy").forEach(e => e.remove());
            } 
            else {
                score += 5;
                scoreSpan.textContent = score;

                enemySpeedMultiplier += 0.2;

                // BOOST VITESSE JOUEUR
                playerSpeed += 2;
            }

            good.remove();
            return;
        }

        if (y > 600) {
            good.remove();
            return;
        }

        requestAnimationFrame(fall);
    }

    requestAnimationFrame(fall);
}


// ---------------- RESTART FALL ----------------
function restartFall(element) {
    let y = parseFloat(element.style.top) || 0;

    function fall() {
        if (isPaused || isGameOver) return;

        const speed = (4 + score * 0.02) * enemySpeedMultiplier;

        y += speed;
        element.style.top = y + "px";

        if (y > 600) {
            element.remove();
            return;
        }

        requestAnimationFrame(fall);
    }

    requestAnimationFrame(fall);
}

// ---------------- STAMINA ----------------
function setStamina(value) {
    document.getElementById("stamina-bar").style.width = value + "%";
}

function smoothMovement() {
    if (!isGameOver && !isPaused) {
        let isMoving = false;

        if (movingLeft && playerX > 0 && stamina > 0) {
            playerX -= playerSpeed;
            isMoving = true;
        }

        if (movingRight && playerX < 350 && stamina > 0) {
            playerX += playerSpeed;
            isMoving = true;
        }

        if (isMoving) {
            stamina -= staminaDrainRate;
            if (stamina < 0) stamina = 0;
        } else {
            stamina += staminaRegenRate;
            if (stamina > 100) stamina = 100;
        }

        setStamina(stamina);
        player.style.left = playerX + "px";
    }

    requestAnimationFrame(smoothMovement);
}
smoothMovement();

// ---------------- SHOOT ----------------
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

        if (bossActive) {
            const b = boss.getBoundingClientRect();
            const bul = bullet.getBoundingClientRect();

            const overlap = !(
                bul.right < b.left ||
                bul.left > b.right ||
                bul.bottom < b.top ||
                bul.top > b.bottom
            );

            if (overlap) {
                hitBoss(1);
                bullet.remove();
                return;
            }
        }

        if (y < 0) bullet.remove();
        else requestAnimationFrame(fly);
    }

    fly();
}

document.addEventListener("keydown", e => {
    if (e.key === " ") shoot();
});

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

    const p = player.getBoundingClientRect();
    const b = boss.getBoundingClientRect();

    const overlap = !(
        p.right < b.left ||
        p.left > b.right ||
        p.bottom < b.top ||
        p.top > b.bottom
    );

    if (overlap) return endGame();

    if (bossHP > 0) requestAnimationFrame(moveBoss);
}


// ---------------- BOSS LOGIC ----------------
function spawnBoss(which) {
    if (bossActive) return;
    bossActive = true;
    bossNumber = which;
    bossY = 40;
    bossX = 110;
    bossDirection = 1;


    if (which === 1) {
        bossHP = 3;
        bossFallSpeed = 0.5;
        bossMoveSpeed = 1.5;
    } else {
        bossHP = 6;
        bossFallSpeed = 0.8;
        bossMoveSpeed = 2.5;
    }

    clearInterval(enemyInterval);

    boss = document.createElement("div");
    boss.classList.add("boss");

    const img = document.createElement("img");
    if (which === 1) {
        img.src = "gameBoard/Boss1.GIF";
    } else {
        img.src = "gameBoard/Boss2.GIF";
    }
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
        if (which === 1) {
        img.src = "gameBoard/Boss1.GIF";
        } else {
            img.src = "gameBoard/Boss2.GIF";
        }
        img.classList.add("enemy-img");
        projectile.appendChild(img);

        projectile.style.left = bossX + "px";
        projectile.style.top = bossY + 60 + "px";

        gameArea.appendChild(projectile);

        let y = bossY + 60;
        const speed = 5;


        function fall() {
            if (isPaused || isGameOver) return;

            y += speed;
            projectile.style.top = y + "px";

            const p = player.getBoundingClientRect();
            const e = projectile.getBoundingClientRect();

            const overlap = !(
                p.right < e.left ||
                p.left > e.right ||
                p.bottom < e.top ||
                p.top > e.bottom
            );

            if (overlap) {
                endGame();
                return;
            }

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
        if (!isPaused && !isGameOver) spawnEnemy();
        if (!isPaused && !isGameOver && Math.random() < 0.20) spawnBonus();
    }, 700);
}

// ---------------- BUTTONS ----------------
pauseBtn.addEventListener("click", pauseGame);
continueButton.addEventListener("click", continueGame);
restartButton.addEventListener("click", startGame);
stopBtn.addEventListener("click", endGame);

startFromStartBox.addEventListener("click", startGame);
