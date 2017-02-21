var Sphere = function() {
	this.center = [];		// The coordinates of the center of the sphere
	this.radius = 0; 		// The sphere's radius
	this.latPoints = 0;		// The number of points per latitude
	this.surface = [];		// An array of points that lie at the surface of the sphere, they get defined in the Sphere.init() function
	this.wx = 0;
	this.wy = 0;
	this.wz = 0;
	this.ax = 0;
	this.ay = 0;
	this.az = 0;
}

Sphere.prototype.setDimensions = function(radius,latPoints) {
	this.radius = radius;
	this.latPoints = latPoints;
}

Sphere.prototype.init = function() {
	// This function creates an array of points that define the surface of the sphere
	var numSteps = this.latPoints;
	var points = [];
	for (var i = 0; i < numSteps; i++) { 
		var theta = i / (numSteps - 1) * Math.PI; 
		for (var j = 0; j < (numSteps - 1); j++) { 
			var phi = j / (numSteps - 1) * 2 * Math.PI; 
			points.push([this.radius*Math.sin(theta)*Math.cos(phi),this.radius*Math.cos(theta),this.radius*Math.sin(theta)*Math.sin(phi)]);
		} 
	}

	this.surface = points;
}

Sphere.prototype.draw = function(canvasId) {
	// This function draw the sphere on an html canvas of which the id is passed as an argument
	var canvas = document.getElementById("canvas1");
	var ctx = canvas.getContext('2d');
	canvas.width = 1000;
	canvas.height = 800;

	for (var i = 0; i < this.surface.length; i++) {
		ctx.beginPath();
		ctx.arc(this.center[0]+this.surface[i][0],this.center[1]+this.surface[i][1],2,0,Math.PI*2);
		ctx.fillStyle = "rgba(100,180,180,1)";
		ctx.lineWidth = 1;
		ctx.fill();

		// Define the style
		if (this.style === 1) {
			var numSteps = this.latPoints;
			var num = numSteps-1;
			if (i+numSteps+num < this.surface.length) {
				ctx.beginPath();
				ctx.moveTo(this.center[0]+this.surface[i][0],this.center[1]+this.surface[i][1]);
				ctx.lineTo(this.center[0]+this.surface[i+numSteps+num][0],this.center[1]+this.surface[i+numSteps+num][1]);
				ctx.strokeStyle = "rgba(0,0,0,0.3)";
				ctx.stroke();
			}
			var num = numSteps-2;
			if (i+numSteps+num < this.surface.length) {
				ctx.beginPath();
				ctx.moveTo(this.center[0]+this.surface[i][0],this.center[1]+this.surface[i][1]);
				ctx.lineTo(this.center[0]+this.surface[i+numSteps+num][0],this.center[1]+this.surface[i+numSteps+num][1]);
				ctx.strokeStyle = "rgba(0,0,0,0.3)";
				ctx.stroke();
			}
			var num = numSteps+1;
			if (i+numSteps+num < this.surface.length) {
				ctx.beginPath();
				ctx.moveTo(this.center[0]+this.surface[i][0],this.center[1]+this.surface[i][1]);
				ctx.lineTo(this.center[0]+this.surface[i+numSteps+num][0],this.center[1]+this.surface[i+numSteps+num][1]);
				ctx.strokeStyle = "rgba(0,0,0,0.3)";
				ctx.stroke();
			}
		}
		if (this.style != 1) {
			var numSteps = this.latPoints;
			var num = numSteps-this.style;
			if (i+numSteps+num < this.surface.length) {
				ctx.beginPath();
				ctx.moveTo(this.center[0]+this.surface[i][0],this.center[1]+this.surface[i][1]);
				ctx.lineTo(this.center[0]+this.surface[i+numSteps+num][0],this.center[1]+this.surface[i+numSteps+num][1]);
				ctx.strokeStyle = "rgba(0,0,0,0.3)";
				ctx.stroke();
			}
		}
	}
}

Sphere.prototype.rotate = function() {
	// This function rotated the three dimensional sphere by left-multiplying each vertex's coordinates by a transformation matrix
	// Rotation about each axis is handled by a corresponding transformation matrix
	// The angle of rotation (in radians) is determined by the object's angular velocity
	
	// 1) Create rotation matices
	// Rotation about the x axis
	var tx = this.wx;
	var rx = [
		[1,0		   , 0			 ],
		[0,Math.cos(tx),-Math.sin(tx)],
		[0,Math.sin(tx), Math.cos(tx)]
	];
	var ty = this.wy;
	var ry = [
		[Math.cos(ty),0,-Math.sin(ty)],
		[0			 ,1, 0		     ],
		[Math.sin(ty),0, Math.cos(ty)]
	];
	// Rotation about the z axis
	var tz = this.wz;
	var rz = [
		[Math.cos(tz),-Math.sin(tz),0],
		[Math.sin(tz), Math.cos(tz),0],
		[0			 , 0		   ,1]
	];
	// Store the three matrices in an array to make
	var rotationMatrices = [rx,ry,rz];

	// 2) Rotate the sphere by left multiplying each vertex by each rotation matrix. (note: if the angular velocity is 0, there will be no rotation)
	var tempVertices = this.surface;
	for (var i = 0; i < rotationMatrices.length; i++) {
		for (var j = tempVertices.length - 1; j >= 0; j--) {
			// Left multiply and store in temporary variable
			var x = rotationMatrices[i][0][0] * tempVertices[j][0] + rotationMatrices[i][0][1] * tempVertices[j][1] + rotationMatrices[i][0][2] * tempVertices[j][2];
			var y = rotationMatrices[i][1][0] * tempVertices[j][0] + rotationMatrices[i][1][1] * tempVertices[j][1] + rotationMatrices[i][1][2] * tempVertices[j][2];
			var z = rotationMatrices[i][2][0] * tempVertices[j][0] + rotationMatrices[i][2][1] * tempVertices[j][1] + rotationMatrices[i][2][2] * tempVertices[j][2];
			// Update the vertex's rotated coordinates in the tempVertices array
			tempVertices[j] = [x,y,z];
		}
	}
	this.surface = tempVertices;
}

Sphere.prototype.animate = function() {
	// This function essentially animates the sphere by setting a timeout function and running the transformations on the sphere at each iteration.

	// Set timeout function to execute the animate fonction after a specified duration
	var self = this;
	var timer = setInterval(function() {
		// Draw the current sphere
		self.draw();
		// Apply transformations to the sphere
		// ROTATION
		// Add angular acceleration to the angular velocity
		self.wx += self.ax;
		self.wy += self.ay;
		self.wz += self.az;
		// Rotate the sphere
		self.rotate();
	},30);
}





