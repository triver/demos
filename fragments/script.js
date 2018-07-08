'use strict'
		
var width = 800
var height = 800
var PI2 = Math.PI*2
var cx = width/2
var cy = height/2
var colors = ['red','blue','green','yellow']
var colorIndex = 0
var voronoi = Voronoi().size([width,height])
var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')
var fragments = []

canvas.width = width
canvas.height = height
ctx.strokeStyle ='black'


canvas.addEventListener('click',function(e){
	
	var m = mouse( e, width )
	
	if(m)
		create( m[0],m[1])
	
},false)

//init
loop()

function loop(){
	
	requestAnimationFrame( loop)
	
	if( fragments.length === 0 ) 
		create( randInt( 20, width - 20 ), randInt( 20, height - 20 ) )
	
	ctx.clearRect( 0, 0, width, height)

	drawFragments( fragments, ctx )
	updateFragments( fragments )
	
	
	
}
	
function create( cx, cy){
	
	var sites =  randomCirclePoints( cx, cy, 100, randInt( 50, 150) ).filter( function(p){
		
		return inRect( p, [[1,1],[width-1,height-1]] )
		
	})
	var polys = voronoi.polygons( sites )
	
	fragments = []
	
	for(var i=0; i< polys.length;i++){
		
		fragments.push( createFragment( polys[i], cx,cy ) )
		
	}

	ctx.fillStyle = colors[ colorIndex % colors.length ]
	canvas.style.backgroundColor = colors[ (colorIndex+1) % colors.length ]
	
	colorIndex++
	
}

function createFragment(poly,cx,cy){
	
	var pos = centroid( poly )
	var speed = ( 1 / dist(pos,[cx,cy]) + Math.random()*0.5) * 10
	
	if(speed < 3 ) speed = 3
	
	var points = []
	
	for( var i=0; i< poly.length; i++){
		
		var p = poly[i]
		points.push([ p[0] - pos[0], p[1] - pos[1] ])
	}
	
	var velocity = normalize( [pos[0] - cx, pos[1] - cy] )
	
	return {
		points: points,
		pos: pos,
		speed: speed,
		velocity: velocity,
		angle:0,
		ax:0,
		rotation: ( 0.5 - Math.random()) / area(points) 
	}
}
function updateFragments(fragments){
	
	
	var i,j,f,l=fragments.length
	
	for( i = 0; i < l; i++ ){
		
		f= fragments[i]
		f.ax += f.speed*0.08
		f.speed *= 0.98
		f.pos[1] += f.ax
		f.pos[0] += f.velocity[0] * f.speed 
		f.pos[1] += f.velocity[1] * f.speed 
		
		for(j=0;j<f.points.length; j++){
			
			f.points[j] = rotatePoint(  f.points[j], f.angle )
		}
		f.angle += f.rotation
		
	}
	
	//check if outside
	
	for(i=l-1;i>=0;i--){
		
		f= fragments[i]
		var coords = []
		
		for( var j = 0, l = f.points.length; j < l + 1; j++){
			
			var x = f.pos[0] + f.points[j%l][0]
			var y = f.pos[1] + f.points[j%l][1]
			
			
			coords.push([x,y])
		}
		
		var bb = boundingBox( coords )
		
		if( !rectOverlap( bb, [[0,0],[width,height]] ) ){
			fragments.splice(i,1)
			
		}
		
	}
}

function drawFragments( fragments, ctx){
	
	ctx.beginPath()
	
	for( var i = 0; i < fragments.length; i++ ){
		
		var f= fragments[i]
		
		
		for( var j = 0, l = f.points.length; j < l + 1; j++){
			
			var x = f.pos[0] + f.points[j%l][0]
			var y = f.pos[1] + f.points[j%l][1]
			
			
			if( j === 0 ){
				
				ctx.moveTo( x,y )
			}
			else
			{
				ctx.lineTo( x,y )
			}
			
		}
		
	}
	ctx.fill()
	ctx.stroke()
}


//utils
function randomCirclePoints(x,y,radius,n){
			
	var points=[];
	
	for(var i=0; i < n ;i++){
		
		var t = 2*Math.PI*Math.random();
		var u = Math.random()+Math.random();
		var r = u>1 ? 2-u : u;
		var s = [x + r*Math.cos(t)*radius, y+ r*Math.sin(t)*radius];
		points.push(s);
		
	 }
 
	return points;
}
function normalize(p){
	
	var l = Math.sqrt(p[0]*p[0]+p[1]*p[1]);
	
	return [p[0] / l, p[1] / l];
}
function inRect (p, r) {
	return p[0] >= r[0][0] && p[0]  <= r[1][0] && p[1]  >= r[0][1] && p[1]  <= r[1][1];
}
function mouse(e, w){
	
	var rect = e.target.getBoundingClientRect();
	
	var scale =  w / rect.width;
	var x = (e.clientX - rect.left)*scale; 
	var y = (e.clientY - rect.top)*scale;
	return [x,y]
}

function randInt( min, max ) {
	return Math.floor(Math.random()*(max-min+1)+min);
}

function dist(p1,p2){

	return Math.sqrt( Math.pow(p2[0]-p1[0], 2) + Math.pow(p2[1]-p1[1], 2) );
}
function inRange( v, min, max){
	return ( v >= min ) && ( v <= max )
}
function rectOverlap( a, b ){
	
	var xOver = inRange( a[0][0], b[0][0],b[1][0] ) || inRange( b[0][0], a[0][0],a[1][0] )
	var yOver = inRange( a[0][1], b[0][1],b[1][1] ) || inRange( b[0][1], a[0][1],a[1][1] )
	
	return xOver && yOver
}
function rotatePoint(point, angle) {

	var cos = Math.cos(angle),
		sin = Math.sin(angle);
	
	return [ cos*point[0] - sin*point[1] , sin*point[0] + cos*point[1]  ];
}
function boundingBox(pts){
	
	var minX = pts[0][0]
	var minY = pts[0][1]
	var maxX = pts[0][0]
	var maxY = pts[0][1]
	
	for (var i = 1; i < pts.length; i++) {
	
	  if(pts[i][0] < minX) minX = pts[i][0]
	  if(pts[i][0] > maxX) maxX = pts[i][0]
	  if(pts[i][1] < minY) minY = pts[i][1]
	  if(pts[i][1] > maxY) maxY = pts[i][1]
	}
	
	return [[minX,minY],[maxX,maxY]]
}
function area(p){

	var area = 0, n = p.length, i,i1;
	
	for (i = 0; i < n; i++) {
	
	  i1 = (i + 1) % n;
	  area += (p[i][1] + p[i1][1]) * (p[i1][0] - p[i][0]) / 2.0;
	}
	
	return area;
}
function centroid(pts){
	
	var centroid = [0,0];
	var signedArea = 0.0;
	var x0 = 0.0; 
	var y0 = 0.0;
	var x1 = 0.0;
	var y1 = 0.0;
	var a = 0.0;
	var l = pts.length;
	
	var i=0;
	for (i=0; i<l; ++i)
	{
		x0 = pts[i][0];
		y0 = pts[i][1];
		x1 = pts[(i+1) % l][0];
		y1 = pts[(i+1) % l][1];
		a = x0*y1 - x1*y0;
		signedArea += a;
		centroid[0] += (x0 + x1)*a;
		centroid[1] += (y0 + y1)*a;
	}

	signedArea *= 0.5;
	centroid[0] /= (6.0*signedArea);
	centroid[1] /= (6.0*signedArea);

	return centroid;
}
