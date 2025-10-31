<template>
	<common-page show-back="true">
		<view class='container'>
			<view class="imgContainer" >
				<image :src="imgPath" style="width: 240px; height: 240px;"></image>
				<canvas
					style="position: absolute; left: -1000px; top: -1000px; width: 240px; height: 240px;"
					canvas-id="m-canvas" 
					id="m-canvas"/>
			</view>
			<view class="other-box">
				<!-- 脸型选择 -->
				<view class="picker-group arrow">
					<picker mode="selector" :range="DrawPuppyData.face_data.list" range-key="name" :value="partsIdx.face" @change="onFaceChange"
						class="picker">
						<text class="title">{{ DrawPuppyData.face_data.name }}:</text>
						<text>{{ DrawPuppyData.face_data.list[partsIdx.face].name }}</text>
					</picker>
				</view>
				<!-- 眼睛选择 -->
				<view class="picker-group arrow">
					<picker mode="selector" :range="DrawPuppyData.eyes_data.list" range-key="name" :value="partsIdx.eyes" @change="onEyesChange"
						class="picker">
						<text class="title">{{ DrawPuppyData.eyes_data.name }}:</text>
						<text>{{ DrawPuppyData.eyes_data.list[partsIdx.eyes].name }}</text>
					</picker>
				</view>
				<!-- 鼻子选择 -->
				<view class="picker-group arrow">
					<picker mode="selector" :range="DrawPuppyData.nose_data.list" range-key="name" :value="partsIdx.nose" @change="onNoseChange"
						class="picker">
						<text class="title">{{ DrawPuppyData.nose_data.name }}:</text>
						<text>{{ DrawPuppyData.nose_data.list[partsIdx.nose].name }}</text>
					</picker>
				</view>
				<!-- 耳朵选择 -->
				<view class="picker-group arrow">
					<picker mode="selector" :range="DrawPuppyData.ears_data.list" range-key="name" :value="partsIdx.ears" @change="onEarsChange"
						class="picker">
						<text class="title">{{ DrawPuppyData.ears_data.name }}:</text>
						<text>{{ DrawPuppyData.ears_data.list[partsIdx.ears].name }}</text>
					</picker>
				</view>
			</view>
			<view class="other-box">
				<!-- 胡子选择 -->
				<view class="picker-group arrow">
					<picker mode="selector" :range="DrawPuppyData.mouth_data.list" range-key="name" :value="partsIdx.mouth" @change="onMouthChange"
						class="picker">
						<text class="title">{{ DrawPuppyData.mouth_data.name }}:</text>
						<text>{{ DrawPuppyData.mouth_data.list[partsIdx.mouth].name }}</text>
					</picker>
				</view>
				<!-- 帽子选择 -->
				<view class="picker-group arrow">
					<picker mode="selector" :range="DrawPuppyData.hat_data.list" range-key="name" :value="partsIdx.hat" @change="onHatChange"
						class="picker">
						<text class="title">{{ DrawPuppyData.hat_data.name }}:</text>
						<text>{{ DrawPuppyData.hat_data.list[partsIdx.hat].name }}</text>
					</picker>
				</view>
				<!-- 皮肤选择 -->
				<view class="picker-group arrow">
					<picker mode="selector" :range="DrawPuppyData.skin_data.list" range-key="name" :value="partsIdx.skin" @change="onSkinChange"
						class="picker">
						<text class="title">{{ DrawPuppyData.skin_data.name }}:</text>
						<text>{{ DrawPuppyData.skin_data.list[partsIdx.skin].name }}</text>
					</picker>
				</view>
				<!-- 背景颜色选择 -->
				<view class="picker-group" @click="chooseColor">
					<text class="title">背景:</text>
					<view class="dot"
						:style="{ background: 'rgba(' + bgColor.r + ',' + bgColor.g + ',' + bgColor.b + ',' + bgColor.a + ')' }" />
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
	import { ref, getCurrentInstance } from 'vue'
	import { onLoad, onUnload } from '@dcloudio/uni-app'
	import { checkPermissionAndSaveToPhotosAlbum, showTextToast } from '../../../../util/util'
	import { DrawPuppyData } from './draw_puppy_data'
	
	let rewardedService = null
	const imgSize = 240
	var partIdxArr = []
	
	const ctx = uni.createCanvasContext('m-canvas')
	
	const colorPicker = ref(null)
	const isShowColorPicker = ref(false)
	const bgColor = ref({r: 255, g: 255, b: 255, a: 1})
	
	let newMouthImgPath = ''
	const imgPath = ref(null)
	
	/// 组成部分
	const partsIdx = ref({ face: 0, eyes: 0, nose: 0, ears: 0, mouth: 0, hat: 0, skin: 0 })
	
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
		bgColor.value = DrawPuppyData.randomBgColorSeeds[Math.floor(Math.random() * DrawPuppyData.randomBgColorSeeds.length)]
		
		partsIdx.value = { 
			face: Math.floor(Math.random() * DrawPuppyData.face_data.list.length), 
			eyes: Math.floor(Math.random() * DrawPuppyData.eyes_data.list.length), 
			nose: Math.floor(Math.random() * DrawPuppyData.nose_data.list.length), 
			ears: Math.floor(Math.random() * DrawPuppyData.ears_data.list.length), 
			mouth: Math.floor(Math.random() * DrawPuppyData.mouth_data.list.length),
			hat: Math.floor(Math.random() * DrawPuppyData.hat_data.list.length),
			skin: Math.floor(Math.random() * DrawPuppyData.skin_data.list.length), 
		}
		
		draw()
	}
	
	function onFaceChange(e) {
		partsIdx.value.face = e.detail.value
		draw()
	}
	
	function onEyesChange(e) {
		partsIdx.value.eyes = e.detail.value
		draw()
	}
	
	function onNoseChange(e) {
		partsIdx.value.nose = e.detail.value
		draw()
	}
	
	function onEarsChange(e) {
		partsIdx.value.ears = e.detail.value
		draw()
	}
	
	function onSkinChange(e) {
		partsIdx.value.skin = e.detail.value
		draw()
	}
	
	function onMouthChange(e) {
		partsIdx.value.mouth = e.detail.value
		draw()
	}
	
	function onHatChange(e) {
		partsIdx.value.hat = e.detail.value
		draw()
	}
	
	function generateColorMouth() {
		ctx.clearRect(0, 0, imgSize, imgSize)
		drawPartImg(DrawPuppyData.skin_data, partsIdx.value.skin)
		ctx.draw(false, () => {
			uni.canvasGetImageData({
				canvasId: 'm-canvas',
				x: 0,
				y: 0,
				width: imgSize,
				height: imgSize,
				success: res => {
					const data = res.data
					const start = (5 * imgSize + 5) * 4
					const sr = data[start + 0]
					const sg = data[start + 1]
					const sb = data[start +2]
					const sa = data[start + 3]
					ctx.clearRect(0, 0, imgSize, imgSize)
					drawPartImg(DrawPuppyData.mouth_data, partsIdx.value.mouth)
					ctx.draw(false, () => {
						uni.canvasGetImageData({
							canvasId: 'm-canvas',
							x: 0,
							y: 0,
							width: imgSize,
							height: imgSize,
							success: res => {
								const data = res.data
								for (let i = 0; i < data.length; i += 4) {
								  const r = data[i]
								  const g = data[i + 1]
								  const b = data[i + 2]
								  const a = data[i + 3]
								  // 判断是否接近白色
								  if (r > 250 && g > 250 && b > 250 && a > 0) {
								    data[i] = sr       // 红
								    data[i + 1] = sg   // 绿
								    data[i + 2] = sb   // 蓝
									data[i + 3] = sa   // 透明
								  }
								}
								
								// 回写修改后的像素数据
								uni.canvasPutImageData({
								  canvasId: 'm-canvas',
								  x: 0,
								  y: 0,
								  width: imgSize,
								  height: imgSize,
								  data: data,
								  success: res => {
								    // 导出新图片
								    uni.canvasToTempFilePath({
								      canvasId: 'm-canvas',
								      x: 0,
								      y: 0,
								      width: imgSize,
								      height: imgSize,
								      success: res2 => {
								    	newMouthImgPath = res2.tempFilePath
								    	lastDraw()
								      }
								    })
								  }
								})
							}
						})
					})
				}
			})
		})
	}
	
	function lastDraw() {
		ctx.clearRect(0, 0, imgSize, imgSize)
		
		const bg = bgColor.value
		ctx.fillStyle = `rgb(${bg.r}, ${bg.g}, ${bg.b})`
		ctx.fillRect(0, 0, imgSize, imgSize)
		
		drawPartImg(DrawPuppyData.face_data, partsIdx.value.face)
		drawPartImg(DrawPuppyData.ears_data, partsIdx.value.ears)
		
		ctx.draw(false, () => {
			uni.canvasGetImageData({
				canvasId: 'm-canvas',
				x: 0,
				y: 0,
				width: imgSize,
				height: imgSize,
				success: res => {
					const data = res.data
					for (let i = 0; i < data.length; i += 4) {
					  const r = data[i]
					  const g = data[i + 1]
					  const b = data[i + 2]
					  const a = data[i + 3]
					  // 判断是否接近白色
					  if (r > 250 && g > 250 && b > 250 && a > 0) {
					    // data[i] = 0       // 红
					    // data[i + 1] = 0   // 绿
					    // data[i + 2] = 0   // 蓝
						data[i + 3] = 0   // 透明
					  }
					}
					
					// 回写修改后的像素数据
					uni.canvasPutImageData({
					  canvasId: 'm-canvas',
					  x: 0,
					  y: 0,
					  width: imgSize,
					  height: imgSize,
					  data: data,
					  success: _ => {
					    // 导出新图片
					    uni.canvasToTempFilePath({
					      canvasId: 'm-canvas',
					      x: 0,
					      y: 0,
					      width: imgSize,
					      height: imgSize,
					      success: res2 => {
					    	ctx.clearRect(0, 0, imgSize, imgSize)
					    	drawPartImg(DrawPuppyData.skin_data, partsIdx.value.skin)
					    	ctx.drawImage(res2.tempFilePath, 0, 0, imgSize, imgSize)
					    	ctx.drawImage(newMouthImgPath, 0, 0, imgSize, imgSize)
					    	drawPartImg(DrawPuppyData.eyes_data, partsIdx.value.eyes)
					    	drawPartImg(DrawPuppyData.nose_data, partsIdx.value.nose)
					    	drawPartImg(DrawPuppyData.hat_data, partsIdx.value.hat)
					    	ctx.draw()
					    	
					    	uni.canvasToTempFilePath({
					    	  canvasId: 'm-canvas',
					    	  x: 0,
					    	  y: 0,
					    	  width: imgSize,
					    	  height: imgSize,
					    	  success: res3 => {
					    		imgPath.value = res3.tempFilePath
					    	  },
							  complete: _ => {
							  }
					    	})
					      }
					    })
					  }
					})
				}
			})
		})
	}
	
	function draw() {
		// 提示：模拟器会显示空白，需要在真机中查看效果
		generateColorMouth()
	}
	
	function drawPartImg(partData, idx) {
		const img = `${DrawPuppyData.imagePathPrefix}${partData.prefix}${partData.list[idx].index}.png`
		ctx.drawImage(img, 0, 0, imgSize, imgSize)
	}
	
	function save() {
		_didSave()
	}
	
	function _didSave() {
		checkPermissionAndSaveToPhotosAlbum(imgPath.value)
	}
	
	onLoad(() => {
		setTimeout(async _ => {
			if (await DrawPuppyData.checkImagesData()) {
				randomAvatar()
			}
		}, 100)
	})
	
	onUnload(() => {
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

