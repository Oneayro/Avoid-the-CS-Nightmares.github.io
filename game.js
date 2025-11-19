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
    // Hide panels
    menu.classList.add("hidden");
    startBox.classList.add("hidden");
    gameOverBox.classList.add("hidden");
    pauseBox.classList.add("hidden");

    // Show board
    gameArea.classList.remove("hidden");
    scoreBox.classList.remove("hidden");
    pauseBtn.classList.remove("hidden");
    stopBtn.classList.remove("hidden");

    // Cleanup
    document.querySelectorAll(".enemy").forEach(e => e.remove());
    document.querySelectorAll(".bonus").forEach(e => e.remove());

    // Reset state
    score = 0;
    scoreSpan.textContent = score;
    isGameOver = false;
    isPaused = false;
    enemySpeedMultiplier = 1;
    playerX = 175;
    player.style.left = playerX + "px";

    // SCORE LOOP
    scoreInterval = setInterval(() => {
        if (!isPaused && !isGameOver) {
            score++;
            scoreSpan.textContent = score;

            // vitesse augmente chaque 50 pts
            if (score % 50 === 0) {
                enemySpeedMultiplier += 0.4;
            }
        }
    }, 500);

    // ENEMY LOOP
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

    finalScoreSpan.textContent = score;

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
    }

    bestScoreSpan.textContent = bestScore;

    gameOverBox.classList.remove("hidden");
}

// ---------------- PAUSE / UNPAUSE ----------------
function pauseGame() {
    if (isGameOver || isPaused) return;

    isPaused = true;

    currentScoreSpan.textContent = score;
    pauseBox.classList.remove("hidden");
    pauseBtn.classList.add("hidden");

    // important : cacher les boutons pour ne pas bloquer le rect
    menuBtn.classList.add("hidden");
}

function continueGame() {
    isPaused = false;
    pauseBox.classList.add("hidden");
    pauseBtn.classList.remove("hidden");
    menuBtn.classList.remove("hidden");

    document.querySelectorAll(".enemy").forEach(e => restartFall(e));
    document.querySelectorAll(".bonus").forEach(b => restartFall(b));
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

function smoothMovement() {
    if (!isGameOver && !isPaused) {

        if (movingLeft && playerX > 0) playerX -= 6;
        if (movingRight && playerX < 350) playerX += 6;

        player.style.left = playerX + "px";
    }
    requestAnimationFrame(smoothMovement);
}
smoothMovement();

// ---------------- SPAWN ENEMY ----------------
function spawnEnemy() {
    const enemy = document.createElement("div");
    enemy.classList.add("enemy");

    const img = document.createElement("img");
    img.src = nightmares[Math.floor(Math.random() * nightmares.length)];
    img.classList.add("enemy-img");

    enemy.appendChild(img);

    enemy.style.left = Math.floor(Math.random() * 300) + "px";


    gameArea.appendChild(enemy);

    let enemyY = parseFloat(enemy.style.top) || 40;


    const speed = (6 + score * 0.02) * enemySpeedMultiplier;

    function fall() {
        if (isPaused || isGameOver) return;

        enemyY += speed;
        enemy.style.top = enemyY + "px";

        // collision
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

// ---------------- SPAWN BONUS ----------------
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

        const overlap =
            !(p.right < g.left ||
              p.left > g.right ||
              p.bottom < g.top ||
              p.top > g.bottom);

        if (overlap) {

            // BONUS SPÉCIAL WIPE
            if (chosenImg === wipeImage) {
                document.querySelectorAll(".enemy").forEach(e => e.remove());
            } else {
                score += 5;
                scoreSpan.textContent = score;

                // bonus normal = petite accélération
                enemySpeedMultiplier += 0.2;
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


// ---------------- BUTTONS ----------------
pauseBtn.addEventListener("click", pauseGame);
continueButton.addEventListener("click", continueGame);
restartButton.addEventListener("click", startGame);
stopBtn.addEventListener("click", endGame);

startFromStartBox.addEventListener("click", () => startGame());
