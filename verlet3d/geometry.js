var Geometry =(function(){
	
	var t = 1.618033988749895; // golden ratio 1 + sqrt(5) / 2
	var c = 0.618033988749894; // golden ratio inverted 1 - sqrt(5) / 2
	var pi = 3.141592653589793; //Math.PI;
	var pi2 =  6.283185307179586; //Math.PI*2;
	var sqrt2 = 1.4142135623730951; //Math.sqrt(2);
	var sqrt3 =  1.7320508075688772; //Math.sqrt(3);
	function randomFloat(min,max){
		return Math.random() * ( max - min ) + min;
	}
	function polygonCentroid(pts){
		var centroid = [0,0];
		var signedArea = 0.0;
		var x0 = 0.0; 
		var y0 = 0.0;
		var x1 = 0.0;
		var y1 = 0.0;
		var a = 0.0;
		var l = pts.length;
		
		var i=0;
		for (i=0; i<l; ++i)
		{
			x0 = pts[i][0];
			y0 = pts[i][1];
			x1 = pts[(i+1) % l][0];
			y1 = pts[(i+1) % l][1];
			a = x0*y1 - x1*y0;
			signedArea += a;
			centroid[0] += (x0 + x1)*a;
			centroid[1] += (y0 + y1)*a;
		}

		signedArea *= 0.5;
		centroid[0] /= (6.0*signedArea);
		centroid[1] /= (6.0*signedArea);

		return centroid;
	}
	function normalize(p){
		
		var len = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]);
		
		if(len === 0) {
			return p;
		}
		var num = 1.0 / len;
		p[0] *= num;
		p[1] *= num;
		p[2] *= num;
		
		return p;
	}
	
	function subdivide(base) {
	
		var positions = base[0]
		var cells = base[1]
		var newCells = []
		var newPositions = []
		var midpoints = {}
		
		var l = 0

		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i]
			var c0 = cell[0]
			var c1 = cell[1]
			var c2 = cell[2]
			var v0 = positions[c0]
			var v1 = positions[c1]
			var v2 = positions[c2]

			var a = getMidpoint(v0, v1, midpoints)
			var b = getMidpoint(v1, v2, midpoints)
			var c = getMidpoint(v2, v0, midpoints)

			var ai = newPositions.indexOf(a)
			if (ai === -1) ai = l++, newPositions.push(a)
			var bi = newPositions.indexOf(b)
			if (bi === -1) bi = l++, newPositions.push(b)
			var ci = newPositions.indexOf(c)
			if (ci === -1) ci = l++, newPositions.push(c)

			var v0i = newPositions.indexOf(v0)
			if (v0i === -1) v0i = l++, newPositions.push(v0)
			var v1i = newPositions.indexOf(v1)
			if (v1i === -1) v1i = l++, newPositions.push(v1)
			var v2i = newPositions.indexOf(v2)
			if (v2i === -1) v2i = l++, newPositions.push(v2)

			newCells.push([v0i, ai, ci])
			newCells.push([v1i, bi, ai])
			newCells.push([v2i, ci, bi])
			newCells.push([ai, bi, ci])
		}

		return [ newPositions, newCells ]
		
		function getMidpoint(a, b, midpoints) {
			var point = midpoint(a, b)
			var pointKey = pointToKey(point)
			var cachedPoint = midpoints[pointKey]
			if (cachedPoint) {
			  return cachedPoint
			} else {
			  return midpoints[pointKey] = point
			}
		}

		function pointToKey(point) {
			return point[0].toPrecision(6) + ','
				 + point[1].toPrecision(6) + ','
				 + point[2].toPrecision(6);
		}

		function midpoint(a, b) {
			return [
				(a[0] + b[0]) / 2,
				(a[1] + b[1]) / 2,
				(a[2] + b[2]) / 2
			];
		}

		
	}
	
	function cartesian(pts){
	
	
		var rx = range(0);
		var ry = range(1);
		var r = rx;
		
		if(rx[1] - rx[0] < ry[1] - ry[0]) r = ry; 
		
		return pts.map(function(p){
			
			return [ convert( p[0] , r,[1,-1]) , convert( p[1] , r ,[1,-1] )];
		});
		
		function convert( value, r1, r2 ) { 
			return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
		}
		
		function range(n){
			
			function x(a){
				return a[n];
			}
			return [Math.min.apply(null, pts.map(x)), Math.max.apply(null, pts.map(x)) ];
		}
		
	}
	function isConvex(pts){
	
		if (pts.length < 4) return true;
		
		var convex =false;
		var n = pts.length;
		
		for(var i=0;i<n;i++)
		{
			var dx1 = pts[(i+2)%n][0] - pts[(i+1)%n][0];
			var dy1 = pts[(i+2)%n][1] - pts[(i+1)%n][1];
			
			var dx2 = pts[i][0] - pts[(i+1)%n][0];
			var dy2 = pts[i][1] - pts[(i+1)%n][1];
			
			var cross = dx1*dy2 - dy1*dx2;
			
			if (i===0)
				convex = cross > 0;
			else
			{
				if (convex !== (cross > 0))
					return false;
			}
		}
		return true;
	}
	function convexHull(points) {
		
		points.sort(function (a, b) {
			return a[0] != b[0] ? a[0] - b[0] : a[1] - b[1];
		});

		var n = points.length,hull = [],l = 2*n, i = 0;

		for (; i < l; ++i) {
			var j = i < n ? i : l - 1 - i;
			while (hull.length >= 2 && checkPoint(hull[hull.length - 2], hull[hull.length - 1], points[j]))
				hull.pop();
			hull.push(points[j]);
		}

		hull.pop();
		
		return hull;
		
		function checkPoint(a, b, c) {
			var cross = (a[0] - b[0]) * (c[1] - b[1]) - (a[1] - b[1]) * (c[0] - b[0]);
			var dot = (a[0] - b[0]) * (c[0] - b[0]) + (a[1] - b[1]) * (c[1] - b[1]);
			return cross < 0 || cross == 0 && dot <= 0;
		}
	}
	function sortCCW( pts, c){
	
		c = c || centroid(pts);
		
		return pts.sort(function(a,b){
		
			if (a[0] - c[0]  >= 0 && b[0]  - c[0]  < 0)
				return false;
			if (a[0]  - c[0]  < 0 && b[0]  - c[0]  >= 0)
				return true;
			if (a[0]  - c[0]  == 0 && b[0]  - c[0]  == 0) {
				if (a[1]  - c[1]  >= 0 || b[1]  - c[1]  >= 0)
					return a[1]  < b[1] ;
				return b[1]  < a[1] ;
			}

			// compute the cross product of vectors (center -> a) x (center -> b)
			var det = (a[0]  - c[0] ) * (b[1]  - c[1] ) - (b[0]  - c[0] ) * (a[1]  - c[1] );
			if (det < 0)
				return false;
			if (det > 0)
				return true;

			// points a and b are on the same line from the center
			// check which point is closer to the center
			var d1 = (a[0]  - c[0] ) * (a[0] - c[0] ) + (a[1]  - c[1] ) * (a[1]  - c[1] );
			var d2 = (b[0]  - c[0] ) * (b[0]  - c[0] ) + (b[1]  - c[1] ) * (b[1]  - c[1] );
			return d1 < d2;
		});
		
		function centroid(points) {
	
		  var l = points.length;

		  return points.reduce(function(center, p, i) {
			center[0] += p[0];
			center[1] += p[1];

			if(i === l - 1) {
				center[0] /= l;
				center[1] /= l;
			}

			return center;
		  },[ 0, 0 ]);
		}
	}
	
	function isClockwise(points) {
		var a = 0;
		var i, j = 0;
		for (i = 0; i < points.length; i++) {
			j = i + 1;
			if (j == points.length) j = 0;
			a += points[i][0] * points[j][1] - points[i][1] * points[j][0];
		}
		return a > 0;
	}
	function normal(p1,p2,p3){
		
		var u = [ p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2] ];
		var v = [ p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2] ];
		
		var nx = u[1]*v[2] - u[2]*v[1];
		var ny = u[2]*v[0] - u[0]*v[2];
		var nz = u[0]*v[1] - u[1]*v[0];
		
		
		return normalize( [ nx, ny, nz] );
	}
	function getNormals(faces,verts){
		
		var i,l=faces.length,j,f,normals=[],p1,p2,p3;
		
		for(i=0;i<l;i++){
			
			f=faces[i];
			
			p1= verts[f[0]];
			p2= verts[f[1]];
			p3= verts[f[2]];
			
			
			normals.push(normal(p1,p2,p3));
		}
		
		return normals;
	}
	/*
	function getFaceCenter(v){
		var i = l = v.length;
		var sx = sy = sz =0;
		while(i--){
			
			sx += v[i].x;
			sy += v[i].y;
			sz += v[i].z;
		}
		return [sx/l,sy/l,sz/l];
	}
	function triangulate(g){
		
		var v=[],f=[],n=[];
		var verts=g[0],faces=g[1];
		
		for(var i=0,l=faces.length;i<l;i++){
			
			var a =[];
			for(var j=0,lj=faces[i].length;j<lj;j++) a.push( verts[ faces[i][j] ] );
			
			var c = getFaceCenter(a);
			
			for(var k=0,la=a.length;k<la;k++){
				
				//??????
			}
		}
		
	}
	*/
	/*==========================================================*/
	
	return {
		
		//PLATONIC SOLIDS
		tetrahedron: function(){
			
			var v = [
				[ 1, 1, 1],
				[ 1,-1,-1],
				[-1, 1,-1],
				[-1,-1, 1]
			];
			var f =[
				[0,2,1],
				[0,1,3],
				[0,3,2],
				[2,3,1]
			];
			
			v = v.map(normalize);
			var n = getNormals(f,v);
			return [ v ,f, n ];
		},
		hexahedron: function(){
	
			var v = [
				[ 1, 1, 1],
				[ 1,-1, 1],
				[-1,-1, 1],
				[-1, 1, 1],
				[ 1, 1,-1],
				[ 1,-1,-1],
				[-1,-1,-1],
				[-1, 1,-1]
				
			];
			var f = [
				[1,2,3,0],
				[7,6,5,4],
				[2,6,7,3],
				[5,1,0,4],
				[3,7,4,0],
				[5,6,2,1]
			];
			
			v = v.map(normalize);
			var n = getNormals(f,v);
			return [ v ,f, n ];

		},
		octahedron: function(){
	
			var v = [
				[ 0, 1, 0],
				[ 1, 0, 0],
				[ 0, 0, 1],
				[-1, 0, 0],
				[ 0, 0, -1],
				[ 0,-1, 0]
			
			];
			var f =[
				[0,1,2],
				[0,2,3],
				[0,3,4],
				[0,4,1],
				
				[5,2,1],
				[5,3,2],
				[5,4,3],
				[5,1,4]
			];
			
			v = v.map(normalize);
			var n = getNormals(f,v);
			return [ v ,f, n ];
		},
		icosahedron: function(){
			var v = [
				[-1,  t,  0],
				[ 1,  t,  0],
				[-1, -t,  0],
				[ 1, -t,  0],
				[ 0, -1,  t],
				[ 0,  1,  t],
				[ 0, -1, -t],
				[ 0,  1, -t],
				[ t,  0, -1],
				[ t,  0,  1],
				[-t,  0, -1],
				[-t,  0,  1]
			];
			
			var f = [
				[5,11,0],
				[1,5,0],
				[7,1,0],
				[10,7,0],
				[11,10,0],
				[9,5,1],
				[4,11,5],
				[2,10,11],
				[6,7,10],
				[8,1,7],
				[4,9,3],
				[2,4,3],
				[6,2,3],
				[8,6,3],
				[9,8,3],
				[5,9,4],
				[11,4,2],
				[10,2,6],
				[7,6,8],
				[1,8,9]
			];
			
			v = v.map(normalize);
			var n = getNormals(f,v);
			return [ v ,f, n ];
		},
		dodecahedron: function(){
			
			var v = [
				//cube
				[ 1, 1, 1],
				[ 1, 1,-1],
				[ 1,-1,-1],
				[-1,-1,-1],
				[-1,-1, 1],
				[-1, 1, 1],
				[-1, 1,-1],
				[ 1,-1, 1],
				//12 new
				[ 0, c, t],
				[ c, t, 0],
				[ t, 0, c],
				[ 0,-c, t],
				[-c, t, 0],
				[ t, 0,-c],
				[ 0, c,-t],
				[ c,-t, 0],
				[-t, 0, c],
				[ 0,-c,-t],
				[-c,-t, 0],
				[-t, 0,-c]
				
			];
			var f =[
				[6,14,1,9,12 ],
				[0,8,5,12,9  ],
				[18,4,11,7,15],
				[2,17,3,18,15],
				[2,13,1,14,17],
				[14,6,19,3,17],
				[4,16,5,8,11 ],
				[8,0,10,7,11 ],
				[16,19,6,12,5],
				[4,18,3,19,16],
				[13,10,0,9,1 ],
				[15,7,10,13,2]
			];
			
			
			v = v.map(normalize);
			var n = getNormals(f,v);
			return [ v ,f, n ];

		},
		
		
		//TRUNCATED SOLIDS
		truncatedTetrahedron: function(){
		
			var v = [
				[3,1,1],
				[1,3,1],
				[1,1,3],
				
				[-3,-1,1],
				[-1,-3,1],
				[-1,-1,3],
				
				[-3,1,-1],
				[-1,3,-1],
				[-1,1,-3],
				
				[3,-1,-1],
				[1,-3,-1],
				[1,-1,-3]
				
			];
			var f =[
				[0,2,1],
				[3,5,4],
				[6,8,7],
				[9,11,10],
				[1,7,8,11,9,0],
				[7,1,2,5,3,6],
				[4,5,2,0,9,10],
				[10,11,8,6,3,4]
			];
			
			
			v = v.map(normalize);
			var n = getNormals(f,v);
			return [ v ,f, n ];

		},
		truncatedHexahedron: function(e){
			if(e === 0) e = 0.0000001;//strange behavior when zero
			e = e || 0.25;
			var v = [
				[e,1,1],
				[1,e,1],
				[1,1,e],
				
				[-e,-1,-1],
				[-1,-e,-1],
				[-1,-1,-e],
				
				[-e,1,1],
				[-1,e,1],
				[-1,1,e],
				
				[e,-1,1],
				[1,-e,1],
				[1,-1,e],
				
				[e,1,-1],
				[1,e,-1],
				[1,1,-e],
				
				[-e,-1,1],
				[-1,-e,1],
				[-1,-1,e],
				
				[e,-1,-1],
				[1,-e,-1],
				[1,-1,-e],
				
				[-e,1,-1],
				[-1,e,-1],
				[-1,1,-e]
				
			];
			var f =[
				[10,9,15,16,7,6,0,1],
				[7,16,17,5,4,22,23,8],
				[2,14,13,19,20,11,10,1],
				[13,12,21,22,4,3,18,19],
				[6,8,23,21,12,14,2,0],
				[5,17,15,9,11,20,18,3],
				[2,1,0],
				[7,8,6],
				[10,11,9],
				[17,16,15],
				[4,5,3],
				[13,14,12],
				[20,19,18],
				[23,22,21]
			];
			
			
			v = v.map(normalize);
			var n = getNormals(f,v);
			return [ v ,f, n ];

		},
		truncatedOctahedron: function(){
			
			var v = [
	
				[ 0, 1,2],
				[ 0, 2,1],
				[1, 0, 2],
				[ 2, 0, 1],
				[1, 2, 0],
				[ 2, 1,0],
				
				[ 0, -1,-2],
				[ 0, -2,-1],
				[-1, 0, -2],
				[ -2, 0, -1],
				[-1, -2, 0],
				[ -2, -1,0],
				
				[-1, 0, 2],
				[ -2, 0, 1],
				[-1, 2, 0],
				[ -2, 1,0],
				
				[ 0, -1,2],
				[ 0, -2,1],
				[1, -2, 0],
				[ 2, -1,0],
				
				[ 0, 1,-2],
				[ 0, 2,-1],
				[1, 0, -2],
				[ 2, 0, -1]
				
			];
			
			var f =[
				//hexagons
				[1,4,5,3,2,0],
				[8,9,11,10,7,6],
				[1,0,12,13,15,14],
				[2,3,19,18,17,16],
				[5,4,21,20,22,23],
				[6,7,18,19,23,22],
				[14,15,9,8,20,21],
				[10,11,13,12,16,17],
				//squares
				[6,22,20,8],
				[3,5,23,19],
				[0,2,16,12],
				[9,15,13,11],
				[1,14,21,4],
				[7,10,17,18]
			
			];
			
			v = v.map(normalize);
			var n = getNormals(f,v);
			return [ v ,f, n ];
		},
		truncatedIcosahedron: function(){ //fotball
			
			var a = 1.618033988749895; //phi
			var b = 3.23606797749979; //phi * 2
			var c =  4.854101966249685; // phi * 3
			var d =  4.23606797749979; //phi power 3
			var e =   3.618033988749895; //phi + 2
			
			var v = [
				[ 0, 1, c],
				[ 0, 1,-c],
				[ 0,-1, c],
				[ 0, -1, -c],
				
				[ 1, c, 0],
				[ 1, -c, 0],
				[-1, c, 0],
				[-1,-c, 0], 
				
				[ c, 0, 1],
				[ c, 0,-1],
				[-c, 0, 1],
				[-c, 0,-1],
				
				[ 2, d, a],
				[ 2, d,-a],
				[ 2,-d, a],
				[ 2,-d,-a],
				
				[ -2, d, a],
				[ -2, d,-a],
				[ -2,-d, a],
				[ -2,-d,-a],
				
				[ d, a, 2],
				[ d, a,-2],
				[ d,-a, 2],
				[ d,-a,-2],
				
				[ -d, a, 2],
				[ -d, a,-2],
				[ -d,-a, 2],
				[ -d,-a,-2],
				
				[ a, 2, d],
				[ a, 2,-d],
				[ a,-2, d],
				[ a,-2,-d],
				
				[ -a, 2, d],
				[ -a, 2,-d],
				[ -a,-2, d],
				[ -a,-2,-d],
				
				[ 1, e, b],
				[ 1, e,-b],
				[ 1,-e, b],
				[ 1,-e,-b],
				
				[ -1, e, b],
				[ -1, e,-b],
				[ -1,-e, b],
				[ -1,-e,-b],
				
				[ e, b, 1],
				[ e, b,-1],
				[ e,-b, 1],
				[ e,-b,-1],
				
				[ -e, b, 1],
				[ -e, b,-1],
				[ -e,-b, 1],
				[ -e,-b,-1],
				
				[ b, 1, e],
				[ b, 1,-e],
				[ b,-1, e],
				[ b,-1,-e],
				
				[ -b, 1, e],
				[ -b, 1,-e],
				[ -b,-1, e],
				[ -b,-1,-e]
			];
			
			var f =[
				//hexagons
				[1,3,31,55,53,29],
				[1,33,57,59,35,3],
				[25,57,33,41,17,49],
				[43,35,59,27,51,19],
				[11,25,49,48,24,10],
				[51,27,11,10,26,50],
				[18,50,26,58,34,42],
				[34,58,56,32,0,2,34],
				[32,56,24,48,16,40],
				[18,42,38,14,5,7],
				[36,40,16,6,4,12],
				[30,2,0,28,52,54],
				[14,38,30,54,22,46],
				[52,28,36,12,44,20],
				[46,22,8,9,23,47],
				[21,9,8,20,44,45],
				[15,47,23,55,31,39],
				[29,53,21,45,13,37],
				[5,15,39,43,19,7],
				[17,41,37,13,4,6],
				
				//pentagons
				[57,25,11,27,59],
				[31,3,35,43,39],
				[41,33,1,29,37],
				[19,51,50,18,7],
				[26,10,24,56,58],
				[16,48,49,17,6],
				[42,34,2,30,38],
				[0,32,40,36,28],
				[22,54,52,20,8],
				[23,9,21,53,55],
				[14,46,47,15,5],
				[13,45,44,12,4]
			];
			
			v = v.map(normalize);
			var n = getNormals(f,v);
			return [ v ,f, n ];
		},
		//MISSING!!! truncatedDodecahedron
		
		
		//GEOMETRY
		cuboid: function(w, h, l) { // defaults to cube
		
			w = w || 1.0;
			h = h || 1.0;
			l = l || 1.0;
			
			var v = [
				[-w,-h,-l],
				[ w,-h,-l],
				[ w, h,-l],
				[-w, h,-l],
				[-w,-h, l],
				[-w, h, l],
				[ w, h, l],
				[ w,-h, l]
			];
			var f = [
				[1,2,3,0],
				[5,6,7,4],
				[7,6,2,1],
				[3,5,4,0],
				[4,7,1,0],
				[2,6,5,3]
			];
			
			
			var n = getNormals(f,v);
			return [ v ,f, n ];
		},
		cone: function cone(r,h,n){ // defaults to square pyramid
			
			
			r = r || 1.0;
			n = n || 4;
			h = h || r;
			
			if(!arguments.length) h = 1 / sqrt2 * ( (2 * r) / sqrt2 ) ;
			
			
			var delta = pi2 / n,
				half = h / 2,
				i=0,
				v =[[ 0, half, 0]],
				f=[],
				bottom=[],
				theta=0;
				
			for(;i<n;i++){
				
				theta = i * delta;
				v.push( [ Math.cos(theta)*r, -half, Math.sin(theta)*r] );
				f.push( [ i + 1, ( i + 1 ) % n + 1, 0] );
				bottom.unshift(i + 1);
			}
			
			f.push(bottom);
			var n = getNormals(f,v);
			return [v, f, n];
		},
		polygon: function(n,r,h){
	
			n = n || 6;
			r = r || 1;
			h = h || (2 * r * Math.sin( pi / n )); // Make height sime as side
			
			var delta = pi2 / n,
				half = h / 2,
				i=0,
				v = [],
				f = [],
				l= n * 2,
				bottom =[],
				top = [],
				theta, x, y, j;
				
			for(;i<n;i++){
				
				theta = i * delta;
				j = i * 2;
				x = Math.cos(theta) * r;
				y = Math.sin(theta) * r;
				
				v.push( [ x, -half, y] , [ x, half, y] );
			
				f.push( [(j + 2) % l,(j + 3) % l,(j + 1) % l , j] );
				
				top.unshift(l - 1 - j);
				bottom.unshift(j);
			}
			f.unshift(top,bottom);
			
			
			var n = getNormals(f,v);
			return [ v ,f, n ];
		},
		sphere: function sphere (n1, n2){
	
			n1 = n1 || 10; //rows
			n2 = n2 || n1; // cols
			
			
			var deltaTheta = pi / ( n1 + 1 );
			var deltaPhi = pi2 / n2;
			var phi = theta = 0;
			var i, j, row, row2, col, sin, cos;
			var v =[];
			var f = [];
			
			//pole 1
			v.push( [ 0, 1, 0 ]);
			for(i=1; i < n2 + 1; i++) f.push( [ 0 , i, i === n2 ? 1 : i + 1] );
			
			
			for(i=0; i < n1; i++){ 
			
				row = i * n2;
				row2 = ((i+1) % n1)*n2;
				
				theta += deltaTheta;
				sin = Math.sin( theta );
				cos = Math.cos( theta );
				
				
				for(j=0; j < n2; j++){ 

					phi += deltaPhi;
					
					v.push( [ sin * Math.cos(phi), cos, sin * Math.sin(phi) ] );

					col = (j + 1) % n2;
					
					if(i < n1 - 1 ) f.push([ row + j + 1, row2 + j +1, row2 + col + 1, row + col + 1]);					
				}
			}
			
			//pole 2
			var l = v.length;
			v.push([ 0, -1, 0 ]);
			
			for(i=1; i < n2 + 1; i++) f.push( [ l , l - i , i === n2 ? l - 1 : l - i - 1 ]);
				
			
			
			var v = v.map(normalize);
			var n = getNormals(f,v);
			
			return [ v ,f, n ];
		},
		icosphere: function(subs){
			
			subs = subs || 1;
			
			var base = this.icosahedron();
			
			
			while (subs-- > 0) base = subdivide(base);
			
			var v = base[0].map(normalize);
			var f = base[1];
			var n = getNormals(f,v);
			return [ v ,f, n ];
			
			
		},
		antiprism: function(n,r,h){
			
			r = r || 1.0;
			n = n || 6;
			
			var theta = pi / n;
			
			if(!h){
				
				//calc height of uniform antiprism
				
				var side = 2 * r * Math.sin( theta );   // Triangle side length
				var c = sqrt3 / 2 * side;        // Triangle height
				var b = r - ( r * Math.cos( theta) );   // R - r
				
				
				h = Math.sqrt( (c*c) - (b*b) );//Phtagorean 
				
			}
			
			var step = theta*2,
				half = h/2,
				i = 0,
				v = [],
				f = [],
				l = n*2,
				bottom = [],
				top = [],
				a,j,x,y,x2,y2;
				
			for(;i<n;i++){
				
				a  = i*step;
				j  = i*2;
				x  = Math.cos(a) * r;
				y  = Math.sin(a) * r;
				x2 = Math.cos(a - theta) * r;
				y2 = Math.sin(a - theta) * r;
				
				v.push( [ x, -half, y ], [ x2, half, y2] );
				
				
				f.push([ j,  (j + 3) % l, (j + 1) % l ]);
				f.push([ j, (j + 2) % l, (j + 3) % l ]);
				
				
				top.unshift(l - 1 - j);
				bottom.unshift(j);
			}
			
			f.unshift(top,bottom);
			var n = getNormals(f,v);
			return [v, f, n];
		},
		torus: function torus(n1,n2, r1,r2){
	
			r1 = r1 || 0.7;
			r2 = r2 || 0.35;
			n1 = n1 || 8;
			n2 = n2 || 6;
			
			var PI2 = Math.PI*2;
			var v = [];
			var f = [];
			var deltaTheta = PI2 / n1;
			var deltaPhi = PI2 / n2;
			var theta = phi = 0;
			var i, j, sin, cos, d, row, row2, col;
			
			for(i=0; i < n1; i++){
				
				cos = Math.cos(theta);
				sin = Math.sin(theta);
				row = i*n2;
				row2 = ((i+1) % n1)*n2;
				
				for(j=0; j < n2; j++){
					
					d = r1 + r2 * Math.cos(phi);
					col = ((j + 1) % n2);
					
					v.push( [ cos * d, sin * d, r2 * Math.sin(phi)] );
					f.push([ row + j, row + col, row2 + col, row2 + j]);
					
					phi += deltaPhi;
				}
				
				theta += deltaTheta;
			}
			
			var n = getNormals(f,v);
			return [ v, f, n ];
		},
		frame: function(l,w){
			
			l = l || 0.5;
			w = w || 0.5;
			
			var v = [
				[ 1, 1, l],
				[ 1,-1, l],
				[-1,-1, l],
				[-1, 1, l],
				[ w, w, l],
				[ w,-w, l],
				[-w,-w, l],
				[-w, w, l],
				
				[ 1, 1, -l],
				[ 1,-1, -l],
				[-1,-1, -l],
				[-1, 1, -l],
				[ w, w, -l],
				[ w,-w, -l],
				[-w,-w, -l],
				[-w, w, -l]
			];
			var f =[
				[0,1,5,4],
				[1,2,6,5],
				[2,3,7,6],
				[3,0,4,7],
				
				[0,3,11,8],
				[0,8,9,1],
				[3,2,10,11],
				[2,1,9,10],
				
				[8,12,13,9],
				[9,13,14,10],
				[10,14,15,11],
				[8,11,15,12],
				
				[4,5,13,12],
				[6,7,15,14],
				[7,4,12,15],
				[5,6,14,13]
			];
			
			
			return [ v , f ];
			
		},
		extrude: function(pts,depth,convex){
			
			pts = pts || [[0,0],[50, (sqrt3/2)*100],[ 100,0]];
			
			if(!!convex) 
				pts = convexHull(pts);
			
			if(isClockwise(pts)) pts = sortCCW(pts);
			
			pts = cartesian(pts);
			
			depth = depth || 1;
			
			var d = depth / 2;
			
			var i=0,
				v = [],
				f = [],
				l= pts.length*2,
				bottom =[],
				top = [],
				j,p;
				
			for(; i < pts.length; i++){
				
				p = pts[i];
				j=i*2;
				
				v.push( [ p[0], p[1], -d] , [ p[0],  p[1], d] );
				f.push( [(j + 2) % l,(j + 3) % l,(j + 1) % l , j]);
				
				top.unshift(l - 1 - j);
				bottom.unshift(j);
			}
			f.unshift(top,bottom);
			
			return [ v, f];
		},
		star:function(n,d,r2){// default pentagram
			
			n = n || 5;
			r2 = r2 || 1 - c;
			d = d || 0.5;
			
			var l = n*2,
				delta = pi2/l,
				i = 0,
				pts = [],
				theta = 0,
				r1 = 1,
				r =1,x,y;
			
			for(; i < l; i++){
				
				theta = i*delta;
				r = i%2 === 0 ? r2 : r1;
				
				x = Math.cos(theta)*r;
				y = Math.sin(theta)*r;
				
				pts.unshift([x,y]);
			}
			return this.extrude(pts,d);
		},
		plane:function(sx,sy,triangulate,rand1,rand2,z,rand3){
			
            sx = sx || 1;
            sy = sy || 1;
            z = z || 0;
            rand1 = rand1 || 0;
			rand2 = rand2 || 0;
			rand3 = rand3 || 0;
			
            var w = sx*2;
            var i=0,x,y;
            var v =[];
            var f = [];
            var randx=0;
            var randy=0;
            
            
            for( y = sy; y >= -sy; --y){
                
                for( x = sx; x >= -sx; --x){
                    if(!!rand1){
                        randx = randomFloat(-rand1,rand1);
                        randy = randomFloat(-rand1,rand1);
                    }
                    v.push([x + randx,y + randy, !!rand2 ? randomFloat(0,rand2) : 0]);
                    
                    if((y > -sy && x > -sx)){
                        
                        f.push([i,i+w+1,i+w+2,i+1]);
                    }
                
                    i++;
                }
                
            }
        
            //triangles
            if(!!triangulate){
                
                var n=[],j=0,k=0,face,l=f.length,idx,center,p0,p1,p2,p3;
                
                for(;j<l;j++){
                    
                    k = f[j];
                    p0 = v[k[0]];
                    p1 = v[k[1]];
                    p2 = v[k[2]];
                    p3 = v[k[3]];
                    
                    center = polygonCentroid([p0,p1,p2,p3]);
                    idx = v.length;
                    
                    v.push([center[0], center[1] ,!!rand3 ? randomFloat(0,rand3) : z]);
                    
                    n.push(
                       [idx,k[0],k[1]],
                       [idx,k[1],k[2]], 
                       [idx,k[2],k[3]], 
                       [idx,k[3],k[0]]
                    );
                }
                f = n;
            }
        
            return [v,f];
        }
		
		
	}; //end of returned object
	
	
	
})();
