<template>
	<common-page :show-back="true">
		<view class="container">
			<canvas canvas-id="hiddenCanvas" style="width: 24px; height: 24px; position: absolute; left: -99999px; top: -9999px;"></canvas>
			<view class="imgContainer">
				<canvas v-if="!isShowColorPicker" canvas-id="largeCanvas" style="width: 100%; height: 100%;"></canvas>
			</view>
			<view class="color-bar" @click="chooseColor()">
				<text>背景：</text>
				<view class="dot" 
				:style="{background: 'rgb(' + bgColor.r + ',' + bgColor.g + ',' + bgColor.b + ')'}"/>
			</view>
			<button @click="generateFace()">随机生成</button>
			<button @click="save()">保存相册</button>
			<view class="spacer" />
		</view>
	</common-page>
	<t-color-picker ref="colorPicker" :color="bgColor" @confirm="confirmColor" @close="closeColorPicker"></t-color-picker>
</template>

<script setup>
	import { onMounted, onUnmounted, ref } from 'vue'
	import { checkPermissionAndSaveToPhotosAlbum, showTextToast } from '../../../util/util'
	import { onLoad, onUnload } from '@dcloudio/uni-app'
	import { AppModel } from '../../../model/app_model'
	
	var imagePath = ''
	var downloadedImagePath = ''
	const originSize = 24
	const colorPicker = ref(null)
	const isShowColorPicker = ref(false)
	const bgColor = ref({r: 255, g: 255, b: 255, a: 1})
	
	function chooseColor() {
		isShowColorPicker.value = true
		colorPicker.value.open()
	}
	
	function confirmColor(e) {
		bgColor.value = e.rgba
		drawAfterDownloaded()
	}
	
	function closeColorPicker() {
		isShowColorPicker.value = false
		drawAfterDownloaded()
	}
	
	function generateFace() {
		// 生成 [0-9999] 的随机数
		const randomNum = Math.floor(Math.random() * 10000)
		// 转换为长度为4的字符串，不足4位在前面补0
		const name = `punk${randomNum.toString().padStart(4, '0')}.png`
		imagePath = AppModel.cryptopunksBaseUrl + name
		uni.downloadFile({
			url: imagePath,
			success: async res => {
				downloadedImagePath = res.tempFilePath
				console.log(`>>> downloadedImagePath: ${downloadedImagePath}`)
				await drawAfterDownloaded()
			},
			fail: err => {
				console.error('下载图片失败', err)
			}
		})
	}
	
	/// 图像下载后，进行绘制
	async function drawAfterDownloaded() {
		// 绘制到隐藏 Canvas
		const ctx = uni.createCanvasContext('hiddenCanvas');
		const bg = bgColor.value
		ctx.setFillStyle(`rgb(${bg.r}, ${bg.g}, ${bg.b})`)
		ctx.fillRect(0, 0, originSize, originSize)
		ctx.drawImage(downloadedImagePath, 0, 0, originSize, originSize);
		// 等待绘制完成
		await new Promise(resolve => ctx.draw(false, resolve));
		// 提取像素数据
		const pixelData = await getCanvasPixelData(originSize, originSize);
		// 转换为二维数组
		const colorArray = pixelDataTo2DArray(pixelData, originSize, originSize);
		
		await drawEnlargedImage(colorArray)
	}
	
	// 从 Canvas 获取像素数据
	function getCanvasPixelData(width, height) {
	      return new Promise((resolve, reject) => {
	        uni.canvasGetImageData({
	          canvasId: 'hiddenCanvas',
	          x: 0,
	          y: 0,
	          width,
	          height,
	          success: (res) => resolve(res.data),
	          fail: reject,
	        });
	      });
	}
	
	// 一维数组 → 二维数组（24x24）
	function pixelDataTo2DArray(pixelData, width, height) {
	      const array = [];
	      for (let y = 0; y < height; y++) {
	        const row = [];
	        for (let x = 0; x < width; x++) {
	          const index = (y * width + x) * 4;
	          row.push([
	            pixelData[index],      // R
	            pixelData[index + 1],  // G
	            pixelData[index + 2],  // B
	            pixelData[index + 3],  // A
	          ]);
	        }
	        array.push(row);
	      }
	      return array;
	}
	
	async function drawEnlargedImage(colorArray) {
      // 2. 创建 240x240 的 Canvas 上下文
      const ctx = uni.createCanvasContext('largeCanvas');
      const scale = 10; // 放大倍数（24x24 → 240x240）
	  const bg = bgColor.value
	  ctx.setFillStyle(`rgba(${bg.r}, ${bg.g}, ${bg.b}, ${bg.a})`)
	  ctx.fillRect(0, 0, originSize*scale, originSize*scale)
      
      // 3. 遍历颜色数组，绘制放大后的像素
      colorArray.forEach((row, y) => {
        row.forEach((pixel, x) => {
          let [r, g, b, a] = pixel;
		  if (r == 0 && g == 0 && b == 0 && a == 0) {
			  [r, g, b, a] = [255, 255, 255, 255]
		  }
          ctx.setFillStyle(`rgba(${r}, ${g}, ${b}, ${a / 255})`);
          ctx.fillRect(
            x * scale,      // 放大后的 x 坐标
            y * scale,      // 放大后的 y 坐标
            scale,          // 每个像素的宽度（10px）
            scale           // 每个像素的高度（10px）
          );
        });
      });
      
      // 4. 绘制到 Canvas
      ctx.draw();
    }
	
	function save() {
		_didSave()
	}
	function _didSave() {
		uni.canvasToTempFilePath({
			canvasId: 'largeCanvas',
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
		generateFace()
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
		
		.spacer {
			flex: 1;
		}
	}
</style>
