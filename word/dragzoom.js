(function(global){
	
	
'use strict'

//utils
var noop = function(){}

function isMultiTouch(e) {
			
	return (e.touches && e.touches.length > 1) || (e.scale && e.scale !== 1);
}
function distance(e){
	
	var dx = e.touches[0].clientX - e.touches[1].clientX
	var dy = e.touches[0].clientY - e.touches[1].clientY
	
	return Math.sqrt(dx*dx + dy*dy);
}
function clamp(num, min, max) {
	return num < min ? min : (num > max ? max : num);
}

//vars
var element = document
var onZoom=noop
var onDrag=noop
var onDragX=noop
var onDragY=noop
var onStart=noop
var onEnd=noop
var onClick = noop
var onMove = noop

var dragging = false
var zooming = false
var axes =false
var tm=null;
var clickAllowed = true;

var mouse ={
	x:0,
	y:0,
	lastX:0,
	lastY:0,
	diffX:0,
	diffY:0,
	dist:0,
	lastDist:0,
	diffDist:0,
	update: function(e){
		
		//skip  if it's multitouch or pinch move
		if(isMultiTouch(e)) return;
		
		var clientX,clientY;
		
		if(e.touches){
			clientX = e.touches[0].clientX;
			clientY = e.touches[0].clientY;
		}
		else
		{
			clientX = e.clientX;
			clientY = e.clientY;
		}	
		
		
		this.lastX = this.x;
		this.lastY = this.y;
		
		this.x = clientX;
		this.y = clientY;
		
		this.diffX = this.x - this.lastX;
		this.diffY = this.y - this.lastY;
	}
	
}	
//main
function DragZoom(opts){
	
	opts = opts || {}
	
	if(opts.drag) onDrag = opts.drag
	if(opts.dragX) onDragX = opts.dragX
	if(opts.dragY) onDragY = opts.dragY
	if(opts.zoom) onZoom = opts.zoom
	if(opts.start) onStart = opts.start
	if(opts.end) onEnd = opts.end
	if(opts.element) element = opts.element
	if(opts.click) onClick = opts.click
	if(opts.move) onMove = opts.move

	//bind
	element.addEventListener("mousemove",      dragMoveHandler,  false);
	element.addEventListener("touchmove",      dragMoveHandler,  false);
	element.addEventListener("mousedown",      dragStartHandler, false);
	element.addEventListener("touchstart",     dragStartHandler, false);
	element.addEventListener("mouseup",        dragEndHandler,   false);
	element.addEventListener("mouseleave",     dragEndHandler,   false);
	element.addEventListener("touchend",       dragEndHandler,   false);
	element.addEventListener("mousewheel",     wheelHandler,     false);
	element.addEventListener("DOMMouseScroll", wheelHandler,     false);
	
	
}
DragZoom.isDragging = false
//handlers
function dragMoveHandler(e){
			
	e.preventDefault();
	e.stopPropagation();
	
	
	if( isMultiTouch(e) && zooming){
		 
		var dist = distance(e);
		
		if(Math.abs(dist-mouse.lastDist) > 5){
			
			onZoom( e, dist - mouse.lastDist );
		}
		mouse.lastDist = dist;
	}
	else if( dragging ){
		
		mouse.update(e);
		
		var ax = Math.abs(mouse.diffX);
		var ay = Math.abs(mouse.diffY);
		
		if (ax > 0 || ay > 0) {
			
			element.removeEventListener("click",clickHandler);
		}
		
		if( Math.abs(ax-ay) < 1){
			
			axes = false;
			return
		}
		 
		 
		if( ax >= ay && axes != 'y'){
			
			if(!axes) axes = 'x';
			
			if(ax > 0.5)
				onDragX( e, mouse.diffX );
		}
		else if(axes != 'x'){
			
			if(!axes) axes = 'y';
			
			if( ay  > 0.5 ){
				
				onDragY( e, mouse.diffY );
			}
		}
		
		onDrag( e, mouse.diffX , mouse.diffY)
	}
	else{
		
		onMove(e)
	}
	
	
}



function wheelHandler(e){
	
	e.preventDefault()
	e.stopPropagation()
	
	zooming = DragZoom.isDragging = true
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
	
	onZoom( e,delta, true);
	
	tm = setTimeout(function(){
		
		if(zooming){ 
			
			zooming = DragZoom.isDragging = false
		}
		else if(tm){
			 
			clearTimeout( tm )
		}
	},500);
	
}

function dragStartHandler(e){
	
	e.stopPropagation()
	
	element.addEventListener("click", clickHandler, false);
	
	if(!isMultiTouch(e)){
		
		e.preventDefault();
	}
	
	mouse.update(e);
	
	if (e.touches && e.touches.length === 2) {
		
		e.preventDefault();
		zooming = true;
		mouse.dist = mouse.lastDist = distance(e);
		
	}
	else{
	
		dragging = DragZoom.isDragging = true
		axes = false;
	 }
	 
	
	onStart(e)
}
function dragEndHandler(e){
	
	e.stopPropagation()
	zooming = false;
	dragging = DragZoom.isDragging = false;
	axes = false;
	
	onEnd(e)
	
	
}
function clickHandler(e){
	
	e.stopPropagation()
	zooming = false;
	dragging = DragZoom.isDragging = false;
	axes = false;
	
	
	onClick(e)
	element.removeEventListener("click",clickHandler);
}



global.DragZoom = DragZoom

	
})(this);
