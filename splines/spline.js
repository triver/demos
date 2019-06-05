;(function(global){

'use strict'

var PI2 = Math.PI*2
function calculateLength( points, t, loop){
	
	var length = 0
	var step = 0.1

	var oldPoint, newPoint
	
	oldPoint = getSplinePoint( points, t, loop )

	
	for (var i = 0; i < 1; i += step)
	{
		
		newPoint = getSplinePoint( points, (t + i) % points.length , loop)
		
		var dx = newPoint[0] - oldPoint[0]
		var dy = newPoint[1] - oldPoint[1]
		
		length += Math.sqrt( dx*dx + dy*dy )
					   
		oldPoint = newPoint;
	}
	
	return length;
}
function getOffset( points, p){
	// Which node is the base?
	var i = 0;
	while (p > points[i][2] )
	{
		p -= points[i][2];
		i++;
	}

	// The fractional is the offset 
	return  i + ( p / points[i][2] ) 
}

function getSplinePoint( points,  t, loop ){
	
	var p0, p1, p2, p3, i = t|0, l = points.length
	
	if (!loop)
	{
		p1 = i + 1
		p2 = p1 + 1
		p3 = p2 + 1
		p0 = p1 - 1
	}
	else
	{
		p1 = i
		p2 = (p1 + 1) % l
		p3 = (p2 + 1) % l
		p0 = p1 >= 1 ? p1 - 1 : l - 1
	}

	t = t - i

	var tt = t * t
	var ttt = tt * t

	var q1 = -ttt + 2 *tt - t
	var q2 = 3 * ttt - 5 * tt + 2
	var q3 = -3 * ttt + 4 * tt + t
	var q4 = ttt - tt

	var tx = 0.5 * ( points[p0][0] * q1 + points[p1][0] * q2 + points[p2][0] * q3 + points[p3][0] * q4)
	var ty = 0.5 * ( points[p0][1] * q1 + points[p1][1] * q2 + points[p2][1] * q3 + points[p3][1] * q4)

	return [ tx, ty ]
}
function getSplineGradient( points,  t, loop ){
	
	var p0, p1, p2, p3, i = t|0, l = points.length
	
	if (!loop)
	{
		p1 = i + 1
		p2 = p1 + 1
		p3 = p2 + 1
		p0 = p1 - 1
	}
	else
	{
		p1 = i
		p2 = (p1 + 1) % l
		p3 = (p2 + 1) % l
		p0 = p1 >= 1 ? p1 - 1 : l - 1
	}

	t = t - i

	var tt = t * t
	var ttt = tt * t

	var q1 = -3 * tt + 4 * t - 1
	var q2 = 9 * tt - 10 * t
	var q3 = -9 * tt + 8 * t + 1
	var q4 = 3 * tt - 2 * t

	var tx = 0.5 * ( points[p0][0] * q1 + points[p1][0] * q2 + points[p2][0] * q3 + points[p3][0] * q4)
	var ty = 0.5 * ( points[p0][1] * q1 + points[p1][1] * q2 + points[p2][1] * q3 + points[p3][1] * q4)

	return [ tx, ty ]
}	
function Spline( n, loop, x, y, radius ){
	
	
	this.points = []
	this.length = 0
	this.curvePoints = []
	this.step = 0.1
	this.loop = !!loop
	this.marker = 0
	this.selected = null
	
	if( typeof n == 'number' && x && y && radius){
		
		var step = Math.PI * 2 / n
		var h_radius = radius/2
		for(var i = 0; i< n;i++){
			
			var a = i*step
			var rand = h_radius - Math.random()*radius
			
			this.points.push( [ x + Math.cos(a) * (radius + rand ) , y + Math.sin(a) * (radius + rand) ] )
		}
	}
	else if( Array.isArray( n ) ){
		
		this.points = n
	}
	
	this.update()
	
}
Spline.prototype.setMarker = function(dist){
	
	var offset=0
	
	//fix more elegant solution then try catch
	if( this.selected ){
		try{ offset = getOffset( this.points, dist ) }catch(e){}
	}
	else{
		offset = getOffset( this.points, dist )
	}
	this.marker = getSplinePoint( this.points, offset, this.loop )
	var grad = getSplineGradient( this.points, offset, this.loop )
	
	this.marker[2] = Math.atan2( grad[1], grad[0] )
	
	return this.marker
	
}
Spline.prototype.setPoints = function(points){
	
	this.points = points
	this.update()
}
Spline.prototype.update = function(){
	
	this.length = 0
	this.curvePoints = []
	
	for(var t =0; t <  this.points.length; t += this.step){
		
		this.curvePoints.push( getSplinePoint( this.points,  t, this.loop ) )
		
	}
	for(var i =0; i <  this.points.length; i++){
		
		var l = calculateLength( this.points, i, this.loop )
		
		this.points[i][2] = l
		this.length += l
	}
}
Spline.prototype.select = function( x, y, dist ){
	
	dist = dist || 3
	
	var selected = null
	var curDist = Infinity
	
	for(var i =0; i <  this.points.length; i++){
		
		var p = this.points[i]
		var dx = p[0] - x
		var dy = p[1] - y
		var d = (dx*dx + dy*dy)
		
		if( d < dist*dist && d < curDist){
			selected = p
			curDist = d
			
		}
	}
	
	this.selected = selected
	
	
	return selected
}
Spline.prototype.deselect = function(  ){
	this.selected = null
	
}
Spline.prototype.drawCurve = function(ctx, color, lw){
	
	var curve = this.curvePoints
	ctx.beginPath()
	ctx.moveTo( curve[0][0], curve[0][1])
	
	for(var i=1; i < curve.length; i++){
		ctx.lineTo( curve[i][0], curve[i][1])
	}
	if(color) ctx.strokeStyle = color
	if(lw) ctx.lineWidth = lw
	ctx.stroke()
}
Spline.prototype.drawPoints = function(ctx, radius, color){
	
	ctx.beginPath()
	for(var i=0; i < this.points.length; i++){
		var p = this.points[i]
		ctx.moveTo( p[0],p[1])
		ctx.arc(p[0],p[1],radius,0,PI2) 
	}
	
	if(color) ctx.fillStyle = color
	ctx.fill()
}
Spline.prototype.drawMarker = function(ctx, radius, color, color2, lw){
	
	if(!this.marker) return
	
	var p = this.marker
	var a = p[2]
	
	ctx.beginPath()
	ctx.moveTo( p[0],p[1])
	ctx.arc(p[0],p[1],radius,0,PI2) 
	if(color) ctx.fillStyle = color
	ctx.fill()
	
	ctx.beginPath()
	ctx.moveTo(p[0], p[1])
	ctx.lineTo( p[0] + Math.cos(a)*(radius*2), p[1] + Math.sin(a)*(radius*2) )
	if(color2) ctx.strokeStyle = color2
	if(lw) ctx.lineWidth = lw
	ctx.stroke()
}

//edito

function SplineEditor(canvas, path , trace){
	
	var width = canvas.width
	var height = canvas.height
	
	var mouse = {
		
		x: 0,
		y: 0,
		down:false,
		ox:0,
		oy:0,
		dx:0,
		dy:0,
		update: function(e){
			
			var rect = e.target.getBoundingClientRect();
		
			var scale = width / rect.width

			var x = (e.clientX - rect.left)*scale
			var y = (e.clientY - rect.top)*scale
			
			this.x = x
			this.y = y
		},
		updateTouch: function(e){
			
			var o = e.touches[0]
			var rect = e.target.getBoundingClientRect();
		
			var scale = width / rect.width

			var x = (o.clientX - rect.left)*scale
			var y = (o.clientY - rect.top)*scale
			
			this.x = x
			this.y = y
		}
	}
	function onMouseDown(e){
		
		mouse.update(e)
		mouse.down = true
		
		if(path.select( mouse.x, mouse.y, 10 )){
			
			mouse.dx = mouse.x - path.selected[0] 
			mouse.dy = mouse.y - path.selected[1]
			
		}
		
		
	}
	function onMouseUp(e){
		
		mouse.update(e)
		mouse.down = false
		mouse.dx=0
		mouse.dy=0
		path.deselect()
		
	}
	function onMouseMove(e){
		
		mouse.update(e)
		
		var selected = path.selected
		
		if( selected ){
			
			selected[0] = mouse.x - mouse.dx
			selected[1] = mouse.y - mouse.dy
			
			path.update()
		}
		
	
	}
	canvas.addEventListener('mousedown',onMouseDown,false)
	canvas.addEventListener('mouseup',onMouseUp,false)
	canvas.addEventListener('mousemove',onMouseMove,false)
	canvas.addEventListener('mouseleave',onMouseUp,false)

	function onTouchStart(e){
		
		//e.preventDefault()
		if( e.touches.length !== 1 ) return
		mouse.updateTouch(e)
		mouse.down = true
		
		if(path.select( mouse.x, mouse.y, 50 )){
			
			mouse.dx = mouse.x - path.selected[0] 
			mouse.dy = mouse.y - path.selected[1]
			
		}
		
		
	}
	function onToucheEnd(e){
		
		mouse.updateTouch(e)
		mouse.down = false
		mouse.dx=0
		mouse.dy=0
		path.deselect()
		
	}
	function onTouchMove(e){
		
		e.preventDefault()
		mouse.updateTouch(e)
		
		var selected = path.selected
		if( selected ){
			
			selected[0] = mouse.x - mouse.dx
			selected[1] = mouse.y - mouse.dy
			
			path.update()
		}
		
	
	}
	canvas.addEventListener('touchstart', onTouchStart, false)
	canvas.addEventListener('touchmove', onTouchMove, false)
	canvas.addEventListener('touchcancel', onToucheEnd, false)
	canvas.addEventListener('touchend', onToucheEnd, false)
	
	
}
global.Spline = Spline
global.SplineEditor = SplineEditor
	
})(this);


















