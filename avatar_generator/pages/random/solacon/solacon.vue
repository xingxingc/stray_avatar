<template>
	<common-page :show-back="true">
		<view class="container">
			<view>
				<input 
					placeholder="输入任意字符串生成头像" 
					v-model="inputText" 
					type="text" 
					class="input" 
					@change="generateAvatar()"
					/>
			</view>
			
			<view class="other-box">
				<!-- 背景颜色选择 -->
				<view class="picker-group" @click="chooseBgColor">
					<text class="title">背景:</text>
					<view class="dot"
						:style="{ background: 'rgb(' + bgColor.r + ',' + bgColor.g + ',' + bgColor.b + ')' }" />
				</view>
			</view>
			<view class="imgContainer" >
				<canvas
					v-if="!isShowColorPicker"
					id='s-canvas'
					canvas-id="s-canvas"
					class="s-canvas"/>
			</view>
			<button @click="randomInput">随机生成</button>
			<button @click="saveAvatar">保存相册</button>
			<view class="spacer"></view>
		</view>
	</common-page>
	<t-color-picker ref="bgColorPicker" :color="bgColor" @confirm="confirmBgColor" @close="closeColorPicker"></t-color-picker>
</template>

<script setup>
	import { randomString, showTextToast, randomToken, postSvgToPng, savePngToFile, checkPermissionAndSaveToPhotosAlbum } from '../../../util/util';
	import { ref } from 'vue';
	import { onLoad, onUnload } from '@dcloudio/uni-app'
	import { AppModel } from '../../../model/app_model';

	let rewardedService = null
	let lastGenText = ''
	const inputText = ref('')
	const bgColor = ref({r: 255,g: 255,b: 255,a: 1.0})
	const bgColorPicker = ref(null)
	const isShowColorPicker = ref(false)
	const size = 240
	
	const ctx = uni.createCanvasContext('s-canvas');
	
	onLoad(() => {
		randomInput()
	}) 
	
	onUnload(() => {
		rewardedService.destory()
	})

	function chooseBgColor() {
		bgColorPicker.value.open()
		isShowColorPicker.value = true
	}
	
	function confirmBgColor(e) {
		bgColor.value = e.rgba
		drawAvatar()
	}
	
	function closeColorPicker(e) {
		isShowColorPicker.value = false
		drawAvatar()
	}
	
	function randomInput() {
		inputText.value = AppModel.randomNames[Math.floor(Math.random() * AppModel.randomNames.length)]
		generateAvatar()
	}
	
	function generateAvatar(isBgChanged = false) {
		if (!isBgChanged && inputText.value == lastGenText) return
		if (inputText.value.length == 0) return
		
		lastGenText = inputText.value
		
		drawAvatar()
	}
	
	function drawAvatar() {
		clearCanvas(ctx, size, size)
		
		const bg = bgColor.value
		ctx.fillStyle = `rgb(${bg.r},${bg.g},${bg.b})`
		ctx.fillRect(0, 0, size, size)
		
		drawSolacon(ctx, size, size, {value: lastGenText, margin: 15})
		
		ctx.draw()
	}
	
	function saveAvatar() {
		_didSaveAvatar()
	}
	
	async function _didSaveAvatar() {
		uni.canvasToTempFilePath({
			canvasId: 's-canvas',
			success: res => {
				checkPermissionAndSaveToPhotosAlbum(res.tempFilePath)
			},
			fail: err => {
				uni.showToast({
				    title: '转换失败',
				    icon: 'none'
				});
				console.error(err);
			}
		})
	}
	
	//////////////////////////
	/// 绘制相关
	//////////////////////////
	
	function sdbm(input) {
			let s = String(input);
			if (s.length < 6) s = s + s + s + s + s; // mimic original behavior for short strings
			let h = 0 >>> 0;
			for (let i = 0; i < s.length; i++) {
				h = (s.charCodeAt(i) + ((h << 6) >>> 0) + ((h << 16) >>> 0) - h) >>> 0;
			}
			return h >>> 0;
		}
	
		function niceDecimal(d) {
			return Math.round(d * 1000) / 1000;
		}
	
		function rgbStr01To255(r01, g01, b01) {
			return (
				niceDecimal(r01 * 255) + ',' + niceDecimal(g01 * 255) + ',' + niceDecimal(b01 * 255)
			);
		}
	
		function setRGBFromHash(hashValue) {
			const r = (hashValue & 0x0f) / 15;
			const g = ((hashValue >>> 4) & 0x0f) / 15;
			const b = ((hashValue >>> 8) & 0x0f) / 15;
			return rgbStr01To255(r, g, b);
		}
	
		function pt(theta, r) {
			const x = r * Math.cos(theta);
			const y = r * Math.sin(theta);
			return [x, y];
		}
	
		function drawSwish(ctx, a1, a2, r1, r2, alpha01, centerX, centerY, rgb) {
			const aNudge = 0.3; // kept for parity (not directly used but retained)
			const rNudge = 0.03; // kept for parity
	
			const p1 = pt(a1, r1);
			const p2 = pt(a2, r2);
			const bd = (a2 - a1) / 3;
	
			let b1 = pt(a1 + bd, (r1 + r2) / 2);
			let b2 = pt(a2 - bd, (r1 + r2) / 2);
	
			let b1b = pt(a1 + bd, (r1 + r2) / 3);
			let b2b = pt(a2 - bd, (r1 + r2) / 3);
	
			ctx.beginPath();
			ctx.moveTo(centerX + p1[0], centerY + p1[1]);
			ctx.bezierCurveTo(
				centerX + b1[0], centerY + b1[1],
				centerX + b2[0], centerY + b2[1],
				centerX + p2[0], centerY + p2[1]
			);
			ctx.bezierCurveTo(
				centerX + b1b[0], centerY + b1b[1],
				centerX + b2b[0], centerY + b2b[1],
				centerX + p1[0], centerY + p1[1]
			);
			ctx.closePath();
			ctx.fillStyle = 'rgba(' + rgb + ', ' + niceDecimal(alpha01) + ')';
			ctx.fill();
		}
	
		function drawWedge(ctx, a1, a2, size, data, centerX, centerY, rgb) {
			for (let i = 0; i < data.length; i++) {
				const r1 = size * data[i][0];
				const r2 = size * data[i][1];
				const alpha01 = data[i][2] / 7;
				drawSwish(ctx, a1, a2, r1, r2, alpha01, centerX, centerY, rgb);
			}
		}
	
		function generateDataFromHash(hashValue) {
			const slices = (hashValue & 0x07) + 3;
			const wAngle = (Math.PI * 2) / slices;
			const data = [];
			for (let i = 0; i < 6; i++) {
				data.push([
					((hashValue >>> (i * 3)) & 0x07) / 7,
					((hashValue >>> (i * 3 + 1)) & 0x07) / 7,
					(hashValue >>> (i * 3 + 2)) & 0x07,
				]);
			}
			return { slices, wAngle, data };
		}
	
		function clearCanvas(ctx, width, height) {
			ctx.clearRect(0, 0, width, height);
		}
	
		function drawSolacon(ctx, width, height, options) {
			const opts = options || {};
			const hashValue = typeof opts.hash === 'number' ? (opts.hash >>> 0) : sdbm(opts.value || Math.random().toString());
			const margin = typeof opts.margin === 'number' ? (opts.margin >>> 0) : 0
			const rgb = opts.rgb || setRGBFromHash(hashValue);
			const centerX = width / 2;
			const centerY = height / 2;
			const { slices, wAngle, data } = generateDataFromHash(hashValue);
			
			for (let i = 0; i < slices; i++) {
				const a1 = wAngle * i;
				const a2 = wAngle * (i + 1);
				drawWedge(ctx, a1, a2, Math.min(width, height) / 2 - margin, data, centerX, centerY, rgb);
			}
			return { hash: hashValue, rgb };
		}
	
		function drawSolaconWithValue(ctx, width, height, value, rgb) {
			return drawSolacon(ctx, width, height, { value, rgb });
		}
	
		function drawSolaconWithHash(ctx, width, height, hash, rgb) {
			return drawSolacon(ctx, width, height, { hash, rgb });
		}
</script>

<style lang="scss">
	@import '../../../static/css/base.scss';

	.container {
		width: 100vw;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		.input {
			margin-top: 10px;
			width: 80vw;
			flex: 1;
			padding: 10px 12px;
			border: 2px solid $app-color-black18;
			border-radius: 8px;
			background-color: #fff;
			font-size: 15px;
			font-weight: bold;
		}

		.other-box {
			display: flex;
			justify-content: center;
			align-items: center;

			.picker-group {
				font-size: 13px;
				font-weight: bold;
				color: $app-color-black18;
				display: flex;
				align-items: center;
				padding: 15px 10px;

				.title {
					margin-right: 5px;
				}

				.dot {
					width: 20px;
					height: 20px;
					border-radius: 10px;
					border: 1px solid $app-color-line;
				}
			}
		}

		.imgContainer {
			margin-bottom: 20px;
			width: 240px;
			height: 240px;
			border: 1px solid $app-color-line;
			.s-canvas {
				width: 100%; 
				height: 100%;
			}
		}

		button {
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