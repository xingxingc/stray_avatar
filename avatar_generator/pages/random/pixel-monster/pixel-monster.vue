<template>
	<common-page :show-back="true">
		<view class="container">
			<view class="imgContainer">
				<canvas
					:style="{position: 'relative', left: `${isShowColorPicker ? 1000 : 0}px`, top: '0px'}"
					id="monster-canvas" 
					canvas-id="monster-canvas"
					type="2d"
					style="width: 240px; height: 240px;"></canvas>
			</view>
			<view class="other-box">
				<!-- 形状颜色选择 -->
				<view class="picker-group" @click="chooseShapeColor">
					<text class="title">前景:</text>
					<view class="dot"
						:style="{ background: 'rgba(' + shapeColor.r + ',' + shapeColor.g + ',' + shapeColor.b + ',' + shapeColor.a + ')' }" />
				</view>
			
				<!-- 背景颜色选择 -->
				<view class="picker-group" @click="chooseBgColor">
					<text class="title">背景:</text>
					<view class="dot"
						:style="{ background: 'rgba(' + bgColor.r + ',' + bgColor.g + ',' + bgColor.b + ',' + bgColor.a + ')' }" />
				</view>
			</view>
			<button @click="generateFace()">随机生成</button>
			<button @click="save()">保存相册</button>
			<view class="spacer" />
		</view>
	</common-page>
	<t-color-picker ref="bgColorPicker" :color="bgColor" @confirm="confirmBgColor" @close="closeColorPicker"></t-color-picker>
	<t-color-picker ref="shapeColorPicker" :color="shapeColor" @confirm="confirmShapeColor" @close="closeColorPicker"></t-color-picker>
</template>

<script setup>
	import { ref, getCurrentInstance, onMounted } from 'vue'
	import { checkPermissionAndSaveToPhotosAlbum, showTextToast } from '../../../util/util'
	import { onLoad, onUnload } from '@dcloudio/uni-app'
	import { kMonsterLen, kMonsterLegs, kMonsterHairs, kMonsterArms, kMonsterBodys, kMonsterEyes, kMonsterMouths } from './part-data'
	
	const bgColorPicker = ref(null)
	const shapeColorPicker = ref(null)
	const isShowColorPicker = ref(false)
	const bgColor = ref({r: 233, g: 223, b: 245, a: 1})
	const shapeColor = ref({r: 97, g: 45, b: 76, a: 1})
	
	let ctx = null
	let canvas = null
	let rewardedService = null
	let monsterData = null
	
	function chooseBgColor() {
		isShowColorPicker.value = true
		bgColorPicker.value.open()
	}
	
	function chooseShapeColor() {
		isShowColorPicker.value = true
		shapeColorPicker.value.open()
	}
	
	function confirmBgColor(e) {
		bgColor.value = e.rgba
		draw()
	}
	
	function confirmShapeColor(e) {
		shapeColor.value = e.rgba
		draw()
	}
	
	function closeColorPicker() {
		isShowColorPicker.value = false
	}
	
	function generateFace() {
		monsterData = [
			getRandomSeed(kMonsterLegs),
			getRandomSeed(kMonsterHairs),
			getRandomSeed(kMonsterArms),
			getRandomSeed(kMonsterBodys),
			getRandomSeed(kMonsterEyes),
			getRandomSeed(kMonsterMouths)
		]
		
		draw()
	}
	
	/// 绘制
	async function draw() {
		const canvasWidth = 240
		
		// 清空
		ctx.clearRect(0, 0, canvasWidth, canvasWidth)
		
		// 背景
		const bg = bgColor.value
		const bgFillStyle = `rgb(${bg.r}, ${bg.g}, ${bg.b})`
		ctx.fillStyle = bgFillStyle
		ctx.fillRect(0, 0, canvasWidth, canvasWidth)
		
		const monsterColor = shapeColor.value
		const monsterFillStyle = `rgb(${monsterColor.r}, ${monsterColor.g}, ${monsterColor.b})`
		ctx.fillStyle = monsterFillStyle
		const margin = 34
		const size = Math.round((canvasWidth - 2 * margin) / kMonsterLen)
		for (var p = 0; p < monsterData.length; p ++) {
			const part = monsterData[p]
			for (var i = 0; i < kMonsterLen; i++) {
				const arr = part[i]
				const y = margin + i * size
				for (var j = 0; j < kMonsterLen; j++) {
					const x = margin + j * size
					const v = arr[j]
					switch (v) {
						case 1:
							ctx.fillStyle = monsterFillStyle
							ctx.fillRect(x, y, size, size)
							break;
						case 2:
							ctx.fillStyle = bgFillStyle
							ctx.fillRect(x, y, size, size)
							break;
						default:
							break;
					}
				}
			}
		}
	}
	
	/// 随机获取数组内容
	function getRandomSeed(arr) {
		const idx = Math.floor(Math.random() * arr.length)
		return arr[idx]
	}
	
	function save() {
		_didSave()
	}
	function _didSave() {
		uni.canvasToTempFilePath({
			canvasId: 'monster-canvas',
			canvas: canvas,
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
	
	onLoad(() => {
		const query = uni.createSelectorQuery().in(getCurrentInstance());
		query.select(`#monster-canvas`)
		  .fields({ node: true, size: true })
		  .exec((res) => {
			canvas = res[0].node;
			ctx = canvas.getContext('2d')
			
			const width = res[0].width
			const height = res[0].height
			
			// 初始化画布大小
			const dpr = wx.getWindowInfo().pixelRatio
			canvas.width = width * dpr
			canvas.height = height * dpr
			ctx.scale(dpr, dpr)
			
			setTimeout(() => {
				generateFace()
			}, 380)
		  });
	})
	onUnload(() => {
	})
</script>

<style lang="scss">
	@import '../../../static/css/base.scss';
	
	.container {
		width: 100vw;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: start;
		background-color: #ffffff;
		
		.imgContainer {
			margin-top: 20px;
			width: 240px;
			height: 240px;
			background-color: white;
			border: 1px solid #eee;
			mask-clip: border-box;
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
		
		.spacer {
			flex: 1;
		}
	}
</style>
