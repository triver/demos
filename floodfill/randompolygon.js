(function(global){
	
function distanceFromALine(point, line) {

	var x0 = point[0],
		y0 = point[1],
		indexOfLastPoint = line.length-1,
		x1 = line[0][0],
		y1 = line[0][1],
		x2 = line[indexOfLastPoint][0],
		y2 = line[indexOfLastPoint][1];
   
	var numerator = Math.abs( ((y2-y1)*x0) - ((x2-x1)*y0) + (x2*y1) - (y2*x1) );
	var denominator = Math.sqrt( Math.pow((y2-y1),2) + Math.pow((x2-x1),2) );
	return numerator / denominator;
}


function farthestPoint(line) {
	
	var candidates = line.slice(1,-1);
	var farthest = candidates.reduce( function(p,c, i) {
	   
		var distance = distanceFromALine(c, line);
	   
		if (p.distance > distance) {
			return p;
		} else {
			return {index: i, distance: distance};
		}
		
	}, {index: undefined, distance: 0});
	
	return farthest;
}

function simplify(line, tollerance) {
  
	if (line.length <= 2) {
		return line;
	}
	var fp = farthestPoint(line);
   
	if (fp.distance <= tollerance) {
	   
		return [line[0], line[line.length-1]];
	} else {
		var firstLine = line.slice(0,fp.index+2),
			secondLine = line.slice(fp.index+1);
	  
		var simplifiedFirstLine = simplify(firstLine, tollerance),
			simplifiedSecondLine = simplify(secondLine, tollerance);            
		   
		return simplifiedFirstLine.concat(simplifiedSecondLine.slice(1));
	}
}	
function checkPoint(a, b, c) {
			
	var cross = (a[0] - b[0]) * (c[1] - b[1]) - (a[1] - b[1]) * (c[0] - b[0]);
	var dot = (a[0] - b[0]) * (c[0] - b[0]) + (a[1] - b[1]) * (c[1] - b[1]);
	return cross < 0 || (cross == 0 && dot <= 0);
}

function convexHull(points) {

	points.sort(function (a, b) {
		return a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]
	})

	var n = points.length,hull = [],l = 2*n, i = 0;

	for (; i < l; ++i) {
		var j = i < n ? i : l - 1 - i;
		while (hull.length >= 2 && checkPoint(hull[hull.length - 2], hull[hull.length - 1], points[j])){
			hull.pop()
            }
		hull.push(points[j])
	}

	hull.pop()
	
	return hull
	
	
}
function dist2(p1,p2){
	return (p2[0] - p1[0])*(p2[0] - p1[0]) + ((p2[1] - p1[1])*(p2[1] - p1[1]))
}	
function randomPoints(n,r,size){
	
	var r2 = r*r
			
	var pts =[]
	var c = [ r, r ]
	
	while( pts.length < n) {
		
		var p = [ Math.random()*size, Math.random()*size]
		
		if(dist2( c, p ) < r2)
			pts.push(p)
	}
	
	return pts
}

function randomPolygon(x,y, r, n, t){
			
			
	t=t||30
	n=n||100
	var size = r*2
	
	var pts = randomPoints( n, r, size ) 
	
	var hull =  simplify( convexHull( pts ) ,t ).slice(0,-1) 
	var out=[]
	for(var i=0; i<hull.length;i++){
		
		out.push([
			x + hull[i][0] - r, 
			y + hull[i][1] - r
		])
	}
	
	return out
	
	
}
global.RandomPolygon = randomPolygon
})(this);
