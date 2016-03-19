var neptune;

function startGame() {
	neptune = new imageComponent('planet.png', 10, 10, 800, 800);
	gameArea.start();
}

var gameArea = {
	canvas : canvas = document.createElement("canvas"),
	start : function() {
		this.canvas.width = 1000;
		this.canvas.height = 1000;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.interval = setInterval(updateGameArea, 20);
	},
	clear : function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	stop : function() {
		clearInterval(this.interval);
	}
}

function imageComponent(source, x, y, width, height) {
	this.source = source;
	this.x = x;
	this.y = y;
	this.image = new Image();
	this.image.src = source;
	this.width = width;
	this.height = height;
	this.update = function() {
		ctx = gameArea.context;
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
	}
}

function updateGameArea() {
	gameArea.clear();
	neptune.update();
}