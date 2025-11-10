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
			<view class="color-bar" @click="chooseColor()">
				<text>背景：</text>
				<view class="dot" 
				:style="{background: 'rgb(' + bgColor.r + ',' + bgColor.g + ',' + bgColor.b + ')'}"/>
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
	
	let rewardedService = null
	const size = 200
	const margin = 30
	const imgSize = size - 2 * margin
	const path = '../../static/images/monsterid/'
	const parts = [
		{ count: 5, prefix: 'arms_' },
		{ count: 5, prefix: 'legs_' },
		{ count: 5, prefix: 'hair_' },
		{ count: 15, prefix: 'body_' },
		{ count: 15, prefix: 'eyes_' },
		{ count: 10, prefix: 'mouth_' }
	]
	var partIdxArr = []
	
	const ctx = uni.createCanvasContext('m-canvas');
	
	const colorPicker = ref(null)
	const isShowColorPicker = ref(false)
	const bgColor = ref({r: 255, g: 255, b: 255, a: 1})
	
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
		let arr = []
		for (const v of parts) {
			const idx = Math.floor(Math.random() * v.count) + 1
			arr.push(idx)
		}
		partIdxArr = arr
		draw()
	}
	
	function draw() {
		const bg = bgColor.value
		ctx.fillStyle = `rgb(${bg.r}, ${bg.g}, ${bg.b})`
		ctx.fillRect(0, 0, size, size)
		for (var i = 0; i < parts.length; i++) {
			const value = parts[i];
			const img = `${path}${value.prefix}${partIdxArr[i]}.png`
			ctx.drawImage(img, margin, margin, imgSize, imgSize)
		}
		ctx.draw()
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
		randomAvatar()
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
		
		.imgContainer {
			margin-top: 20px;
			width: 200px;
			height: 200px;
			border: 1px solid $app-color-line;
			.m-canvas {
				width: 100%; 
				height: 100%;
			}
		}
		
		button {
			margin-top: 12px;
			width: 160px;
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
