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
	import {
		onMounted,
		onUnmounted,
		ref
	} from 'vue';
	import {
		hashCode,
		getUnit,
		getBoolean,
		getRandomColor,
		getContrast,
	} from './utilities';
	import {
		checkPermissionAndSaveToPhotosAlbum, postSvgToPng, randomToken, savePngToFile, showTextToast
	} from '../../../util/util';

	const svgImagePath = ref('')

	let svgString = null
	
	let token = null

	const SIZE = 36;

	let size = 240

	function getRandomHexColor() {
		return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
	}

	function generateRandomString(length: number = 12) {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	function generateData() {
		let square = true
		let id = generateRandomString(8)
		let name = generateRandomString(12)
		const colors = Array.from({
			length: 10
		}, () => getRandomHexColor());

		const numFromName = hashCode(name);
		const range = colors && colors.length;
		const wrapperColor = getRandomColor(numFromName, colors, range);
		const preTranslateX = getUnit(numFromName, 10, 1);
		const wrapperTranslateX =
			preTranslateX < 5 ? preTranslateX + SIZE / 9 : preTranslateX;
		const preTranslateY = getUnit(numFromName, 10, 2);
		const wrapperTranslateY =
			preTranslateY < 5 ? preTranslateY + SIZE / 9 : preTranslateY;

		const data = {
			wrapperColor: wrapperColor,
			faceColor: getContrast(wrapperColor),
			backgroundColor: getRandomColor(numFromName + 13, colors, range),
			wrapperTranslateX: wrapperTranslateX,
			wrapperTranslateY: wrapperTranslateY,
			wrapperRotate: getUnit(numFromName, 360),
			wrapperScale: 1 + getUnit(numFromName, SIZE / 12) / 10,
			isMouthOpen: getBoolean(numFromName, 2),
			isCircle: getBoolean(numFromName, 1),
			eyeSpread: getUnit(numFromName, 5),
			mouthSpread: getUnit(numFromName, 3),
			faceRotate: getUnit(numFromName, 10, 3),
			faceTranslateX: wrapperTranslateX > SIZE / 6 ?
				wrapperTranslateX / 2 : getUnit(numFromName, 8, 1),
			faceTranslateY: wrapperTranslateY > SIZE / 6 ?
				wrapperTranslateY / 2 : getUnit(numFromName, 7, 2),
		};

		let mouthPath = ''
		if (data.isMouthOpen) {
			mouthPath = `
		  <path
		    d='M15 ${19 + data.mouthSpread}c2 1 4 1 6 0'
		    stroke='${data.faceColor}'
		    fill='none'
		    stroke-linecap='round'
		  />
		  `
		} else {
			mouthPath = `
		  <path
		    d='M13,${19 + data.mouthSpread} a1,0.75 0 0,0 10,0'
		    fill='${data.faceColor}'
		  />
		  `
		}
		let svg = `		
			<svg
			  viewBox='0 0 ${SIZE} ${SIZE}'
			  fill='none'
			  role='img'
			  xmlns='http://www.w3.org/2000/svg'
			  width='${size}'
			  height='${size}'
			>
			  <mask
			    id='${id}'
			    maskUnits='userSpaceOnUse'
			    x='0'
			    y='0'
			    width='${SIZE}'
			    height='${SIZE}'
			  >
			    <rect
			      width='${SIZE}'
			      height='${SIZE}'
			      rx='${!square ? SIZE * 2 : 0}'
			      fill='#FFFFFF'
			    />
			  </mask>
			  <g mask='url(#${id})'>
			    <rect width='${SIZE}' height='${SIZE}' fill='${data.backgroundColor}' />
			    <rect
			      x='0'
			      y='0'
			      width='${SIZE}'
			      height='${SIZE}'
			      transform='translate(${data.wrapperTranslateX} ${data.wrapperTranslateY}) rotate(${data.wrapperRotate} ${SIZE / 2} ${SIZE / 2}) scale(${data.wrapperScale})'
			      fill='${data.wrapperColor}'
			      rx='${data.isCircle ? SIZE : SIZE / 6}'
			    />
			    <g
			      transform='translate(${data.faceTranslateX} ${data.faceTranslateY}) rotate(${data.faceRotate} ${SIZE / 2} ${SIZE / 2})'
			    >
			      ${mouthPath}
			      <rect
			        x='${14 - data.eyeSpread}'
			        y='14'
			        width='1.5'
			        height='2'
			        rx='1'
			        stroke='none'
			        fill='${data.faceColor}'
			      />
			      <rect
			        x='${20 + data.eyeSpread}'
			        y='14'
			        width='1.5'
			        height='2'
			        rx='1'
			        stroke='none'
			        fill='${data.faceColor}'
			      />
			    </g>
			  </g>
			</svg>
	`

		svgString = svg

		const fs = wx.getFileSystemManager();
		const timestamp = new Date().getTime();
		const filePath = `${wx.env.USER_DATA_PATH}/b${timestamp}.svg`;
		const kLastBoringImgPathKey = "last_boring_beam_path"

		let lastPath = uni.getStorageSync(kLastBoringImgPathKey)
		console.debug(`lastPath: ${lastPath}`)
		if (lastPath != null && lastPath != undefined && lastPath.length > 0) {
			try {
				fs.unlinkSync(lastPath)
				console.debug('删除上一次生成的boring-beam文件')
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
				uni.setStorageSync(kLastBoringImgPathKey, filePath)
			},
			fail: err => {
				console.error('保存失败:', err);
			}
		});

		return data;
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
			const pngPath = await savePngToFile(resp)
			checkPermissionAndSaveToPhotosAlbum(pngPath)
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
	
	onMounted(() => {
		generateData()
	})
	
	onUnmounted(() => {})
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