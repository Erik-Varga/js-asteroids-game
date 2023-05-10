// Variables
let ROID_NUM = 1; // starting number of asteroids in pixels per second
let GAME_LIVES = 3; // starting number of lives

const FPS = 30; // frames per second
const FRICTION = 0.2; // friction coefficient of space (0 = no friction, 1 = lots of friction)
const LASER_DIST = 0.6; // maximum distance laser can travel as fraction of screen width
const LASER_EXPLODE_DUR = 0.1; // duration of the lasers' explosion in seconds
const LASER_MAX = 10; // maximum number of lasers on screen at once
const LASER_SPD = 500; // speed of lasers in pixels per second
const ROID_JAG = 0.4; // jaggedness of the asteroids (0 = none, 1 = lots)
const ROID_SIZE = 100; // starting size of asteroids in pixels
const ROID_SPD = 50; // max starting speed of asteroids in pixels per second
const ROID_VERT = 10; // average number of vertices on each asteroid
const SHIP_BLINK_DUR = 0.3; // duration of the ship's blink during invisibility in seconds
const SHIP_EXPLODE_DUR = 0.3; // duration of the ship's explosion in seconds
const SHIP_INV_DUR = 4; // duration of the ship's invisibility in seconds
const SHIP_SIZE = 25; // ship height in pixels
const SHIP_THRUST = 5; // acceleration of the ship in pixels per second per second
const SHIP_TURN_SPD = 360; // turn speed in degrees per second
const SHOW_BOUNDING = false; // show or hide collision bounding
const SHOW_CENTRE_DOT = false; // show or hide ship's centre dot
const TEXT_FADE_TIME = 3.5; // text fade time in seconds
const TEXT_SIZE = 40; // text font height in pixels

const roidNum = document.getElementById('roidNum');
const level_num = document.getElementById('levelNum');

let ship_x = document.getElementById('shipX');
let ship_y = document.getElementById('shipY');
let screen_x = document.getElementById('screenX');
let screen_y = document.getElementById('screenY');
let new_game = document.getElementById('newGame');


// Canvas

/** @type {HTMLCanvasElement} */
var canv = document.getElementById('gameCanvas');
canv.width = document.body.clientWidth;
canv.height = window.innerHeight;
canv.height -= 195;

screen_x.innerHTML = parseInt(document.body.clientWidth);
screen_y.innerHTML = parseInt(window.innerHeight);

var ctx = canv.getContext('2d');

// setup the game parameters
var level, lives, roids, ship, text, textAlpha;
newGame();

// set up event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// set up the game loop
setInterval(update, 1000 / FPS);


// Functions

// Ship Buttons

function leftBtn() {
    ship.rot = SHIP_TURN_SPD / 180 * Math.PI / FPS;
}

function rightBtn() {
    ship.rot = -SHIP_TURN_SPD / 180 * Math.PI / FPS;
}

function stopBtn() {
    ship.rot = 0;
}

function fireBtn() {
    shootLaser();
}

function thrustBtn() {
    ship.thrusting = true;
}

// astronaut flashes when ship explodes
function astronaut_solid() {
    var ele = document.getElementById("astronaut");
    ele.classList.remove("astronaut");
}
function astronaut_flash() {
    var ele = document.getElementById("astronaut");
    ele.classList.add("astronaut");
}


// Buttons (jQuery)

$("#left").on('mousedown', function(e) {
    leftBtn();
});

$("#left").on('mouseup', function(e) {
    stopBtn();
});

$("#right").on('mousedown', function(e) {
    rightBtn();
});

$("#right").on('mouseup', function(e) {
    stopBtn();
});

$("#fire").on('mousedown', function(e) {
    shootLaser();
});

$("#fire").on('mouseup', function(e) {
    return;
});

$("#thrust").on('mousedown', function(e) {
    thrustBtn();
});

$("#thrust").on('mouseup', function(e) {
    ship.thrusting = false;
});

function createAsteroidBelt() {
    roids = [];
    var x, y;
    for (var i = 0; i < ROID_NUM + level + 1; i++) {
        // random asteroid location (not touching spaceship)
        do {
            x = Math.floor(Math.random() * canv.width);
            y = Math.floor(Math.random() * canv.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ROID_SIZE * 2 + ship.r);
        roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 2)));
    }
    ROID_NUM = ROID_NUM + level + 1;
    roidNum.innerHTML = ROID_NUM;
}

function destroyAsteroid(index) {
    var x = roids[index].x;
    var y = roids[index].y;
    var r = roids[index].r;

    // split the asteroid in two if necessary
    if (r == Math.ceil(ROID_SIZE / 2)) { // large asteroid
        ROID_NUM = ROID_NUM + 1;
        roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 4)));
        roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 4)));
    } else if (r == Math.ceil(ROID_SIZE / 4)) { // medium asteroid
        ROID_NUM = ROID_NUM + 1;
        roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 8)));
        roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 8)));
    } else if (r == Math.ceil(ROID_SIZE / 8)) { // small asteroid
        ROID_NUM = ROID_NUM - 1;
    }
    
    // destroy the asteroid
    roids.splice(index, 1);

    // update asteroid total in control panel
    roidNum.innerHTML = ROID_NUM;

    // new level when no more asteroids
    if (roids.length == 0) {
        level++;
        newLevel();
    }
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function explodeShip() {
    // ctx.strokeStyle = "lime";
    // ctx.fillStyle = "#072A9Z";
    // ctx.beginPath();
    // ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
    // ctx.fill();
    // ctx.stroke();

    ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
    astronaut_flash();
}

function gameOver() {
    ship.dead = true;
    text = "GAME OVER";
    textAlpha = 1.0;
}

// Keys
function keyDown(/** @type {KeyboardEvent} */ ev) {
    if (ship.dead) {
        return;
    }

    switch(ev.keyCode) {
        case 32: // space bar (shoot laser)
            shootLaser();
            break;
        case 37: // left arrow (rotate ship left)
            leftBtn();
            break;
        case 38: // up arrow (thrust the ship forward)
            thrustBtn();
            break;
        case 39: // right arrow (rotate ship right)
            rightBtn();
            break;
    }
}

function keyUp(/** @type {KeyboardEvent} */ ev) {
    if (ship.dead) {
        return;
    }

    switch(ev.keyCode) {
        case 32: // space bar (allow shooting again)
            ship.canShoot = true;
            break;
        case 37: // left arrow (stop rotating left)
            stopBtn();
            break;
        case 38: // up arrow (stop thrusting)
            ship.thrusting = false;
            break;
        case 39: // right arrow (stop rotating right)
            stopBtn();
            break;
    }
}

function newAsteroid(x, y, r) {
    var levelMultiplier = 1 + 0.1 * level;
    var roid = {
        x: x,
        y: y,
        xv: Math.random() * ROID_SPD * levelMultiplier / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ROID_SPD * levelMultiplier / FPS * (Math.random() < 0.5 ? 1 : -1),
        a: Math.random() * Math.PI * 2, // in radians
        r: r,
        offs: [],
        vert: Math.floor(Math.random() * (ROID_VERT + 1) + ROID_VERT / 2)
    };

    // populate the offsets array
    for (var i = 0; i < roid.vert; i++) {
        roid.offs.push(Math.random() * ROID_JAG * 2 + 1 - ROID_JAG);
    }

    level_num.innerHTML = level;

    return roid;
}

function newGame() {
    level = 0;
    lives = GAME_LIVES;
    // setup the spaceship object
    ship = newShip();
    // setup new level
    newLevel();
    new_game.classList.add('invisible');
}

function newLevel() {
    text = "Level " + level;
    textAlpha = 1.0
    // set up asteroids
    createAsteroidBelt();
    level_num.innerHTML = level;
}

function newShip() {
    roidNum.innerHTML = ROID_NUM;
    return {
        x: canv.width / 2,
        y: canv.height / 2,
        r: SHIP_SIZE / 2,
        a: 90 / 180 * Math.PI, // convert to radians
        blinkNum: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),
        blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
        canShoot: true,
        dead: false,
        explodeTime: 0,
        lasers: [],
        rot: 0,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        }
    }
}    

function drawShip(x, y, a, color = "white") {
    ctx.strokeStyle = "white";
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo( // nose of the ship
        x + 4 / 3 * ship.r * Math.cos(a),
        y - 4 / 3 * ship.r * Math.sin(a)
    );
    ctx.lineTo( // rear left
        x - ship.r * (2 / 3 * Math.cos(a) + Math.sin(a)),
        y + ship.r * (2 / 3 * Math.sin(a) - Math.cos(a))
    );
    ctx.lineTo( // rear right
        x - ship.r * (2 / 3 * Math.cos(a) - Math.sin(a)),
        y + ship.r * (2 / 3 * Math.sin(a) + Math.cos(a))
    );
    ctx.closePath();
    ctx.stroke();
}

function shootLaser(){
    // create the laser object
    if (ship.canShoot && ship.lasers.length < LASER_MAX) {
        ship.lasers.push({ // from nose of the ship
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: LASER_SPD * Math.cos(ship.a) / FPS,
            yv: -LASER_SPD * Math.sin(ship.a) / FPS,
            dist: 0,
            explodeTime: 0
        });
    }
 
    // prevent further shooting
    ship.canShoot = false;
}

function update() {
    // blink the ship   
    var blinkOn = ship.blinkNum % 2 == 0; // even number
    
    // ship is exploding
    var exploding = ship.explodeTime > 0;

    // draw space
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);

    // thrust the ship
    if (ship.thrusting && !ship.dead) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;

        // draw the thruster
        if (!exploding && blinkOn) {
            ctx.fillStyle = '#e5fc37';
            ctx.strokeStyle = '#001717';
            ctx.lineWidth = SHIP_SIZE / 11;
            ctx.beginPath();
            ctx.moveTo( // rear left
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
            );
            ctx.lineTo( // rear centre (behind the ship)
                ship.x - ship.r * 6 / 3 * Math.cos(ship.a),
                ship.y + ship.r * 6 / 3 * Math.sin(ship.a)
            );
            ctx.lineTo( // rear right
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
            );
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    } else {
        // apply friction (slow the ship down when not thrusting)
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }

    // draw the triangular ship
    if (!exploding) {
        if (blinkOn & !ship.dead) {
            drawShip(ship.x, ship.y, ship.a);
        }

        // handle blinking
        if (ship.blinkNum > 0) {
            // reduce blink time
            ship.blinkTime--;
            // reduce blink num
            if (ship.blinkTime == 0) {
                ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
                ship.blinkNum--;
            }
        }

    } else {
        // draw the explosion
        ctx.fillStyle = "darkred";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 3.7, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 3.6, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = "darkred";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
        ctx.fill();
        
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = "yellowred";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.3, 0, Math.PI * 2, false);
        ctx.fill();
    }

    // create collision boundaries - ship
    if (SHOW_BOUNDING) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
        ctx.stroke();
    }

    // draw the asteroids
    var a, r, x, y, offs, vert;
    for (var i = 0; i < roids.length; i++) {
        
        // asteroid color
        ctx.strokeStyle = "slategrey";
        ctx.lineWidth = SHIP_SIZE / 20;

        // get the asteroid properties
        a = roids[i].a;
        r = roids[i].r;
        x = roids[i].x;
        y = roids[i].y;
        offs = roids[i].offs;
        vert = roids[i].vert;
        
        // draw the path
        ctx.beginPath();
        ctx.moveTo(
            x + r * offs[0] * Math.cos(a),
            y + r * offs[0] * Math.sin(a)
        );

        // draw the polygon
        for (var j = 1; j < vert; j++) {
            ctx.lineTo(
                x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
            );
        }
        ctx.closePath();
        ctx.stroke();

        // create collision boundaries - asteroid
        if (SHOW_BOUNDING) {
            ctx.strokeStyle = "lime";
            ctx.fillStyle = "#072A9Z";
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, false);
            // ctx.fill();
            ctx.stroke();
        }
    }
    
    // centre dot
    if (SHOW_CENTRE_DOT) {
        ctx.fillStyle = "red";
        ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
    }

    // draw the lasers
    for (var i = 0; i < ship.lasers.length; i++) {
        if (ship.lasers[i].explodeTime == 0) {
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 10 , 0, Math.PI * 2, false);
            ctx.fill();
        } else {
            // draw the explosion
            ctx.fillStyle = "darkred";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.5, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false);
            ctx.fill();
        }
    }

    // draw the game text
    if (textAlpha >= 0) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255, 255, 255, " + textAlpha + ")";
        ctx.font = TEXT_SIZE + "px 'Righteous', cursive";
        ctx.fillText(text, canv.width /2, canv.height * 0.75);
        textAlpha -= (0.5 / TEXT_FADE_TIME / FPS);
    } else if (ship.dead) {
        new_game.classList.remove('invisible');
    }

    // draw the ship lives
    var lifeColor;
    for (let i = 0; i < lives; i++) {
        lifeColor = exploding && i == lives - 1 ? "red" : "white";
        drawShip(SHIP_SIZE + i * SHIP_SIZE * 1.2, SHIP_SIZE, 0.5 * Math.PI, lifeColor);
    }

    // detect laser hits on asteroids
    var ax, ay, ar, lx, ly;
    for (let i = roids.length - 1; i >= 0; i--) {
        
        // grab the asteroid properties
        ax = roids[i].x;
        ay = roids[i].y;
        ar = roids[i].r;
        
        // loop over the lasers
        for (let j = ship.lasers.length - 1; j >= 0; j--) {
            
            // grab the laser properties
            lx = ship.lasers[j].x;
            ly = ship.lasers[j].y;

            // detect hits
            if (ship.lasers[j].explodeTime == 0 && distBetweenPoints(ax, ay, lx, ly) < ar) {

                // remove the laser
                // ship.lasers.splice(j, 1);

                // destory the asteroid and activate the laser explosion

                // remove the asteroid
                destroyAsteroid(i);
                ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * FPS);

                break;
            }
            
        }
    }

    // check for asteroid collisions
    if (!exploding) {
        if (ship.blinkNum == 0 && !ship.dead) {
            for (var i = 0; i < roids.length; i++) {
                if (distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r) {
                    explodeShip();
                    destroyAsteroid(i);
                    break;
                }
            }
        }
    
    // rotate the ship
    ship.a += ship.rot;

    // move the ship
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    } else {
       
        // reduce time left on explosion
        ship.explodeTime--;

        if (ship.explodeTime == 0) {
            // astronaut flash
            setTimeout(astronaut_solid, 3000);
            lives--;
            if (lives == 0) {
                gameOver();
            } else {
                // new ship
                ship = newShip();
            }

        }
    }

    // handle edge of screen
    if (ship.x < 0 - ship.r) {
        ship.x = canv.width + ship.r;
    } else if (ship.x > canv.width + ship.r) {
        ship.x = 0 - ship.r;
    }
    if (ship.y < 0 - ship.r) {
        ship.y = canv.height + ship.r;
    } else if (ship.y > canv.height + ship.r) {
        ship.y = 0 - ship.r;
    }

    // update ship coordinates to screen
    ship_x.innerHTML = parseInt(ship.x);
    ship_y.innerHTML = parseInt(ship.y);
    
    // move the lasers
    for (let i = ship.lasers.length - 1; i >= 0; i--) {
        // check distance travelled
        if (ship.lasers[i].dist > LASER_DIST * canv.width) {
            ship.lasers.splice(i, 1);
            continue;
        }

        // move the laser
        ship.lasers[i].x += ship.lasers[i].xv;
        ship.lasers[i].y += ship.lasers[i].yv;

        // calculate distance travelled
        ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
        
        // handle the explosion
        if (ship.lasers[i].explodeTime > 0) {
            ship.lasers[i].explodeTime--;

            // destroy the laser after the duration is up
            if (ship.lasers[i].explodeTime == 0) {
                ship.lasers.splice(i, 1);
                continue;
            }
        } else {
            // move the laser
            ship.lasers[i].x += ship.lasers[i].xv;
            ship.lasers[i].y += ship.lasers[i].yv;

            // calculate the distance travelled
            ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
        }


        // handle edge of screen
        if (ship.lasers[i].x < 0) {
            ship.lasers[i].x - canv.width;
        } else if (ship.lasers[i].x > canv.width) {
            ship.lasers[i].x = 0;
        }
        if (ship.lasers[i].y < 0) {
            ship.lasers[i].y - canv.height;
        } else if (ship.lasers[i].y > canv.height) {
            ship.lasers[i].y = 0;
        }
    }

    // move the asteroids
    for (var i = 0; i < roids.length; i++) {
        roids[i].x += roids[i].xv;
        roids[i].y += roids[i].yv;

        // handle asteroid edge of screen
        if (roids[i].x < 0 - roids[i].r) {
            roids[i].x = canv.width + roids[i].r;
        } else if (roids[i].x > canv.width + roids[i].r) {
            roids[i].x = 0 - roids[i].r
        }
        if (roids[i].y < 0 - roids[i].r) {
            roids[i].y = canv.height + roids[i].r;
        } else if (roids[i].y > canv.height + roids[i].r) {
            roids[i].y = 0 - roids[i].r
        }
    }
}
