startGame = function() {
	gameArea.start();
	neptune = new component(600, 600, 480, 270, 240, "planet.png");
}

gameConfig = {
	showCenter : true // Displays a dot in the center of components
}

gameArea = {
	canvas : document.createElement('canvas'),
	start : function() {
		this.canvas.width = 4800;
		this.canvas.height = 2700;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.interval = setInterval(updateGameArea, 20);
	},
	clear : function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}

function component(width, height, x, y, rotation, source) {
	this.image = new Image();
	this.image.src = source;
	this.width = width;
	this.height = height;
	this.x = x - this.width / 2;
	this.y = y - this.height / 2;
	this.rotation = rotation * Math.PI / 180;
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
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
		ctx.restore();
		if (gameConfig.showCenter == true) {
			ctx.beginPath();
			ctx.fillRect(this.midpoint[0], this.midpoint[1], 2, 2);
			ctx.fillStyle = "red";
			ctx.fill();
		}
	}
}

function updateGameArea() {
	gameArea.clear();
	neptune.update();
}