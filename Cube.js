var Cubo = function Cubo() {
	// DIMENSIONS
	// The default dimensions for the cube are set to 0.
	// Use setDimensions() to set them, passing as arguments the numeric values for the with, height and depth respectively
	this.width  = 0;
	this.height = 0;
	this.depth  = 0;
	// VERTICES AND CENTER
	// The cube's center is an array with three dimensional coordinates x,y and z
	// It is used as a reference point to position the cube's vertices
	this.center 	= [0,0,0];
	// The vertices property is an array of eight points with three dimensional coordinates
	// The coordinates for each of the eight points is calculated and pushed into the array by the init() function.
	this.vertices 	= [];
	// ANGULAR ACCELERATION AND VELOCITY
	// Angular Acceleration is only used when the animate() function is called.
	// The angular acceleration will get added to the current angular velocity at each iteration of the animate() function
	this.ax = 0;
	this.ay = 0;
	this.az = 0;
	// Angular velocities x,y and z, are the angles in radians by which the cube is rotation about the x, y, and z axes respectively
	// The way the rotation is done is by rotating the cube's vertices by an angle = to the angular velocity with the this.rotate() function
	this.wx = 0;
	this.wy = 0;
	this.wz = 0;
	// CANVAS ID
	// This property is the html canvas' id that refers to the canvas on which the cube will be drawn
	// It is set to null by default
	this.canvasId = null;
}

Cubo.prototype.setDimensions = function(width,height,depth) {
	// Sets the width, height and depth of the cube object
	this.width 	= width;
	this.height = height;
	this.depth 	= depth;
}

Cubo.prototype.init = function() {
	// Creates the cube's vertices with three dimensional coordinates with respect to the center of the cube.
	// The coordinates are calculated by dividing the width, height and depth by 2, and positioning them with respect to cube's center (i.e. this.center) following the algorythm bellow.
	// The algorythm creates the points as follows (asume a regular 3D cartesian coordinate system with the z axis perpendicular to the screen you are looking at, and the positive z axis coming out of the screen toward you):
	// Point A ( x, y, z)
	// Point B (-x, y, z)
	// Point C ( x,-y, z)
	// Point D (-x,-y, z)
	// Point E ( x, y,-z)
	// Point F (-x, y,-z)
	// Point G ( x,-y,-z)
	// Point H (-x,-y,-z)

	var tempArr = [];
	var x = this.width/2,
		y = this.height/2,
		z = this.depth/2;

	for (var i = 0; i < 8; i++) {
		// Push the point into the temporary array formated as an array containing the x,y and z coordinates
		tempArr.push([x,y,z]);
		
		// The x coordinates alternates at each instantiation of the for loop
		x = -1 * x;

		// The y coordinate alternates every two instantiations of the for loop.
		// That is, when the iterator is impair.
		// To evaluate this, we verify with the modulus function if the division of the iterator by 2 has a remainder. If so, it is impair
		if (i % 2 != 0) {
			y = -1 * y;
		}

		// The z coordinates change sign in the series after the fourth iteration
		// Since we are pushing the point at the begining of the loop, we change the sign in during third iteration.
		if (i === 3) {
			z = -1 * z;
		}
	}

	// Now that the vertices have been calculated and put into an array, lets set the cube's vertices array to this temporary array
	this.vertices = tempArr;
}

Cubo.prototype.project = function() {
	// This function projects the cube's vertices' 3D coordinates into 2D

	var x,y;
	// The array where the projected vertices will be put in
	var tempArr = [];
	// Create a projection matrix that keeps the x and y coordinates and discards the z coordinate
	var matrix = [
		[1,0,0],
		[0,1,0]
	];

	// Loop through vertices and left-multiply each vertex's 3D coordinates by the projection matrix
	for (var i = 0; i < this.vertices.length; i++) {
		x = matrix[0][0] * this.vertices[i][0] + matrix[0][1] * this.vertices[i][1] + matrix[0][2] * this.vertices[i][2];
		y = matrix[1][0] * this.vertices[i][0] + matrix[1][1] * this.vertices[i][1] + matrix[1][2] * this.vertices[i][2];
		tempArr.push([x,y]);
	}

	return tempArr;
}

Cubo.prototype.rotate = function() {
	// This function rotated the three dimensional cube by left-multiplying each vertex's coordinates by a transformation matrix
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
	// Rotation about the y axis
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

	// 2) Rotate the cube by left multiplying each vertex by each rotation matrix. (note: if the angular velocity is 0, there will be no rotation)
	var tempVertices = this.vertices;
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
	// Update the cube's vertices with the rotated vertices
	this.vertices = tempVertices;
}

Cubo.prototype.draw = function() {
	// The draw function "draws" the cube on a canvas specified by its html id as argument
	// First, a 2d projection of the cube is created
	// Then the vertices are drawn in the order they are organized in the this.vertices array.
	// Finally the edges of the cube are drawn by joining the verteces with the algorythm below

	// 1) Project the cube's vertices from 3D onto 2D
	// Store the projected vertices into an array
	var projection = this.project();

	// 2) Draw the vertices
	if (this.canvasId != null && document.getElementById(this.canvasId) != undefined) {
		var canvas 	= document.getElementById(this.canvasId);
		var ctx		= canvas.getContext('2d');
		
		canvas.width  = 800;
		canvas.height = 500;

		// Loop throught the projected vertices array and draw the vertex in relation to the cube's center
		for (var i = 0; i < projection.length; i++) {
			var x = projection[i][0];
			var y = projection[i][1];

			ctx.beginPath();
			ctx.arc(this.center[0] + x,this.center[1] + y,5,0,Math.PI * 2);
			ctx.fillStyle = "rgba(150,150,200,1)";
			ctx.fill();
		}

		// 3) Draw the edges of the cube
		// There has got to be a better way to do this... will figure it out later.
		ctx.beginPath();
		// Link A to B
		ctx.moveTo(this.center[0]+projection[0][0],this.center[1]+projection[0][1]);
		ctx.lineTo(this.center[0]+projection[1][0],this.center[1]+projection[1][1]);
		// Link A to C
		ctx.moveTo(this.center[0]+projection[0][0],this.center[1]+projection[0][1]);
		ctx.lineTo(this.center[0]+projection[2][0],this.center[1]+projection[2][1]);
		// Link A to E
		ctx.moveTo(this.center[0]+projection[0][0],this.center[1]+projection[0][1]);
		ctx.lineTo(this.center[0]+projection[4][0],this.center[1]+projection[4][1]);
		// Link F to B
		ctx.moveTo(this.center[0]+projection[5][0],this.center[1]+projection[5][1]);
		ctx.lineTo(this.center[0]+projection[1][0],this.center[1]+projection[1][1]);
		// Link F to H
		ctx.moveTo(this.center[0]+projection[5][0],this.center[1]+projection[5][1]);
		ctx.lineTo(this.center[0]+projection[7][0],this.center[1]+projection[7][1]);
		// Link F to E
		ctx.moveTo(this.center[0]+projection[5][0],this.center[1]+projection[5][1]);
		ctx.lineTo(this.center[0]+projection[4][0],this.center[1]+projection[4][1]);
		// Link D to B
		ctx.moveTo(this.center[0]+projection[3][0],this.center[1]+projection[3][1]);
		ctx.lineTo(this.center[0]+projection[1][0],this.center[1]+projection[1][1]);
		// Link D to H
		ctx.moveTo(this.center[0]+projection[3][0],this.center[1]+projection[3][1]);
		ctx.lineTo(this.center[0]+projection[7][0],this.center[1]+projection[7][1]);
		// Link D to C
		ctx.moveTo(this.center[0]+projection[3][0],this.center[1]+projection[3][1]);
		ctx.lineTo(this.center[0]+projection[2][0],this.center[1]+projection[2][1]);
		// Link G to E
		ctx.moveTo(this.center[0]+projection[6][0],this.center[1]+projection[6][1]);
		ctx.lineTo(this.center[0]+projection[4][0],this.center[1]+projection[4][1]);
		// Link G to H
		ctx.moveTo(this.center[0]+projection[6][0],this.center[1]+projection[6][1]);
		ctx.lineTo(this.center[0]+projection[7][0],this.center[1]+projection[7][1]);
		// Link G to C
		ctx.moveTo(this.center[0]+projection[6][0],this.center[1]+projection[6][1]);
		ctx.lineTo(this.center[0]+projection[2][0],this.center[1]+projection[2][1]);

		ctx.strokeStyle = "rgba(150,150,200,1)";
		ctx.stroke();
	} else {
		console.log("The canvas id property is either not set or spelled incorectly. Cubo.js could not get the html canvas element in Cubo.draw().");
	}
}

Cubo.prototype.animate = function() {
	// This function essentially animates the cube by setting a timeout function and running the transformations on the cube at each iteration.

	// Set timeout function to execute the animate fonction after a specified duration
	var self = this;
	var timer = setInterval(function() {
		// Draw the current cube
		self.draw();
		// Apply transformations to the cube
		// ROTATION
		// Add angular acceleration to the angular velocity
		self.wx += self.ax;
		self.wy += self.ay;
		self.wz += self.az;
		// Rotate the cube
		self.rotate();
	},30);
}