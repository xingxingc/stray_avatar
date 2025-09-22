<template>
	<common-page :show-back="true">
		<view class="container">
			<image :src="svgImagePath" class="imgContainer" />
			<canvas id="pngCanvas" canvas-id="pngCanvas"
				style="position: absolute; left: -999px; top: -999px; width: 240px; height: 240px;" />
			<button @click="generateFace()">随机生成</button>
			<button @click="save()">保存相册</button>
			<view class="spacer"></view>
		</view>
	</common-page>
</template>

<script>
	import * as faceShape from "./utils/face_shape.js";
	import * as eyeShape from "./utils/eye_shape.js";
	import * as hairLines from "./utils/hair_lines.js";
	import * as mouthShape from "./utils/mouth_shape.js";
	import templateText from './ugly_face_svg_template.js'
	import {
		checkPermissionAndSaveToPhotosAlbum, postSvgToPng, randomToken, savePngToFile, showTextToast
	} from "../../../util/util.ts";

	function randomFromInterval(min, max) {
		return Math.random() * (max - min) + min;
	}

	export default {
		name: "UglyFace",
		data() {
			return {
				rewardedService: null,
				svgImagePath: null,
				svgString: null,
				token: null,
				faceScale: 1.8, // face scale
				computedFacePoints: [], // the polygon points for face countour
				eyeRightUpper: [], // the points for right eye upper lid
				eyeRightLower: [],
				eyeRightCountour: [], // for the white part of the eye
				eyeLeftUpper: [],
				eyeLeftLower: [],
				eyeLeftCountour: [],
				faceHeight: 0, // the height of the face
				faceWidth: 0, // the width of the face
				center: [0, 0], // the center of the face
				distanceBetweenEyes: 0, // the distance between the eyes
				leftEyeOffsetX: 0, // the offset of the left eye
				leftEyeOffsetY: 0, // the offset of the left eye
				rightEyeOffsetX: 0, // the offset of the right eye
				rightEyeOffsetY: 0, // the offset of the right eye
				eyeHeightOffset: 0, // the offset of the eye height
				leftEyeCenter: [0, 0], // the center of the left eye
				rightEyeCenter: [0, 0], // the center of the right eye
				rightPupilShiftX: 0, // the shift of the right pupil
				rightPupilShiftY: 0, // the shift of the right pupil
				leftPupilShiftX: 0, // the shift of the left pupil
				leftPupilShiftY: 0, // the shift of the left pupil
				rightNoseCenterX: 0, // the center of the right nose
				rightNoseCenterY: 0, // the center of the right nose
				leftNoseCenterX: 0, // the center of the left nose
				leftNoseCenterY: 0, // the center of the left nose
				hairs: [],
				haventSleptForDays: false,
				hairColors: [
					"rgb(0, 0, 0)", // Black
					"rgb(44, 34, 43)", // Dark Brown
					"rgb(80, 68, 68)", // Medium Brown
					"rgb(167, 133, 106)", // Light Brown
					"rgb(220, 208, 186)", // Blond
					"rgb(233, 236, 239)", // Platinum Blond
					"rgb(165, 42, 42)", // Red
					"rgb(145, 85, 61)", // Auburn
					"rgb(128, 128, 128)", // Grey
					"rgb(185, 55, 55)", // Fire
					"rgb(255, 192, 203)", // Pastel Pink
					"rgb(255, 105, 180)", // Bright Pink
					"rgb(230, 230, 250)", // Lavender
					"rgb(64, 224, 208)", // Turquoise
					"rgb(0, 191, 255)", // Bright Blue
					"rgb(148, 0, 211)", // Deep Purple
					"rgb(50, 205, 50)", // Lime Green
					"rgb(255, 165, 0)", // Vivid Orange
					"rgb(220, 20, 60)", // Crimson Red
					"rgb(192, 192, 192)", // Silver
					"rgb(255, 215, 0)", // Gold
					"rgb(255, 255, 255)", // White
					"rgb(124, 252, 0)", // Lawn Green
					"rgb(127, 255, 0)", // Chartreuse
					"rgb(0, 255, 127)", // Spring Green
					"rgb(72, 209, 204)", // Medium Turquoise
					"rgb(0, 255, 255)", // Cyan
					"rgb(0, 206, 209)", // Dark Turquoise
					"rgb(32, 178, 170)", // Light Sea Green
					"rgb(95, 158, 160)", // Cadet Blue
					"rgb(70, 130, 180)", // Steel Blue
					"rgb(176, 196, 222)", // Light Steel Blue
					"rgb(30, 144, 255)", // Dodger Blue
					"rgb(135, 206, 235)", // Sky Blue
					"rgb(0, 0, 139)", // Dark Blue
					"rgb(138, 43, 226)", // Blue Violet
					"rgb(75, 0, 130)", // Indigo
					"rgb(139, 0, 139)", // Dark Magenta
					"rgb(153, 50, 204)", // Dark Orchid
					"rgb(186, 85, 211)", // Medium Orchid
					"rgb(218, 112, 214)", // Orchid
					"rgb(221, 160, 221)", // Plum
					"rgb(238, 130, 238)", // Violet
					"rgb(255, 0, 255)", // Magenta
					"rgb(216, 191, 216)", // Thistle
					"rgb(255, 20, 147)", // Deep Pink
					"rgb(255, 69, 0)", // Orange Red
					"rgb(255, 140, 0)", // Dark Orange
					"rgb(255, 165, 0)", // Orange
					"rgb(250, 128, 114)", // Salmon
					"rgb(233, 150, 122)", // Dark Salmon
					"rgb(240, 128, 128)", // Light Coral
					"rgb(205, 92, 92)", // Indian Red
					"rgb(255, 99, 71)", // Tomato
					"rgb(255, 160, 122)", // Light Salmon
					"rgb(220, 20, 60)", // Crimson
					"rgb(139, 0, 0)", // Dark Red
					"rgb(178, 34, 34)", // Fire Brick
					"rgb(250, 235, 215)", // Antique White
					"rgb(255, 239, 213)", // Papaya Whip
					"rgb(255, 235, 205)", // Blanched Almond
					"rgb(255, 222, 173)", // Navajo White
					"rgb(245, 245, 220)", // Beige
					"rgb(255, 228, 196)", // Bisque
					"rgb(255, 218, 185)", // Peach Puff
					"rgb(244, 164, 96)", // Sandy Brown
					"rgb(210, 180, 140)", // Tan
					"rgb(222, 184, 135)", // Burly Wood
					"rgb(250, 250, 210)", // Light Goldenrod Yellow
					"rgb(255, 250, 205)", // Lemon Chiffon
					"rgb(255, 245, 238)", // Sea Shell
					"rgb(253, 245, 230)", // Old Lace
					"rgb(255, 228, 225)", // Misty Rose
					"rgb(255, 240, 245)", // Lavender Blush
					"rgb(250, 240, 230)", // Linen
					"rgb(255, 228, 181)", // Moccasin
					"rgb(255, 250, 250)", // Snow
					"rgb(240, 255, 255)", // Azure
					"rgb(240, 255, 240)", // Honeydew
					"rgb(245, 245, 245)", // White Smoke
					"rgb(245, 255, 250)", // Mint Cream
					"rgb(240, 248, 255)", // Alice Blue
					"rgb(240, 248, 255)", // Ghost White
					"rgb(248, 248, 255)", // Ghost White
					"rgb(255, 250, 240)", // Floral White
					"rgb(253, 245, 230)", // Old Lace
				],
				hairColor: "black",
				dyeColorOffset: "50%",
				backgroundColors: [
					"rgb(245, 245, 220)", // Soft Beige
					"rgb(176, 224, 230)", // Pale Blue
					"rgb(211, 211, 211)", // Light Grey
					"rgb(152, 251, 152)", // Pastel Green
					"rgb(255, 253, 208)", // Cream
					"rgb(230, 230, 250)", // Muted Lavender
					"rgb(188, 143, 143)", // Dusty Rose
					"rgb(135, 206, 235)", // Sky Blue
					"rgb(245, 255, 250)", // Mint Cream
					"rgb(245, 222, 179)", // Wheat
					"rgb(47, 79, 79)", // Dark Slate Gray
					"rgb(72, 61, 139)", // Dark Slate Blue
					"rgb(60, 20, 20)", // Dark Brown
					"rgb(25, 25, 112)", // Midnight Blue
					"rgb(139, 0, 0)", // Dark Red
					"rgb(85, 107, 47)", // Olive Drab
					"rgb(128, 0, 128)", // Purple
					"rgb(0, 100, 0)", // Dark Green
					"rgb(0, 0, 139)", // Dark Blue
					"rgb(105, 105, 105)", // Dim Gray
					"rgb(240, 128, 128)", // Light Coral
					"rgb(255, 160, 122)", // Light Salmon
					"rgb(255, 218, 185)", // Peach Puff
					"rgb(255, 228, 196)", // Bisque
					"rgb(255, 222, 173)", // Navajo White
					"rgb(255, 250, 205)", // Lemon Chiffon
					"rgb(250, 250, 210)", // Light Goldenrod Yellow
					"rgb(255, 239, 213)", // Papaya Whip
					"rgb(255, 245, 238)", // Sea Shell
					"rgb(255, 248, 220)", // Cornsilk
					"rgb(255, 255, 240)", // Ivory
					"rgb(240, 255, 240)", // Honeydew
					"rgb(240, 255, 255)", // Azure
					"rgb(240, 248, 255)", // Alice Blue
					"rgb(248, 248, 255)", // Ghost White
					"rgb(255, 250, 250)", // Snow
					"rgb(255, 240, 245)", // Lavender Blush
					"rgb(255, 228, 225)", // Misty Rose
					"rgb(230, 230, 250)", // Lavender
					"rgb(216, 191, 216)", // Thistle
					"rgb(221, 160, 221)", // Plum
					"rgb(238, 130, 238)", // Violet
					"rgb(218, 112, 214)", // Orchid
					"rgb(186, 85, 211)", // Medium Orchid
					"rgb(147, 112, 219)", // Medium Purple
					"rgb(138, 43, 226)", // Blue Violet
					"rgb(148, 0, 211)", // Dark Violet
					"rgb(153, 50, 204)", // Dark Orchid
					"rgb(139, 69, 19)", // Saddle Brown
					"rgb(160, 82, 45)", // Sienna
					"rgb(210, 105, 30)", // Chocolate
					"rgb(205, 133, 63)", // Peru
					"rgb(244, 164, 96)", // Sandy Brown
					"rgb(222, 184, 135)", // Burly Wood
					"rgb(255, 250, 240)", // Floral White
					"rgb(253, 245, 230)", // Old Lace
					"rgb(250, 240, 230)", // Linen
				],
				mouthPoints: [],
			};
		},
		methods: {
			generateFace() {
				this.faceScale = 1.5 + Math.random() * 0.6;
				this.haventSleptForDays = Math.random() > 0.8;
				let faceResults = faceShape.generateFaceCountourPoints();
				this.computedFacePoints = faceResults.face;
				this.faceHeight = faceResults.height;
				this.faceWidth = faceResults.width;
				this.center = faceResults.center;
				let eyes = eyeShape.generateBothEyes(this.faceWidth / 2);
				let left = eyes.left;
				let right = eyes.right;
				this.eyeRightUpper = right.upper;
				this.eyeRightLower = right.lower;
				this.eyeRightCountour = right.upper
					.slice(10, 90)
					.concat(right.lower.slice(10, 90).reverse());
				this.eyeLeftUpper = left.upper;
				this.eyeLeftLower = left.lower;
				this.eyeLeftCountour = left.upper
					.slice(10, 90)
					.concat(left.lower.slice(10, 90).reverse());
				this.distanceBetweenEyes = randomFromInterval(
					this.faceWidth / 4.5,
					this.faceWidth / 4,
				);
				this.eyeHeightOffset = randomFromInterval(
					this.faceHeight / 8,
					this.faceHeight / 6,
				);
				this.leftEyeOffsetX = randomFromInterval(
					-this.faceWidth / 20,
					this.faceWidth / 10,
				);
				this.leftEyeOffsetY = randomFromInterval(
					-this.faceHeight / 50,
					this.faceHeight / 50,
				);
				this.rightEyeOffsetX = randomFromInterval(
					-this.faceWidth / 20,
					this.faceWidth / 10,
				);
				this.rightEyeOffsetY = randomFromInterval(
					-this.faceHeight / 50,
					this.faceHeight / 50,
				);
				this.leftEyeCenter = left.center[0];
				this.rightEyeCenter = right.center[0];
				this.leftPupilShiftX = randomFromInterval(
					-this.faceWidth / 20,
					this.faceWidth / 20,
				);

				// now we generate the pupil shifts
				// we first pick a point from the upper eye lid
				let leftInd0 = Math.floor(randomFromInterval(10, left.upper.length - 10));
				let rightInd0 = Math.floor(
					randomFromInterval(10, right.upper.length - 10),
				);
				let leftInd1 = Math.floor(randomFromInterval(10, left.upper.length - 10));
				let rightInd1 = Math.floor(
					randomFromInterval(10, right.upper.length - 10),
				);
				let leftLerp = randomFromInterval(0.2, 0.8);
				let rightLerp = randomFromInterval(0.2, 0.8);

				this.leftPupilShiftY =
					left.upper[leftInd0][1] * leftLerp +
					left.lower[leftInd1][1] * (1 - leftLerp);
				this.rightPupilShiftY =
					right.upper[rightInd0][1] * rightLerp +
					right.lower[rightInd1][1] * (1 - rightLerp);
				this.leftPupilShiftX =
					left.upper[leftInd0][0] * leftLerp +
					left.lower[leftInd1][0] * (1 - leftLerp);
				this.rightPupilShiftX =
					right.upper[rightInd0][0] * rightLerp +
					right.lower[rightInd1][0] * (1 - rightLerp);

				var numHairLines = [];
				var numHairMethods = 4;
				for (var i = 0; i < numHairMethods; i++) {
					numHairLines.push(Math.floor(randomFromInterval(0, 50)));
				}
				this.hairs = [];
				if (Math.random() > 0.3) {
					this.hairs = hairLines.generateHairLines0(
						this.computedFacePoints,
						numHairLines[0] * 1 + 10,
					);
				}
				if (Math.random() > 0.3) {
					this.hairs = this.hairs.concat(
						hairLines.generateHairLines1(
							this.computedFacePoints,
							numHairLines[1] / 1.5 + 10,
						),
					);
				}
				if (Math.random() > 0.5) {
					this.hairs = this.hairs.concat(
						hairLines.generateHairLines2(
							this.computedFacePoints,
							numHairLines[2] * 3 + 10,
						),
					);
				}
				if (Math.random() > 0.5) {
					this.hairs = this.hairs.concat(
						hairLines.generateHairLines3(
							this.computedFacePoints,
							numHairLines[3] * 3 + 10,
						),
					);
				}
				this.rightNoseCenterX = randomFromInterval(
					this.faceWidth / 18,
					this.faceWidth / 12,
				);
				this.rightNoseCenterY = randomFromInterval(0, this.faceHeight / 5);
				this.leftNoseCenterX = randomFromInterval(
					-this.faceWidth / 18,
					-this.faceWidth / 12,
				);
				this.leftNoseCenterY =
					this.rightNoseCenterY +
					randomFromInterval(-this.faceHeight / 30, this.faceHeight / 20);
				if (Math.random() > 0.1) {
					// use natural hair color
					this.hairColor = this.hairColors[Math.floor(Math.random() * 10)];
				} else {
					this.hairColor = "url(#rainbowGradient)";
					this.dyeColorOffset = randomFromInterval(0, 100) + "%";
				}

				var choice = Math.floor(Math.random() * 3);
				if (choice == 0) {
					this.mouthPoints = mouthShape.generateMouthShape0(
						this.computedFacePoints,
						this.faceHeight,
						this.faceWidth,
					);
				} else if (choice == 1) {
					this.mouthPoints = mouthShape.generateMouthShape1(
						this.computedFacePoints,
						this.faceHeight,
						this.faceWidth,
					);
				} else {
					this.mouthPoints = mouthShape.generateMouthShape2(
						this.computedFacePoints,
						this.faceHeight,
						this.faceWidth,
					);
				}

				let img = templateText
				img = img.replaceAll('##eyeLeftCountour##', this.parseTwoDimensionalArray(this.eyeLeftCountour))
				img = img.replaceAll('##eyeRightCountour##', this.parseTwoDimensionalArray(this.eyeRightCountour))
				img = img.replaceAll('##dyeColorOffset##', this.dyeColorOffset)
				img = img.replaceAll('##computedFacePoints##', this.parseTwoDimensionalArray(this.computedFacePoints))
				img = img.replaceAll('##eyeRightUpper##', this.parseTwoDimensionalArray(this.eyeRightUpper))
				img = img.replaceAll('##eyeRightLower##', this.parseTwoDimensionalArray(this.eyeRightLower))
				img = img.replaceAll('##eyeLeftUpper##', this.parseTwoDimensionalArray(this.eyeLeftUpper))
				img = img.replaceAll('##eyeLeftLower##', this.parseTwoDimensionalArray(this.eyeLeftLower))
				img = img.replaceAll('##mouthPoints##', this.parseTwoDimensionalArray(this.mouthPoints))
				let rainbowGradient_stop_1 =
					`stop-color: ${this.hairColors[Math.floor(Math.random() * 10)]} ; stop-opacity: 1`
				img = img.replaceAll('##rainbowGradient_stop_1##', rainbowGradient_stop_1)
				let rainbowGradient_stop_2 =
					`stop-color: ${this.hairColors[Math.floor(Math.random() * this.hairColors.length)]}; stop-opacity: 1`
				img = img.replaceAll('##rainbowGradient_stop_2##', rainbowGradient_stop_2)
				let rainbowGradient_stop_3 =
					`stop-color: ${this.hairColors[Math.floor(Math.random() * this.hairColors.length)]}; stop-opacity: 1`
				img = img.replaceAll('##rainbowGradient_stop_3##', rainbowGradient_stop_3)
				let rect_bg_fill = this.backgroundColors[Math.floor(Math.random() * this.backgroundColors.length)]
				img = img.replaceAll('##rect_bg_fill##', rect_bg_fill)
				let faceContour_stroke_width = 3.0 / this.faceScale
				img = img.replaceAll('##faceContour_stroke_width##', faceContour_stroke_width)
				let rightCountour_transform = 'translate(' +
					(this.center[0] + this.distanceBetweenEyes + this.rightEyeOffsetX) +
					', ' +
					-(-this.center[1] + this.eyeHeightOffset + this.rightEyeOffsetY) +
					')'
				img = img.replaceAll('##rightCountour_transform##', rightCountour_transform)
				let rightCountour_stroke_width = 0.0 / this.faceScale
				img = img.replaceAll('##rightCountour_stroke_width##', rightCountour_stroke_width)
				let leftCountour_transform = 'translate(' +
					-(this.center[0] + this.distanceBetweenEyes + this.leftEyeOffsetX) +
					', ' +
					-(-this.center[1] + this.eyeHeightOffset + this.leftEyeOffsetY) +
					')'
				img = img.replaceAll('##leftCountour_transform##', leftCountour_transform)
				let leftCountour_stroke_width = 0.0 / this.faceScale
				img = img.replaceAll('##leftCountour_stroke_width##', leftCountour_stroke_width)
				let g_transform_1 = 'translate(' +
					(this.center[0] + this.distanceBetweenEyes + this.rightEyeOffsetX) +
					', ' +
					-(-this.center[1] + this.eyeHeightOffset + this.rightEyeOffsetY) +
					')'
				img = img.replaceAll('##g_transform_1##', g_transform_1)
				let rightUpper_stroke_width = (this.haventSleptForDays ? 5.0 : 3.0) / this.faceScale
				img = img.replaceAll('##rightUpper_stroke_width##', rightUpper_stroke_width)
				let g_transform_2 = 'translate(' +
					-(this.center[0] + this.distanceBetweenEyes + this.leftEyeOffsetX) +
					', ' +
					-(-this.center[1] + this.eyeHeightOffset + this.leftEyeOffsetY) +
					')'
				img = img.replaceAll('##g_transform_2##', g_transform_2)
				let mouth_stroke_width = 2.7 + Math.random() * 0.5
				img = img.replaceAll('##mouth_stroke_width##', mouth_stroke_width)
				let g_transform_1_circles = ''
				for (var i = 0; i < 10; i++) {
					g_transform_1_circles +=
						`
			<circle r="${Math.random() * 2 + 3.0}" cx="${this.rightPupilShiftX + Math.random() * 5 - 2.5}"
						cy="${this.rightPupilShiftY + Math.random() * 5 - 2.5}" stroke="black" fill="none"
						stroke-width="${1.0 + Math.random() * 0.5}" filter="url(#fuzzy)" clip-path="url(#rightEyeClipPath)" />
			`
				}
				img = img.replaceAll('##g_transform_1_circles##', g_transform_1_circles)
				let g_transform_2_circles = ''
				for (var i = 0; i < 10; i++) {
					g_transform_2_circles +=
						`
		  	<circle r="${Math.random() * 2 + 3.0}" cx="${this.leftPupilShiftX + Math.random() * 5 - 2.5}"
		  				cy="${this.leftPupilShiftY + Math.random() * 5 - 2.5}" stroke="black" fill="none"
		  				stroke-width="${1.0 + Math.random() * 0.5}" filter="url(#fuzzy)" clip-path="url(#leftEyeClipPath)" />
		  	`
				}
				img = img.replaceAll('##g_transform_2_circles##', g_transform_2_circles)
				let hairs_polylines = ''
				for (let hair of this.hairs) {
					hairs_polylines +=
						`
			<polyline points="${this.parseTwoDimensionalArray(hair)}" fill="none" stroke="${this.hairColor}"
						stroke-width="${0.5 + Math.random() * 2.5}" stroke-linejoin="round" filter="url(#fuzzy)" />
			`
				}
				img = img.replaceAll('##hairs_polylines##', hairs_polylines)

				let noseSeed = Math.random()
				if (noseSeed > 0.5) {
					let rightNoseCircles = ''
					for (var i = 0; i < 10; i++) {
						rightNoseCircles += `
				  <circle r="${Math.random() * 2 + 1.0}" cx="${this.rightNoseCenterX + Math.random() * 4 - 2}"
				  	cy="${this.rightNoseCenterY + Math.random() * 4 - 2}" stroke="black" fill="none"
				  	stroke-width="${1.0 + Math.random() * 0.5}" filter="url(#fuzzy)" />
				  `
					}
					let leftNoseCircles = ''
					for (var i = 0; i < 10; i++) {
						leftNoseCircles += `
				<circle r="${Math.random() * 2 + 1.0}" cx="${this.leftNoseCenterX + Math.random() * 4 - 2}"
					cy="${this.leftNoseCenterY + Math.random() * 4 - 2}" stroke="black" fill="none"
					stroke-width="${1.0 + Math.random() * 0.5}" filter="url(#fuzzy)" />
				`
					}
					let pointNose = `
			  <g id="pointNose">
			  		<g id="rightNose">
			  			${rightNoseCircles}
			  		</g>
			  		<g id="leftNose">
			  			${leftNoseCircles}
			  		</g>
			  	</g>
			  `
					img = img.replaceAll('##nose_g##', pointNose)
				} else {
					let d = 'M' +
						this.leftNoseCenterX +
						' ' +
						this.leftNoseCenterY +
						' Q' +
						this.rightNoseCenterX +
						' ' +
						this.rightNoseCenterY * 1.5 +
						' ' +
						(this.leftNoseCenterX + this.rightNoseCenterX) / 2 +
						' ' +
						-this.eyeHeightOffset * 0.2
					let lineNose = `
			<g id="lineNose">
				<path d="${d}" fill="none" stroke="black" stroke-width="${2.5 + Math.random() * 1.0}" stroke-linejoin="round"
					filter="url(#fuzzy)"></path>
			</g>
			`
					img = img.replaceAll('##nose_g##', lineNose)
				}

				this.svgString = img

				const fs = wx.getFileSystemManager();
				const timestamp = new Date().getTime();
				const filePath = `${wx.env.USER_DATA_PATH}/u${timestamp}.svg`;
				const kLastUglyImgPathKey = "last_ugly_avatar_path"

				let lastPath = uni.getStorageSync(kLastUglyImgPathKey)
				console.debug(`lastPath: ${lastPath}`)
				if (lastPath != null && lastPath != undefined && lastPath.length > 0) {
					try {
						fs.unlinkSync(lastPath)
						console.debug('删除上一次生成的丑头像文件')
					} catch (e) {
						console.error(`文件不存在：${lastPath}`)
					}
				}
				fs.writeFile({
					filePath: filePath,
					data: img,
					encoding: 'utf8',
					success: res => {
						console.log('保存成功:', filePath);
						this.svgImagePath = filePath;
						uni.setStorageSync(kLastUglyImgPathKey, filePath)
					},
					fail: err => {
						console.error('保存失败:', err);
					}
				});
			},
			async save() {
				if (this.svgImagePath == null) return
				
				this.svgToPng()
			},
			async svgToPng() {
				if (this.svgString == null) return
				
				if (this.token == null) {
					this.token = randomToken()
				}
				
				uni.showLoading({title: '生成中'})
				try {
					const resp = await postSvgToPng(this.svgString, this.token)
					if (resp != null) {
						const pngPath = await savePngToFile(resp)
						checkPermissionAndSaveToPhotosAlbum(pngPath)
					}
				} catch (e) {
					console.error('svgToPng error', e)
					uni.showModal({
						title: '出错了',
						content: '图片生成失败',
						showCancel: false,
					})
				}
				uni.hideLoading()
			},
			parseTwoDimensionalArray(array) {
				let result = ''
				for (let i = 0; i < array.length; i++) {
					result += array[i].join(',')
					if (i != array.length - 1) {
						result += ','
					}
				}
				return result
			}
		},
		onLoad() {
			this.generateFace();
		},
		onUnload() {
		}
	};
</script>

<style lang="scss">
	.container {
		width: 100vw;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #ffffff;
		
		.imgContainer {
			margin-top: 20px;
			width: 240px;
			height: 240px;
			background-color: white;
			border-radius: 10px;
		}
		
		button {
			margin-top: 12px;
			width: 180px;
			padding: 5px;
			background: transparent;
			border-width: 2px;
			font-size: 15px;
			border-color: black;
			color: black;
			font-weight: bold;
			user-select: none;
			border-radius: 10px;
			box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.75);
		}
		
		button:active {
			background: rgb(65, 65, 65);
			box-shadow: 1px 1px 0px 0px rgba(0, 0, 0, 0.75);
		}
		
		.spacer {
			flex: 1;
		}
	}
</style>