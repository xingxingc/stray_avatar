<template>
	<common-page :show-back="true">
		<view class="container">
			<view class="avatar-canvas">
				<image class="img" :src="svgImagePath" />
			</view>
			<view class="other-box">
				<!-- 背景颜色选择 -->
				<view class="picker-group" @click="chooseBgColor">
					<text class="title">背景:</text>
					<view class="dot"
						:style="{ background: 'rgba(' + bgColor.r + ',' + bgColor.g + ',' + bgColor.b + ',' + bgColor.a + ')' }" />
				</view>
				<!-- 形状颜色选择 -->
				<view class="picker-group" @click="chooseShapeColor">
					<text class="title">前景:</text>
					<view class="dot"
						:style="{ background: 'rgba(' + shapeColor.r + ',' + shapeColor.g + ',' + shapeColor.b + ',' + shapeColor.a + ')' }" />
				</view>
				<!-- 形态选择 -->
				<view class="picker-group arrow">
					<picker mode="selector" :range="shapes" range-key="name" :value="shapeIndex" @change="onShapeChange"
						class="picker">
						<text class="title">形态:</text>
						<text>{{ shapes[shapeIndex].name }}</text>
					</picker>
				</view>
				<!-- 表情选择 -->
				<view class="picker-group arrow">
					<picker mode="selector" :range="faces" range-key="name" :value="faceIndex" @change="onFaceChange"
						class="picker">
						<text class="title">表情:{{ faces[faceIndex].name }}</text>
					</picker>
				</view>
			</view>
			
			<button @click="randomAvatar()">随机生成</button>
			<button @click="saveAvatar">保存相册</button>
			<view class="spacer"></view>
		</view>
	</common-page>
	<t-color-picker ref="shapeColorPicker" :color="shapeColor" @confirm="confirmShapeColor"></t-color-picker>
	<t-color-picker ref="bgColorPicker" :color="bgColor" @confirm="confirmBgColor"></t-color-picker>
</template>

<script setup>
	import { ref } from 'vue'
	import {
		checkPermissionAndSaveToPhotosAlbum, postSvgToPng, randomToken, savePngToFile, showTextToast
	} from '../../../../util/util';
	import { genKawaiiSvg } from './kawaii';
	import { onLoad, onUnload } from '@dcloudio/uni-app'
	import { MOODS, SHAPES } from './constants';
	import { kMoodName, kShapeName } from './types';

	let rewardedService = null
	let svgString = null
	let token = null
	const shapeColorPicker = ref(null)
	const bgColorPicker = ref(null)
	const svgImagePath = ref(null)
	// 默认形状颜色
	const shapeColor = ref({r: 167, g: 226, b: 145, a: 1.0})
	// 默认背景颜色
	const bgColor = ref({r: 255, g: 255, b: 255, a: 1.0})
	// 形态下标
	const shapeIndex = ref(SHAPES.indexOf('humanDinosaur'))
	const shapes = SHAPES.map(e => {
		return {
			value: e,
			name: kShapeName(e)
		}
	})
	// 表情下标
	const faceIndex = ref(MOODS.indexOf('happy'))
	const faces = MOODS.map(e => {
		return {
			value: e,
			name: kMoodName(e)
		}
	})
	
	onLoad(() => {
		generateAvatar()
	})
	
	onUnload(() => {
		rewardedService.destory()
	})
	
	function chooseShapeColor() {
		shapeColorPicker.value.open()
	}
	
	function chooseBgColor() {
		bgColorPicker.value.open()
	}
	
	function confirmShapeColor(e) {
		shapeColor.value = e.rgba
		generateAvatar()
	}
	
	function confirmBgColor(e) {
		bgColor.value = e.rgba
		generateAvatar()
	}
	
	function onShapeChange(e) {
		shapeIndex.value = e.detail.value
		generateAvatar()
	}
	
	function onFaceChange(e) {
		faceIndex.value = e.detail.value
		generateAvatar()
	}
	
	function randomAvatar() {
		shapeIndex.value = Math.floor(Math.random() * shapes.length)
		faceIndex.value = Math.floor(Math.random() * faces.length)
		generateAvatar()
	}
	
	function generateAvatar() {
		console.log(shapeIndex.value, faceIndex.value)
		const s = shapeColor.value
		const b = bgColor.value
		svgString =  genKawaiiSvg(
			shapes[shapeIndex.value].value, 
			faces[faceIndex.value].value, 
			`rgb(${s.r},${s.g},${s.b})`,
			`rgb(${b.r},${b.g},${b.b})`
		)
		
		const fs = wx.getFileSystemManager();
		const timestamp = new Date().getTime();
		const filePath = `${wx.env.USER_DATA_PATH}/k${timestamp}.svg`;
		const kLastKawaiiImgPathKey = "last_kawaii_path"
		
		let lastPath = uni.getStorageSync(kLastKawaiiImgPathKey)
		console.debug(`lastPath: ${lastPath}`)
		if (lastPath != null && lastPath != undefined && lastPath.length > 0) {
			try {
				fs.unlinkSync(lastPath)
				console.debug('删除上一次生成的kawaii头像文件')
			} catch (e) {
				console.error(`文件不存在：${lastPath}`)
			}
		}
		fs.writeFile({
			filePath: filePath,
			data: svgString,
			encoding: 'utf8',
			success: res => {
				console.log('保存成功:', filePath);
				svgImagePath.value = filePath;
				uni.setStorageSync(kLastKawaiiImgPathKey, filePath)
			},
			fail: err => {
				console.error('保存失败:', err);
			}
		});
	}
	
	function saveAvatar() {
		_didSaveAvatar()
	}
	
	async function _didSaveAvatar() {
		uni.showLoading({
			title: '保存中...'
		});
		
		if (svgString == null) return
		
		if (token == null) {
			token = randomToken()
		}
		
		uni.showLoading({title: '生成中'})
		try {
			// 处理与服务端svg版本的兼容问题
			let s = svgString.replaceAll('<use href=', '<use xlink:href=')
							 .replaceAll('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ')
			const resp = await postSvgToPng(s, token)
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
	}
	
</script>

<style lang="scss">
	@import '../../../../static/css/base.scss';

	.container {
		width: 100vw;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		
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

		.avatar-canvas {
			width: 240px;
			height: 240px;
			border: 1px solid $app-color-line;
			mask-clip: border-box;
			.img {
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