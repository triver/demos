
function TexturedTriangle(	x1, y1, u1, v1, w1,
							x2, y2, u2, v2, w2,
							x3, y3, u3, v3, w3)
{
	
	var textureCoords = []
	var tmp
	if (y2 < y1)
	{
		
		//swap(y1, y2);
		
		tmp = y1
		y1 = y2
		y2 = tmp
		
		//swap(x1, x2);
		
		tmp = x1
		x1 = x2
		x2 = tmp
		
		//swap(u1, u2);
		tmp = u1
		u1 = u2
		u2 = tmp
		//swap(v1, v2);
		tmp = v1
		v1 = v2
		v2 = tmp
		
		//swap(w1, w2);
		tmp = w1
		w1 = w2
		w2 = tmp
	}

	if (y3 < y1)
	{
		//swap(y1, y3);
		tmp = y1
		y1 = y3
		y3 = tmp
		//swap(x1, x3);
		tmp = x1
		x1 = x3
		x3 = tmp
		//swap(u1, u3);
		tmp = u1
		u1 = u3
		u3 = tmp
		//swap(v1, v3);
		tmp = v1
		v1 = v3
		v3 = tmp
		//swap(w1, w3);
		tmp = w1
		w1 = w3
		w3 = tmp
	}

	if (y3 < y2)
	{
		//swap(y2, y3);
		tmp = y2
		y2 = y3
		y3 = tmp
		
		//swap(x2, x3);
		tmp = x2
		x2 = x3
		x3 = tmp
		//swap(u2, u3);
		tmp = u2
		u2 = u3
		u3 = tmp
		//swap(v2, v3);
		tmp = v2
		v2 = v3
		v3 = tmp
		//swap(w2, w3);
		tmp = w2
		w2 = w3
		w3 = tmp
	}

	var dy1 = y2 - y1;
	var dx1 = x2 - x1;
	var dv1 = v2 - v1;
	var du1 = u2 - u1;
	var dw1 = w2 - w1;

	var dy2 = y3 - y1;
	var dx2 = x3 - x1;
	var dv2 = v3 - v1;
	var du2 = u3 - u1;
	var dw2 = w3 - w1;

	var tex_u, tex_v, tex_w;

	var dax_step = 0, dbx_step = 0,
		du1_step = 0, dv1_step = 0,
		du2_step = 0, dv2_step = 0,
		dw1_step=0, dw2_step=0;

	if (dy1) dax_step = dx1 / Math.abs(dy1);
	if (dy2) dbx_step = dx2 / Math.abs(dy2);

	if (dy1) du1_step = du1 / Math.abs(dy1);
	if (dy1) dv1_step = dv1 / Math.abs(dy1);
	if (dy1) dw1_step = dw1 / Math.abs(dy1);

	if (dy2) du2_step = du2 / Math.abs(dy2);
	if (dy2) dv2_step = dv2 / Math.abs(dy2);
	if (dy2) dw2_step = dw2 / Math.abs(dy2);

	if (dy1)
	{
		for (var i = y1; i <= y2; i++)
		{
			var ax = ( x1 + (i - y1) * dax_step ) 
			var bx = ( x1 + (i - y1) * dbx_step ) 

			var tex_su = u1 + (i - y1) * du1_step;
			var tex_sv = v1 + (i - y1) * dv1_step;
			var tex_sw = w1 + (i - y1) * dw1_step;

			var tex_eu = u1 + (i - y1) * du2_step;
			var tex_ev = v1 + (i - y1) * dv2_step;
			var tex_ew = w1 + (i - y1) * dw2_step;

			if (ax > bx)
			{
				//swap(ax, bx);
				tmp = ax
				ax = bx
				bx = tmp
				//swap(tex_su, tex_eu);
				tmp = tex_su
				tex_su = tex_eu
				tex_eu = tmp
				//swap(tex_sv, tex_ev);
				tmp = tex_sv
				tex_sv = tex_ev
				tex_ev = tmp
				//swap(tex_sw, tex_ew);
				tmp = tex_sw
				tex_sw = tex_ew
				tex_ew = tmp
			}

			tex_u = tex_su;
			tex_v = tex_sv;
			tex_w = tex_sw;

			var tstep = 1.0 / (bx - ax);
			var t = 0.0;

			for (var j = ax-1 < 0 ? 0 : ax - 1; j < bx; j++)
			{
				tex_u = (1.0 - t) * tex_su + t * tex_eu;
				tex_v = (1.0 - t) * tex_sv + t * tex_ev;
				tex_w = (1.0 - t) * tex_sw + t * tex_ew;
				
				textureCoords.push( [j, i,  (tex_u / tex_w) ,( tex_v / tex_w)])
				t += tstep;
			}

		}
	}
	
	
	
	dy1 = y3 - y2;
	dx1 = x3 - x2;
	dv1 = v3 - v2;
	du1 = u3 - u2;
	dw1 = w3 - w2;

	if (dy1) dax_step = dx1 / Math.abs(dy1);
	if (dy2) dbx_step = dx2 / Math.abs(dy2);

	du1_step = 0, dv1_step = 0;
	
	if (dy1) du1_step = du1 / Math.abs(dy1);
	if (dy1) dv1_step = dv1 / Math.abs(dy1);
	if (dy1) dw1_step = dw1 / Math.abs(dy1);

	if (dy1)
	{
		for (var i = y2; i <= y3; i++)
		{
			var ax = x2 + (i - y2) * dax_step;
			var bx = x1 + (i - y1) * dbx_step;

			var tex_su = u2 + (i - y2) * du1_step;
			var tex_sv = v2 + (i - y2) * dv1_step;
			var tex_sw = w2 + (i - y2) * dw1_step;

			var tex_eu = u1 + (i - y1) * du2_step;
			var tex_ev = v1 + (i - y1) * dv2_step;
			var tex_ew = w1 + (i - y1) * dw2_step;

			if (ax > bx)
			{
				//swap(ax, bx);
				tmp = ax
				ax = bx
				bx = tmp
				//swap(tex_su, tex_eu);
				tmp = tex_su
				tex_su = tex_eu
				tex_eu = tmp
				//swap(tex_sv, tex_ev);
				tmp = tex_sv
				tex_sv = tex_ev
				tex_ev = tmp
				//swap(tex_sw, tex_ew);
				tmp = tex_sw
				tex_sw = tex_ew
				tex_ew = tmp
			}

			tex_u = tex_su;
			tex_v = tex_sv;
			tex_w = tex_sw;

			var tstep = 1.0 / (bx - ax);
			var t = 0.0;

			for (var j = ax-1 < 0 ? 0 : ax - 1 ; j < bx; j++)
			{
				tex_u = (1.0 - t) * tex_su + t * tex_eu
				tex_v = (1.0 - t) * tex_sv + t * tex_ev
				tex_w = (1.0 - t) * tex_sw + t * tex_ew

				textureCoords.push( [j, i, (tex_u / tex_w),  (tex_v / tex_w) ])
				t += tstep;
			}
		}	
	}
	return textureCoords		
}
