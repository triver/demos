//Vec2
function Vec2(x,y){
	
	this.x = x || 0;
	this.y = y || 0;
}

Vec2.prototype = {
	clone: function(){
		return new Vec2( this.x, this.y );
	},
	copy: function( v){
		this.x = v.x;
		this.y = v.y;
		return this;
	},
	add: function( v ){
		
		this.x += v.x;
		this.y += v.y;
		return this;
	},
	subtract: function( v ){
		this.x -= v.x;
		this.y -= v.y;
		return this;
	},
	length: function(){
		return Math.sqrt( this.x*this.x + this.y*this.y);
	},
	lengthSq: function(){
		return this.x*this.x + this.y*this.y;
	},
	multiplyScalar: function(s){
		
		this.x *= s;
		this.y *= s;
		return this;
	},
	normalize: function(){
		var l = this.length() || 1;
		this.x /= l;
		this.y /= l;
		return this;
	},
	clamp:function(max){
		
		var l = this.length();
		var m = Math.min( max, l);
		this.x = this.x / l * m;
		this.y = this.y / l * m;
		return this;
	},
	lerp: function ( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;

		return this;

	},
	round: function () {

		this.x = Math.round( this.x );
		this.y = Math.round( this.y );

		return this;

	},
	rotate: function(angle){
		
		var cos = Math.cos(angle);
		var sin = Math.sin(angle);

		var x = this.x * cos - this.y * sin;
		var y = this.x * sin + this.y * cos;
		
		this.x = x;
		this.y = y;
		
		return this;
	},
	dot: function ( v ) {

		return this.x * v.x + this.y * v.y;

	},
	reflect: function( normal ){
		
		return this.subtract( normal.clone().multiplyScalar( 2 * this.dot( normal ) ) );
	},
	negate: function () {

		this.x = - this.x;
		this.y = - this.y;

		return this;

	},
	normal: function(){
		
		return new Vec2( -this.y, this.x).normalize();
	},
	prep: function(){
		
		return new Vec2( -this.y, this.x);
	},
	setLength: function ( length ) {

		return this.normalize().multiplyScalar( length );

	},
	project: function ( v ) {

		var scalar = v.dot( this ) / v.lengthSq();

		return this.copy( v ).multiplyScalar( scalar );

	},
	cross:function(v){
		
		return this.x*v.y - this.y*v.x;
	}
	
}
var NamedColors = {
	
  aliceblue: 0xf0f8ff,
  antiquewhite: 0xfaebd7,
  aqua: 0x00ffff,
  aquamarine: 0x7fffd4,
  azure: 0xf0ffff,
  beige: 0xf5f5dc,
  bisque: 0xffe4c4,
  black: 0x000000,
  blanchedalmond: 0xffebcd,
  blue: 0x0000ff,
  blueviolet: 0x8a2be2,
  brown: 0xa52a2a,
  burlywood: 0xdeb887,
  cadetblue: 0x5f9ea0,
  chartreuse: 0x7fff00,
  chocolate: 0xd2691e,
  coral: 0xff7f50,
  cornflowerblue: 0x6495ed,
  cornsilk: 0xfff8dc,
  crimson: 0xdc143c,
  cyan: 0x00ffff,
  darkblue: 0x00008b,
  darkcyan: 0x008b8b,
  darkgoldenrod: 0xb8860b,
  darkgray: 0xa9a9a9,
  darkgreen: 0x006400,
  darkgrey: 0xa9a9a9,
  darkkhaki: 0xbdb76b,
  darkmagenta: 0x8b008b,
  darkolivegreen: 0x556b2f,
  darkorange: 0xff8c00,
  darkorchid: 0x9932cc,
  darkred: 0x8b0000,
  darksalmon: 0xe9967a,
  darkseagreen: 0x8fbc8f,
  darkslateblue: 0x483d8b,
  darkslategray: 0x2f4f4f,
  darkslategrey: 0x2f4f4f,
  darksteelblue: 0x294C69,
  darkturquoise: 0x00ced1,
  darkviolet: 0x9400d3,
  deeppink: 0xff1493,
  deepskyblue: 0x00bfff,
  dimgray: 0x696969,
  dimgrey: 0x696969,
  dodgerblue: 0x1e90ff,
  firebrick: 0xb22222,
  floralwhite: 0xfffaf0,
  forestgreen: 0x228b22,
  fuchsia: 0xff00ff,
  gainsboro: 0xdcdcdc,
  ghostwhite: 0xf8f8ff,
  gold: 0xffd700,
  goldenrod: 0xdaa520,
  gray: 0x808080,
  green: 0x008000,
  greenyellow: 0xadff2f,
  grey: 0x808080,
  honeydew: 0xf0fff0,
  hotpink: 0xff69b4,
  indianred: 0xcd5c5c,
  indigo: 0x4b0082,
  ivory: 0xfffff0,
  khaki: 0xf0e68c,
  lavender: 0xe6e6fa,
  lavenderblush: 0xfff0f5,
  lawngreen: 0x7cfc00,
  lemonchiffon: 0xfffacd,
  lightblue: 0xadd8e6,
  lightcoral: 0xf08080,
  lightcyan: 0xe0ffff,
  lightgoldenrodyellow: 0xfafad2,
  lightgray: 0xd3d3d3,
  lightgreen: 0x90ee90,
  lightgrey: 0xd3d3d3,
  lightpink: 0xffb6c1,
  lightsalmon: 0xffa07a,
  lightseagreen: 0x20b2aa,
  lightskyblue: 0x87cefa,
  lightslategray: 0x778899,
  lightslategrey: 0x778899,
  lightsteelblue: 0xb0c4de,
  lightyellow: 0xffffe0,
  lime: 0x00ff00,
  limegreen: 0x32cd32,
  linen: 0xfaf0e6,
  magenta: 0xff00ff,
  maroon: 0x800000,
  mediumaquamarine: 0x66cdaa,
  mediumblue: 0x0000cd,
  mediumorchid: 0xba55d3,
  mediumpurple: 0x9370db,
  mediumseagreen: 0x3cb371,
  mediumslateblue: 0x7b68ee,
  mediumspringgreen: 0x00fa9a,
  mediumturquoise: 0x48d1cc,
  mediumvioletred: 0xc71585,
  midnightblue: 0x191970,
  mintcream: 0xf5fffa,
  mistyrose: 0xffe4e1,
  moccasin: 0xffe4b5,
  navajowhite: 0xffdead,
  navy: 0x000080,
  oldlace: 0xfdf5e6,
  olive: 0x808000,
  olivedrab: 0x6b8e23,
  orange: 0xffa500,
  orangered: 0xff4500,
  orchid: 0xda70d6,
  palegoldenrod: 0xeee8aa,
  palegreen: 0x98fb98,
  paleturquoise: 0xafeeee,
  palevioletred: 0xdb7093,
  papayawhip: 0xffefd5,
  peachpuff: 0xffdab9,
  peru: 0xcd853f,
  pink: 0xffc0cb,
  plum: 0xdda0dd,
  powderblue: 0xb0e0e6,
  purple: 0x800080,
  rebeccapurple: 0x663399,
  red: 0xff0000,
  rosybrown: 0xbc8f8f,
  royalblue: 0x4169e1,
  saddlebrown: 0x8b4513,
  salmon: 0xfa8072,
  sandybrown: 0xf4a460,
  seagreen: 0x2e8b57,
  seashell: 0xfff5ee,
  sienna: 0xa0522d,
  silver: 0xc0c0c0,
  skyblue: 0x87ceeb,
  slateblue: 0x6a5acd,
  slategray: 0x708090,
  snow: 0xfffafa,
  springgreen: 0x00ff7f,
  steelblue: 0x4682b4,
  tan: 0xd2b48c,
  teal: 0x008080,
  thistle: 0xd8bfd8,
  tomato: 0xff6347,
  turquoise: 0x40e0d0,
  violet: 0xee82ee,
  wheat: 0xf5deb3,
  white: 0xffffff,
  whitesmoke: 0xf5f5f5,
  yellow: 0xffff00,
  yellowgreen: 0x9acd32
};

Easing = {
 
  linear: function (t) { return t },
  easeInQuad: function (t) { return t*t },
  easeOutQuad: function (t) { return t*(2-t) },
  easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
  easeInCubic: function (t) { return t*t*t },
  easeOutCubic: function (t) { return (--t)*t*t+1 },
  easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
  easeInQuart: function (t) { return t*t*t*t },
  easeOutQuart: function (t) { return 1-(--t)*t*t*t },
  easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
  easeInQuint: function (t) { return t*t*t*t*t },
  easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
  easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t },
  easeInElastic: function (t) { return (.04 - .04 / t) * Math.sin(25 * t) + 1 },
  easeOutElastic: function (t) { return .04 * t / (--t) * Math.sin(25 * t) },
  easeInOutElastic: function (t) { 
	  return (t -= .5) < 0 ? (.02 + .01 / t) * Math.sin(50 * t) : (.02 - .01 / t) * Math.sin(50 * t) + 1 
  },
  easeInSin: function (t) { return 1 + Math.sin(Math.PI / 2 * t - Math.PI / 2); },
  easeOutSin: function (t) { return Math.sin(Math.PI / 2 * t); },
  easeInOutSin: function (t) { return (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2; },
  easeInBack: function(t,s) { s = s || 1.70158; return t * t * ((s + 1) * t - s); },
  easeOutBack:function(t,s) { s = s || 1.70158; return --t * t * ((s + 1) * t + s) + 1; },
  easeInOutBack:function(t,s) { s = s || 1.70158; return ((t *= 2) < 1 ? t * t * ((s + 1) * t - s) : (t -= 2) * t * ((s + 1) * t + s) + 2) / 2; }
}

function matrix(cx,cy,tx,ty,sx,sy,a){
	
	var sin = Math.sin(a);
	var cos = Math.cos(a);
	
	var m = [ sx*cos,
		 sy*sin, 
		-sx* sin, 
		 sy*cos, 
		-cx * cos*sx + cy * sin*sx + cx +tx, 
		-cx * sin*sy - cy * cos*sy + cy+ty];
		
	return 'matrix('+m.join(',')+')';
}
function isometric( cx, cy,scale, rotation, tilt){
	
	var sin = Math.sin(rotation);
	var cos = Math.cos(rotation);
	var h = Math.cos( tilt);
	
	var a = scale*cos;
	var b = -scale*sin;
	var c = cx;
	var d = h*scale*sin;
	var e = h*scale*cos;
	var f = cy;
	
	return 'matrix('+a+','+d+','+b+','+e+','+c+','+f+')';
	
}
function scaleMatrix( cx,cy,sx,sy){
	
	return 'matrix('+sx+', 0, 0, '+sy+', '+(cx-sx*cx)+', '+(cy - sy*cy)+')';
}
function oscillate(x, w, f){
		
	return Math.sin( w * Math.pow( 1 - x , 2 ) - f );
}

function hexToRgb(hex) {//format input 0xFFFFFF
	
	var bigint = parseInt(hex);
	var r = (bigint >> 16) & 255;
	var g = (bigint >> 8) & 255;
	var b = bigint & 255;

	return {r:r,g:g,b:b};
}
function mod(n, m) {
	return ((n % m) + m) % m;
}
function normalize( x, min, max){
	
	return (x - min) / (max - min);
}
function clamp(num, min, max) {
	return num < min ? min : (num > max ? max : num);
}
function interpolateColor(a,b, ease){
	
	var c1 = hexToRgb( NamedColors[a]);
	var c2 = hexToRgb( NamedColors[b]);
	
	var dr = c2.r - c1.r;
	var dg = c2.g - c1.g;
	var db = c2.b - c1.b;
	
	var r0 = c1.r;
	var g0 = c1.g;
	var b0 = c1.b;
	
	return function(t){
		
		if(ease) t = ease(t);
		
		var r = (r0 + t * dr) | 0;
		var g = (g0 + t * dg) | 0;
		var b = (b0 + t * db) | 0;
		
		return 'rgb('+r+','+g+','+b+')';
	}
	
}
function shuffle(array, dontModify) {
			
	if(dontModify) array = array.slice(0);
	
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array;
}
function convertRange( value, r1, r2 ) { 
	return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
}
