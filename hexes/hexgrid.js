(function(global){
	
'use strict'

//CONSTANTS
var SQRT3 = Math.sqrt(3)
var SQRT33 = SQRT3/3
var PI2 = Math.PI*2
var PI2_6 = PI2/6
var TWO_THIRDS = 2 / 3


var DIRECTIONS = [
   [ 1, -1,  0], [ 1,  0, -1], [ 0,  1, -1],
   [-1,  1,  0], [-1,  0,  1], [ 0, -1,  1]
]
var DIAGONALS =[
   [2, -1, -1], [ 1, 1, -2],[-1, 2, -1], 
   [-2,  1,  1], [-1, -1, 2],[ 1, -2, 1]
]

//POINT
function Point( x, y){
	this.x = x;
	this.y = y;
}

function getHexPoints(hex,unit){
		
	var center = hex.toXY(unit)
	var step = PI2_6
	var radius = TWO_THIRDS*unit 
	var points =[]
	
	for(var i=0;i<6;i++){
		var a = i*step
		var x = center.x + Math.cos(a)*radius
		var y = center.y + Math.sin(a)*radius
		points.push(new Point(x,y) )
	}
	
	return points
}	
function strokeHex(ctx, cx, cy, hex, color, fill ){
		
	var pts = hex.points
	ctx.beginPath()
	ctx.moveTo( cx + pts[0].x, cy + pts[0].y)
	
	for(var i=1;i<pts.length;i++){
		
		ctx.lineTo( cx + pts[i].x, cy + pts[i].y)
	}
	ctx.closePath()
	if(fill){
		ctx.fillStyle = fill
		ctx.fill()
	}
	ctx.strokeStyle = color
	ctx.stroke()
	
}
function drawCircle( ctx, cx, cy, pos, r, c ){
		
		
	ctx.moveTo( cx + pos.x,cy +pos.y )
	ctx.beginPath()
	ctx.arc( cx + pos.x, cy + pos.y, r, 0, PI2  )
	
	if(c) ctx.fillStyle = c
	ctx.fill()
}
function pointInPolygon(point, vs) {
			
	var x = point.x, y = point.y;

	var inside = false;
	for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
		var xi = vs[i].x, yi = vs[i].y;
		var xj = vs[j].x, yj = vs[j].y;

		var intersect = ((yi > y) != (yj > y))
			&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		if (intersect) inside = !inside;
	}

	return inside;
}
//HEX
function Hex( x, y, z){
	
	
	this.x = x || 0
	this.y = y || 0
	this.z = z || -this.x - this.y
	
	if (Math.round(this.x + this.y + this.z) !== 0) throw "x + y + z must equal 0"

}
Hex.prototype.clone = function(){
	
	var hex = new Hex()
	
	for(var p in this){
		if( this.hasOwnProperty( p ) ){
			hex[p] = this[p]
		}
		
	}
	return hex
}
Hex.prototype.copy = function(other){
	
	for(var p in other)
		if( this.hasOwnProperty( p ) )
			this[p] = other[p]
	
	return this
}
Hex.prototype.add = function(other){
	
	this.x += other.x 
	this.y += other.y 
	this.z += other.z
	return this
}
Hex.prototype.subtract = function(other){
	
	this.x -= other.x
	this.y -= other.y
	this.z -= other.z
	return this
}
Hex.prototype.scale = function(s){
	
	this.x *= s
	this.y *= s
	this.z *= s
	return this
}
Hex.prototype.rotateLeft = function(){
	
	var x = this.x, y = this.y,z = this.z
	this.x = -y 
	this.y = -z
	this.z = -x
	return this
}
Hex.prototype.rotateRight = function(){
	
	var x = this.x, y = this.y, z = this.z
	this.x = -z 
	this.y = -x
	this.z = -y
	return this
}
Hex.prototype.step = function(i){
	
	this.x += DIRECTIONS[i][0];
	this.y += DIRECTIONS[i][1];
	this.z += DIRECTIONS[i][2];
	
	return this
}
Hex.prototype.stepDiagonal = function(i){
	
	this.x += DIAGONALS[i][0];
	this.y += DIAGONALS[i][1];
	this.z += DIAGONALS[i][2];
	
	return this
}
Hex.prototype.moveDiagonal = function(i,s){
	
	return this.stepDiagonal(i).scale( s )
}
Hex.prototype.move = function(i,s){
	
	return this.step(i).scale( s )
}
Hex.prototype.length = function (){
	
    return ( Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) ) / 2;
}
Hex.prototype.distanceTo = function ( other )
{
    return new Hex( this.x,this.y,this.z).subtract( other ).length()
}
Hex.prototype.equals = function( x, y, z ){
	
	if( x instanceof Hex ){
		
		var _x = x.x , _y = x.y , _z = x.z
	}
	else
	{
		var _x = x , _y = y , _z = z || -x-y;
	}
	return  (this.x === _x && this.y === _y && this.z === _z )
}
Hex.prototype.round = function() {
	var cx = this.x, 
		cy = this.y,
		cz = this.z;
	
	this.x = Math.round(cx);
	this.y = Math.round(cy);
	this.z = Math.round(cz);

	var dx = Math.abs(this.x - cx),
		dy = Math.abs(this.y - cy),
		dz = Math.abs(this.z - cz);

	if ( dx > dy && dx > dz )
		this.x = -this.y -this.z;
	else if ( dy > dz )
		this.y = -this.x -this.z;
	else
		this.z = -this.x -this.y;
	
	return this;
}
Hex.prototype.lerp = function(other, t)
{
    return new Hex(
		this.x * (1 - t) + other.x * t, 
		this.y * (1 - t) + other.y * t, 
		this.z * (1 - t) + other.z * t).round();
}	

Hex.prototype.getKey = function () {
	return this.x + "x" + this.y;
}
Hex.prototype.toXY = function (s) {
	s = s || 1
	return { x: this.x * s, y: (this.y-this.z)*SQRT33*s }
}
//GRID

function Grid( radius, unit, cx, cy ){
	
	this.unit = unit || 1
	this.originX = cx || 0
	this.originY = cy || 0
	this.radius = radius | 1
	this.hexes =[]
	
	
	for (var x = -radius; x <= radius; x++){
		
		for (var y = Math.max(-radius, -x - radius), l = Math.min(radius, -x + radius); y <= l; y++){
			
			var z = -x - y
			var hex = new Hex(x,y,z) 
			hex.cost=1
			hex.value=0
			hex.center = hex.toXY(this.unit)
			hex.points = getHexPoints( hex, this.unit)
			this.hexes.push(hex )
		}
	}
	
	this.length = this.hexes.length
	
}

Grid.prototype.draw = function( ctx, color ){
	
	color = color || '#000000'
	for(var i=0; i<this.hexes.length;i++){
		
		strokeHex( ctx, this.originX, this.originY,  this.hexes[i], color )
	}
	
}
Grid.prototype.drawCoords= function( ctx, radius, color ){
	
	radius = radius || 3
	color = color || '#000000'
	
	for(var i=0; i<this.hexes.length;i++){
		
		var hex = this.hexes[i]
		var pos = hex.toXY( this.unit )
		
		drawCircle( ctx, this.originX, this.originY, pos, radius, color )
		
		ctx.fillStyle = color
		ctx.fillText( hex.x+'  '+hex.y+'  '+hex.z, this.originX + pos.x - 18,this.originY +  pos.y - 10 )
	}
	
}
Grid.prototype.drawHex = function( ctx, hex, color, fill ){
	
	
	color = color || '#000000'
	
	hex.points = getHexPoints( hex, this.unit)
	strokeHex( ctx, this.originX, this.originY, hex, color ,fill )
	
	return hex
}
Grid.prototype.drawHexes = function( ctx, hexes, color ){
	color = color || '#000000'
	
	for(var i=0; i< hexes.length;i++){
		
		strokeHex( ctx, this.originX, this.originY, hexes[i], color ) 
		
	}
	
}
Grid.prototype.findNearest= function( x,y ){
	
	
	for(var i=0; i<this.hexes.length;i++){
		
		var hex = this.hexes[i]
		
		if( pointInPolygon( new Point(x - this.originX,y - this.originY), hex.points ) ){
			
			return hex
		} 
		
	}
	
	return  false
	
}
Grid.prototype.find = function(x,y,r){
	
	if(!this.tree) return;
	
	if( x instanceof Hex ){
		var _x = x.x , _y = x.y
	}
	else
	{
		var _x = x , _y = y
	}
	return this.tree.find(_x,_y,r)
}
Grid.prototype.getHexAt = function( x, y, z){

	if( x instanceof Hex ){
		var _x = x.x , _y = x.y , _z = x.z
	}
	else
	{
		var _x = x , _y = y , _z = z || -x-y;
	}
	
	var i,l,hex
	
	for(i=0,l=this.hexes.length; i<l;i++){
		
		hex = this.hexes[i]
		
		if( hex.equals( _x, _y, _z ) ) return hex
	} 
	
	return false
}
Grid.prototype.getRandomHex = function( hex, minDist ){
	
	minDist = minDist || 1
	
	var newHex,l = this.hexes.length,maxIters=1000
	
	do{
		newHex = this.hexes[ Math.floor( Math.random()*l ) ]
		maxIters--
	}
	while( newHex.distanceTo( hex) < minDist && !newHex.blocked && maxIters )
	
	return newHex || hex
}
Grid.prototype.getNeighbors = function(a) {

	var neighbors = [], 
		directions = DIRECTIONS,
		i,dir,hex
	
	for(i=0; i<6;i++){
		
		dir = directions[i]
		hex = this.getHexAt( a.x + dir[0], a.y + dir[1], a.z + dir[2])
		if (hex) neighbors.push(hex);
	}
	
	return neighbors;
	
}
Grid.prototype.getDiagonalNeighbors = function(a) {
	
	var neighbors = [], 
		diagonals = DIAGONALS,
		l=diagonals.length,
		i,dia,hex
	
	for(i=0; i<l;i++){
		
		dia = diagonals[i]
		
		hex = this.getHexAt( a.x + dia[0], a.y + dia[1], a.z + dia[2])
		
		if (hex) neighbors.push(hex)
	}
	
	return neighbors;
	
}
Grid.prototype.getCircle = function(n, dir) {
	
	if(!n) return [this.getHexAt(0,0,0) ]
	
	if( n > this.radius ) return []
	
	dir = dir || 4
	
	var hexes = [], cur = new Hex().move( dir,  n ), i, j
	
	for( i = 0; i < 6; i++ ){
		for( j = 0; j < n; j++ ){
			
			hexes.push( this.getHexAt( cur ) )
			cur = cur.step( i )
		}
	}
	
	return hexes
}
Grid.prototype.getRange = function(n) {
	
	if( n > this.radius ) return []
	
	var hexes = []
	
	for (var x = -n; x <= n; x++){
		
		for (var y = Math.max(-n, -x - n); y <= Math.min(n, -x + n); y++){
			
			var z = -x - y
			hexes.push( this.getHexAt(x, y, z) )
		}
	}
	return hexes
}

Grid.prototype.getLine = function( a, b) {
	
	var n = a.distanceTo( b ),
		hexes=[b],
		i,r,
		step = 1.0 / Math.max(n, 1)
	
	var an = new Hex( a.x + 0.000001, a.y + 0.000001, a.z - 0.000002 )
	var bn = new Hex( b.x + 0.000001, b.y + 0.000001, b.z - 0.000002 )
	
	for(i=0; i < n;i++){
		
		r = an.lerp( bn, step * i)
		
		hexes.push( this.getHexAt( r.x, r.y, r.z )  )
	}
	return hexes
}
/*Pathfinder*/

Grid.Search = {};

Grid.Search.Heap = function () {
	
	if (!BinaryHeap) throw new Error("BinaryHeap was not found.");
	
	return new BinaryHeap(function (node) {
		return node.F;
	});
};

Grid.Search.Node = function (hex, parent, g, h) {
	this.hex = hex;
	this.parent = this.G = this.H = this.F = null;
	this.rescore(parent, g, h);
};

Grid.Search.Node.prototype.rescore = function (parent, g, h) {
	this.parent = parent;
	this.G = g;
	this.H = h || 0;
	this.F = this.G + this.H;
};

Grid.prototype.findPath = function (start, end) {
	
	var grid = this,
		openHeap = new Grid.Search.Heap(),
		closedHexes = {},
		visitedNodes = {};
	
	openHeap.push(new Grid.Search.Node(start, null, 0, start.distanceTo(end)  ));
	
	while(openHeap.size() > 0) {
		// Get the item with the lowest score (current + heuristic).
		var current = openHeap.pop();
		
		// SUCCESS: If this is where we're going, backtrack and return the path.
		if (current.hex.equals(end)) {
			var path = [];
			while(current.parent) {
				path.push(current);
				current = current.parent;
			}
			return path.map(function(x) { return x.hex; }).reverse();
		}
		
		// Close the hex as processed.
		closedHexes[current.hex.getKey()] = current;
		
		// Get and iterate the neighbors.
		var neighbors = grid.getNeighbors(current.hex);
		
		neighbors.forEach(function(n) {
			// Make sure the neighbor is not blocked and that we haven't already processed it.
			if (n.blocked || closedHexes[n.getKey()]) return;
			
			// Get the total cost of going to this neighbor.
			var g = current.G + n.cost,
				visited = visitedNodes[n.getKey()];
			
			// Is it cheaper the previously best path to get here?
			if (!visited || g < visited.G) {
				var h = n.distanceTo( end);
				
				if (!visited) {
					// This was the first time we visited this node, add it to the heap.
					var nNode = new Grid.Search.Node(n, current, g, h);
					closedHexes[nNode.hex.getKey()] = nNode;
					openHeap.push(nNode);
				} else {
					// We've visited this path before, but found a better path. Rescore it.
					visited.rescore(current, g, h);
					openHeap.rescoreElement(visited);
				}
			}
		});
	}

	return [];
}
//lineof sight

Grid.prototype.getLineOfSight = function (start, end) {
	
	
	if (start.equals( end ) ) return []
	
	var N = start.distanceTo( end),
		line1 = [],
		line2 = [],
		cStart = start.clone(),
		cEnd1 = end.clone(),
		cEnd2 = end.clone(),
		step = 1.0 / Math.max( N, 1)
	
	
	cEnd1.x -= 1e-6; cEnd1.y -= 1e-6; cEnd1.z += 2e-6;
	cEnd2.x += 1e-6; cEnd2.y += 1e-6; cEnd2.z -= 2e-6;
	
	for (var i = 0; i <= N; i++) {
		
		var pos = cStart.lerp( cEnd1, step * i);
		
		var hex = this.getHexAt(pos);
		
		if (!start.equals(hex)) {
			if (!hex.blocked) {
				line1.push(hex);
			} else break;
		}
	}

	for (var i = 0; i <= N; i++) {
		var pos = cStart.lerp( cEnd2, step * i);
		
		var hex = this.getHexAt(pos);
		
		if (!start.equals(hex)) {
			if (!hex.blocked) {
				line2.push(hex);
			} else break;
		}
	}
	
	return (line1.length > line2.length) ? line1 : line2;
}


/*END*/

global.Hex = Hex
global.Grid = Grid

})(this)



