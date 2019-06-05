function floodFill( data, width, height, startPos,  targetColor, fillColor ){
		
	var pixelStack = [startPos]
	var indexes = []
	
	while(pixelStack.length){
		
	  var newPos, x, y, pixelPos, reachLeft, reachRight
	  
	  newPos = pixelStack.pop()
	  
	  x = newPos[0];
	  y = newPos[1];
	  
	  pixelPos = ( y * width + x ) * 4;
	  
	  while(y-- >= 0 && matchStartColor( data, pixelPos, targetColor) )
	  {
		pixelPos -= width * 4
	  }
	  pixelPos += width * 4
	  
	  ++y
	  
	  reachLeft = false
	  reachRight = false
	  
	  while(y++ < height-1 && matchStartColor( data, pixelPos, targetColor ))
	  {
		colorPixel( data, pixelPos, fillColor)
		indexes.push( pixelPos )

		if(x > 0)
		{
		  if( matchStartColor( data, pixelPos - 4, targetColor))
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
		  if(matchStartColor( data, pixelPos + 4, targetColor ))
		  {
			if(!reachRight)
			{
			  pixelStack.push([x + 1, y]);
			  reachRight = true
			}
		  }
		  else if(reachRight)
		  {
			reachRight = false
		  }
		}
				
		pixelPos += width * 4
	  }
	}
	
	return indexes
	
}
function matchStartColor( data, pixelPos, color)
{
  var r = data[pixelPos]	
  var g = data[pixelPos+1]
  var b = data[pixelPos+2]
  var a = data[pixelPos+3]

  return (r === color[0] && g === color[1] && b === color[2] && a === color[3] )
}

function colorPixel( data, pixelPos, color)
{
  data[pixelPos] =   color[0]
  data[pixelPos+1] = color[1]
  data[pixelPos+2] = color[2]
  data[pixelPos+3] = color[3]
}
