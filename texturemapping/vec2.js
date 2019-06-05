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
	divideScalar:function(s){
		this.x /= s;
		this.y /= s;
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
	},
	angleTo: function( v ){
		
		return Math.acos( this.dot( v ) / ( this.length() * v.length() ) )
	},
	fromAngleAndMagnitude: function(  angle, mag ){
	
	 this.x = mag*Math.cos(angle);
	 this.y = mag*Math.sin(angle);
	
	 return this;
	}
	
}
