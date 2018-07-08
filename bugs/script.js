'use strict'
		
var width = 800
var height = 800
var PI2 = Math.PI*2
var epsilon =  0.00000001
var maxRadius = 90

var canvas = document.getElementById('canvas') 
var ctx = canvas.getContext('2d')

canvas.width = width
canvas.height = height
ctx.strokeStyle ='red'
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.font = 'bold 150px Arial'
ctx.lineWidth = 1

var curve1 = [
	[30,400],
	[50,0],
	[700,800],
	[770,400]
]

var curve2 = [
	[770,400],
	[750,0],
	[50,800],
	[30,400]
]

var curve3 = [
	[400,50],
	[0,50],
	[0,750],
	[400,750]
]
var curve4 = [
	[400,750],
	[800,750],
	[800,50],
	[400,50]
]
var curve5 = [
	[400,200],
	[600,200],
	[600,650],
	[400,650]
]
var curve6 = [
	[400,650],
	[200,650],
	[200,200],
	[400,200]
]

var dataA = evenCurve(curve1, 400, 16).concat( evenCurve(curve2, 400, 16) )
var dataB = evenCurve(curve3, 400, 16).concat( evenCurve(curve4, 400, 16) )
var dataC = evenCurve(curve5, 400, 16).concat( evenCurve(curve6, 400, 16) )

var intersections = getIntersections( dataA, dataB ).concat( getIntersections( dataA, dataC ) ) 

function Bug( data ){
	
	this.data = data
	this.legs = [2,2,0,0]
	this.state = 0
	this.order = [0,3,1,2]
	this.scale = 20
	this.length = data.length
	
	this.body = [data[1][0][0],data[1][0][1]]
	this.wait = false
	this.intersection = -1
	this.lastDist = -1
}
Bug.prototype.update = function(){
	
	if(this.wait) return
	
	var legs = this.legs
	var l = this.length
	
	var cur = this.order[this.state]
	
	switch(cur){
		case 0: legs[cur] = (legs[1] + 1) % l; break;
		case 1: legs[cur] = (legs[0] + 1) % l; break;
		case 2: legs[cur] = (legs[3] + 1) % l; break;
		case 3: legs[cur] = (legs[2] + 1) % l; break;
	}
	
	this.state++

	if( this.state > 3 ) this.state = 0
}
Bug.prototype.draw = function(){

	var d = this.data
	var l = this.legs
	var i,x,y, odd = 1,b =[]
	
	
	ctx.beginPath()
	for( i=0;i<4;i++){
		
		if(odd){
			x = d[ l[i] ][0][0] - d[ l[i] ][1][1]*this.scale
			y = d[ l[i] ][0][1] + d[ l[i] ][1][0]*this.scale
		}
		else
		{
			x = d[ l[i] ][0][0] + d[ l[i] ][1][1]*this.scale
			y = d[ l[i] ][0][1] - d[ l[i] ][1][0]*this.scale
		}
		
		ctx.moveTo(x,y)
		ctx.arc( x, y, 3, 0, Math.PI*2)
		
		
		b.push([x,y])
		odd = 1 - odd
	}
	ctx.fill()
	
	
	var c = centroid([ b[0],b[2],b[3],b[1]])
	
	this.body  = c
	
	ctx.beginPath()
	
	for( i=0;i<4;i++){
		
		ctx.moveTo(c[0],c[1])
		ctx.lineTo(b[i][0],b[i][1])
	}
	ctx.strokeStyle ='red'
	ctx.lineWidth = 2
	ctx.stroke()
	
	var xx =c[0] - d[ l[0] ][1][0]*this.scale
	var yy =c[1] - d[ l[0] ][1][1]*this.scale
	
	
	ctx.beginPath()
	ctx.moveTo(c[0],c[1])
	ctx.lineTo (xx,yy)
	ctx.strokeStyle ='black'
	ctx.lineWidth = 4
	ctx.stroke()
	
	ctx.beginPath()
	ctx.arc( c[0], c[1], 10, 0, Math.PI*2 )
	ctx.arc( xx, yy, 5, 0, Math.PI*2 )
	ctx.fill()
	
}

var bugs =[ 
	new Bug(dataA), 
	new Bug(dataB), 
	new Bug(dataC)
]


//init
loop()

function loop(){
	
	ctx.clearRect(0,0,width,height)
	
	
	ctx.strokeStyle = 'lightslategray'
	ctx.lineWidth = 1
	
	
	draw(dataA,8,ctx)
	draw(dataB,8,ctx)
	draw(dataC,8,ctx)
	

	
	ctx.fillStyle = 'black'
	ctx.strokeStyle = 'red'
	ctx.lineWidth = 2
	

	var i
	
	for(i=0; i< intersections.length; i++){
		
		var p = intersections[i]
		var a = [], j
		
		for(j=0;j<bugs.length; j++){
			
			var bug = bugs[j]
			var d = dist(bug.body, p)
			
			if( d < maxRadius ){
			 
				a.push([ d, bug ])
				bug.intersection = i
				
				if(bug.lastDist !== -1 && bug.lastDist > d){
					
					bug.closing = true
				}
				else{
					
					bug.closing = false
				}
				
				bug.lastDist = d
			}
			else if( bug.wait && bug.intersection === i ){
				
				 bug.wait = false
				 bug.intersection = -1
				 bug.lastDist = -1
				 bug.closing = false
			 }
		}
	
		
		if(a.length === 1){
			
			a[0][1].wait = false
		}
		else if( a.length > 1 ){
			
			a.sort(function(a,b){
				
				return a[0] - b[0]
			})
			
			a[0][1].wait=false
			
			for(j = 1; j< a.length; j++){
				
				if( !a[j][1].wait && a[j][1].closing ){
					
					a[j][1].wait=true
					
				}
			}
		}
	}
	
	for(i=0; i< bugs.length; i++){
		
		bugs[i].update()
		bugs[i].draw()
		
	}

	
	setTimeout(loop, 60)
}


function draw(  data, scale, ctx){
	var i,p,n
	
	ctx.lineWidth=0.5
	
	ctx.beginPath()
	
	for( i =0; i < data.length; i++){
		
		
		p = data[i][0]
		n = data[i][1]
		
		ctx.moveTo(p[0], p[1]) 
		ctx.lineTo( p[0] - n[1]*scale, p[1] + n[0]*scale)
		ctx.moveTo(p[0], p[1]) 
		ctx.lineTo( p[0] + n[1]*scale, p[1] - n[0]*scale)
	}
	
	ctx.stroke()
	
}
function getIntersections(a,b){
	var ret=[]
	for( var i = 1; i< a.length; i++){
		
		var x1 = a[i-1][0][0]
		var y1 = a[i-1][0][1]
		var x2 = a[i][0][0]
		var y2 = a[i][0][1]
		
		for(var j = 1;j < b.length; j++){
			
			var x3 = b[j-1][0][0]
			var y3 = b[j-1][0][1]
			var x4 = b[j][0][0]
			var y4 = b[j][0][1]
			
			var p = intersect( x1,y1,x2,y2,x3,y3,x4,y4)
			if( p )
				ret.push(p)
		}
	}
	return ret
}
function evenCurve(curve, steps, step ){
	
	var cur = compute( curve, epsilon)
	var d =  derivative( curve, epsilon )
	 
	var ta = normalize( [ d[0] - cur[0], d[1] - cur[1] ] )
	
	var ret = [[cur,ta]]
	
	for( var i =0; i <= steps; i++){
		
		var t = i / steps
		var p = compute( curve, t )
		
		if( dist( cur, p ) > step ){
			
			d =  derivative( curve, t ) 
			ta = normalize( [ d[0] - p[0], d[1] - p[1] ] )
			
			ret.push([p,ta])
		
			cur = p
		}
		
	}
	ret.pop()
	return ret
}

function derivative(p,t) {
	
	var mt = 1 - t,
		a = mt * mt,
		b = mt * t * 2,
		c = t * t
		
	return [ 
		a * p[0][0] + b * p[1][0] + c * p[2][0], 
		a * p[0][1] + b * p[1][1] + c * p[2][1] 
	]

}
function normalize(p){
	
	var l = Math.sqrt(p[0]*p[0]+p[1]*p[1]);
	
	return [p[0] / l, p[1] / l];
}
	
function compute(p,t) {
	
	if (t === 0) {
	return p[0]
	}
	if (t === 1) {
	return p[3]
	}

	var mt = 1 - t,
		mt2 = mt * mt,
		t2 = t * t,
		a = mt2 * mt,
		b = mt2 * t * 3,
		c = mt * t2 * 3,
		d = t * t2


	return [ 
	
	a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0],
	a * p[0][1] + b * p[1][1]  + c * p[2][1]  + d * p[3][1] 
	
	]

}

function randInt( min, max ) {
	return Math.floor(Math.random()*(max-min+1)+min);
}
function dist(p1,p2){

	return Math.sqrt( Math.pow(p2[0]-p1[0], 2) + Math.pow(p2[1]-p1[1], 2) );
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

function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {


	if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
		return false
	}

	var denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))


	if (denominator === 0) {
		return false
	}

	var ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
	var ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator


	if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
		return false
	}


	let x = x1 + ua * (x2 - x1)
	let y = y1 + ua * (y2 - y1)

	return [x, y]
}
