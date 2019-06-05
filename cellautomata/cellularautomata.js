;(function(global){
	
'use strict'

function randomGrid( width, height) {
		
	var grid = []

	for (var y = 0; y < height; y++) {
		
		grid[y] = []

		for (var x = 0; x < width; x++) {
			
			var on = ( x === 0 || x === width - 1 || y === 0 || y === height - 1   )
			
		   grid[y][x] = on ? 1 : Math.random() < 0.5 ? 1 : 0 
		}
	}

	return grid
}
function applyAutomata( grid ){
		
	var toggle =[], x, y, i, count , width, height
	
	var n = [
		[-1,-1],[0,-1],[1,-1],
		[-1, 0],       [1, 0],
		[-1, 1],[0, 1],[1, 1]
	]

	for (y = 1, height = grid.length - 1; y < height; y++) {
		
		for (x = 1, width = grid[y].length - 1; x < width; x++) {
			
			count = 0
			
			for(i=0;i<n.length; i++){
				
				count += grid[ y + n[i][1] ][ x + n[i][0] ]
			}
			
			if( count > 4){
				
				if( grid[y][x] === 0 ) toggle.push( [x,y] )
				
			}
			else if( count < 4 ){
				
				if( grid[y][x] === 1 ) toggle.push( [x,y] )
				
			}
			
		}
	}
	
	for(i=0; i< toggle.length; i++){
		
		x = toggle[i][0]
		y = toggle[i][1]
		
		grid[y][x] = 1 - grid[y][x]
	}
	
}

function findTarget( grid, target){
		
	for (var y = 0, ly = grid.length; y < ly; y++) {
		
		for (var x = 0, lx = grid[y].length; x < lx; x++) {
			
			if( grid[y][x] === target) return [ x, y]
			
			
		}
	}
	
	return false
}
function extractGridArea( grid,  startPos, target, fill ){
	
	var height = grid.length
	var width = grid[0].length
	var result =[startPos]
	var pixelStack = [startPos]
	
	
	while(pixelStack.length){
		
	  var newPos, x, y, reachLeft, reachRight
	  
	  newPos = pixelStack.pop()
	  
	  x = newPos[0]
	  y = newPos[1]
	 
		
	  while(y > 0 && grid[y][x] === target ) { y-- }
	
	  
	  reachLeft = false
	  reachRight = false
	 
	  while( y++ < height-1 && grid[y][x] === target ){
		  
			result.push([x,y])
			grid[y][x] = fill
				
				
				
				if(x > 0)
				{
				  if( grid[y][x - 1] === target)
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
				  if( grid[y][x + 1] === target )
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

	return result
}
function extractParts( grid ){
		
	var start, parts = [], id = 1
	
	while( start = findTarget( grid, 0 ) ){
		
		parts.push( extractGridArea( grid,  start, 0, ++id ) )
	}
	
	return parts
}
function cellularAutomata( width, height, numIterations, minArea ){
	
	var i, j, p
	
	var grid = randomGrid( width, height )
	
	for( i =0; i < numIterations; i++) applyAutomata( grid )
	
	var parts = extractParts( grid )
	
	if(parts && parts.length && minArea){
		
		for( i =0; i < parts.length; i++){
			
			p = parts[i]
			
			if(p.length < minArea){
				
				for( j =0; j < p.length; j++){
					
					grid[p[j][1]][p[j][0]] = 1
					
				}
			}
		}
	}
	
	return grid
	
} 	

global.cellularAutomata = cellularAutomata	
})(this);
