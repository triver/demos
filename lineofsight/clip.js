;(function(global){

function inside(p, cp1, cp2) {
    return (cp2[0]-cp1[0])*(p[1]-cp1[1]) > (cp2[1]-cp1[1])*(p[0]-cp1[0]);
}
 function intersection (s,e,cp1,cp2) {
    var dc = [ cp1[0] - cp2[0], cp1[1] - cp2[1] ],
        dp = [ s[0] - e[0], s[1] - e[1] ],
        n1 = cp1[0] * cp2[1] - cp1[1] * cp2[0],
        n2 = s[0] * e[1] - s[1] * e[0], 
        n3 = 1.0 / (dc[0] * dp[1] - dc[1] * dp[0]);
    return [(n1*dp[0] - n2*dc[0]) * n3, (n1*dp[1] - n2*dc[1]) * n3];
}
function clip( subjectPolygon, clipPolygon) {
            
	
	var outputList = subjectPolygon;
	
	var cp1 = clipPolygon[clipPolygon.length-1];
	
	 for (var j =0; j< clipPolygon.length;j++) {
					
				   var cp2 = clipPolygon[j];
					var inputList = outputList;
					outputList = [];
					
				   var  s = inputList[inputList.length - 1]; //last on the input list
				   
					for (var i = 0; i< inputList.length; i++) {
						
					   var e = inputList[i];
					 
						if (inside(e, cp1, cp2)) {
							
							if (!inside(s, cp1, cp2)) {
								outputList.push(intersection(s,e,cp1,cp2));
							}
							outputList.push(e);
						}
						else if (inside(s, cp1, cp2)) {
							outputList.push(intersection(s,e,cp1,cp2));
						}
						
						s = e;
					}
				
					cp1 = cp2;
				  
	}
	return outputList
}
global.Clip = clip
})(this);
