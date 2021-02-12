const DEBUG = false;

const CANVAS = document.getElementById("invaders");
const CONTEXT = CANVAS.getContext("2d");

const C_WIDTH = CANVAS.width;
const C_HEIGHT = CANVAS.height;

const SHIP_SIZE = new GetElementSize(C_WIDTH / 12, C_HEIGHT / 12);
const MISSILE_SIZE = new GetElementSize(C_WIDTH / 120 , C_HEIGHT / 40);

const SHIP_IMG = document.getElementById("ship");
const ENEMY_IMG = document.getElementById("enemy-1");
const BUILDING_IMG = document.getElementById("building");
const MISSILE_IMG = document.getElementById("missile");
const E_MISSILE_IMG = document.getElementById("enemyMissile");

let rightKey = false;
let leftKey = false;
let spaceKey = false;

let playerLives = 5;
let score = 0;
let level = 0;
let gameOver = false;

let time = 0;
let calTime = true;

let buildings = [];
let playerMissilesOnScreen = [];
let enemiesOnScreen = [];
let enemyMissilesOnScreen = [];

function GetElementSize(width, height) {
    this.width = width;
    this.height = height;
}

// object creator to create the game elements
function CreateGameElement(width, height, xPos, yPos, speed, img) {
    return {
        width: width,
        height: height,
        xPos: xPos,
        yPos: yPos,
        speed: speed,
        draw: function() {
            CONTEXT.drawImage(img, this.xPos, this.yPos, this.width, this.height);
        }
    };
}

// Create the Ship
const SHIP = CreateGameElement(SHIP_SIZE.width, SHIP_SIZE.height, (C_WIDTH - SHIP_SIZE.width) / 2, C_HEIGHT - SHIP_SIZE.height - 5, 2.5, SHIP_IMG);

// Create the Buildings and Draw them to the Screen.
function createBuildings() {
    for (let i = 0; i < 4; i++) {
       buildings.push(CreateGameElement(SHIP.width * 1.5, SHIP.height * 1.2, 65 + 175 * i, C_HEIGHT - 130, 0, BUILDING_IMG));
    }
}
function drawBuildings() {
    for (let i = 0; i < buildings.length; i++) {
        buildings[i].draw();
    }
}

// Create the Enemies, control them on the screen
let enemiesPos = {
    xLimit: true,
    rightSpeed: 0,
    leftSpeed: 1.8
};
function drawEnemies() {
    for (let i = 0; i < 4; i++) {
        for (let y = 0; y < 6; y++) {
            enemiesOnScreen.push(CreateGameElement(SHIP.width, SHIP.height / 1.25, 95 * y, 70 * i, 0, ENEMY_IMG));
        }
    }
}
function moveEnemies() {
    for (let i = 0; i < enemiesOnScreen.length; i++) {
        enemiesOnScreen[i].draw();
        enemiesOnScreen[i].xPos += 1;
    
        if (enemiesOnScreen[i].xPos + enemiesOnScreen[i].width > C_WIDTH - 10) {
            enemiesPos.xLimit = true;
            for (let j = 0; j < enemiesOnScreen.length; j++) {
                enemiesOnScreen[j].yPos += 3.5;
            }
        }
        else if (enemiesOnScreen[i].xPos <= 10){
            enemiesPos.xLimit = false;
            for (let j = 0; j < enemiesOnScreen.length; j++) {
                enemiesOnScreen[j].yPos += 3.5;
            }
        }
        else if (enemiesOnScreen[i].yPos >= CANVAS.height - 135) {
            gameOver = true;
        }
    }
    
    if (enemiesPos.xLimit === true) {
        for (let i = 0; i < enemiesOnScreen.length; i++) {
            enemiesOnScreen[i].xPos -= enemiesPos.leftSpeed;
            
        }
    }
    else if (enemiesPos.xLimit === false) {
        for (let i = 0; i < enemiesOnScreen.length; i++) {
            enemiesOnScreen[i].xPos += enemiesPos.rightSpeed;
        }
    }
}

// Create the Enemy missles, control thier movments and see if they colide with other game elements.
let enemyMissile = {
    yPos: 0,
    xPos: 0,
    speed: 4,
    
    fire: function(yPos, xPos, width) {
        this.xPos = xPos + (width / 2) - (MISSILE_SIZE.width / 2);
        this.yPos = yPos;
    
        enemyMissilesOnScreen.push(CreateGameElement(MISSILE_SIZE.width, MISSILE_SIZE.height + 5, this.xPos, this.yPos, this.speed, E_MISSILE_IMG));
    }
};
function drawEnemyMissile() {
    for (let i = 0; i < enemyMissilesOnScreen.length; i++) {
        try {
            enemyMissilesOnScreen[i].draw();
            enemyMissilesOnScreen[i].yPos += enemyMissilesOnScreen[i].speed;
        }
        catch (error) {
            console.error(error);
        }
    }
}
function fireEnemyMissiles() {
    if (enemiesOnScreen.length > 0) {
        for (let i = 0; i < enemiesOnScreen.length; i++) {
            if (enemiesOnScreen.length <= 12)  {
                if (i === Math.floor((Math.random() * 300) + 1)) {
                    enemyMissile.fire(enemiesOnScreen[i].yPos, enemiesOnScreen[i].xPos, enemiesOnScreen[i].width);
                }
            }
            else if (enemiesOnScreen.length <= 6)  {
                if (i === Math.floor((Math.random() * 10 + 1))) {
                    enemyMissile.fire(enemiesOnScreen[i].yPos, enemiesOnScreen[i].xPos, enemiesOnScreen[i].width);
                }
            }
            else {
                if (i === Math.floor((Math.random() * 1000) + 1)) {
                    enemyMissile.fire(enemiesOnScreen[i].yPos, enemiesOnScreen[i].xPos, enemiesOnScreen[i].width);
                }
            }
        }
    }
}
function enemyMissileCollision() {
    for (let i = 0; i < enemyMissilesOnScreen.length; i++) {
        try {
            // test to see if the enemy missile hits the floor
            if (enemyMissilesOnScreen[i].yPos >= C_HEIGHT) {
                enemyMissilesOnScreen.splice(i, 1);
                    
                if (DEBUG === true) {
                    console.log("E - Out of Bounds");
                }
            }
            
            // test to see if the enemy missile hits the players ship
            if (enemyMissilesOnScreen[i].yPos >= SHIP.yPos &&
                enemyMissilesOnScreen[i].xPos > SHIP.xPos &&
                enemyMissilesOnScreen[i].xPos < SHIP.xPos + SHIP.width) {
                
                enemyMissilesOnScreen.splice(i, 1);
                
                SHIP.xPos = (C_WIDTH - SHIP_SIZE.width) / 2;
                
                //flash red
                CONTEXT.beginPath();
                CONTEXT.rect(1, 1, C_WIDTH, C_HEIGHT);
                CONTEXT.fillStyle = "red";
                CONTEXT.fill();
                CONTEXT.closePath();
                
                playerLives -= 1;
                
                if (DEBUG === true) {
                    console.log("HIT PLAYER");
                    console.log(playerLives)
                }
            }
            
            
            // test to see if the enemy missile hits any of the buildings
            for (let x = 0; x < buildings.length; x++) {
                if (enemyMissilesOnScreen[i].yPos >= buildings[x].yPos &&
                    enemyMissilesOnScreen[i].xPos >= buildings[x].xPos &&
                    enemyMissilesOnScreen[i].xPos <= buildings[x].xPos + buildings[x].width) {
                    
                    enemyMissilesOnScreen.splice(i, 1);
                    
                    if (buildings[x].width < 20) {
                        buildings.splice(x, 1);
                    }
                    else {
                        buildings[x].width -= 25;
                        buildings[x].xPos += 10;
                    }
                    
                    if (DEBUG === true) {
                        console.log("E -HIT BUILDING");
                    }
                }
            }
        }
        catch (error) {
            enemyMissilesOnScreen.splice(i, 1);
        }
    } 
}


// Create and controll the missiles fired by the player. Test to see if they colide with other game elements.
let playerMissile = {
    yPos: SHIP.yPos,
    xPos: 0,
    speed: 4,
    pCooldown: 0,
    
    fire: function() {
        this.xPos = SHIP.xPos + (SHIP.width / 2) - (MISSILE_SIZE.width / 2);
        
        playerMissilesOnScreen.push(CreateGameElement(MISSILE_SIZE.width, MISSILE_SIZE.height, this.xPos, this.yPos, this.speed, MISSILE_IMG));
    
        if (DEBUG === true) {
            console.log(playerMissilesOnScreen.length);
        }
    }
};
function drawPlayerMissile() {
    for (let i = 0; i < playerMissilesOnScreen.length; i++) {
        try {
            playerMissilesOnScreen[i].draw();
            
            if  (score >= 35000)  {
                playerMissilesOnScreen[i].yPos -= playerMissilesOnScreen[i].speed + 4;
            } 
            else if (score >= 70000) {
                playerMissilesOnScreen[i].yPos -= playerMissilesOnScreen[i].speed + 8;
            }
            else{
                playerMissilesOnScreen[i].yPos -= playerMissilesOnScreen[i].speed;
            }
        }
        catch (error) {
            console.error(error);
        }
    }
}
function playerMissileCollision() {
    for (let i = 0; i < playerMissilesOnScreen.length; i++) {
        try {
            
            // test to see if the missile hits the celling
            if (playerMissilesOnScreen[i].yPos <= 0) {
                
                playerMissilesOnScreen.splice(i, 1);
                playerMissile.pCooldown -= 1;
                    
                if (DEBUG === true) {
                    console.log("Out of Bounds");
                }
            }
            
            // test to see if the missile hits an enemey
            for (let j = 0; j < enemiesOnScreen.length; j++) {
                if (playerMissilesOnScreen[i].yPos - enemiesOnScreen[j].height <= enemiesOnScreen[j].yPos &&
                    playerMissilesOnScreen[i].xPos >= enemiesOnScreen[j].xPos &&
                    playerMissilesOnScreen[i].xPos <= enemiesOnScreen[j].xPos + enemiesOnScreen[j].width) {
                
                    enemiesOnScreen.splice(j, 1);
                    playerMissilesOnScreen.splice(i, 1);
                    playerMissile.pCooldown -= 1;
                    score += 500;
                   
                    if (DEBUG === true) {
                        console.log("HIT");
                        console.log(score);
                    }
                }
            }
            
            // test to see if the missile hits any of the buildings
            for (let x = 0; x < buildings.length; x++) {
                if (playerMissilesOnScreen[i].yPos <= buildings[x].yPos &&
                    playerMissilesOnScreen[i].xPos >= buildings[x].xPos &&
                    playerMissilesOnScreen[i].xPos <= buildings[x].xPos + buildings[x].width) {
                    
                    playerMissilesOnScreen.splice(i, 1);
                    playerMissile.pCooldown -= 1;
                    score -= 100;
                    
                    if (buildings[x].width < 20) {
                        buildings.splice(x, 1);
                    }
                    else {
                        buildings[x].width -= 25;
                        buildings[x].xPos += 10;
                    }
                    
                    if (DEBUG === true) {
                        console.log("HIT BUILDING");
                        console.log(score);
                        console.log(buildings[x].width);
                    }
                }
            }
        }
        catch (error) {
            playerMissilesOnScreen.splice(i, 1);
        }
    } 
}

// create levels
function nextLevel() {
    level += 1;
    enemiesPos.leftSpeed += 0.5;
    enemiesPos.rightSpeed += 0.5;
    
    buildings = [];
    playerMissilesOnScreen = [];
    enemiesOnScreen = [];
    enemyMissilesOnScreen = [];
    
    playerMissile.pCooldown = 0;
    
    createBuildings();    
    drawEnemies();
}

// Update the Score on the DOM
function updateScore(scoreValue) {
    scoreDisplay = document.getElementById("score");
    finalScore = document.getElementById("scoreModal")
    
    scoreDisplay.innerHTML = scoreValue;
    finalScore.innerHTML = scoreValue;
}

// Keep track of the time the game has been running.
function startClock() {
    timePlayed = document.getElementById("time");
    finalTime = document.getElementById("timeModal");
    
    if (calTime === true) {
        time += 1;
    }
    
    timePlayed.innerHTML = time + " S";
    finalTime.innerHTML = time + " SECONDS";
}

// Display Information about the game to inform the player.
function hud() {
    let missileCount = 5 - playerMissile.pCooldown
    
    CONTEXT.fillStyle = "yellow";
    CONTEXT.font = "20px Arial";
    CONTEXT.textAlign = "left";
    CONTEXT.fillText("LEVEL \\\\  " + level, 10, 20);
    CONTEXT.textAlign = "center";
    CONTEXT.fillText("LIVES  \\\\  " + playerLives, C_WIDTH/2, 20);
    CONTEXT.textAlign = "left";
    CONTEXT.fillText("MISSLES \\\\  " + missileCount, C_WIDTH - 130, 20);
}


// MENUES
function startMenu() {
    CONTEXT.clearRect(0, 0, C_WIDTH, C_HEIGHT);
    CONTEXT.fillStyle = "yellow";
    CONTEXT.textAlign = "center";
    CONTEXT.font = "48px Arial";
    CONTEXT.fillText("Click To Start", C_WIDTH / 2, C_HEIGHT / 2);
    CANVAS.addEventListener("click", startGame);
}
function startGame() {
    setInterval(startClock, 1000);
    nextLevel();
    animate();
    CANVAS.removeEventListener("click", startGame);
    
    if (DEBUG === true) {
        console.log("GAME STARTING");
    }
}
let endGame = {
    modal: document.getElementById("gameOverModal"),
    
    gameOver: function() {
        playerMissile.pCooldown = 11;
        CONTEXT.clearRect(0, 0, C_WIDTH, C_HEIGHT);
        this.modal.style.display = "block";
    },
    
    close: function() {
        location.reload();
    }
};
let howToPlay = {
    modal: document.getElementById("howToModal"),
    
    open: function() {
        this.modal.style.display = "block";
    
    },
    close: function() {
        this.modal.style.display = "none";
    }
};

// core game animations
function animate() {
    CONTEXT.clearRect(0, 0, C_WIDTH, C_HEIGHT);

    if (enemiesOnScreen.length === 0) {
        nextLevel();
    }
    else if (playerLives === 0) {
        gameOver = true;
    }
    
    drawEnemyMissile();
    drawPlayerMissile();
    
    enemyMissileCollision();
    playerMissileCollision();
    
    hud();
    updateScore(score);
    
    SHIP.draw();
    
    moveEnemies();
    fireEnemyMissiles();
    
    drawBuildings();
    
    // Controling the Ship
    if (rightKey === true) {
        if (score >= 100000) {
            SHIP.xPos += SHIP.speed * 4;
        }
        else if (score >= 50000) {
            SHIP.xPos += SHIP.speed * 3;
        }
        else if (score >= 25000) {
            SHIP.xPos += SHIP.speed * 2;
        }
        else {
            SHIP.xPos += SHIP.speed;
        }
        
        if (SHIP.xPos + SHIP.width > C_WIDTH - 10) {
            SHIP.xPos = C_WIDTH - 10 - SHIP.width;
        }
    }
    else if (leftKey === true) {
        if (score >= 100000){
            SHIP.xPos -= SHIP.speed * 4;
        }
        else if (score >= 50000) {
            SHIP.xPos -= SHIP.speed * 3;
        }
        else if (score >= 25000) {
            SHIP.xPos -= SHIP.speed * 2;
        }
        else {
            SHIP.xPos -= SHIP.speed;
        }
        
        if (SHIP.xPos < 10) {
            SHIP.xPos = 10;
        }
    }
    
    if (gameOver){
        endGame.gameOver();
        calTime = false;
    }
    else {
        window.requestAnimationFrame(animate);
    }
      
}

// Key Functions
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

function keyDown() {
    let e = event.key;
    
    if (e === "ArrowRight" || e === "Right") {
        rightKey = true;
    }
    if (e === "ArrowLeft" || e === "Left") {
        leftKey = true;
    }
    if (e === " " || e === "ArrowUp" || e === "Up"){
        if (playerMissile.pCooldown <= 4) {
            playerMissile.fire();
            playerMissile.pCooldown += 1;
        }
    }
}
function keyUp() {
    let e = event.key
    
    if (e === "ArrowRight" || e === "Right") {
        rightKey = false;
    }
    else if (e === "ArrowLeft" || e === "Left") {
        leftKey = false;
    }
}

startMenu();

if (DEBUG === true) {
    console.log("W x H");
    console.log(C_WIDTH, C_HEIGHT);
    console.log(SHIP);

}