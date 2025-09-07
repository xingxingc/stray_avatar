export default `
<svg viewBox='-75 -75 150 150' xmlns='http://www.w3.org/2000/svg' width='500' height='500' id='duck-svg'>
			<title>Duck Duck Duck</title>
			<desc>CREATED BY XUAN TANG, MORE INFO AT TXSTC55.GITHUB.IO</desc>
			<rect x='-75' y='-75' width='100%' height='100%' fill='##bgColor##' />
			<g transform='##bodyContour_transform##'>
				<polyline id='bodyContour' points='##computedBodyPoints##' fill='white' stroke='black'
					stroke-width='##bodyContour_stroke_width##' stroke-linejoin='round' />
			</g>
			<g transform='##faceContour_transform##'>
				<polyline id='faceContour' points='##computedFacePoints##' fill='white' stroke='black'
					stroke-width='##faceContour_stroke_width##' stroke-linejoin='round' />
			</g>
			<g transform='##faceInterior_transform##'>
				<polyline id='faceInterior' points='##computedFacePoints##' fill='white' stroke-linejoin='round' />
			</g>
			<g transform='##bodyInterior_transform##'>
				<polyline id='bodyInterior' points='##computedBodyPoints##' fill='white' stroke-linejoin='round' />
			</g>
			<g transform='##leg_transform##'>
				<path id='leftLeg' stroke='orange' stroke-width='2' stoke-linejoin='round' fill='none'
					stroke-linecap='round' d='##leftLegPoints##'></path>
				<path id='rightLeg' stroke='orange' stroke-width='2' stoke-linejoin='round' fill='none'
					stroke-linecap='round' d='##rightLegPoints##'></path>

				<!-- here we deal with left feet -->
				<g transform='##left_feet_transform_1##'>
					<polyline id='leftFeetMiddleFinger' stroke-width='2' fill='none' stroke-linecap='round'
						stroke='orange' points='##leftFeetMiddleFingerPoints##'></polyline>
				</g>
				<g transform='##left_feet_transform_2##'>
					<polyline id='leftFeetMiddleFinger' stroke-width='2' fill='none' stroke-linecap='round'
						stroke='orange' points='##leftFeetMiddleFingerPoints##'></polyline>
				</g>
				<g transform='##left_feet_transform_3##'>
					<polyline id='leftFeetMiddleFinger' stroke-width='2' fill='none' stroke-linecap='round'
						stroke='orange' points='##leftFeetMiddleFingerPoints##'></polyline>
				</g>
				<g transform='##left_feet_transform_4##'>
					<polyline id='leftFeetMiddleFinger' stroke-width='##left_feet_stroke_width##' fill='none'
						stroke-linecap='round' stroke='orange' points='##leftFeetMiddleFingerPoints##'></polyline>
				</g>
				<g transform='##left_feet_transform_5##'>
					<polyline id='leftFeetMiddleFinger' stroke-width='##left_feet_stroke_width##' fill='none'
						stroke-linecap='round' stroke='orange' points='##leftFeetMiddleFingerPoints##'></polyline>
				</g>
				<!-- now we deal with right feet -->
				<g transform='##right_feet_transform_1##'>
					<polyline id='rightFeetMiddleFinger' stroke-width='2' fill='none' stroke-linecap='round'
						stroke='orange' points='##rightFeetMiddleFingerPoints##'></polyline>
				</g>
				<g transform='##right_feet_transform_2##'>
					<polyline id='rightFeetMiddleFinger' stroke-width='2' fill='none' stroke-linecap='round'
						stroke='orange' points='##rightFeetMiddleFingerPoints##'></polyline>
				</g>
				<g transform='##right_feet_transform_3##'>
					<polyline id='rightFeetMiddleFinger' stroke-width='2' fill='none' stroke-linecap='round'
						stroke='orange' points='##rightFeetMiddleFingerPoints##'></polyline>
				</g>
				<g transform='##right_feet_transform_4##'>
					<polyline id='rightFeetMiddleFinger' stroke-width='##right_feet_stroke_width##' fill='none'
						stroke-linecap='round' stroke='orange' points='##rightFeetMiddleFingerPoints##'></polyline>
				</g>
				<g transform='##right_feet_transform_5##'>
					<polyline id='rightFeetMiddleFinger' stroke-width='##right_feet_stroke_width##' fill='none'
						stroke-linecap='round' stroke='orange' points='##rightFeetMiddleFingerPoints##'></polyline>
				</g>
			</g>
			<g transform='##eye_mouth_transform##'>
				<ellipse cx='##rightEyeX##' cy='##eyeHeight##' rx='##right_eye_rx##'
					ry='##right_eye_ry##' id='rightEye' />
				<ellipse cx='##leftEyeX##' cy='##eyeHeight##' rx='##left_eye_rx##'
					ry='##left_eye_ry##' id='leftEye' />
				<polyline id='mouth' points='##computedMouthPoints##' fill='orange' stroke='orange' stroke-width='0.1'>
				</polyline>
			</g>
</svg>
`