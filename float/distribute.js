var Distribute = function(){
	
	var ANGLE = Math.PI * (3 - Math.sqrt(5));
	var sqrt2 = Math.sqrt(2);
	var sqrt3 = Math.sqrt(3);
	var sqrt32 = sqrt3/2;
	var sqrt12 = 1/sqrt2;
	
	//utils
	function distanceSquared(p1,p2){
	
		return (p2[0] - p1[0])*(p2[0] - p1[0]) + ((p2[1] - p1[1])*(p2[1] - p1[1]));
	}
	function randomFloat(min,max){
		return Math.random() * ( max - min ) + min;
	}	
	//helpers

	
	function poissonDiscSampler(width, height, radius) {
		
		
		  var k = 30, // maximum number of samples before rejection
			  radius2 = radius * radius,
			  R = 3 * radius2,
			  cellSize = radius * Math.SQRT1_2,
			  gridWidth = Math.ceil(width / cellSize),
			  gridHeight = Math.ceil(height / cellSize),
			  grid = new Array(gridWidth * gridHeight),
			  queue = [],
			  queueSize = 0,
			  sampleSize = 0;

		  return function() {
			  
			if (!sampleSize) return sample(Math.random() * width, Math.random() * height);

			// Pick a random existing sample and remove it from the queue.
			while (queueSize) {
			  var i = Math.random() * queueSize | 0,
				  s = queue[i];

			  // Make a new candidate between [radius, 2 * radius] from the existing sample.
			  for (var j = 0; j < k; ++j) {
				var a = 2 * Math.PI * Math.random(),
					r = Math.sqrt(Math.random() * R + radius2),
					x = s[0] + r * Math.cos(a),
					y = s[1] + r * Math.sin(a);

				// Reject candidates that are outside the allowed extent,
				// or closer than 2 * radius to any existing sample.
				if (0 <= x && x < width && 0 <= y && y < height && far(x, y)) return sample(x, y);
			  }

			  queue[i] = queue[--queueSize];
			  queue.length = queueSize;
			}
		  };

		  function far(x, y) {
			var i = x / cellSize | 0,
				j = y / cellSize | 0,
				i0 = Math.max(i - 2, 0),
				j0 = Math.max(j - 2, 0),
				i1 = Math.min(i + 3, gridWidth),
				j1 = Math.min(j + 3, gridHeight);

			for (j = j0; j < j1; ++j) {
			  var o = j * gridWidth;
			  for (i = i0; i < i1; ++i) {
				if (s = grid[o + i]) {
				  var s,
					  dx = s[0] - x,
					  dy = s[1] - y;
				  if (dx * dx + dy * dy < radius2) return false;
				}
			  }
			}

			return true;
		  }

		  function sample(x, y) {
			var s = [x, y];
			queue.push(s);
			grid[gridWidth * (y / cellSize | 0) + (x / cellSize | 0)] = s;
			++sampleSize;
			++queueSize;
			return s;
		  }
	}
	
	function gaussian(mean, stdev) {
		var y2;
		var use_last = false;
		return function() {
			var y1;
			if(use_last) {
			   y1 = y2;
			   use_last = false;
			}
			else {
				var x1, x2, w;
				do {
					 x1 = 2.0 * Math.random() - 1.0;
					 x2 = 2.0 * Math.random() - 1.0;
					 w  = x1 * x1 + x2 * x2;               
				} while( w >= 1.0);
				w = Math.sqrt((-2.0 * Math.log(w))/w);
				y1 = x1 * w;
				y2 = x2 * w;
				use_last = true;
		   }

		   var retval = mean + stdev * y1;
		   if(retval > 0) 
			   return retval;
		   return -retval;
	   }
	}
	
	//API
	return {
	
		random: function(x,y,w,h,n){
			
			var minDist =20;
			var shift = minDist/2.5;
			var rows = Math.floor(h/minDist);
			var cols = Math.floor(w/minDist);
			var a = new Array(rows).fill(0).map(function(){ 
				return new Array(cols).fill(0); 
			});
			
			var i,x,y,pts=[],count;
			
			for(i=0; i< n; i++){
				count = 0;
				do{
					x = Math.floor(Math.random()*cols);
					y = Math.floor(Math.random()*rows);
					
					if(count > 1000) return pts;
					count++;
				}
				while(a[y][x] === 1);
				
				pts.push([ x * minDist + randomFloat(-shift,shift), y * minDist + randomFloat(-shift,shift) ]);
				a[y][x] = 1;
			}
			return pts;
		},
		uniform:function(x,y,w,h,r){
			
			var sample = poissonDiscSampler(w, h, r);
			var samples = [];
			var done = false;
			var p;
			while(!done) {
				for (var i = 0; i < 10; ++i) {
					var s = sample();
					if (!s){ 
						done = true;
						break;
					}
					
					p = [x + s[0], y + s[1]];
					samples.push(p);
					
					
				}
			}
			return samples;
		},
		randomDisc: function(x,y,radius,n){
			
			var points=[];
			
			for(var i=0; i < n ;i++){
				
				var t = 2*Math.PI*Math.random();
				var u = Math.random()+Math.random();
				var r = u>1 ? 2-u : u;
				var s = [x + r*Math.cos(t)*radius, y+ r*Math.sin(t)*radius];
				points.push(s);
				
			 }
		 
			return points;
		},
		spiralDisc:function spiralDisc(x,y,radius,numPoints){
 
			var angle = ANGLE;
			var points = [];
			var theta,r,dx,dy,p;
			var sqrtp = Math.sqrt(numPoints);
			
			for( var i =0; i < numPoints;i++){
			  theta = i * angle;
			  r = Math.sqrt(i) / sqrtp;
			  dx = x + r * Math.cos(theta) * radius;
			  dy = y + r * Math.sin(theta)*radius;
			  p = [ dx, dy];
			  points.push(p);
			  
			}
			return points;
		},
		uniformDisc: function( cx, cy, r1, r2){
			
			var r = r1+r1,
				dx,dy,d;
				
			return this.uniform(cx - r1, cy - r1 , r, r, r2).filter(function(a){
				
				dx = a[0] - cx;
				dy = a[1] - cy;
				d = Math.sqrt(dx*dx + dy*dy)
				
				return d < r1
			})
			
		},
		gaussianDisc:function(cx,cy,mean,num,variation,tolerance){
			
			mean = Number(mean) || 100;
			num = Number(num) || 100;
			variation = Number(variation) || 15;
			toleranceSquared = Number(tolerance*tolerance) || 1;
		
			var rand = gaussian( mean, variation );
			var i,j,tooClose=false;
			var pts=[];
			
			for(i=0; i < num; i++){
			
				tooClose=false;
				
				x = rand() + cx - mean;
				y = rand() + cy - mean;
				
				j=pts.length;
				
				while(j--){
					if(distanceSquared(pts[j],[x,y]) < toleranceSquared ){
						tooClose = true;
						break;
					}
				}
				if(tooClose){ 
					i--;
					continue;
				}
				else pts.push([x,y]);
			}
			
			return pts;
		},
		triangleGrid: function(x0,y0,w,h,r){
			
			var r2 = r * 2,
				r05 = r * 0.5,
				row = sqrt3 * r05,
				points =[],
				odd = false,
				x, y, nx=w+r, ny=h+row,i,off;
				
			
			for( y = 0; y < ny ; y += row) {
				
				if (odd){
					
					off =  r05;
					i = 1;
				}
				else off = i = 0;
				
				for( x = r05; x < nx ; x += ( i++ & 1 ? r : r2 )){
					
					points.push([ x0 + x + off, y0 + y]);
				}
				odd = !odd;
			}
			
			return points;
		},
		hexGrid: function(x0,y0,w,h,radius,pointy){
			
			var apothem = sqrt32*radius,
				points =[],
				odd=false, 
				j = 0,
				stepx,stepy,x,y,nx,ny;
			
			if(!!pointy){
				
				stepx = 2*apothem;
				stepy = radius*1.5;
				
			}else{
				stepx = radius*1.5;
				stepy = 2*apothem;
				
			}
			
			for( y = 0, ny = h + stepy; y < ny ; y += stepy){
				
				j = 0;
				
				for( x = 0, nx = w + stepx; x < nx ; x += stepx){
					
					if(!!pointy)
						points.push([ x0 + x + ( odd ? 0 : apothem ), y0 + y ]);
					else
						points.push([ x0 + x , y0 + y - ( j++ & 1 ? 0 : apothem ) ]);
					
				}
				
				odd = !odd;
			}
			
			return points;
		},
		octaGrid: function(x0,y0,w,h,r){
			
			
			var step=0.92388 * 2 * r,
				points =[],
				x,y,nx,ny;
		
			for( y = 0, ny = h + step; y < ny ; y += step){
				
				for( x = 0, nx = w + step; x < nx ; x += step){
					
						points.push([ x0 + x , y0 + y]);
				}
			}
			return points;
		},
		squareGrid: function( x0, y0, w, h, size, bricks){
			
			var half = size*0.5,
				size15 = size+half,
				pts =[],
				odd = false,
				o = half,
				x,y,nx,ny;
			
			for( y = 0, ny = h + size15; y < ny ; y += size ){
				
				if(!!bricks) o = odd  ? half : 0;
				
				for( x = 0, nx = w + size15 ; x < nx ; x += size ){
					
					pts.push( [ x0 + x - o, y0 + y - half ] );
				}
				odd = !odd;
			}
			return pts;
		},
		isometricGrid: function( x0, y0, w, h, size){
			
			var half = size*0.5,
				size15 = size+half,
				quart = size*0.25,
				pts =[],
				odd = false,
				o = half,
				x,y,nx,ny;
			
			for( y = 0, ny = h + size15; y < ny ; y += quart ){
				
				o = odd ? 0 : half;
				
				for( x = 0, nx = w + size15 ; x < nx ; x += size ){
					
					pts.push( [ x0 + x + o, y0 + y] );
				}
				odd = !odd;
			}
			return pts;
		}
	
	};
};






