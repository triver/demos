var SvgCanvas = function( container, w,h){
	
	if(!container) return;
	
	w = w || 300;
	h = h || 300;
	
	var ns = 'http://www.w3.org/2000/svg'
	
	var svg = document.createElementNS( ns,'svg');
	
	svg.setAttributeNS(null,'viewBox', ''+(-w/2)+' '+(-h/2)+' '+w+' '+h+'');
	svg.setAttributeNS(null,'preserveAspectRatio','xMidYMid meet');
	svg.setAttributeNS(null,'class','svg-canvas');
	
	
	var center = { x: w/2, y: h/2 };
	
	container.appendChild(svg);
	
	return {
		
		canvas: svg,
		center: center,
		createElement: function(type,attr,parent){
	
			if(!type) return;
			
			attr = attr || {};
			parent = parent ? parent.element : this.canvas;
			
			var elm = document.createElementNS(ns, type);
			var p;
			
			for( p in attr){
				
				elm.setAttributeNS(null,p,attr[p]);
			}
			parent.appendChild(elm);
			
			return elm;
			
		},
		transform: function(cx,cy,tx,ty,sx,sy,a){
	
			var sin = Math.sin(a);
			var cos = Math.cos(a);
			return [ sx*cos,
				 sy*sin, 
				-sx* sin, 
				 sy*cos, 
				-cx * cos*sx + cy * sin*sx + cx +tx, 
				-cx * sin*sy - cy * cos*sy + cy+ty];
		},
		getPolygonCentroid: function (pts){
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
		},
		transformPoint: function(p,m){
			
			var x = m[0]*p[0] + m[2]*p[1] + m[4];
			var y = m[1]*p[0] + m[3]*p[1] + m[5];
			return [x,y];
		},
		getTransformedPolygonPoints: function(poly){
			
			var pts = poly.element.points, 
				n = pts.length,
				p=[],
				i;				
			for(i = 0; i < n; i++ ){
				p.push(  this.transformPoint( [ pts[i].x, pts[i].y ], poly.matrix )   );
			}
			
			return p;
		},
		transformPolygonPoints:function(cx,cy,tx,ty,sx,sy,a,pts){
			
			var m = this.transform(cx,cy,tx,ty,sx,sy,a),
				n= pts.length,newPoints=[],
				i=0;
				
			for (i = 0; i < n; i++) {
				newPoints.push( this.transformPoint(pts[i],m));
			}
			return newPoints;
		},
		getTransformedPolygonArea: function(poly){
			
			var p = this.getTransformedPolygonPoints(poly), 
				n = p.length,
				area=0,
				i,i1;
			
			for (i = 0; i < n; i++) {
			
			  i1 = (i + 1) % n;
			  area += (p[i][1] + p[i1][1]) * (p[i1][0] - p[i][0]) / 2.0;
			}
			
			return Math.abs(area);
		},
		transformCanvas: function(cx,cy,tx,ty,sx,sy,a){
			
			var m = this.transform(cx,cy,tx,ty,sx,sy,a);
			this.canvas.setAttribute('transform', 'matrix('+m.join(',')+')' );
		},
		element: function(type,attr,parent){
	
			if(!type) return;
			
			var elm = this.createElement(type,attr,parent);
			var self = this;
			
			function getCenter(){
				
				try{ var box = elm.getBBox(); } catch(e){ return { x:0, y:0 }; };
				return {x:  box.x + box.width / 2, y: box.y + box.height / 2 };
			}
			
			var center = getCenter();
			
			if(parent && parent.update ) parent.update();
				
			
			return {
				
				element: elm,
				center: center,
				name: elm.nodeName,
				matrix: self.transform( center.x, center.y, 0, 0, 1, 1, 0),
				update: function(){
					this.center = getCenter();
				},
				transform: function(cx,cy,tx,ty,sx,sy,a){
					
					var m = self.transform(cx,cy,tx,ty,sx,sy,a);
					this.setAttr( 'transform', 'matrix('+m.join(',')+')' );
					this.matrix = m;
				},
				setValue: function(prop,val){
					elm[prop].baseVal.value = val;
				},
				getValue: function(prop){
					return elm[prop].baseVal.value;
				},
				setAttr: function(prop,val){
					
					elm.setAttributeNS(null,prop,val);
				},
				getAttr: function(prop){
					
					return elm.getAttribute(prop);
				},
				setStyle: function(prop,val){
					
					elm.style[prop] = val;
				},
				getStyle: function(prop){
					
					return elm.style[prop];
				},
				html: function(html){
					
					elm.insertAdjacentHTML('beforeend', html);
					this.update();
				}
				
			};
		},
		text: function(str,attr,parent){
	
			var elm = this.element('text',attr,parent);
			var node = document.createTextNode(str);
			elm.element.appendChild(node);
			elm.update();
			if(parent) parent.update();
			
			return elm;
		},
		layer: function(attr,parent){
	
			return this.element('g',attr,parent);
		},
		regularPolygon: function( x, y, n, r, t, attr, parent){
			
			t = t || 0;
			
			if(n < 3) return;
			
			var poly = this.element('polygon',attr,parent);
			var pts ='',
				step=Math.PI*2/n,
				a=0,
				i=n;
			while(i--){
				a = step*i + t;
				pts += (x + Math.cos(a)*r)+','+(y + Math.sin(a)*r)+' ';
			}
			
			poly.setAttr('points',pts.trim());
			poly.update();
			if(parent) parent.update();
			return poly;
		}
		
	};
	
};
