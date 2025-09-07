export default `
<svg viewBox='-100 -100 200 200' xmlns='http://www.w3.org/2000/svg' width='500' height='500' id='face-svg'>
	<defs>
		<clipPath id='leftEyeClipPath'>
			<polyline points='##eyeLeftCountour##' />
		</clipPath>
		<clipPath id='rightEyeClipPath'>
			<polyline points='##eyeRightCountour##' />
		</clipPath>

		<filter id='fuzzy'>
			<feTurbulence id='turbulence' baseFrequency='0.05' numOctaves='3' result='noise' />
			<feDisplacementMap in='SourceGraphic' in2='noise' scale='2' />
		</filter>
		<linearGradient id='rainbowGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
			<stop offset='0%' style='##rainbowGradient_stop_1##' />
			<stop offset='##dyeColorOffset##' style='##rainbowGradient_stop_2##' />
			<stop offset='100%' style='##rainbowGradient_stop_3##' />
		</linearGradient>
	</defs>
	<title>That's an ugly face</title>
	<desc>CREATED BY XUAN TANG, MORE INFO AT TXSTC55.GITHUB.IO</desc>
	<rect x='-100' y='-100' width='100%' height='100%' fill='##rect_bg_fill##' />
	<polyline id='faceContour' points='##computedFacePoints##' fill='#ffc9a9' stroke='black'
		stroke-width='##faceContour_stroke_width##' stroke-linejoin='round' filter='url(#fuzzy)' />

	<g transform='##rightCountour_transform##'>
		<polyline id='rightCountour' points='##eyeRightCountour##' fill='white' stroke='white'
			stroke-width='##rightCountour_stroke_width##' stroke-linejoin='round' filter='url(#fuzzy)' />
	</g>
	<g transform='##leftCountour_transform##'>
		<polyline id='leftCountour' points='##eyeLeftCountour##' fill='white' stroke='white'
			stroke-width='##leftCountour_stroke_width##' stroke-linejoin='round' filter='url(#fuzzy)' />
	</g>
	<g transform='##g_transform_1##'>
		<polyline id='rightUpper' points='##eyeRightUpper##' fill='none' stroke='black'
			stroke-width='##rightUpper_stroke_width##' stroke-linejoin='round'
			stroke-linecap='round' filter='url(#fuzzy)' />
		<polyline id='rightLower' points='##eyeRightLower##' fill='none' stroke='black'
			stroke-width='##rightUpper_stroke_width##' stroke-linejoin='round'
			stroke-linecap='round' filter='url(#fuzzy)' />
		##g_transform_1_circles##
	</g>
	<g transform='##g_transform_2##'>
		<polyline id='leftUpper' points='##eyeLeftUpper##' fill='none' stroke='black'
			stroke-width='##rightUpper_stroke_width##' stroke-linejoin='round'
			filter='url(#fuzzy)' />
		<polyline id='leftLower' points='##eyeLeftLower##' fill='none' stroke='black'
			stroke-width='##rightUpper_stroke_width##' stroke-linejoin='round'
			filter='url(#fuzzy)' />
		##g_transform_2_circles##
	</g>
	<g id='hairs'>
		##hairs_polylines##
	</g>
	##nose_g##
	<g id='mouth'>
		<polyline points='##mouthPoints##' fill='rgb(215,127,140)' stroke='black' stroke-width='##mouth_stroke_width##'
			stroke-linejoin='round' filter='url(#fuzzy)' />
	</g>
</svg>
`