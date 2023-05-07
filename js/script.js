// Variables

const FPS = 30; // Frames per second
const FRICTION = 0.05; // friction coefficient of space (0 = no friction, 1 = lots of friction)
const SHIP_SIZE = 25; // ship height in px
const SHIP_THRUST = 5; // ship thrust in px per second
const TURN_SPEED = 360; // turn speed in deg per second

// Canvas

//* @type {HTMLCanvasElement}
var canv = document.getElementById('gameCanvas');
canv.width = document.body.clientWidth;
canv.height = window.innerHeight;
canv.height -= 175;

var ctx = canv.getContext('2d');

// Construct Ship
var ship = {
    x: canv.width / 2,
    y: canv.height / 2,
    radius: SHIP_SIZE / 2, // radius
    angle: 90 / 180 * Math.PI, // convert to radians, ship angle
    rotation: 0,
    thrusting: false,
    thrust: {
        x: 0,
        y: 0
    }
}

// Events
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// Game Loop
setInterval(update, 1000 / FPS);

// Functions

function leftBtn() {
    ship.rotation = TURN_SPEED / 180 * Math.PI / FPS;
}

function rightBtn() {
    ship.rotation = -TURN_SPEED / 180 * Math.PI / FPS;
}
function thrustBtn() {
    ship.thrusting = true;
}
// Buttons

$("#turnLeft").on('mousedown', function(e) {
    ship.rotation = TURN_SPEED / 180 * Math.PI / FPS;
});

$("#turnLeft").on('mouseup', function(e) {
    ship.rotation = 0;
});

$("#forwardLeft").on('mousedown', function(e) {
    ship.thrusting = true;
});

$("#forwardLeft").on('mouseup', function(e) {
    ship.thrusting = false;
});

$("#fireLeft").on('mousedown', function(e) {
    
});

$("#fireLeft").on('mouseup', function(e) {
    
});

// Right
$("#turnRight").on('mousedown', function(e) {
    ship.rotation = -TURN_SPEED / 180 * Math.PI / FPS;
});

$("#turnRight").on('mouseup', function(e) {
    ship.rotation = 0;
});

$("#forwardRight").on('mousedown', function(e) {
    ship.thrusting = true;
});

$("#forwardRight").on('mouseup', function(e) {
    ship.thrusting = false;
});

$("#fireRight").on('mousedown', function(e) {
    
});

$("#fireRight").on('mouseup', function(e) {
    
});


// Keys
function keyDown(/** @type {KeyboardEvent} */ ev) {
    switch(ev.keyCode) {
        case 37: // left arrow (rotate ship left)
            ship.rotation = TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case 38: // up arrow (thrust ship forward)
            ship.thrusting = true;
            break;
        case 39: // right arrow (rotate ship right)
            ship.rotation = -TURN_SPEED / 180 * Math.PI / FPS;
            break;

    }
}

function keyUp(/** @type {KeyboardEvent} */ ev) {
    switch(ev.keyCode) {
        case 37: // left arrow (stop rotation ship left)
            ship.rotation = 0;
            break;
        case 38: // up arrow (stop thrust ship forward)
            ship.thrusting = false;
            break;
        case 39: // right arrow (stop rotation ship right)
            ship.rotation = 0;
            break;
    }
}

// Update Screen

function update() {
    // draw space
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canv.clientWidth, canv.height);

    // thrust the ship
    if (ship.thrusting) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.angle) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.angle) / FPS;

        // draw the thruster
        ctx.fillStyle = '#e5fc37';
        ctx.strokeStyle = '#001717';
        ctx.lineWidth = SHIP_SIZE / 4;
        ctx.beginPath();
        ctx.moveTo( // rear left
            ship.x - ship.radius * (2 / 3 * Math.cos(ship.angle) + 0.65 * Math.sin(ship.angle)),
            ship.y + ship.radius * (2 / 3 * Math.sin(ship.angle) - 0.65 * Math.cos(ship.angle))
        );
        ctx.lineTo( // rear center behind the ship
            ship.x - ship.radius * 8 / 3 * Math.cos(ship.angle),
            ship.y + ship.radius * 8 / 3 * Math.sin(ship.angle)
        );
        ctx.lineTo( // rear right
            ship.x - ship.radius * (2 / 3 * Math.cos(ship.angle) - 0.65 * Math.sin(ship.angle)),
            ship.y + ship.radius * (2 / 3 * Math.sin(ship.angle) + 0.65 * Math.cos(ship.angle))
        );
        // ctx.closePath();
        ctx.fill();
        ctx.stroke();

    } else {
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }

    // draw the triangular ship
    ctx.strokeStyle = 'white';
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo( // nose of the ship
        ship.x + 4 / 3 * ship.radius * (Math.cos(ship.angle)),
        ship.y - 4 / 3 * ship.radius * (Math.sin(ship.angle))
    );
    ctx.lineTo( // rear left
        ship.x - ship.radius * (2 / 3 * Math.cos(ship.angle) + Math.sin(ship.angle)),
        ship.y + ship.radius * (2 / 3 * Math.sin(ship.angle) - Math.cos(ship.angle))
    );
    ctx.lineTo( // rear right
        ship.x - ship.radius * (2 / 3 * Math.cos(ship.angle) - Math.sin(ship.angle)),
        ship.y + ship.radius * (2 / 3 * Math.sin(ship.angle) + Math.cos(ship.angle))
    );
    ctx.closePath();
    ctx.stroke();

    // rotate the ship
    ship.angle += ship.rotation;

    // move the ship
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    // handle edge of the screen
    if (ship.x < 0 - ship.radius) {
        ship.x = canv.width + ship.radius;
    } else if(ship.x > canv.width + ship.radius) {
        ship.x = 0 - ship.radius;
    }
    
    if (ship.y < 0 - ship.radius) {
        ship.y = canv.height + ship.radius;
    } else if(ship.y > canv.height + ship.radius) {
        ship.y = 0 - ship.radius;
    }

    // draw centre dot
    // ctx.fillStyle = 'red';
    // ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
}