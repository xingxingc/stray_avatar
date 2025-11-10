<template>
	<common-page show-back="true">
		<view class='container'>
			<view class="imgContainer" >
				<canvas
					v-if="!isShowColorPicker"
					canvas-id="m-canvas" 
					id="m-canvas"
					class="m-canvas"/>
			</view>
			<view class="other-box">
				<!-- 背景颜色选择 -->
				<view class="picker-group" @click="chooseColor">
					<text class="title">背景:</text>
					<view class="dot"
						:style="{ background: 'rgba(' + bgColor.r + ',' + bgColor.g + ',' + bgColor.b + ',' + bgColor.a + ')' }" />
				</view>
				<!-- 形态选择 -->
				<view class="picker-group arrow">
					<picker mode="selector" :range="CuteDogData.hat_data.list" range-key="name" :value="partsIdx.hat" @change="onHatChange"
						class="picker">
						<text class="title">{{ CuteDogData.hat_data.name }}:</text>
						<text>{{ CuteDogData.hat_data.list[partsIdx.hat].name }}</text>
					</picker>
				</view>
				<!-- 身躯选择 -->
				<view class="picker-group arrow">
					<picker mode="selector" :range="CuteDogData.body_data.list" range-key="name" :value="partsIdx.body" @change="onBodyChange"
						class="picker">
						<text class="title">{{ CuteDogData.body_data.name }}:</text>
						<text>{{ CuteDogData.body_data.list[partsIdx.body].name }}</text>
					</picker>
				</view>
				<!-- 服饰选择 -->
				<view class="picker-group arrow">
					<picker mode="selector" :range="CuteDogData.shirt_data.list" range-key="name" :value="partsIdx.shirt" @change="onShirtChange"
						class="picker">
						<text class="title">{{ CuteDogData.shirt_data.name }}:</text>
						<text>{{ CuteDogData.shirt_data.list[partsIdx.shirt].name }}</text>
					</picker>
				</view>
			</view>
			<view class="other-box">
				<!-- 眼睛选择 -->
				<view class="picker-group arrow">
					<picker mode="selector" :range="CuteDogData.eyes_data.list" range-key="name" :value="partsIdx.eyes" @change="onEyesChange"
						class="picker">
						<text class="title">{{ CuteDogData.eyes_data.name }}:</text>
						<text>{{ CuteDogData.eyes_data.list[partsIdx.eyes].name }}</text>
					</picker>
				</view>
				<!-- 嘴巴选择 -->
				<view class="picker-group arrow">
					<picker mode="selector" :range="CuteDogData.mouth_data.list" range-key="name" :value="partsIdx.mouth" @change="onMouthChange"
						class="picker">
						<text class="title">{{ CuteDogData.mouth_data.name }}:</text>
						<text>{{ CuteDogData.mouth_data.list[partsIdx.mouth].name }}</text>
					</picker>
				</view>
				<!-- 爪饰选择 -->
				<view class="picker-group arrow">
					<picker mode="selector" :range="CuteDogData.glove_data.list" range-key="name" :value="partsIdx.glove" @change="onGloveChange"
						class="picker">
						<text class="title">{{ CuteDogData.glove_data.name }}:</text>
						<text>{{ CuteDogData.glove_data.list[partsIdx.glove].name }}</text>
					</picker>
				</view>
				<!-- 卡片选择 -->
				<view class="picker-group arrow">
					<picker mode="selector" :range="CuteDogData.card_data.list" range-key="name" :value="partsIdx.card" @change="onCardChange"
						class="picker">
						<text class="title">{{ CuteDogData.card_data.name }}:</text>
						<text>{{ CuteDogData.card_data.list[partsIdx.card].name }}</text>
					</picker>
				</view>
			</view>
			<button @click="randomAvatar()">随机生成</button>
			<button @click="save()">保存相册</button>
			<view class="spacer"></view>
		</view>
		<t-color-picker ref="colorPicker" :color="bgColor" @confirm="confirmColor" @close="closeColorPicker"></t-color-picker>
	</common-page>
</template>

<script setup>
	import { ref } from 'vue'
	import { onLoad, onUnload } from '@dcloudio/uni-app'
	import { checkPermissionAndSaveToPhotosAlbum, showTextToast } from '../../../../util/util'
	import { CuteDogData } from './cute_dog_data'
	
	let rewardedService = null
	const size = 240
	const margin = 0
	const imgSize = size - 2 * margin
	var partIdxArr = []
	
	const ctx = uni.createCanvasContext('m-canvas');
	
	const colorPicker = ref(null)
	const isShowColorPicker = ref(false)
	const bgColor = ref({r: 255, g: 255, b: 255, a: 1})
	
	/// 组成部分
	const partsIdx = ref({ hat: 0, body: 0, shirt: 0, eyes: 0, mouth: 0, card: 0, hand: 0, glove: 0 })
	
	function chooseColor() {
		isShowColorPicker.value = true
		colorPicker.value.open()
	}
	
	function confirmColor(e) {
		bgColor.value = e.rgba
		draw()
	}
	
	function closeColorPicker() {
		isShowColorPicker.value = false
		draw()
	}
	
	function randomAvatar() {
		bgColor.value = CuteDogData.randomBgColorSeeds[Math.floor(Math.random() * CuteDogData.randomBgColorSeeds.length)]
		
		partsIdx.value = { 
			hat: Math.floor(Math.random() * CuteDogData.hat_data.list.length), 
			body: Math.floor(Math.random() * CuteDogData.body_data.list.length), 
			shirt: Math.floor(Math.random() * CuteDogData.shirt_data.list.length), 
			eyes: Math.floor(Math.random() * CuteDogData.eyes_data.list.length), 
			mouth: Math.floor(Math.random() * CuteDogData.mouth_data.list.length), 
			card: Math.floor(Math.random() * CuteDogData.card_data.list.length), 
			hand: 0, 
			glove: Math.floor(Math.random() * CuteDogData.glove_data.list.length), 
		}
		
		draw()
	}
	
	function onHatChange(e) {
		partsIdx.value.hat = e.detail.value
		draw()
	}
	
	function onBodyChange(e) {
		partsIdx.value.body = e.detail.value
		draw()
	}
	
	function onShirtChange(e) {
		partsIdx.value.shirt = e.detail.value
		draw()
	}
	
	function onEyesChange(e) {
		partsIdx.value.eyes = e.detail.value
		draw()
	}
	
	function onMouthChange(e) {
		partsIdx.value.mouth = e.detail.value
		draw()
	}
	
	function onGloveChange(e) {
		partsIdx.value.glove = e.detail.value
		draw()
	}
	
	function onCardChange(e) {
		partsIdx.value.card = e.detail.value
		draw()
	}
	
	function draw() {
		const bg = bgColor.value
		ctx.fillStyle = `rgb(${bg.r}, ${bg.g}, ${bg.b})`
		ctx.fillRect(0, 0, size, size)
			
		drawPartImg(CuteDogData.hat_data, partsIdx.value.hat)
		drawPartImg(CuteDogData.body_data, partsIdx.value.body)
		drawPartImg(CuteDogData.shirt_data, partsIdx.value.shirt)
		drawPartImg(CuteDogData.eyes_data, partsIdx.value.eyes)
		drawPartImg(CuteDogData.mouth_data, partsIdx.value.mouth)
		if (partsIdx.value.card < 3) {
			drawPartImg(CuteDogData.card_data, partsIdx.value.card)
		}
		drawPartImg(CuteDogData.hand_data, 0)
		drawPartImg(CuteDogData.glove_data, partsIdx.value.glove)
		
		ctx.draw()
	}
	
	function drawPartImg(partData, idx) {
		const img = `${CuteDogData.imagePathPrefix}${partData.prefix}${partData.list[idx].index}.png`
		ctx.drawImage(img, margin, margin, imgSize, imgSize)
	}
	
	function save() {
		_didSave()
	}
	
	function _didSave() {
		uni.canvasToTempFilePath({
			canvasId: 'm-canvas',
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
		setTimeout(async _ => {
			if (await CuteDogData.checkImagesData()) {
				randomAvatar()
			}
		}, 100)
	})
	
</script>

<style lang="scss" scoped>
	@import '../../../../static/css/base.scss';
	
	.container {
		width: 100vw;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: start;
		background-color: #ffffff;
		
		.other-box {
			display: flex;
			justify-content: center;
			align-items: center;
		
			.picker-group {
				font-size: 12px;
				font-weight: bold;
				color: $app-color-black18;
				display: flex;
				align-items: center;
				padding: 10px 8px;
		
				.title {
					margin-right: 3px;
				}
		
				.dot {
					width: 18px;
					height: 18px;
					border-radius: 9px;
					border: 1px solid $app-color-line;
				}
			}
			
			.arrow {
				&::after {
					content: "";
					display: inline-block;
					width: 0;
					height: 0;
					margin-left: 1px;            /* 三角与文本间距 */
					vertical-align: middle;      /* 与文本垂直对齐 */
					border-left: 3px solid transparent;
					border-right: 3px solid transparent;
					border-top: 3px solid $app-color-black18;  /* 三角颜色（向下） */
					pointer-events: none;        /* 不影响点击 */
				}
			}
		}
		
		.imgContainer {
			margin-top: 10px;
			width: 240px;
			height: 240px;
			.m-canvas {
				width: 100%; 
				height: 100%;
			}
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
		
		.color-bar {
			color: $app-color-black18;
			font-size: 13px;
			font-weight: bold;
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;
			padding: 15px 15px 5px 15px;
			.dot {
				width: 20px;
				height: 20px;
				background-color: #ffffff;
				border: 1px solid $app-color-line;
				border-radius: 10px;
			}
		}
		
		.spacer {
			flex: 1;
		}
	}
</style>

