function Display(width,height){
	
	this.width = width
	this.height = height
	this.grid = new Array( width*height ).fill( 0) 
}
Display.prototype.clear = function( x, y ){
	
	this.grid = new Array(this.width*this.height).fill(0)
}
Display.prototype.fillRandom = function( ){
	
	for(var i = this.grid.length-1; i>= 0; --i){
		
		if(Math.random() < 0.5) this.grid[i] = 1
	}
}
Display.prototype.pixel = function( x, y, v ){
	
	x |= 0
	y |= 0
	v = v || 1
	
	if(x >= 0 && 
			y >= 0 && 
			x < this.width && 
			y < this.height 
		) this.grid[x + y*this.width] = v
}
Display.prototype.getPixel = function( x, y){
	
	x |= 0
	y |= 0
	
	if(x >= 0 && 
			y >= 0 && 
			x < this.width && 
			y < this.height 
		) return this.grid[x + y*this.width]
}
Display.prototype.clearPixel = function( x, y ){
	
	x |= 0
	y |= 0
	
	
	if(x >= 0 && 
			y >= 0 && 
			x < this.width && 
			y < this.height 
		) this.grid[x + y*this.width] = 0
}
Display.prototype.circle = function(x0, y0, radius, v,  fill)
{	
	x0 |= 0
	y0 |= 0
	
	v = v || 1
	
	var x = radius-1
	var y = 0
	var dx = 1
	var dy = 1
	var err = dx - (radius << 1)
	
	
	while (x >= y)
	{
		
		if(fill){
			this.line( x0 - x, y0 + y, x0 + x, y0 + y , v)
			this.line( x0 - x, y0 - y, x0 + x, y0 - y , v)
			this.line( x0 - y, y0 - x, x0 + y, y0 - x , v)
			this.line( x0 - y, y0 + x, x0 + y, y0 + x , v)
		}
		else
		{
			this.pixel( x0 + x, y0 - y, v)
			this.pixel( x0 - x, y0 - y, v)
			this.pixel( x0 + x, y0 + y, v)
			this.pixel( x0 - x, y0 + y, v)
			this.pixel( x0 - y, y0 + x, v)
			this.pixel( x0 + y, y0 + x, v)
			this.pixel( x0 - y, y0 - x, v)
			this.pixel( x0 + y, y0 - x, v)
		}
		
		
		if (err < 0)
		{
			y += 1
			err += dy
			dy += 2
		}
		if (err >= 0)
		{
			x -= 1
			dx += 2
			err += dx - (radius << 1)
		}
	}
}
Display.prototype.line = function(x0, y0, x1, y1, v) {

	x0 |= 0
	y0 |= 0
	x1 |= 0
	y1 |= 0
	v = v || 1
	var dx = Math.abs(x1 - x0), 
	  sx = x0 < x1 ? 1 : -1;
	  
	var dy = Math.abs(y1 - y0), 
	  sy = y0 < y1 ? 1 : -1;
	  
	var err = (dx>dy ? dx : -dy)/2;

	while (true) {

		this.pixel( x0, y0, v )

		if (x0 === x1 && y0 === y1) break;

		var e2 = err;

		if (e2 > -dx) { err -= dy; x0 += sx; }

		if (e2 < dy) { err += dx; y0 += sy; }
	}
  
}
Display.prototype.polygon = function( poly , v){
	
	for( var i=0, l = poly.length; i<l; i++){
		
		var p1x = poly[i][0] | 0
		var p1y = poly[i][1] | 0
		var p2x = poly[(i + 1) % l][0] | 0
		var p2y = poly[(i + 1) % l][1] | 0
		
		 this.line(p1x, p1y, p2x, p2y, v)
	}
}
Display.prototype.fill = function( x0, y0, t, v ){
	
	x0 |= 0
	y0 |= 0
	v = v || 1
	t = t || 0
	var height = this.height
	var width  = this.width
	var grid   = this.grid
	
	var pixelStack = [ [ x0, y0] ]
	
	
	while(pixelStack.length){
		
	  var newPos, x, y, reachLeft, reachRight
	  
	  newPos = pixelStack.pop()
	  
	  x = newPos[0]
	  y = newPos[1]
	 
		
	  while(y >= 0 && grid[x+y*width] === t ) { y-- }
	
	  
	  reachLeft = false
	  reachRight = false
	 
	  while( y++ < height && grid[x+y*width] === t ){
		  
			
			this.pixel( x, y, v)
				
				
				
				if(x > 0)
				{
				  if( grid[(x-1)+y*width] === t)
				  {
					if(!reachLeft){
					  pixelStack.push([x - 1, y])
					  reachLeft = true
					}
				  }
				  else if(reachLeft)
				  {
					reachLeft = false
				  }
				}
				
				if(x < width-1)
				{
				  if( grid[(x+1)+y*width] === t)
				  {
					if(!reachRight)
					{
					  pixelStack.push( [x + 1, y] )
					  reachRight = true
					}
				  }
				  else if( reachRight )
				  {
					reachRight = false
				  }
				}
						
		
	  }//while down ends
	  
	 
	}//while stack ends

}
Display.prototype.spline = function getSplinePoint( points, v ){
	
	
	var l = points.length
	
	for(var n =0; n <  points.length; n += 0.03){	
		
			var p0, p1, p2, p3, t=n, i = n|0
			
		
			p1 = i
			p2 = (p1 + 1) % l
			p3 = (p2 + 1) % l
			p0 = p1 >= 1 ? p1 - 1 : l - 1
			

			t = t - i

			var tt = t * t
			var ttt = tt * t

			var q1 = -ttt + 2 *tt - t
			var q2 = 3 * ttt - 5 * tt + 2
			var q3 = -3 * ttt + 4 * tt + t
			var q4 = ttt - tt

			var x = 0.5 * ( points[p0][0] * q1 + points[p1][0] * q2 + points[p2][0] * q3 + points[p3][0] * q4) | 0
			var y = 0.5 * ( points[p0][1] * q1 + points[p1][1] * q2 + points[p2][1] * q3 + points[p3][1] * q4) | 0
			
			
			this.pixel( x, y, v )
			
	}
}
Display.prototype.merge = function( display2 ){
	
	//fix different sizes
	var g = display2.grid
	
	for(var y = 0; y< this.height; y++){
		for(var x = 0; x< this.width; x++){
			
			var i = x + y*this.width
			
			if(g[i]) this.grid[i] = g[i] | 0
		}
	}
	
}
Display.prototype.drawColor = function( ctx, size, colors ){
	
	var w = this.width
	var g = this.grid
	colors = colors || ['black','orange','green','red','lime','deeppink','olive','dodgerblue','ivory']
	
	
	for(var y = this.height - 1; y >= 0; --y){
		for(var x = w - 1; x >= 0; --x){
			var i = ( x + y*w)
			
			if(g[i]){
				
				ctx.fillStyle = colors[g[i]-1]
				ctx.fillRect(  x * size, y * size, size,size)
				
			}
		}
	}
	
	
}
Display.prototype.draw = function( ctx, size, color ){
	
	var w = this.width
	var g = this.grid
	ctx.fillStyle = color || 'black'
	
	ctx.beginPath()
	for(var y = this.height - 1; y >= 0; --y){
		for(var x = w - 1; x >= 0; --x){
			var i = ( x + y*w)
			
			if(g[i]){
				
				ctx.rect(  x * size, y * size, size,size)
				
			}
		}
	}
	ctx.fill()
	
}
