<template>
	<common-page :show-back="true">
		<div class="container">
			<image :src="svgImagePath" class="imgContainer"/>
			<view class="color-bar" @click="chooseColor()">
				<text>背景：</text>
				<view class="dot" 
				:style="{background: 'rgb(' + bgColor.r + ',' + bgColor.g + ',' + bgColor.b + ')'}"/>
			</view>
			<button @click="initialization()" class="button">随机生成</button>
			<button @click="save()" class="button">保存相册</button>
			<view class="spacer"></view>
		</div>
	</common-page>
	<t-color-picker ref="colorPicker" :color="bgColor" @confirm="confirmColor"></t-color-picker>
</template>

<script>
	import {
		checkPermissionAndSaveToPhotosAlbum, delay, postSvgToPng, randomToken, savePngToFile, showTextToast
	} from '../../../util/util.ts';
	import templateText from './duck_svg_template.js'

	function randomFromInterval(min, max) {
		// min and max included
		return Math.random() * (max - min) + min;
	}
	export default {
		name: "DuckGenerator",
		data() {
			return {
				token: null,
				svgString: null,
				svgImagePath: null,
				point_per_segment: 15,
				computedFacePoints: "",
				bgColor: {r:255, g:255, b:255, a: 1},
				faceY: 40,
				faceX: 25,
				faceScale: 1.0,
				faceK: 0.01,
				eyeHeight: 20,
				eyeLevelWidth: 20,
				eyePositionScale: 4.0,
				leftEyeX: 0,
				rightEyeX: 0,
				faceRotateDegree: 0,
				showRightEye: true,
				showLeftEye: true,
				mouthY: 0,
				mouthX: 0,
				mouthWidth: 0,
				mouthHeight: 0,
				faceRotation: 0,
				faceTranslationX: 0,
				faceTranslationY: 0,
				computedBodyPoints: "",
				bodyY: 40,
				bodyX: 25,
				bodyScale: 1.0,
				bodyK: 0.01,
				bodyRotation: 0,
				bodyTranslationX: 0,
				bodyTranslationY: 0,
				bodyPointsRaw: [],
				computedRotatedBodyPoints: "",
				computedMouthPoints: "",
				leftLegPoints: "",
				rightLegPoints: "",
				leftLegPointsStart: [],
				leftLegPointEnd: [],
				rightLegPointStart: [],
				rightLegPointEnd: [],
				leftFeetMiddleFingerPoints: "",
				rightFeetMiddleFingerPoints: "",
				leftFeetRotateDegree: 0,
				rightFeetRotateDegree: 0,
				feetLength: 0,
			};
		},
		methods: {
			getEggShapePoints(a, b, k, isFace, segment_points) {
				// the function is x^2/a^2 * (1 + ky) + y^2/b^2 = 1
				// we want to intersect it with a line
				var result = [];
				//   var pointString = "";
				for (var i = 0; i < segment_points; i++) {
					// x positive, y positive
					// first compute the degree
					var degree =
						(Math.PI / 2 / segment_points) * i +
						randomFromInterval(
							-Math.PI / 1.1 / segment_points,
							Math.PI / 1.1 / segment_points
						);
					var y = Math.sin(degree) * b;
					var x =
						Math.sqrt(((1 - (y * y) / (b * b)) / (1 + k * y)) * a * a) +
						randomFromInterval(-a / 200.0, a / 200.0);
					// pointString += x + "," + y + " ";
					result.push([x, y]);
				}
				for (var i = segment_points; i > 0; i--) {
					// x is negative, y is positive
					var degree =
						(Math.PI / 2 / segment_points) * i +
						randomFromInterval(
							-Math.PI / 1.1 / segment_points,
							Math.PI / 1.1 / segment_points
						);
					var y = Math.sin(degree) * b;
					var x = -Math.sqrt(((1 - (y * y) / (b * b)) / (1 + k * y)) * a * a) +
						randomFromInterval(-a / 200.0, a / 200.0);
					// pointString += x + "," + y + " ";
					result.push([x, y]);
				}
				if (isFace) {
					var eyeSelectionSlice = Math.floor(
						segment_points / (Math.random() * 0.3 + 1.8)
					);
					var mouthSelectionSlice =
						eyeSelectionSlice - Math.floor(segment_points / 5);
				}
				for (var i = 0; i < segment_points; i++) {
					// x is negative, y is negative
					var degree =
						(Math.PI / 2 / segment_points) * i +
						randomFromInterval(
							-Math.PI / 1.1 / segment_points,
							Math.PI / 1.1 / segment_points
						);
					var y = -Math.sin(degree) * b;
					var x = -Math.sqrt(((1 - (y * y) / (b * b)) / (1 + k * y)) * a * a) +
						randomFromInterval(-a / 200.0, a / 200.0);
					// pointString += x + "," + y + " ";
					result.push([x, y]);
					if (isFace) {
						if (i == mouthSelectionSlice) {
							var trueDegree = (Math.PI / 2 / segment_points) * i;
							var trueY = -Math.sin(trueDegree) * b;
							var trueX = -Math.sqrt(
								((1 - (trueY * trueY) / (b * b)) / (1 + k * trueY)) * a * a
							);
							this.mouthY = trueY;
							this.mouthX = -trueX;
							this.mouthWidth = randomFromInterval(0.4 * -trueX, 0.5 * -trueX);
							this.mouthHeight = randomFromInterval(
								0.3 * this.mouthWidth,
								0.5 * this.mouthWidth
							);
							this.mouthY += this.mouthHeight / 2;
						}
						if (i == eyeSelectionSlice) {
							this.eyeHeight = y;
							this.eyeLevelWidth = -x * 2;
							this.eyePositionScale = randomFromInterval(2.9, 4.1);
							var rightEyeDegree = Math.acos(
								this.eyeLevelWidth / this.eyePositionScale / -x / 1.1
							);
							var leftEyeDegree = Math.acos(
								this.eyeLevelWidth / this.eyePositionScale / x / 1.1
							);
							//   console.log(rightEyeDegree, leftEyeDegree);
							this.faceRotateDegree = randomFromInterval(-80, 80);
							rightEyeDegree += (this.faceRotateDegree / 180.0) * Math.PI;
							leftEyeDegree += (this.faceRotateDegree / 180.0) * Math.PI;
							// if (rightEyeDegree < 0 || rightEyeDegree > Math.PI) {
							//   this.showRightEye = false;
							// } else {
							//   this.showRightEye = true;
							// }
							// if (leftEyeDegree < 0 || leftEyeDegree > Math.PI) {
							//   this.showLeftEye = false;
							// } else {
							//   this.showLeftEye = true;
							// }
							this.rightEyeX = Math.cos(rightEyeDegree) * -x * 1.1;
							this.leftEyeX = Math.cos(leftEyeDegree) * -x * 1.1;
						}
					}
				}
				if (isFace) {
					this.mouthX =
						Math.cos(((this.faceRotateDegree * 1.1 + 90) / 180.0) * Math.PI) *
						this.mouthX;
				}
				//   console.log(this.mouthX);
				for (var i = segment_points; i > 0; i--) {
					// x is positive, y is negative
					var degree =
						(Math.PI / 2 / segment_points) * i +
						randomFromInterval(
							-Math.PI / 1.1 / segment_points,
							Math.PI / 1.1 / segment_points
						);
					var y = -Math.sin(degree) * b;
					var x =
						Math.sqrt(((1 - (y * y) / (b * b)) / (1 + k * y)) * a * a) +
						randomFromInterval(-a / 200.0, a / 200.0);
					// pointString += x + "," + y + " ";
					result.push([x, y]);
				}
				//   pointString += result[0][0] + "," + result[0][1] + " ";
				//   const svg = document.getElementById("duck-svg");
				return result;
				//   return pointString;
			},
			initializeFace() {
				this.faceY = randomFromInterval(15, 30);
				this.faceX = randomFromInterval(10, 18);
				this.faceScale = randomFromInterval(1.0, 1.2);
				this.faceK =
					randomFromInterval(0.001, 0.01) * (Math.random() > 0.5 ? 1 : -1);
				var facePoints = this.getEggShapePoints(
					this.faceX,
					this.faceY,
					this.faceK,
					true,
					this.point_per_segment
				);
				this.computedFacePoints = "";
				for (var i = 0; i < facePoints.length; i++) {
					this.computedFacePoints +=
						facePoints[i][0] + "," + facePoints[i][1] + " ";
				}
				this.computedFacePoints +=
					facePoints[0][0] + "," + facePoints[0][1] + " ";
				this.faceRotation = randomFromInterval(-30, 30);
				this.faceTranslationX = randomFromInterval(
					-this.faceX / 6,
					this.faceX / 6
				);
				this.faceTranslationY = randomFromInterval(
					-this.faceY / 4,
					this.faceY / 4
				);
			},

			initializeBody() {
				this.bodyY = randomFromInterval(20, 30);
				this.bodyX = randomFromInterval(20, 30);
				this.bodyScale = randomFromInterval(1.0, 1.2);
				this.faceK =
					randomFromInterval(0.0001, 0.001) * (Math.random() > 0.5 ? 1 : -1);
				this.bodyRotation = randomFromInterval(-90, 90);

				this.computedBodyPoints = "";
				var bodyPoints = this.getEggShapePoints(
					this.bodyX,
					this.bodyY,
					this.bodyK,
					false,
					this.point_per_segment
				);
				for (var i = 0; i < bodyPoints.length; i++) {
					this.computedBodyPoints +=
						bodyPoints[i][0] + "," + bodyPoints[i][1] + " ";
				}
				this.computedBodyPoints +=
					bodyPoints[0][0] + "," + bodyPoints[0][1] + " ";
				this.bodyTranslationY =
					this.bodyY + randomFromInterval(-this.bodyY / 6, this.bodyY / 6);
				this.bodyTranslationX = randomFromInterval(
					-this.bodyX / 8,
					this.bodyX / 8
				);
				this.bodyPointsRaw = bodyPoints;
			},
			initializeLeg() {
				// first we rotate each point by degree
				var cosTheta = Math.cos((this.bodyRotation / 180.0) * Math.PI);
				var sinTheta = Math.sin((this.bodyRotation / 180.0) * Math.PI);
				// matrix is
				// cosTheta -sinTheta
				// sinTheta cosTheta
				var rotatedPoints = [];
				for (var i = 0; i < this.bodyPointsRaw.length; i++) {
					var x = this.bodyPointsRaw[i][0];
					var y = this.bodyPointsRaw[i][1];
					var rotatedX = x * cosTheta - y * sinTheta;
					var rotatedY = x * sinTheta + y * cosTheta;
					rotatedPoints.push([
						rotatedX * this.bodyScale,
						rotatedY * this.bodyScale,
					]);
				}
				this.computedRotatedBodyPoints = "";
				for (var i = 0; i < rotatedPoints.length; i++) {
					this.computedRotatedBodyPoints +=
						rotatedPoints[i][0] + "," + rotatedPoints[i][1] + " ";
				}
				this.computedRotatedBodyPoints +=
					rotatedPoints[0][0] + "," + rotatedPoints[0][1] + " ";
				// we choose lets to be degree 15 and degree -15
				var legSpreadDegree = 15;
				var leftLegRotateDegree = randomFromInterval(
					-this.faceRotateDegree / 4,
					this.faceRotateDegree / 1.1
				);
				var rightLegRotateDegree = randomFromInterval(
					-this.faceRotateDegree / 4,
					this.faceRotateDegree / 1.1
				);
				while (
					90 +
					legSpreadDegree +
					leftLegRotateDegree -
					(90 - legSpreadDegree + rightLegRotateDegree) <
					20
				) {
					leftLegRotateDegree = randomFromInterval(
						-this.faceRotateDegree / 4,
						this.faceRotateDegree / 1.1
					);
					rightLegRotateDegree = randomFromInterval(
						-this.faceRotateDegree / 4,
						this.faceRotateDegree / 1.1
					);
				}
				// console.log(this.faceRotateDegree, legRotateDegree);
				var leftLegTan = Math.tan(
					((90 + legSpreadDegree + leftLegRotateDegree) / 180.0) * Math.PI
				);
				var rightLegTan = Math.tan(
					((90 - legSpreadDegree + rightLegRotateDegree) / 180.0) * Math.PI
				);
				var leftLegEndTan = Math.tan(
					((90 + legSpreadDegree + leftLegRotateDegree - 2) / 180.0) * Math.PI
				);
				var rightLegEndTan = Math.tan(
					((90 - legSpreadDegree + rightLegRotateDegree + 2) / 180.0) * Math.PI
				);
				var leftLegClosestDistance = Math.pow(10, 1000);
				var rightLegClosestDistance = Math.pow(10, 1000);
				var leftLegEndClosestDistance = Math.pow(10, 1000);
				var rightLegEndClosestDistance = Math.pow(10, 1000);
				var leftLegClosestPoint = [0, 0];
				var rightLegClosestPoint = [0, 0];
				var leftLegEndClosestPoint = [0, 0];
				var rightLegEndClosestPoint = [0, 0];
				for (var i = 0; i < rotatedPoints.length; i++) {
					// console.log( rotatedPoints[i]);
					if (rotatedPoints[i][1] > 0) {
						// we only consider y positive
						var x = rotatedPoints[i][0];
						var y = rotatedPoints[i][1];
						if (Math.pow(y / x - leftLegTan, 2) < leftLegClosestDistance) {
							leftLegClosestDistance = Math.pow(y / x - leftLegTan, 2);
							leftLegClosestPoint = [
								x * randomFromInterval(0.5, 0.8),
								y * randomFromInterval(0.5, 0.8),
							];
						}
						if (Math.pow(y / x - rightLegTan, 2) < rightLegClosestDistance) {
							rightLegClosestDistance = Math.pow(y / x - rightLegTan, 2);
							rightLegClosestPoint = [
								x * randomFromInterval(0.5, 0.8),
								y * randomFromInterval(0.5, 0.8),
							];
						}
						if (Math.pow(y / x - leftLegEndTan, 2) < leftLegEndClosestDistance) {
							leftLegEndClosestDistance = Math.pow(y / x - leftLegEndTan, 2);
							leftLegEndClosestPoint = [
								x * randomFromInterval(1.2, 1.3),
								y * randomFromInterval(1.2, 1.3),
							];
						}
						if (
							Math.pow(y / x - rightLegEndTan, 2) < rightLegEndClosestDistance
						) {
							rightLegEndClosestDistance = Math.pow(y / x - rightLegEndTan, 2);
							rightLegEndClosestPoint = [
								x * randomFromInterval(1.2, 1.3),
								y * randomFromInterval(1.2, 1.3),
							];
						}
					}
				}
				var leftControlRandom1 = randomFromInterval(0.2, 0.4);
				var leftControlRandom2 = randomFromInterval(0.2, 0.4);
				var leftLegNormal = [
					-leftLegEndClosestPoint[1] + leftLegClosestPoint[1],
					leftLegEndClosestPoint[0] - leftLegClosestPoint[0],
				];
				if (this.faceRotateDegree < 0) {
					leftLegNormal = [
						leftLegEndClosestPoint[1] - leftLegClosestPoint[1],
						-leftLegEndClosestPoint[0] + leftLegClosestPoint[0],
					];
				}
				var leftLegControlPoint1 = [
					leftLegClosestPoint[0] +
					(leftLegEndClosestPoint[0] - leftLegClosestPoint[0]) *
					leftControlRandom1 +
					leftLegNormal[0] /
					(randomFromInterval(5, 10) +
						(90 - Math.abs(this.faceRotateDegree)) / 20),
					leftLegClosestPoint[1] +
					(leftLegEndClosestPoint[1] - leftLegClosestPoint[1]) *
					leftControlRandom1 +
					leftLegNormal[1] /
					(randomFromInterval(5, 10) +
						(90 - Math.abs(this.faceRotateDegree)) / 20),
				];

				var leftLegControlPoint2 = [
					leftLegEndClosestPoint[0] +
					(leftLegClosestPoint[0] - leftLegEndClosestPoint[0]) *
					leftControlRandom2 +
					leftLegNormal[0] /
					(randomFromInterval(5, 10) +
						(90 - Math.abs(this.faceRotateDegree)) / 20),
					leftLegEndClosestPoint[1] +
					(leftLegClosestPoint[1] - leftLegEndClosestPoint[1]) *
					leftControlRandom2 +
					leftLegNormal[0] /
					(randomFromInterval(5, 10) +
						(90 - Math.abs(this.faceRotateDegree)) / 20),
				];
				var rightControlRandom1 = randomFromInterval(0.2, 0.4);
				var rightControlRandom2 = randomFromInterval(0.2, 0.4);
				var rightLegNormal = [
					-rightLegEndClosestPoint[1] + rightLegClosestPoint[1],
					rightLegEndClosestPoint[0] - rightLegClosestPoint[0],
				];
				if (this.faceRotateDegree < 0) {
					rightLegNormal = [
						rightLegEndClosestPoint[1] - rightLegClosestPoint[1],
						-rightLegEndClosestPoint[0] + rightLegClosestPoint[0],
					];
				}
				var rightLegControlPoint1 = [
					rightLegClosestPoint[0] +
					(rightLegEndClosestPoint[0] - rightLegClosestPoint[0]) *
					rightControlRandom1 +
					rightLegNormal[0] /
					(randomFromInterval(5, 10) +
						(90 - Math.abs(this.faceRotateDegree)) / 20),
					rightLegClosestPoint[1] +
					(rightLegEndClosestPoint[1] - rightLegClosestPoint[1]) *
					rightControlRandom1 +
					rightLegNormal[1] /
					(randomFromInterval(5, 10) +
						(90 - Math.abs(this.faceRotateDegree)) / 20),
				];
				var rightLegControlPoint2 = [
					rightLegEndClosestPoint[0] +
					(rightLegClosestPoint[0] - rightLegEndClosestPoint[0]) *
					rightControlRandom2 +
					rightLegNormal[0] /
					(randomFromInterval(5, 10) +
						(90 - Math.abs(this.faceRotateDegree)) / 20),
					rightLegEndClosestPoint[1] +
					(rightLegClosestPoint[1] - rightLegEndClosestPoint[1]) *
					rightControlRandom2 +
					rightLegNormal[0] /
					(randomFromInterval(5, 10) +
						(90 - Math.abs(this.faceRotateDegree)) / 20),
				];

				this.rightLegPoints =
					"M " +
					rightLegClosestPoint[0] +
					" " +
					rightLegClosestPoint[1] +
					" C " +
					rightLegControlPoint1[0] +
					" " +
					rightLegControlPoint1[1] +
					", " +
					rightLegControlPoint2[0] +
					" " +
					rightLegControlPoint2[1] +
					", " +
					rightLegEndClosestPoint[0] +
					" " +
					rightLegEndClosestPoint[1];
				this.leftLegPoints =
					"M " +
					leftLegClosestPoint[0] +
					" " +
					leftLegClosestPoint[1] +
					" C " +
					leftLegControlPoint1[0] +
					" " +
					leftLegControlPoint1[1] +
					", " +
					leftLegControlPoint2[0] +
					" " +
					leftLegControlPoint2[1] +
					", " +
					leftLegEndClosestPoint[0] +
					" " +
					leftLegEndClosestPoint[1];
				this.leftLegPointStart = leftLegClosestPoint;
				this.leftLegPointEnd = leftLegEndClosestPoint;
				this.rightLegPointStart = rightLegClosestPoint;
				this.rightLegPointEnd = rightLegEndClosestPoint;
			},
			initializeMouth() {
				this.computedMouthPoints = "";
				var mouthRaw = this.getEggShapePoints(
					this.mouthWidth,
					this.mouthHeight,
					randomFromInterval(0.001, 0.01),
					false,
					8
				);
				for (var i = 0; i < mouthRaw.length; i++) {
					this.computedMouthPoints +=
						mouthRaw[i][0] +
						this.mouthX +
						", " +
						(mouthRaw[i][1] + this.mouthY) +
						" ";
				}
				this.computedMouthPoints +=
					mouthRaw[0][0] + this.mouthX + ", " + (mouthRaw[0][1] + this.mouthY);
				// console.log(this.computedMouthPoints);
			},
			initializeFeet() {
				// first we get the normal
				var leftLegNormal = [
					-this.leftLegPointEnd[1] + this.leftLegPointStart[1],
					this.leftLegPointEnd[0] - this.leftLegPointStart[0],
				];
				if (this.faceRotateDegree < 0) {
					leftLegNormal = [
						this.leftLegPointEnd[1] - this.leftLegPointStart[1],
						-this.leftLegPointEnd[0] + this.leftLegPointStart[0],
					];
				}
				var rightLegNormal = [
					-this.rightLegPointEnd[1] + this.rightLegPointStart[1],
					this.rightLegPointEnd[0] - this.rightLegPointStart[0],
				];
				if (this.faceRotateDegree < 0) {
					rightLegNormal = [
						this.rightLegPointEnd[1] - this.rightLegPointStart[1],
						-this.rightLegPointEnd[0] - this.rightLegPointStart[0],
					];
				}
				this.feetLength =
					Math.max(
						Math.sqrt(
							Math.pow(this.leftLegPointEnd[0] - this.leftLegPointStart[0], 2) +
							Math.pow(this.leftLegPointEnd[1] - this.leftLegPointStart[1], 2)
						),
						Math.sqrt(
							Math.pow(this.rightLegPointEnd[0] - this.rightLegPointStart[0], 2) +
							Math.pow(this.rightLegPointEnd[1] - this.rightLegPointStart[1], 2)
						)
					) * randomFromInterval(0.4, 0.6);
				// initialize left feet middle finger
				this.leftFeetMiddleFingerPoints =
					"0,0 0," + -this.feetLength * randomFromInterval(0.8, 1.1);
				this.rightFeetMiddleFingerPoints =
					"0,0 0," + -this.feetLength * randomFromInterval(0.8, 1.1);
				this.leftFeetRotateDegree =
					(90 -
						Math.atan(
							this.leftLegPointEnd[1] - this.leftLegPointStart[1],
							this.leftLegPointEnd[0] - this.leftLegPointStart[0]
						) *
						(180 / Math.PI)) *
					randomFromInterval(1, 5);
				this.rightFeetRotateDegree =
					(90 -
						Math.atan(
							this.rightLegPointEnd[1] - this.rightLegPointStart[1],
							this.rightLegPointEnd[0] - this.rightLegPointStart[0]
						) *
						(180 / Math.PI)) *
					randomFromInterval(1, 5);
				// console.log(this.rightFeetRotateDegree);
				// console.log(this.feetLength);
			},
			initialization() {
				this.initializeFace();
				this.initializeBody();
				this.initializeLeg();
				this.initializeFeet();
				this.initializeMouth();

				this.draw()
			},
			draw() {
				let img = templateText
				
				let bodyContour_transform = 'translate(' +
					this.bodyTranslationX +
					' ' +
					this.bodyTranslationY +
					') rotate(' +
					this.bodyRotation +
					') scale(' +
					this.bodyScale +
					')'
				img = img.replaceAll('##bgColor##', `rgb(${this.bgColor.r},${this.bgColor.g},${this.bgColor.b})`)
				// img = img.replaceAll('##bgColorOpacity##', this.bgColor.a ?? 1.0)
				// 透明度已移除，如需恢复，放开上方代码注释，并在duck_svg_template.js里 fill='..'后面添加：
				// fill-opacity="##bgColorOpacity##"
				img = img.replaceAll('##bodyContour_transform##', bodyContour_transform)
				img = img.replaceAll('##computedBodyPoints##', this.computedBodyPoints)
				let bodyContour_stroke_width = 3.0 / this.bodyScale
				img = img.replaceAll('##bodyContour_stroke_width##', bodyContour_stroke_width)
				let faceContour_transform = 'translate(' +
					this.faceTranslationX +
					' ' +
					this.faceTranslationY +
					') rotate(' +
					this.faceRotation +
					') scale(' +
					this.faceScale +
					')'
				img = img.replaceAll('##faceContour_transform##', faceContour_transform)
				img = img.replaceAll('##computedFacePoints##', this.computedFacePoints)
				let faceContour_stroke_width = 3.0 / this.faceScale
				img = img.replaceAll('##faceContour_stroke_width##', faceContour_stroke_width)
				let faceInterior_transform = 'translate(' +
					this.faceTranslationX +
					' ' +
					this.faceTranslationY +
					') rotate(' +
					this.faceRotation +
					') scale(' +
					this.faceScale +
					')'
				img = img.replaceAll('##faceInterior_transform##', faceInterior_transform)
				let bodyInterior_transform = 'translate(' +
					this.bodyTranslationX +
					' ' +
					this.bodyTranslationY +
					') rotate(' +
					this.bodyRotation +
					') scale(' +
					this.bodyScale +
					')'
				img = img.replaceAll('##bodyInterior_transform##', bodyInterior_transform)
				img = img.replaceAll('##computedBodyPoints##', this.computedBodyPoints)
				let leg_transform = 'translate(' + this.bodyTranslationX + ' ' + this.bodyTranslationY + ')'
				img = img.replaceAll('##leg_transform##', leg_transform)
				img = img.replaceAll('##leftLegPoints##', this.leftLegPoints)
				img = img.replaceAll('##rightLegPoints##', this.rightLegPoints)
				let left_feet_transform_1 = 'translate(' +
					this.leftLegPointEnd[0] +
					' ' +
					this.leftLegPointEnd[1] +
					') rotate(' +
					(-this.faceRotateDegree * 1.2 - this.leftFeetRotateDegree) +
					')'
				img = img.replaceAll('##left_feet_transform_1##', left_feet_transform_1)
				img = img.replaceAll('##leftFeetMiddleFingerPoints##', this.leftFeetMiddleFingerPoints)
				let left_feet_transform_2 = 'translate(' +
					this.leftLegPointEnd[0] +
					' ' +
					this.leftLegPointEnd[1] +
					') rotate(' +
					(-this.faceRotateDegree * 1.2 - this.leftFeetRotateDegree + 25) +
					')'
				img = img.replaceAll('##left_feet_transform_2##', left_feet_transform_2)
				let left_feet_transform_3 = 'translate(' +
					this.leftLegPointEnd[0] +
					' ' +
					this.leftLegPointEnd[1] +
					') rotate(' +
					(-this.faceRotateDegree * 1.2 - this.leftFeetRotateDegree - 25) +
					')'
				img = img.replaceAll('##left_feet_transform_3##', left_feet_transform_3)
				let left_feet_transform_4 = 'translate(' +
					this.leftLegPointEnd[0] +
					' ' +
					this.leftLegPointEnd[1] +
					') rotate(' +
					(-this.faceRotateDegree * 1.2 - this.leftFeetRotateDegree + 12.5) +
					') scale(0.88)'
				img = img.replaceAll('##left_feet_transform_4##', left_feet_transform_4)
				let left_feet_transform_5 = 'translate(' +
					this.leftLegPointEnd[0] +
					' ' +
					this.leftLegPointEnd[1] +
					') rotate(' +
					(-this.faceRotateDegree * 1.2 - this.leftFeetRotateDegree - 12.5) +
					') scale(0.88)'
				img = img.replaceAll('##left_feet_transform_5##', left_feet_transform_5)
				let left_feet_stroke_width = this.feetLength / 2.5
				img = img.replaceAll('##left_feet_stroke_width##', left_feet_stroke_width)
				img = img.replaceAll('##rightFeetMiddleFingerPoints##', this.rightFeetMiddleFingerPoints)
				let right_feet_transform_1 = 'translate(' +
					this.rightLegPointEnd[0] +
					' ' +
					this.rightLegPointEnd[1] +
					') rotate(' +
					(-this.faceRotateDegree * 1.2 - this.rightFeetRotateDegree) +
					')'
				img = img.replaceAll('##right_feet_transform_1##', right_feet_transform_1)
				let right_feet_transform_2 = 'translate(' +
					this.rightLegPointEnd[0] +
					' ' +
					this.rightLegPointEnd[1] +
					') rotate(' +
					(-this.faceRotateDegree * 1.2 - this.rightFeetRotateDegree + 25) +
					')'
				img = img.replaceAll('##right_feet_transform_2##', right_feet_transform_2)
				let right_feet_transform_3 = 'translate(' +
					this.rightLegPointEnd[0] +
					' ' +
					this.rightLegPointEnd[1] +
					') rotate(' +
					(-this.faceRotateDegree * 1.2 - this.rightFeetRotateDegree - 25) +
					')'
				img = img.replaceAll('##right_feet_transform_3##', right_feet_transform_3)
				let right_feet_transform_4 = 'translate(' +
					this.rightLegPointEnd[0] +
					' ' +
					this.rightLegPointEnd[1] +
					') rotate(' +
					(-this.faceRotateDegree * 1.2 - this.rightFeetRotateDegree + 12.5) +
					') scale(0.88)'
				img = img.replaceAll('##right_feet_transform_4##', right_feet_transform_4)
				let right_feet_transform_5 = 'translate(' +
					this.rightLegPointEnd[0] +
					' ' +
					this.rightLegPointEnd[1] +
					') rotate(' +
					(-this.faceRotateDegree * 1.2 - this.rightFeetRotateDegree - 12.5) +
					') scale(0.88)'
				img = img.replaceAll('##right_feet_transform_5##', right_feet_transform_5)
				let right_feet_stroke_width = this.feetLength / 2.5
				img = img.replaceAll('##right_feet_stroke_width##', right_feet_stroke_width)
				let eye_mouth_transform = 'translate(' +
					this.faceTranslationX +
					' ' +
					this.faceTranslationY +
					') rotate(' +
					this.faceRotation +
					') scale(' +
					this.faceScale +
					')'
				img = img.replaceAll('##eye_mouth_transform##', eye_mouth_transform)
				img = img.replaceAll('##rightEyeX##', this.rightEyeX)
				img = img.replaceAll('##computedMouthPoints##', this.computedMouthPoints)
				img = img.replaceAll('##eyeHeight##', this.eyeHeight)
				img = img.replaceAll('##leftEyeX##', this.leftEyeX)
				let right_eye_rx = Math.random() * 0.3 + 1.3 / this.faceScale
				img = img.replaceAll('##right_eye_rx##', right_eye_rx)
				let right_eye_ry = Math.random() * 0.3 + 1.3 / this.faceScale
				img = img.replaceAll('##right_eye_ry##', right_eye_ry)
				let left_eye_rx = Math.random() * 0.3 + 1.3 / this.faceScale
				img = img.replaceAll('##left_eye_rx##', left_eye_rx)
				let left_eye_ry = Math.random() * 0.3 + 1.3 / this.faceScale
				img = img.replaceAll('##left_eye_ry##', left_eye_ry)
				
				this.svgString = img
				
				const fs = wx.getFileSystemManager();
				const timestamp = new Date().getTime();
				const filePath = `${wx.env.USER_DATA_PATH}/d${timestamp}.svg`;
				const kLastDuckImgPathKey = "last_duck_path"
				
				let lastPath = uni.getStorageSync(kLastDuckImgPathKey)
				console.debug(`lastPath: ${lastPath}`)
				if (lastPath != null && lastPath != undefined && lastPath.length > 0) {
					try {
						fs.unlinkSync(lastPath)
						console.debug('删除上一次生成的鸭子头像文件')
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
						uni.setStorageSync(kLastDuckImgPathKey, filePath)
					},
					fail: err => {
						console.error('保存失败:', err);
					}
				});
			},
			save() {
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
					const pngPath = await savePngToFile(resp)
					checkPermissionAndSaveToPhotosAlbum(pngPath)
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
			chooseColor() {
				this.$refs.colorPicker.open()
			},
			confirmColor(e) {
				this.bgColor = e.rgba
				this.draw()
			}
		},
		onLoad() {
			this.initialization();
		},
		onUnload: () => {
		}
	};
</script>

<style scoped lang="scss">
	@import '../../../static/css/base.scss';
	
	.container {
		width: 100vw;
		height: 100%;
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: start;
		
		.imgContainer {
			margin-top: 20px;
			width: 240px;
			height: 240px;
			background-color: white;
			border: 1px solid #eee;
			border-radius: 10px;
		}
		
		.color-bar {
			color: $app-color-black18;
			font-size: 13px;
			font-weight: bold;
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;
			padding: 15px 15px;
			.dot {
				width: 20px;
				height: 20px;
				background-color: #ffffff;
				border: 1px solid $app-color-line;
				border-radius: 10px;
			}
		}
		
		.button {
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
			margin-bottom: 12px;
			
			&:active {
				background: rgb(65, 65, 65);
				box-shadow: 1px 1px 0px 0px rgba(0, 0, 0, 0.75);
			}
		}
		
		.spacer {
			flex: 1;
		}
	}
</style>