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