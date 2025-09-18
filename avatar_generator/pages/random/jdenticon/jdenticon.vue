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
			<image class="img" :src="svgImagePath" mode="aspectFit" />
			<button @click="randomInput">随机生成</button>
			<button @click="saveAvatar">保存相册</button>
			<view class="spacer"></view>
		</view>
	</common-page>
	<t-color-picker ref="bgColorPicker" :color="bgColor" @confirm="confirmBgColor"></t-color-picker>
</template>

<script setup>
	import { randomString, showTextToast, randomToken, postSvgToPng, savePngToFile, checkPermissionAndSaveToPhotosAlbum } from '../../../util/util';
	import * as jdenticon from 'jdenticon'
	import { ref } from 'vue';
	import { onLoad, onUnload } from '@dcloudio/uni-app'

	let rewardedService = null
	let lastGenText = null
	let token = null
	let svgText = null
	let svgImagePath = ref('')
	const inputText = ref('')
	const avatar = ref('')
	const bgColor = ref({r: 255,g: 255,b: 255,a: 1.0})
	const bgColorPicker = ref(null)
	const randomSeeds = [
		'微笑向阳', '天生赢家', 'Dwyane Wade',
		'微笑天使', '独步芳华', 'Kobe Bryant',
		'我可真棒', '无敌存在', 'Allen Iverson',
		'星河有你', '独领风骚', 'Dirk Nowitzki',
		'元气满格', '超凡入圣', 'Manu Ginóbili',
		'笑眼弯弯', '万人迷', 'Michael Jordan',
		'星光未眠', '风华绝代', 'Michael Jackson',
		'清茶煮雨', '独步天下', '球球',
		'心有桃花', '魅力无限', '琳琳',
		'暖阳小鹿', '美艳无双', '若曦',
	]
	
	onLoad(() => {
		randomInput()
	}) 
	
	onUnload(() => {
	})

	function chooseBgColor() {
		bgColorPicker.value.open()
	}
	
	function confirmBgColor(e) {
		bgColor.value = e.rgba
		generateAvatar(true)
	}
	
	function randomInput() {
		inputText.value = randomSeeds[Math.floor(Math.random() * randomSeeds.length)]
		generateAvatar()
	}
	
	function generateAvatar(isBgChanged = false) {
		if (!isBgChanged && inputText.value == lastGenText) return
		if (inputText.value.length == 0) return
		
		// 真机运行需要引入text-encoding,这个库代码体积多大，替换成保存图片文件的方式处理
		// let svg = jdenticon.toSvg(inputText.value, 320)
		// svg = svg.replace(
		//   /<svg([^>]+)>/,
		//   `<svg$1><rect width="100%" height="100%" fill="rgb(${bgColor.value.r}, ${bgColor.value.g}, ${bgColor.value.b})"/>`
		// )
		// svgText = svg
		// const base64 = "data:image/svg+xml;base64," + wx.arrayBufferToBase64(new TextEncoder().encode(svg))
		// avatar.value = base64
		
		let svg = jdenticon.toSvg(inputText.value, 320)
		svg = svg.replace(
		  /<svg([^>]+)>/,
		  `<svg$1><rect width="100%" height="100%" fill="rgb(${bgColor.value.r}, ${bgColor.value.g}, ${bgColor.value.b})"/>`
		)
		svgText = svg
		
		const fs = wx.getFileSystemManager();
		const timestamp = new Date().getTime();
		const filePath = `${wx.env.USER_DATA_PATH}/jd${timestamp}.svg`;
		const kLastJdenticonImgPathKey = "last_jdenticon_path"
		
		let lastPath = uni.getStorageSync(kLastJdenticonImgPathKey)
		console.debug(`lastPath: ${lastPath}`)
		if (lastPath != null && lastPath != undefined && lastPath.length > 0) {
			try {
				fs.unlinkSync(lastPath)
				console.debug('删除上一次生成的字符图形文件')
			} catch (e) {
				console.error(`文件不存在：${lastPath}`)
			}
		}
		fs.writeFile({
			filePath: filePath,
			data: svg,
			encoding: 'utf8',
			success: res => {
				console.log('保存成功:', filePath);
				svgImagePath.value = filePath;
				uni.setStorageSync(kLastJdenticonImgPathKey, filePath)
			},
			fail: err => {
				console.error('保存失败:', err);
			}
		});
		
		lastGenText = inputText.value
	}
	
	function saveAvatar() {
		_didSaveAvatar()
	}
	
	async function _didSaveAvatar() {
		if (svgText == null || svgText.length == 0) return
		
		if (token == null) {
			token = randomToken()
		}
		
		uni.showLoading({
			title: '保存中...'
		});
		try {
			const resp = await postSvgToPng(svgText, token)
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

		.img {
			width: 240px;
			height: 240px;
			border: 1px solid $app-color-line;
			margin-bottom: 20px;
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