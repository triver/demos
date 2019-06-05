(function( global){
	
//utils
function distanceSquared(a,b){
			
	var dx = b.x - a.x;
	var dy = b.y - a.y;
	var dz = b.z - a.z;
	
	return ( dx*dx + dy*dy + dz*dz );
}
function extractEdges(faces){
			
	var edges = [];
	var check = [];
	var i,j,min,max,a,b,key,face;
	
	for( i=0,l=faces.length; i< l;i++){
		
		face = faces[i];
		
		for(j=0,l2=face.length;j< l2;j++){
			
			a = face[j];
			b = face[ (j + 1) % l2];
			min = Math.min( a, b );
			max = Math.max( a ,b);
			key = min+'_'+max;
			
			if( check.indexOf(key) === -1){
				edges.push([min,max]);
				check.push(key); 
			}
		}
	}
	
	return edges;
}
function extractFarthestPairs(particles){
			
	var pairs =[];
	var i,j;
	var used = [];
	
	for( i=0,l = particles.length - 1; i < l; i++){
		
		if( used.indexOf( i ) !== -1 ) continue;
		
		var a = particles[i];
		
		var farthest = null;
		var idx = 0;
		var dist = 0;
		
		for( j = i + 1; j < particles.length; j++){
			
			if( used.indexOf( j ) !== -1 ) continue;
			
			var b = particles[j];
			
			if( !farthest ){
				
				farthest = particles[j];
				idx = j;
				dist = distanceSquared( a.pos, farthest.pos );
				
				continue;
			}
			
			var dist2 = distanceSquared( a.pos, b.pos );
				
			if( dist2 > dist ){
					
					farthest = b;
					idx = j;
					dist = dist2
			
			}
		}
		
		if( farthest ){
			
			pairs.push([ a, farthest, Math.sqrt( dist ) ]);
			used.push( idx, i);
		}
		
	}
	
	return pairs;
}
function clockwise(points) {
	
	var a = 0;
	var i, j = 0;
	for (i = 0; i < points.length; i++) {
		j = i + 1;
		if (j == points.length) j = 0;
		a += points[i].pos.x * points[j].pos.y - points[i].pos.y * points[j].pos.x;
	}
	return a > 0;
}
function nearestParticle( particles, x, y, minDist){
	
			
	minDist = minDist || 20;
		
	var nearest=null;
	var dist = Infinity;
	var minDist2 = minDist*minDist;
	
	for(var i=0; i < particles.length; i++){
		
		var p = particles[i];
		
		var dx = x - p.pos.x;
		var dy = y - p.pos.y; 
		
		var d = ( dx * dx + dy * dy );
		
		if( d < dist && d < minDist2 ){
			
			nearest = p;
			dist = d;
		}
	}
	
	return nearest;
}
function inPolygon( vs, x, y ) {
	

	var inside = false;
	for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
		var xi = vs[i].pos.x, yi = vs[i].pos.y;
		var xj = vs[j].pos.x, yj = vs[j].pos.y;

		var intersect = ((yi > y) != (yj > y))
			&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		if (intersect) inside = !inside;
	}

	return inside;
}
//Vec2
function Vec3(x, y, z) {
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
}

Vec3.prototype.add = function(v) {
	return new Vec3( this.x + v.x, this.y + v.y, this.z + v.z);
}

Vec3.prototype.sub = function(v) {
	return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
}

Vec3.prototype.mul = function(v) {
	return new Vec3(this.x * v.x, this.y * v.y, this.z * v.z);
}

Vec3.prototype.div = function(v) {
	return new Vec3(this.x / v.x, this.y / v.y, this.z / v.z);
}

Vec3.prototype.scale = function(coef) {
	return new Vec3(this.x*coef, this.y*coef, this.z*coef);
}

Vec3.prototype.mutableSet = function(v) {
	this.x = v.x;
	this.y = v.y;
	this.z = v.z;
	return this;
}

Vec3.prototype.mutableAdd = function(v) {
	this.x += v.x;
	this.y += v.y;
	this.z += v.z;
	return this;
}

Vec3.prototype.mutableSub = function(v) {
	this.x -= v.x;
	this.y -= v.y;
	this.z -= v.z;
	return this;
}

Vec3.prototype.mutableMul = function(v) {
	this.x *= v.x;
	this.y *= v.y;
	this.z *= v.z;
	return this;
}

Vec3.prototype.mutableDiv = function(v) {
	this.x /= v.x;
	this.y /= v.y;
	this.z /= v.z;
	return this;
}

Vec3.prototype.mutableScale = function(coef) {
	this.x *= coef;
	this.y *= coef;
	this.z *= coef;
	return this;
}

Vec3.prototype.equals = function(v) {
	return this.x == v.x && this.y == v.y && this.z == v.z;
}

Vec3.prototype.length = function(v) {
	return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
}

Vec3.prototype.length2 = function(v) {
	return this.x*this.x + this.y*this.y + this.z*this.z;
}

Vec3.prototype.dist = function(v) {
	
	return Math.sqrt(this.dist2(v));
}

Vec3.prototype.dist2 = function(v) {
	var x = v.x - this.x;
	var y = v.y - this.y;
	var z = v.z - this.z;
	return x*x + y*y + z*z;
}

Vec3.prototype.normal = function() {
	var m = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
	return new Vec3(this.x/m, this.y/m, this.z/m );
}

Vec3.prototype.dot = function(v) {
	return this.x*v.x + this.y*v.y + this.z*v.z;
}

Vec3.prototype.cross =function ( a, b ) {

	var ax = a.x, ay = a.y, az = a.z;
	var bx = b.x, by = b.y, bz = b.z;

	this.x = ay * bz - az * by;
	this.y = az * bx - ax * bz;
	this.z = ax * by - ay * bx;

	return this;

}



//Constraints
function DistanceConstraint(a, b, stiffness, distance /*optional*/, isEdge/*optional*/) {
	
	this.a = a;
	this.b = b;
	this.distance =  !!distance || a.pos.sub( b.pos ).length();
	this.distance2 = this.distance*this.distance;
	this.stiffness = stiffness;
	this.isEdge = !!isEdge;
}

DistanceConstraint.prototype.relax = function(stepCoef) {
	
	var normal = this.a.pos.sub(this.b.pos);
	var m = normal.length2();
	
	if( m === 0) return;
	
	normal.mutableScale( ( (this.distance2 - m) / m ) * this.stiffness * stepCoef );
	
	this.a.pos.mutableAdd(normal);
	this.b.pos.mutableSub(normal);
}

DistanceConstraint.prototype.draw = function(ctx) {
	
	ctx.beginPath();
	ctx.moveTo(this.a.pos.x, this.a.pos.y);
	ctx.lineTo(this.b.pos.x, this.b.pos.y);
	ctx.strokeStyle = "#d8dde2";
	ctx.stroke();
}



function PinConstraint(a, pos) {
	this.a = a;
	this.pos = (new Vec3()).mutableSet(pos);
}

PinConstraint.prototype.relax = function(stepCoef) {
	this.a.pos.mutableSet(this.pos);
}

PinConstraint.prototype.draw = function(ctx) {
	
	ctx.beginPath();
	ctx.arc(this.pos.x, this.pos.y, 6, 0, 2*Math.PI);
	ctx.fillStyle = "rgba(0,153,255,0.1)";
	ctx.fill();
}


//Engine
function Particle(pos) {
	
	this.pos = (new Vec3()).mutableSet(pos);
	this.lastPos = (new Vec3()).mutableSet(pos);
}

function Composite() {
	
	this.particles = [];
	this.constraints = [];
	this.edges = [];
	this.faces = [];
	this.pairs = [];
	this.pins = [];
	this.light = null;
	
}
Composite.prototype.setLight = function( x, y, z) {
	
	this.light = new Vec3( x, y, z).normal();
}
Composite.prototype.pin = function(index, pos) {
	
	pos = pos || this.particles[index].pos;
	
	var pc = new PinConstraint( this.particles[index], pos); 
	
	this.pins.push( pc );
	this.constraints.push( pc );
	return pc;
}


function Verlet3( left, right, top, bottom) {
	
	this.left = left;
	this.right = right;
	this.top = top;
	this.bottom = bottom;
	
	this.bounds = function (particle) {
		
		if (particle.pos.y > this.bottom )
			particle.pos.y = this.bottom;
		else if (particle.pos.y < this.top)
			particle.pos.y = this.top;
		
		if (particle.pos.x < this.left )
			particle.pos.x = this.left;
		else if (particle.pos.x > this.right)
			particle.pos.x = this.right;
		
	}
	
	
	// simulation params
	this.gravity = new Vec3( 0, 0.2, 0);
	this.friction = 0.99;
	this.groundFriction = 0.2;
	this.steps = 16;
	this.stepCoef = 1 / this.steps; 
	
	// holds composite entities
	this.composites = [];
	
}

Verlet3.prototype.update = function() {
	
	var i, j, c, lc, lp;

	for (c = 0, lc =this.composites.length; c < lc; ++c ) {
		
		var composite = this.composites[c];
		
		for (i=0,lp = this.composites[c].particles.length; i < lp; ++i) {
			
			var particle = composite.particles[i];
			
			// calculate velocity
			var velocity = particle.pos.sub( particle.lastPos).scale( this.friction );
		
			// ground friction
			
			if( particle.pos.y >= this.bottom && velocity.length2() > 0.000001 ) {
				
				var m = velocity.length();
				
				velocity.x /= m;
				velocity.y /= m;
				velocity.z /= m;
				
				velocity.mutableScale( m * this.groundFriction );
			}
			
			// save last good state
			particle.lastPos.mutableSet( particle.pos );
		
			// gravity
			particle.pos.mutableAdd(this.gravity);
		
			// inertia  
			particle.pos.mutableAdd(velocity);
		}
		
		if(composite.faces.length){
			
			for(var i=0; i<composite.faces.length; i++){
				
				var face = composite.faces[i];
				
				 face.cw = clockwise(face);
				
				
				if(composite.light){
					
					var a = face[0].pos;
					var b = face[1].pos;
					var c = face[2].pos;
					
					var n = new Vec3().cross( b.sub(a), c.sub(a) ).normal();
					face.normal=n;
					face.light = Math.max( 0, n.dot( composite.light) );
					//face.ref = n.scale( 2*face.light ).mutableSub( composite.light ).normal().dot( new Vec3(0,0,1).normal() )  
				}
				
			}
			
		}
		
	}
		
	// relax
	
	for (c = 0,lc = this.composites.length; c < lc; ++c) {
		
		var constraints = this.composites[c].constraints;
		for ( i= 0; i < this.steps; ++i)
			for (j=0; j < constraints.length; ++j)
				constraints[j].relax( this.stepCoef );
	}
	
	// bounds checking
	
	for (c = 0,lc = this.composites.length; c < lc; ++c) {
		var particles = this.composites[c].particles;
		for (i =0; i < particles.length; ++i)
			this.bounds(particles[i]);
	}
	
	
}
Verlet3.prototype.geometry = function( geometry, scale, stiffness ){
	
	scale = scale || 1;
	stiffness = stiffness || 1;
	
	var colors =[
	[255,0,0],
	[255,255,0],
	[255,0,255],
	[0,255,0],
	[0,0,255],
	[0,255,255]
	
	];
	
	var verts = geometry[0];
	var faces = geometry[1];
	var edges = extractEdges(faces);
	
	var composite = new Composite();
	
	//add particles
	for(var i =0; i< verts.length; i++){
		
		var v = verts[i];
		
		composite.particles.push( new Particle( new Vec3( v[0] * scale, v[1] * scale, v[2] * scale )));
	}
	
	//add edges
	for(var i =0; i< edges.length; i++){
		
		var a = composite.particles[ edges[i][0] ];
		var b = composite.particles[ edges[i][1] ];
		
		composite.edges.push([a,b]);
		composite.constraints.push( new DistanceConstraint( a, b, stiffness, 0,true ) );
	}
	
	
	//add pairs
	var pairs = extractFarthestPairs( composite.particles );
	
	for(var i =0; i< pairs.length; i++){
		
		var a = pairs[i][0];
		var b = pairs[i][1];
		
		composite.pairs.push([a,b]);
		composite.constraints.push( new DistanceConstraint( a, b, stiffness ) );
	}
	
	//store faces
	for(var i =0; i< faces.length; i++){
		
		var face = faces[i];
		var f = [];
		
		for(var j =0; j< face.length; j++){
			
			f.push(composite.particles[ face[j] ]);
			
		}
		
		f.color = colors[ i % colors.length ]; 
		composite.faces.push( f );
	}
	
	this.composites.push( composite );
	
	return composite;
}
Verlet3.prototype.nearest = function( x, y, minDist){
	
	for( var i = 0; i < this.composites.length; i++){
		
		var composite = this.composites[i];
		for( var j = 0; j < composite.faces.length; j++){
			
			var face = composite.faces[j];
			
			if( face.cw && inPolygon( face, x, y ) ) 
				return nearestParticle( face, x, y, minDist);
		}
		
	}	
}


global.Verlet3 = Verlet3;


})(this);













