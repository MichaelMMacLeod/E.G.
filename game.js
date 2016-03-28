startGame = function() {
	gameArea.start();
	loadComponents();
}
loadComponents = function() {
	planet = new component(600, 600, 480, 540, 0, 1, "bluePlanet.png");
	ship = new component(64, 64, 480, 100, 0, 1, "blueShip.png");
	background = new component(1450, 1450, 480, 540, 0, 1, "background.png")
	if (config.shaders == true) {
		backgroundShade = new component(960, 540, 480, 270, 0, config.backgroundShadeAmount, "backShade.png");
		planetShade = new component(600, 600, 480, 540, 0, config.planetShadeAmount, "planetShade.png");	
	}
}
config = {
	updatePeriod : 20, // Lower: more screen updates per second. Keep this at 20.
	shaders : true, // Purely visual. Adds shadows everywhere.
	planetShadeAmount : 0.3, // Transparency of the planet shadow. Values range from 1 (dark) to 0 (no shadow).
	backgroundShadeAmount : 0.9, // Transparency of the background shadow. Values range from 1 (dark) to 0 (no shadow).
	rotateLeftKey : 68, // Key used to rotate things to the left.
	rotateRightKey : 65, // Key used to rotate things to the right.
	thrustKey : 87, // Key used to turn the ship's thrusters on. 
	rotationDecay : 0.95 // Decaying speed of planet rotation when a key is not pressed. Ranges from 1 (No decay) to 0 (Insta-stop).
}
gameArea = {
	canvas : document.createElement('canvas'),
	start : function() {
		this.canvas.width = 960;
		this.canvas.height = 540;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.interval = setInterval(updateGameArea, config.updatePeriod);
		window.addEventListener('keydown', function (e) {
			gameArea.keys = (gameArea.keys || []);
			gameArea.keys[e.keyCode] = true;
		})
		window.addEventListener('keyup', function (e) {
			gameArea.keys[e.keyCode] = false;
		})
	},
	clear : function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}
function component(
	width, // Width of the image to draw in pixels.
	height, // Height of the image to draw in pixels.
	x, // X coordinate of the midpoint of the image in pixels. 
	y, // Y coordinate of the midpoint of the image in pixels.
	rotation, // Default rotation of an image.
	transparency, // Transparency of the image. Ranges from 1 (no transparency) to 0 (see-through).
	source // URL of the image.
	) {
	this.image = new Image();
	this.image.src = source;
	this.width = width;
	this.height = height;
	this.x = x - this.width / 2;
	this.y = y - this.height / 2;
	this.rotation = rotation * Math.PI / 180;
	this.transparency = transparency;
	this.speed = 0;
	this.update = function() { // Draws the component with the correct rotation. Must be called after other 'update' type functions.
		this.ab = [ // The bottom right corner of a shape at 0 degrees rotation
			this.width + this.x,
			this.height + this.y
		];
		this.midpoint = [ // The midpoint of a shape at 0 degrees rotation
			(this.x + this.ab[0]) / 2, 
			(this.y + this.ab[1]) / 2
		];
		this.midpointNew = [ // The midpoint of the rotated shape
			this.midpoint[1] * Math.sin(-this.rotation) + this.midpoint[0] * Math.cos(-this.rotation),
			this.midpoint[1] * Math.cos(-this.rotation) - this.midpoint[0] * Math.sin(-this.rotation)
		];
		this.midpointDiff = [ // The difference between the two midpoints
			this.midpoint[0] - this.midpointNew[0],
			this.midpoint[1] - this.midpointNew[1]
		];
		ctx = gameArea.context;
		ctx.save();
		ctx.translate(this.midpointDiff[0], this.midpointDiff[1]);
		ctx.rotate(this.rotation);
		ctx.globalAlpha = this.transparency;
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
		ctx.restore();
	}
	this.updateRotation = function() { // Updates the rotation of a (planet) shape based on keys the user has pressed.
		if (gameArea.keys && gameArea.keys[config.thrustKey] && ship.rotation >= 5 * Math.PI / 180) {
			this.speed -= (this.speed + 0.1) * (1 * Math.PI / 180); 
		}
		if (gameArea.keys && gameArea.keys[config.thrustKey] && ship.rotation <= 5 * Math.PI / 180) {
			this.speed += (this.speed + 0.1) * (1 * Math.PI / 180);
		}
		this.speed = this.speed * config.rotationDecay;
		if (this.speed > 1 * Math.PI / 180) {
			this.speed = 1 * Math.PI / 180;
		} else if (this.speed < -1 * Math.PI / 180) {
			this.speed = -1 * Math.PI / 180;
		}
		this.rotation += this.speed;
	}
	this.updateShipRotation = function() { // Updates the rotation of a (ship) shape based on keys the user has pressed.
		if (this.rotation > 180 * Math.PI / 180) { // Keeps the rotation within the right bounds, so the following statements work at any rotation.
			this.rotation -= 360 * Math.PI / 180;
		} else if (this.rotation < -180 * Math.PI / 180) {
			this.rotation += 360 * Math.PI / 180;
		}
		if (gameArea.keys && gameArea.keys[config.rotateLeftKey]) { // Accelerates the object (to the left) when the left key is pressed
			this.speed += (this.speed + 0.1) * (1 * Math.PI / 180); 
		}
		if (gameArea.keys && gameArea.keys[config.rotateRightKey]) { // Accelerates the object (to the right) when the right key is pressed
			this.speed -= (this.speed + 0.1) * (1 * Math.PI / 180);
		}
		// The following 4 if statements push the ship horizontal when the thrusters are turned on
		if (gameArea.keys && gameArea.keys[config.thrustKey] && this.rotation > 90 * Math.PI / 180 && this.rotation < 180 * Math.PI / 180) {
			this.speed -= (this.speed + 0.1) * (1 * Math.PI / 180);
		}
		if (gameArea.keys && gameArea.keys[config.thrustKey] && this.rotation > 0 && this.rotation < 90 * Math.PI / 180) {
			this.speed += (this.speed + 0.1) * (1 * Math.PI / 180);
		}
		if (gameArea.keys && gameArea.keys[config.thrustKey] && this.rotation < -90 * Math.PI / 180 && this.rotation > -180 * Math.PI / 180) {
			this.speed += (this.speed + 0.1) * (1 * Math.PI / 180);
		}
		if (gameArea.keys && gameArea.keys[config.thrustKey] && this.rotation < 0 && this.rotation > -90 * Math.PI / 180) {
			this.speed -= (this.speed + 0.1) * (1 * Math.PI / 180);
		}
		this.speed = this.speed * config.rotationDecay; // Deceleration.
		if (this.speed > 2 * Math.PI / 180) { // Limits the maximum speed.
			this.speed = 2 * Math.PI / 180;
		} else if (this.speed < -2 * Math.PI / 180) {
			this.speed = -2 * Math.PI / 180;
		}
		this.rotation += this.speed;
	}
}
function updateGameArea() { // Order to call functions: updateRotation/updateShipRotation/update
	gameArea.clear();
	if (config.shaders == true) { // Shadows should be drawn directly after the update() is called for what they are shadowing
		background.updateRotation();
		planet.updateRotation();
		ship.updateShipRotation();
		background.update();
		backgroundShade.update();
		planet.update();
		planetShade.update();
		ship.update();
	} else {
		background.updateRotation();
		planet.updateRotation();
		ship.updateShipRotation();
		background.update();
		planet.update();
		ship.update();
	}
}