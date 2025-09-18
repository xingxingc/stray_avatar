<template>
	<common-page :show-back="true">
		<view class="container">
			<image class="img" :src="svgImagePath" mode="aspectFit" />
			<button @click="generateAvatar()">随机生成</button>
			<button @click="saveAvatar()">保存相册</button>
			<view class="spacer"></view>
		</view>
	</common-page>
</template>

<script setup>
	import { randomString, showTextToast, randomToken, postSvgToPng, savePngToFile, checkPermissionAndSaveToPhotosAlbum } from '../../../util/util';
	import { Facitars } from './facitars.js'
	import { ref } from 'vue';
	import { onLoad, onUnload } from '@dcloudio/uni-app'
	
	let svgText = null
	let token = null
	let svgImagePath = ref('')
	const model = new Facitars()
	
	async function generateAvatar() {
		const seed = randomString(Math.random(30)+1)
		svgText = (await model.generate(seed)).svg
		
		const fs = wx.getFileSystemManager();
		const timestamp = new Date().getTime();
		const filePath = `${wx.env.USER_DATA_PATH}/facitars${timestamp}.svg`;
		const kLastFacitarImgPathKey = "last_facitar_path"
		
		let lastPath = uni.getStorageSync(kLastFacitarImgPathKey)
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
			data: svgText,
			encoding: 'utf8',
			success: res => {
				console.log('保存成功:', filePath);
				svgImagePath.value = filePath;
				uni.setStorageSync(kLastFacitarImgPathKey, filePath)
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
	
	onLoad(() => {
		generateAvatar()
	}) 
	
	onUnload(() => {
	})
</script>

<style scoped lang="scss">
	@import '../../../static/css/base.scss';
	
	.container {
		width: 100vw;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	
		.img {
			width: 200px;
			height: 200px;
			border: 1px solid $app-color-line;
			margin-bottom: 20px;
			margin-top: 10px;
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
