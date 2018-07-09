'use strict'
		
var width = 600
var height = 600
var speed =4
var delay=33
var epsilon = 0.0000001
var count = 0

var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')

canvas.width = width
canvas.height = height

//line
var p1=[0,0]
var p2=[Math.random()*width,Math.random()*height]
var t=0
var d = 1 / ( Math.sqrt(dist(p1,p2)) + epsilon) * speed


//circle
var arc=Math.PI*2
var arcOffset=0
var radius = speed*Math.floor(Math.random()*20+10) / Math.PI
var angle = 0
var delta = arc / (arc*radius) * speed
var cx=200
var cy = 200

//curve
var curve = randomCurve( width,height)
var evenCurvePoints = evenBezierPoints( curve[0],curve[1],curve[2],curve[3],speed)
var curveIndex = 0

//drawing
var lineData=[
	
	{
		type:'arc',
		arc: Math.PI*2,
		arcOffset:0,
		radius:100,
		cx: width/2,
		cy: height/2,
		speed:6
	},
	{
		type:'arc',
		arc: Math.PI*2,
		arcOffset:0,
		radius:20,
		cx: width/2 + 50,
		cy: height/2,
		speed:6
	},
	{
		type:'arc',
		arc: Math.PI*2,
		arcOffset:0,
		radius:20,
		cx: width/2-50,
		cy: height/2,
		speed:6
	},
	{
		type:'curve',
		curve:[[250,360],[300,320],[300,420],[350,340]],
		speed:6
	},
	{
		type: 'line',
		points: [[150,150],[450,150]],
		speed: 6
	},
	{
		type: 'line',
		points: [[450,150],[450,450]],
		speed: 6
	},
	{
		type: 'line',
		points: [[450,450],[150,450]],
		speed: 6
	},
	{
		type: 'line',
		points: [[150,450],[150,150]],
		speed: 6
	}
]

var drawing = createData( lineData )


document.getElementById('speedControl').addEventListener('change',function(){
	speed = +this.value
},false)

document.getElementById('delayControl').addEventListener('change',function(){
	delay = +this.value
},false)

//init
loop()

function loop(){
	
	if(count%40 === 0 ){
		ctx.fillStyle = 'rgba(255,255,255,0.2)'
		ctx.fillRect(0,0,width,height)
	}
	
	dotLine()
	dotArc()
	dotCurve()
	
	drawData( count, drawing )
	setTimeout(loop,delay)
	count++
}
function dotArc(){
	
	ctx.beginPath()
	
	ctx.arc( 
		cx + Math.cos( angle + arcOffset ) * radius, 
		cy + Math.sin( angle + arcOffset ) * radius, 
		1, 0, Math.PI*2 )
		
	ctx.fillStyle = 'red'
	ctx.fill()
	
	angle += delta
	
	if( angle > arc-delta/2){
		
		
		radius = speed*Math.round(Math.random()*20+10) / Math.PI
		arc= Math.random() < 0.5 ? Math.PI*2 : 1 + Math.PI*Math.random()
		arcOffset = Math.random()*Math.PI*2
		angle =0
		delta = arc/ (arc*radius) * speed
		cx=Math.random()*width
		cy = Math.random()*height
	}
}
function dotLine(){
	
	var l = lerp(p1,p2,t)
	
	ctx.beginPath()
	ctx.arc( l[0], l[1], 1, 0, Math.PI*2 )
	ctx.fillStyle = 'green'
	ctx.fill()
	
	t  += d
	
	if( t > 1 ){
		
		p1=l
		p2 = [Math.random()*width,Math.random()*height]
		
		d = 1 / ( Math.sqrt(dist(p1,p2)) + epsilon)  * speed
		t=d
		
	}
}
function dotCurve(){
	
	var l = evenCurvePoints[curveIndex]
	
	ctx.beginPath()
	ctx.arc( l[0], l[1], 1, 0, Math.PI*2 )
	ctx.fillStyle = 'blue'
	ctx.fill()
	
	curveIndex++
	
	if( curveIndex > evenCurvePoints.length-1 ){
		
		curve = randomCurve( width,height)
		evenCurvePoints = evenBezierPoints( curve[0],curve[1],curve[2],curve[3],speed)
		curveIndex=0
		
	}
}


function drawData( i, pts ){
	
	i = i%pts.length
	
	ctx.beginPath()
	ctx.arc( pts[i][0], pts[i][1], 2, 0, Math.PI*2 )
	ctx.fillStyle = 'black'
	ctx.fill()
}
function createData(data){
	
	var points=[]
	
	console.log( data.length)
	
	for(var n=0; n< data.length; n++){
		
		var item = data[n]
		
		switch( item.type){
			
			case 'line':
			
				var d = 1 / ( Math.sqrt(dist(item.points[0],item.points[1])) + epsilon)  * item.speed
				
				for(var t = 0; t < 1; t += d ){
					
					points.push( lerp( item.points[0], item.points[1], t ) )
				}
			
			
			break;
			case 'arc':
			
				var d = item.arc/ (item.arc*item.radius) * item.speed
				var l = item.arc - d / 2
				
				for( var a = 0; a < l; a += d ){
					
					points.push([ 
						item.cx + Math.cos( a + item.arcOffset ) * item.radius, 
						item.cy + Math.sin( a + item.arcOffset ) * item.radius 
					])
				}
			
			
			break;
			case 'curve':
				points = points.concat( evenBezierPoints( 
															item.curve[0],
															item.curve[1],
															item.curve[2],
															item.curve[3],
															item.speed) )
			break;
			case 'lineSegment':
				
				points.push( item.points[0] )
				
				for(var i = 1; i < item.points.length; i++){
					
					var p0 = item.points[ i - 1 ]
					var p1 = item.points[ i ]
					
					var d = 1 / ( Math.sqrt( dist( p0, p1 )) + epsilon)  * item.speed
					
					for(var t = d; t <= 1; t += d ){
						
						points.push( lerp( p0, p1, t ) )
					}
				
				}
				
			break;
			default:
		}
	}
	
	return points
}
function dist(p1,p2){
	return (p2[0] - p1[0])*(p2[0] - p1[0]) + ((p2[1] - p1[1])*(p2[1] - p1[1]));
}
function lerp(p1,p2,t){

	return [ p1[0] + t*( p2[0] - p1[0] ), p1[1] + t*(p2[1] - p1[1] )] ;
}
function slope( x1,y1,x2,y2){

	return ( y2 - y1 ) / (x2 - x1 )
	
}
function randomCurve(w,h){
	
	var p0x = Math.random()*w
	var p0y=Math.random()*h
	
	var p1x = Math.random()*w
	var p1y=Math.random()*h
	
	var a0 = Math.random()*Math.PI*2
	var r0 = Math.random()*100+50
	var c0x = p0x + Math.cos(a0)*r0
	var c0y = p0y + Math.sin(a0)*r0
	
	var a1 = Math.random()*Math.PI*2
	var r1 = Math.random()*100+50
	var c1x = p1x + Math.cos(a1)*r1
	var c1y = p1y + Math.sin(a1)*r1
	
	return [[p0x,p0y],[c0x,c0y],[c1x,c1y],[p1x,p1y]]
}
function bezierPoint(p0, p1, p2, p3, t){

	var cX = 3 * (p1[0] - p0[0]),
		bX = 3 * (p2[0] - p1[0]) - cX,
		aX = p3[0] - p0[0] - cX - bX;

	var cY = 3 * (p1[1] - p0[1]),
		bY = 3 * (p2[1] - p1[1]) - cY,
		aY = p3[1] - p0[1] - cY - bY;

	var x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0[0];
	var y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0[1];

	return [x,y];
}
function bezierPoints(p0,p1,p2,p3,n){
	n = n || 1000;
	var points =[];
	
	for(var i=0; i < n; i++) {
		var t=i/n;
		points.push(bezierPoint(p0,p1,p2,p3,t));
		
	}
	points.push( bezierPoint(p0,p1,p2,p3,1) );
	return points;
}
function evenBezierPoints(p0,p1,p2,p3,speed){


	var points = bezierPoints(p0,p1,p2,p3,3000);
	
	var seg = speed*speed;
	var cur =0;
	var i =1;
	var even = [points[cur]]
	
	while(points[cur+i]){
		
		if(dist(points[cur],points[cur+i]) < seg ){
		
			i++;
		}
		else{
			
			cur += i;
			i=1;
			even.push( points[cur]);
		}
	}
	
	return even;
}
