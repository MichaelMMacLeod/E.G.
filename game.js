startGame = function() {
	gameArea.start();
	loadComponents();
}

loadComponents = function() {
	planet = new component(600, 600, 480, 540, 0, 1, "bluePlanet.png");
	if (config.planetShade == true) {
		planetShadeOverlay = new component(600, 600, 480, 540, 0, config.planetShadeAmount, "planetShadeOverlay.png");	
	}
}

config = {
	showCenter : true, // (For developer) Displays a dot in the center of components.
	fps : 20, // Frame rate.
	planetShade : true, // Purely visual. Adds shadows on planets.
	planetShadeAmount : 0.3 // Values range from 1 (dark) to 0 (no shadow).
}

gameArea = {
	canvas : document.createElement('canvas'),
	start : function() {
		this.canvas.width = 960;
		this.canvas.height = 540;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.interval = setInterval(updateGameArea, config.fps);
	},
	clear : function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}

function component(width, height, x, y, rotation, transparency, source) {
	/*
	width : width of the image to draw in pixels.
	height : height of the image to draw in pixels.
	x : x coordinate of the midpoint of the image in pixels.
	y : y coordinate of the midpoint of the image in pixels.
	transparency : Transparency of the image. Ranges from 1 (no transparency) to 0 (see-through).
	source : URL of the image.
	*/
	this.image = new Image();
	this.image.src = source;
	this.width = width;
	this.height = height;
	this.x = x - this.width / 2;
	this.y = y - this.height / 2;
	this.rotation = rotation * Math.PI / 180;
	this.transparency = transparency;
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
	this.update = function() { // Draws the component with the correct rotation
		ctx = gameArea.context;
		ctx.save();
		ctx.translate(this.midpointDiff[0], this.midpointDiff[1]);
		ctx.rotate(this.rotation);
		ctx.globalAlpha = this.transparency;
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
		ctx.restore();
		if (config.showCenter == true) {
			ctx.beginPath();
			ctx.fillRect(this.midpoint[0], this.midpoint[1], 2, 2);
			ctx.fillStyle = "red";
			ctx.fill();
		}
	}
}

function updateGameArea() {
	gameArea.clear();
	planet.update();
	planetShadeOverlay.update();
}