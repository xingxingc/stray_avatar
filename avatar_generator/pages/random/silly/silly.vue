<template>
	<common-page show-back="true">
		<view class='container'>
			<view class="imgContainer" >
				<canvas
					canvas-id="silly-canvas" 
					id="silly-canvas" 
					type="2d"
					style="width: 200px; height: 200px;"/>
			</view>
			<button @click="draw()">随机生成</button>
			<button @click="save()">保存相册</button>
			<view class="spacer"></view>
		</view>
	</common-page>
</template>

<script setup>
	import { getCurrentInstance } from 'vue'
	import headGenerator from './lib/index.js'
	import { onLoad, onUnload } from '@dcloudio/uni-app'
	import { checkPermissionAndSaveToPhotosAlbum, showTextToast } from '../../../util/util'
	
	let canvas = null
	let ctx = null
	let rewardedService = null
	
	function draw() {
		headGenerator(canvas, ctx)
	}
	
	function save() {
		_didSave()
	}
	
	function _didSave() {
		uni.canvasToTempFilePath({
			canvasId: 'silly-canvas',
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
		}, getCurrentInstance())
	}
	
	onLoad(() => {
		const query = uni.createSelectorQuery().in(getCurrentInstance());
		query.select(`#silly-canvas`)
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
				draw()
			}, 380)
		  });
	})
	
	onUnload(() => {
	})
</script>

<style lang="scss" scoped>
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
			width: 200px;
			height: 200px;
			background-color: white;
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
		
		.spacer {
			flex: 1;
		}
	}
</style>
