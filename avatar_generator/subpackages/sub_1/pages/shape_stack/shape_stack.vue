<template>
	<common-page :show-back="true">
		<view class='container'>
			<image :src="svgImagePath" class="imgContainer" />
			<canvas id="pngCanvas" canvas-id="pngCanvas"
				style="position: absolute; left: -999px; top: -999px; width: 240px; height: 240px;" />
			<button @click="generateData()">随机生成</button>
			<button @click="save()">保存相册</button>
			<view class="spacer"></view>
		</view>
	</common-page>
</template>

<script lang='ts' setup>
	import { onMounted, onUnmounted, ref } from 'vue';
	import { checkPermissionAndSaveToPhotosAlbum, postSvgToPng, randomToken, savePngToFile, showTextToast } from '../../../../util/util';
	import { getAvatarByName } from './shape_stack.js'
	import { onLoad, onUnload } from '@dcloudio/uni-app'

	const svgImagePath = ref('')
	let svgString = null
	let token = null

	function generateData() {
		svgString = getAvatarByName()

		const fs = wx.getFileSystemManager();
		const timestamp = new Date().getTime();
		const filePath = `${wx.env.USER_DATA_PATH}/ss${timestamp}.svg`;
		const kLastBoringImgPathKey = "last_ss_path"

		let lastPath = uni.getStorageSync(kLastBoringImgPathKey)
		if (lastPath != null && lastPath != undefined && lastPath.length > 0) {
			try {
				fs.unlinkSync(lastPath)
				console.debug('删除上一次生成的shape_stack文件')
			} catch (e) {
				console.error(`文件不存在：${lastPath}`)
			}
		}
		fs.writeFile({
			filePath: filePath,
			data: svgString,
			encoding: 'utf8',
			success: _ => {
				console.log('保存成功:', filePath);
				svgImagePath.value = filePath;
				uni.setStorageSync(kLastBoringImgPathKey, filePath)
			},
			fail: err => {
				console.error('保存失败:', err);
			}
		});
	}

	async function save() {
		if (svgImagePath.value == null || svgImagePath.value == '') return
		
		svgToPng()
	}

	async function svgToPng() {
		if (svgString == null) return
		
		if (token == null) {
			token = randomToken()
		}
		
		uni.showLoading({title: '生成中'})
		try {
			const resp = await postSvgToPng(svgString, token)
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
		generateData()
	})
</script>

<style lang="scss">
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
			border-radius: 10px;
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
		
		.spacer {
			flex: 1;
		}
	}
</style>