'use strict'
		
var width = 600
var height = 600
var PI2 = Math.PI*2
var radius = 100
var elasticity = 0.4
var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')

canvas.width = width
canvas.height = height
ctx.strokeStyle ='red'
ctx.fillStyle ='lightslategray'
ctx.lineWidth = 3


var dist = Distribute()
var pos = dist.uniformDisc( 0, 0, radius,8)
var hull = convexHull(pos )
var simplex = new SimplexNoise()
var res = 150
var factor = 0.5
var cx = width/2
var cy = height/2
var vx = 4
var vy = 3
var ax = 0
var ay = 0
var z = 0
var friction = 0.9
var spring = 0.03
var targetX = 0
var targetY = 0
var maxSpeed = 6

var facControl = document.getElementById('facControl')
var resControl = document.getElementById('resControl')

setTarget()

facControl.value = 0.5
resControl.value = 150

resControl.addEventListener('change',function(){ res = +this.value },false)
facControl.addEventListener('change',function(){ factor = +this.value },false)

canvas.addEventListener('click',function(e){
	
	var m = mouse(e,width)
	setTarget( m[0],m[1])
	
},false)

function loop(){
	
	ctx.clearRect(0,0,width,height)
	

	ctx.beginPath()
	ctx.arc( targetX, targetY, 8, 0, PI2)
	ctx.fill()
	
	
	var i
	/*
	ctx.beginPath()
	for(i=0; i<pos.length; i++){
		
		var n = simplex.noise3d(( cx + pos[i][0]) / res, (cy + pos[i][1]) / res, z )*factor
		var x = cx + pos[i][0] * ( 1 + n )
		var y = cy + pos[i][1] * ( 1 + n )
		
		if( x > width-2) x=width-2
		else if( x < 2) x =2
		
		if( y > height-2) y=height-2
		else if( y < 2) y =2
		
		ctx.moveTo(x,y)
		ctx.arc(x,y,2,0,PI2)
	}
	ctx.fill()
	*/
	ctx.beginPath()
	for(i=0; i<hull.length; i++){
		
		var n = simplex.noise3d(( cx + hull[i][0]) / res, (cy + hull[i][1]) / res, z )*factor
		var x = cx + hull[i][0] * ( 1 + n )
		var y =cy +  hull[i][1] * ( 1 + n )
		
		if( x > width-2) x=width-2
		else if( x < 2) x =2
		
		if( y > height-2) y=height-2
		else if( y < 2) y =2
		
		if( i==0) ctx.moveTo(x,y)
		else ctx.lineTo( x, y )
	}
	ctx.closePath()
	//ctx.fill()
	ctx.stroke()
	
	var dx = targetX - cx
	var dy = targetY - cy
	
	ax = dx * spring
	ay =  dy * spring
	
	vx += ax
	vy += ay
	
	vx *=friction
	vy *=friction
	
	z += 0.015
	
	if( vx > maxSpeed) vx = maxSpeed
	else if(vx < -maxSpeed) vx = -maxSpeed
	if( vy > maxSpeed) vy = maxSpeed
	else if(vy < -maxSpeed) vy = -maxSpeed
	
	cx += vx
	cy += vy
	
	if( Math.abs(vx) < 0.02 && Math.abs(vy) < 0.02){
		
		 setTarget()
	}
	
	setTimeout(loop,33)
}

//init
loop()

function setTarget(x,y){
	
	if(!x)
		targetX = 50 + Math.random()*(width-100)
	else 
		targetX = x
		
	if(!y)
		targetY = 50 + Math.random()*(height-100)
	else 
		targetY = y
}

function mouse(e, w){
	
	var rect = e.target.getBoundingClientRect();
	
	var scale =  w / rect.width

	var x = e.clientX - rect.left*scale
	var y = e.clientY - rect.top*scale
	
	return [x,y]
}

function checkPoint(a, b, c) {
	
	var cross = (a[0] - b[0]) * (c[1] - b[1]) - (a[1] - b[1]) * (c[0] - b[0])
	var dot = (a[0] - b[0]) * (c[0] - b[0]) + (a[1] - b[1]) * (c[1] - b[1])
	
	return cross < 0 || cross == 0 && dot <= 0
}

function convexHull(points) {

	points.sort(function (a, b) {
		return a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]
	})

	var n = points.length,hull = [],l = 2*n, i = 0

	for (; i < l; ++i) {
		var j = i < n ? i : l - 1 - i
		while (hull.length >= 2 && checkPoint(hull[hull.length - 2], hull[hull.length - 1], points[j]))
			hull.pop()
		hull.push(points[j])
	}

	hull.pop()
	
	return hull
	
	
}
