(function(global){

'use strict'

function Vec2(x, y) {
	
	this.x = x || 0.0;
	this.y = y || 0.0;
};

Vec2.prototype = {
	
	set: function(x, y) {
		this.x = x;
		this.y = y;
		return this;
	},

	copy: function(v) {
		this.x = v.x;
		this.y = v.y;
		return this;
	},

	neg: function() {
		this.x = -this.x;
		this.y = -this.y;
		return this;
	},

	sub: function(v0, v1) {
		this.x = v0.x - v1.x;
		this.y = v0.y - v1.y;
		return this;
	},

	scale: function(v, s) {
		this.x = v.x * s;
		this.y = v.y * s;
		return this;
	},

	dot: function(v) {
		return this.x * v.x + this.y * v.y;
	},
	squareDist: function(v) {
		var dx = this.x - v.x;
		var dy = this.y - v.y;
		return dx * dx + dy * dy;
	},
	length: function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	},
	length2: function() {
		return (this.x * this.x + this.y * this.y);
	},
	perp: function(v) {
		this.x = -v.y;
		this.y = v.x;
		return this;
	},
	normal: function(v0, v1) {
		// perpendicular
		var nx = v0.y - v1.y, ny = v1.x - v0.x;
		// normalize
		var len = 1.0 / Math.sqrt(nx * nx + ny * ny);
		this.x = nx * len;
		this.y = ny * len;
		return this;
	},
	angle:function(v) {
		return Math.atan2(this.x*v.y-this.y*v.x,this.x*v.x+this.y*v.y);
	},
	angle2:function(vLeft, vRight) {
		var a = new Vec2().sub( vLeft, this);
		var b = new Vec2().sub( vRight, this);
		return a.angle(b);
	},
	rotate: function(origin, theta) {
	
		var x = this.x - origin.x;
		var y = this.y - origin.y;
		return new Vec2(x*Math.cos(theta) - y*Math.sin(theta) + origin.x, x*Math.sin(theta) + y*Math.cos(theta) + origin.y);
	}
};

//collision
var collision = {
	
	testAxis: new Vec2(),
	axis: new Vec2(),
	center: new Vec2(),
	line: new Vec2(),
	response: new Vec2(),
	relVel: new Vec2(),
	tangent: new Vec2(),
	relTanVel: new Vec2(),
	depth: 0,
	edge: null,
	vertex: null,

	//
	// Separating Axis Theorem collision test
	//

	SAT: function(B0, B1) {
		//
		// aabb overlap test
		//

		if (
			!(0 > Math.abs(B1.center.x - B0.center.x) - (B1.halfEx.x + B0.halfEx.x) &&
				0 > Math.abs(B1.center.y - B0.center.y) - (B1.halfEx.y + B0.halfEx.y))
		)
			return false; // no aabb overlap

		//
		// SAT collision detection
		//

		var minDistance = 99999, n0 = B0.eCount, n1 = B1.eCount;

		// Iterate through all of the edges of both bodies
		for (var i = 0, n = n0 + n1; i < n; i++) {
			// get edge
			var edge = i < n0 ? B0.edges[i] : B1.edges[i - n0];

			// Calculate the perpendicular to this edge and normalize it
			this.testAxis.normal(edge.p0, edge.p1);

			// Project both bodies onto the normal
			B0.projectAxis(this.testAxis);
			B1.projectAxis(this.testAxis);

			//Calculate the distance between the two intervals
			var dist = B0.min < B1.min ? B1.min - B0.max : B0.min - B1.max;

			// If the intervals don't overlap, return, since there is no collision
			
			if (dist > 0) return false;
			
			else if (Math.abs(dist) < minDistance) {
				
				minDistance = Math.abs(dist);

				// Save collision information
				this.axis.copy(this.testAxis);
				this.edge = edge;
			}
		}

		this.depth = minDistance;

		// Ensure collision edge in B1 and collision vertex in B0
		if (this.edge.parent != B1) {
			
			var t = B1;
			B1 = B0;
			B0 = t;
		}

		// Make sure that the collision normal is pointing at B1
		var n = this.center.sub(B0.center, B1.center).dot(this.axis);

		// Revert the collision normal if it points away from B1
		if (n < 0) this.axis.neg();

		var smallestDist = 99999, v, dist;

		for (var i = 0; i < B0.vCount; i++) {
			// Measure the distance of the vertex from the line using the line equation
			v = B0.vertices[i];
			this.line.sub(v.position, B1.center);
			dist = this.axis.dot(this.line);

			// Set the smallest distance and the collision vertex
			if (dist < smallestDist) {
				smallestDist = dist;
				this.vertex = v;
			}
		}

		// There is no separating axis. Report a collision!
		return true;
	},

	//
	// collision resolution
	//

	resolve: function(kFriction) {
		// cache vertices positions
		var p0 = this.edge.p0,
			p1 = this.edge.p1,
			o0 = this.edge.v0.oldPosition,
			o1 = this.edge.v1.oldPosition,
			vp = this.vertex.position,
			vo = this.vertex.oldPosition,
			rs = this.response;

		// response vector
		this.response.scale(this.axis, this.depth);

		// calculate where on the edge the collision vertex lies
		var t = Math.abs(p0.x - p1.x) > Math.abs(p0.y - p1.y)
			? (vp.x - rs.x - p0.x) / (p1.x - p0.x)
			: (vp.y - rs.y - p0.y) / (p1.y - p0.y);
		var lambda = 1 / (t * t + (1 - t) * (1 - t));

		// mass coefficient
		var m0 = this.vertex.parent.mass,
			m1 = this.edge.parent.mass,
			tm = m0 + m1,
			m0 = m0 / tm,
			m1 = m1 / tm;

		// apply the collision response
		p0.x -= rs.x * (1 - t) * lambda * m0;
		p0.y -= rs.y * (1 - t) * lambda * m0;
		p1.x -= rs.x * t * lambda * m0;
		p1.y -= rs.y * t * lambda * m0;

		vp.x += rs.x * m1;
		vp.y += rs.y * m1;

		//
		// collision friction
		//

		// compute relative velocity
		this.relVel.set(
			vp.x - vo.x - (p0.x + p1.x - o0.x - o1.x) * 0.5,
			vp.y - vo.y - (p0.y + p1.y - o0.y - o1.y) * 0.5
		);

		// axis perpendicular
		this.tangent.perp(this.axis);

		// project the relative velocity onto tangent
		var relTv = this.relVel.dot(this.tangent);
		var rt = this.relTanVel.set(this.tangent.x * relTv, this.tangent.y * relTv);

		// apply tangent friction
		vo.x += rt.x * kFriction * m1;
		vo.y += rt.y * kFriction * m1;

		o0.x -= rt.x * (1 - t) * kFriction * lambda * m0;
		o0.y -= rt.y * (1 - t) * kFriction * lambda * m0;
		o1.x -= rt.x * t * kFriction * lambda * m0;
		o1.y -= rt.y * t * kFriction * lambda * m0;
	}
};

//constarints
/*
function AngleConstraint(parent,a, b, c, stiffness) {
	
	this.parent = parent;
	this.a = a;
	this.b = b;
	this.c = c;
	this.angle = this.b.position.angle2(this.a.position, this.c.position );
	this.stiffness = stiffness;
}
AngleConstraint.prototype.solve = function(stepCoef) {
	
	var angle = this.b.position.angle2(this.a.position, this.c.position);
	var diff = angle - this.angle;
	
	if (diff <= -Math.PI)
		diff += 2*Math.PI;
	else if (diff >= Math.PI)
		diff -= 2*Math.PI;

	diff *= stepCoef*this.stiffness;
	
	this.a.position = this.a.position.rotate(this.b.position, diff);
	this.c.position = this.c.position.rotate(this.b.position, -diff);
	this.b.position = this.b.position.rotate(this.a.position, diff);
	this.b.position = this.b.position.rotate(this.c.position, -diff);
}

*/
function PinConstraint(parent,a,pos){
	
	this.parent = parent;
	this.a = a;
	this.pin = { 
		isPin:true,
		parent: parent,
		position: pos 
	};
	
}
PinConstraint.prototype.solve = function(){
	
	this.a.position.x = this.pin.position.x;
	this.a.position.y = this.pin.position.y;
	
}
function DistanceConstraint(parent, v0, v1, edge) {
	
	this.parent = parent;
	this.v0 = v0;
	this.v1 = v1;
	this.p0 = v0.position;
	this.p1 = v1.position;
	this.dist = new Vec2().sub( this.p0, this.p1).length();//this.p0.squareDist(this.p1);
	this.dist2 = this.dist*this.dist;
	this.edge = edge;
	this.stiffness = this.parent.stiffness;
};
DistanceConstraint.prototype.solve = function(coef) {
	
	var normal = new Vec2().sub( this.p0, this.p1);
	
	var m = normal.length2();
	var s = ( (this.dist2 - m ) / m ) * this.stiffness * coef ;
	
	var n = new Vec2().scale(normal,s);
	
	this.p0.x += n.x;
	this.p0.y += n.y;
	this.p1.x -= n.x;
	this.p1.y -= n.y;
	
};


// vertex
function Vertex(parent, vertex) {
		
	this.parent = parent;
	this.position = new Vec2(vertex.x, vertex.y);
	this.oldPosition = new Vec2(vertex.x, vertex.y);
	
};
Vertex.prototype.integrate = function( w, h,gravity, viscosity, groundFriction, offset) {
	
	offset = offset || 0;
	
	var p = this.position, 
		o = this.oldPosition, 
		x = p.x, 
		y = p.y;
	
	p.x += (p.x - o.x) * viscosity;
	p.y += (p.y - o.y) * viscosity + gravity;

	o.set(x, y);
	
	//bounds
	if (p.y < offset){ 
		p.y = offset;
	}
	else if(p.y > h-offset) {
		
		p.x -= (p.y - (h - offset)) * (p.x - o.x) * groundFriction;
		p.y = h - offset;
	}

	if (p.x < offset){
		 
		p.x = offset;
	}
	else if(p.x > w - offset){
		 p.x = w-offset;
	 }
};


//body
var Body = function(body,verlet) {
	
	
	this.vCount = 0;
	this.eCount = 0;
	this.vertices = [];
	this.positions = [];
	this.edges = [];
	this.pins =[];
	this.constraints=[];
	this.center = new Vec2();
	this.halfEx = new Vec2();
	this.min = 0;
	this.max = 0;
	this.color = body.color || '#999';
	this.mass = body.mass || 1.0;
	this.stiffness = body.stiffness || 1.0;
	this.verlet = verlet;

	for (var n in body.vertices) {
		
		
		var vertex = new Vertex(this, body.vertices[n]);
		
		body.vertices[n].ref = vertex;
		
		this.vertices.push(vertex);
		
		this.positions.push(vertex.position);
		
		verlet.vertices.push(vertex);
		
		this.vCount++;
	}

	for (var i = 0; i < body.constraints.length; i++) { 
		
		var bci = body.constraints[i];

		var constraint = new DistanceConstraint(
			this,
			body.vertices[bci[0]].ref,
			body.vertices[bci[1]].ref,
			bci[2] || false
		);

		if (constraint.edge) {
			
			this.edges.push(constraint);
			this.eCount++;
		}
		else{
			
			this.constraints.push(constraint);
		}
		
		verlet.constraints.push(constraint);
	}
	
};
Body.prototype.pin = function(i,pos) {
	
	var vertex = this.vertices[i];
	var pos = new Vec2().copy( vertex.position );
	var pin = new PinConstraint( this, vertex , pos);
	
	this.verlet.constraints.push( pin );
	this.pins.push( pin );
}

Body.prototype.boundingBox = function() {
	
	var minX = 99999.0, minY = 99999.0, maxX = -99999.0, maxY = -99999.0;

	for (var i = 0; i < this.vCount; i++) {
		var p = this.positions[i];

		if (p.x > maxX) maxX = p.x;
		if (p.y > maxY) maxY = p.y;
		if (p.x < minX) minX = p.x;
		if (p.y < minY) minY = p.y;
	}

	// center
	this.center.set((minX + maxX) * 0.5, (minY + maxY) * 0.5);

	// half extents
	this.halfEx.set((maxX - minX) * 0.5, (maxY - minY) * 0.5);
};

Body.prototype.projectAxis = function(axis) {
	
	var d = this.positions[0].dot(axis);
	
	this.min = this.max = d;

	for (var i = 1; i < this.vCount; i++) {
		
		d = this.positions[i].dot(axis);
		
		if (d > this.max) this.max = d;
		if (d < this.min) this.min = d;
	}
};


function Verlet( width, height ){
	
	this.width = width;
	this.height = height;
	
	this.gravity = 0.1;
	this.friction = 0.5;
	this.iterations =8;
	this.groundFriction = 0.1;
	this.viscosity = 1.0;
	this.offset = 2;
	
	this.bodies = [];
	this.vertices = [];
	this.constraints =[];
	
}
Verlet.prototype.body = function(v,c,s,m,col){
	
	var b = new Body({
		mass: m,
		color: col,
		vertices: v,
		constraints: c,
		stiffness: s
	},this);
	this.bodies.push(b);
	return b;
}
Verlet.prototype.polygon = function(x,y,n,r,s,m,col){
	var v ={};
	var c =[];
	
	var angle = Math.PI*2/n;
	var i,a,next;
	
	for(i=0; i<n;i++){
		
		a=i*angle;
		next = (i+1) % n;
		
		v['n'+i] ={
			x: x + Math.cos(a)*r,
			y: y + Math.sin(a)*r
		}
		c.push(['n'+i,'n'+next,true]);
	}
	
	if(n===4){
		
		c.push(['n0','n2'],['n1','n3']);
	}
	else if(n===5){
		
		
		c.push(['n0','n2'],['n0','n3'],['n1','n4']);
	}
	else if(n===6){
		
		c.push(['n0','n3'],['n1','n4'],['n2','n5']);
	}
	
	return this.body(v,c,s,m,col);
}
Verlet.prototype.rectangle = function(x,y,w,h,s,m,col){
	
	w /= 2;
	h /= 2;
	
	var v = {
		'n0': { x: x - w , y: y - h },
		'n1': { x: x + w , y: y - h },
		'n2': { x: x + w , y: y + h },
		'n3': { x: x - w , y: y + h }
	};
	
	var c = [
	['n0','n1',true],
	['n1','n2',true],
	['n2','n3',true],
	['n3','n0',true],
	['n0','n2'],
	['n1','n3']
	];
	
	return this.body(v,c,s,m,col);
}

Verlet.prototype.update = function(){
	
	var coef = 1 / this.iterations;
	
	// integrate vertices
	
	for (var i = 0, n = this.vertices.length; i < n; i++) {
		
		this.vertices[i].integrate( this.width, this.height, this.gravity, this.viscosity, this.groundFriction , this.offset);
	}
	
	//solve constraints
	
	for (var n = 0; n < this.iterations; n++) {
		
		// solve constraints
		
		for (var i = 0; i < this.constraints.length; i++) {
			
			this.constraints[i].solve( coef );
		}
		
		
		if(this.bodies.length > 1){
			
			//update boxes
			for (var i = 0; i < this.bodies.length; i++) {
				
				this.bodies[i].boundingBox();
			}
			
			//check collisions
			for (var i = 0; i <this.bodies.length - 1; i++) {
				
				var b0 = this.bodies[i];

				for (var j = i + 1; j < this.bodies.length; j++) {
					
					var b1 = this.bodies[j];
					
					collision.SAT(b0, b1) && collision.resolve( this.friction );
				}
			}
		}
		
	}
}
Verlet.prototype.nearestVertex = function( x, y, minDist ){
	
	var verts = this.vertices;
	var pointer = new Vec2(x,y);
	
	minDist = minDist || 20;
		
	var nearest=null;
	var dist = Infinity;
	var minDist2 = minDist*minDist;
	
	for(var i=0; i < verts.length; i++){
		
		var v = verts[i];
		var d = v.position.squareDist( pointer );
		
		if( d < dist && d < minDist2 ){
			nearest = v;
			dist = d;
		}
	}
	//check for pins
	if(nearest){
		
		var pins = nearest.parent.pins;
		
		if(pins.length){
			for(var i=0; i<pins.length; i++){
				if(nearest == pins[i].a)
					nearest = pins[i].pin;
			}
		}
		
		 
	}
	
	return nearest;
}
//sign global

global.Verlet = Verlet;
global.VerletBody = Body;

})(this);
