// Variables del tablero
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns;
let boardHeight = tileSize * rows;
let context;

// Navecita
let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = tileSize * columns / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

let ship = {
    x: shipX,
    y: shipY,
    width: shipWidth,
    height: shipHeight,
}

let shipImg = new Image();
shipImg.src = "img/ship.png";
let shipVelocityX = tileSize;

// Aliens
let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImgs = []; // Array de imágenes de alienígenas
let alienRows = 2;
let alienColumns = 3;
let alienCount = 0;
let alienVelocityX = 0.5; // Cambio: Velocidad inicial ajustada
let alienDirection = 1; // Cambio: Variable para manejar la dirección de los alienígenas

// Balas
let bulletArray = [];
let bulletVelocityY = -10;

// Variables
let score = 0;
let gameOver = false;
let gamePaused = false;
let gameStarted = false;
let resetButton = document.getElementById("resetButton");

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    // Cargar imágenes de alienígenas
    let alienSources = ["img/alien.png", "img/alien-cyan.png", "img/alien-magenta.png", "img/alien-yellow.png"];
    for (let i = 0; i < alienSources.length; i++) {
        let img = new Image();
        img.src = alienSources[i];
        alienImgs.push(img);
    }

    // Añadir eventos a los botones
    document.getElementById("startButton").addEventListener("click", startGame);
    document.getElementById("pauseButton").addEventListener("click", pauseGame);

    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
}

function startGame() {
    if (!gameStarted) {
        createAliens();
        requestAnimationFrame(update);
        gameStarted = true;
        gamePaused = false;
    } else if (gamePaused) {
        gamePaused = false;
        requestAnimationFrame(update);
    }
}

function pauseGame() {
    gamePaused = true;
}

function update() {
    if (gamePaused) {
        return;
    }

    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    // Dibuja la nave
    context.drawImage(shipImg, ship.x, ship.y, shipWidth, shipHeight);

    // Dibuja y mueve alienígenas
    let changeDirection = false; // Cambio: Bandera para cambio de dirección
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX * alienDirection;

            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                changeDirection = true;
            }

            context.drawImage(alien.img, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= ship.y) {
                gameOver = true;
                perdiste();
            }
        }
    }

    if (changeDirection) { // Cambio: Cambio de dirección y movimiento hacia abajo
        alienDirection *= -1;
        for (let i = 0; i < alienArray.length; i++) {
            let alien = alienArray[i];
            alien.y += alienHeight;
        }
    }

    // Dibuja y mueve balas
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // Colisión de balas con alienígenas
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectColission(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
            }
        }
    }

    // Elimina balas usadas o fuera de pantalla
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift();
    }

    // Siguiente nivel
    if (alienCount == 0) {
        alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
        alienRows = Math.min(alienRows + 1, rows - 4);
        alienVelocityX += 0.5; // Cambio: Incremento más suave de la velocidad
        bulletVelocityY -= 0.2; // Cambio: Aumento de la velocidad de las balas
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    // Puntaje
    context.fillStyle = "white";
    context.font = "16px courier";
    context.fillText(score, 5, 20);
}

function moveShip(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX;
    } else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX;
    }
}

function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let randomImage = alienImgs[Math.floor(Math.random() * alienImgs.length)];
            let alien = {
                img: randomImage,
                x: alienX + c * alienWidth,
                y: alienY + r * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true,
            }

            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "Space") {
        let bullet = {
            x: ship.x + shipWidth * 15 / 32,
            y: ship.y,
            width: tileSize / 8,
            height: tileSize / 2,
            used: false,
        }
        bulletArray.push(bullet);
    }
}

function detectColission(a, b) {
    return a.x < b.x + b.width && 
        a.x + a.width > b.x &&
        a.y < b.y + b.height && 
        a.y + a.height > b.y;
}

function perdiste() {
    if (gameOver) {
        let gameOverElement = document.querySelector(".gameOver");
        gameOverElement.classList.add("visible");
    }
}

resetButton.addEventListener("click", function() {
    window.location.reload();
});
