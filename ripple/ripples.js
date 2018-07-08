 var Ripples = function(canvas,radius){
	 

	var ctx         = canvas.getContext('2d')
	var width       = canvas.width
	var height      = canvas.height
	var halfWidth   = width  >> 1
	var halfHeight  = height >> 1
	var size        = width * (height + 3) * 2
    var oldIdx      = width
	var newIdx      = width * (height + 3);
	var rippleRad   = radius || 3
	var rippleMap   = new Int32Array(size)
	var lastMap     = new Int32Array(size)
	var mapIdx = 0
	var ripple = ctx.getImageData(0, 0, width, height)
	var texture = ctx.getImageData(0, 0, width, height)
	

	
	function dropAt( dx, dy )
	{
		
		dx <<= 0
		dy <<= 0
		
	   
		for (var j = dy - rippleRad; j < dy + rippleRad; j++)
		{
			for (var k = dx - rippleRad; k < dx + rippleRad; k++)
			{
				rippleMap[oldIdx + (j * width) + k] += 128
			}
		}
	}
	
	function newframe()
	{
		var i
		var a, b
		var data, oldData
		var curPixel, newPixel
		
		
		i = oldIdx
		oldIdx = newIdx
		newIdx = i
		
	   
		i = 0
		mapIdx = oldIdx
		
		for (var y = 0; y < height; y++)
		{
			for (var x = 0; x < width; x++)
			{
				
				data = (
						rippleMap[mapIdx - width] + 
						rippleMap[mapIdx + width] + 
						rippleMap[mapIdx - 1] + 
						rippleMap[mapIdx + 1]) >> 1  
				
				
				data -= rippleMap[newIdx + i]

				data -= data >> 4

				
				rippleMap[newIdx + i] = data
				
				var p = 1024
				data = 1024 - data
	
				oldData = lastMap[i]
				lastMap[i] = data
	
				if (oldData != data)  
				{
				   
					a = (((x - halfWidth) * data / 1024) << 0) + halfWidth
					b = (((y - halfHeight) * data / 1024) << 0) + halfHeight
					
				  
					if (a >= width) a = width - 1
					if (a < 0) a = 0
					if (b >= height) b = height - 1
					if (b < 0) b = 0

				   
					newPixel = (a + (b * width)) * 4
					curPixel = i * 4
					
				   
					ripple.data[curPixel]       = texture.data[newPixel]
					ripple.data[curPixel + 1] = texture.data[newPixel + 1]
					ripple.data[curPixel + 2] = texture.data[newPixel + 2]
				}
				mapIdx++
				i++
			}
		}
	}

	return {
		
		draw:function(){
			
			newframe()
			
			ctx.putImageData(ripple, 0, 0)
		},
		drop: function(x,y){
			
			x = x || Math.random() * ( width - 20 ) + 10
			y = y || Math.random() * ( height - 20 ) + 10
			
			dropAt(x,y)
		}
	}
 }
