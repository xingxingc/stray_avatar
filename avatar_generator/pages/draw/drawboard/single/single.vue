<template>
	<common-page show-back="true" title="自己画">
		<view class="page-container">
			<view class="content-part">
				<view class="other-box">
					<!-- 网格数选择 -->
					<view class="picker-group">
						<picker mode="selector" :range="gridSizeOptions" :value="gridSizeIndex" @change="onGridSizeChange"
							class="picker">
							<text class="title">网格:</text>
							<text>{{ gridSize }}x{{ gridSize }}</text>
						</picker>
					</view>
					<!-- 形状颜色选择 -->
					<view class="picker-group" @click="chooseBgColor">
						<text class="title">背景:</text>
						<view class="dot"
							:style="{ background: 'rgb(' + bgColor.r + ',' + bgColor.g + ',' + bgColor.b + ')' }" />
					</view>
							
					<!-- 背景颜色选择 -->
					<view class="picker-group" @click="chooseLineColor">
						<text class="title">线条:</text>
						<view class="dot"
							:style="{ background: 'rgb(' + lineColor.r + ',' + lineColor.g + ',' + lineColor.b + ')' }" />
					</view>
				</view>
				<draw-board 
					ref="singleDrawboard" 
					:gridCount="gridSize" 
					:bgColor="bgColor" 
					:borderColor="lineColor" 
					:should-paint="() => true"
					@layer-update="onLayerChanged"
					/>
			</view>
			<view class="handle-bar" :style="{height: `${bottomBarHeight}px`}">
				<view class="content" :style="{height: `${bottomContentHeight}px`}">
					<view class="save-btn" @click="save()">
						<text>保存相册</text>
					</view>
				</view>
			</view>
		</view>
	</common-page>
	<t-color-picker ref="lineColorPicker" :color="lineColor" @confirm="confirmLineColor" @close="closePicker"></t-color-picker>
	<t-color-picker ref="bgColorPicker" :color="bgColor" @confirm="confirmBgColor" @close="closePicker"></t-color-picker>
</template>

<script lang="ts" setup>
	import { computed, getCurrentInstance, onMounted, onUnmounted, ref } from 'vue';
	import { checkPermissionAndSaveToPhotosAlbum, showTextToast } from '../../../../util/util';
	
	const gridSizeOptions = Array.from({ length: 30 - 6 + 1 }, (_, i) => 6 + i)
	const gridSizeIndex = ref(gridSizeOptions.indexOf(12))
	const gridSize = computed(() => gridSizeOptions[gridSizeIndex.value])
	const bgColor = ref({r: 255, g: 255, b: 255, a: 1})
	const lineColor = ref({r: 205, g: 205, b: 205, a: 1})
	const lineColorPicker = ref(null)
	const bgColorPicker = ref(null)
	const singleDrawboard = ref(null)
	
	const sysInfo = uni.getSystemInfoSync()
	const bottomContentHeight = 60
	const bottomBarHeight = bottomContentHeight + sysInfo.safeAreaInsets.bottom
	
	// 选择网格大小
	function onGridSizeChange(e) {
		if (gridSizeIndex.value == e.detail.value) return
		
		uni.showModal({
			title: '提示',
			content: '设置网格会重置画板，会清空绘制的图案并无法恢复，请确认是否重置?',
			showCancel: true,
			confirmText: '确认',
			confirmColor: '#121212',
			cancelText: '取消',
			cancelColor: '#a0a0a0',
			success: (res) => {
				if (res.confirm) {
					gridSizeIndex.value = e.detail.value
					singleDrawboard.value.resetCanvas(gridSize.value)
				}
			}
		})
	}
	
	// 选择背景颜色
	function chooseBgColor() {
		bgColorPicker.value.open()
		singleDrawboard.value.updateIsShowPicker(true)
	}
	
	// 确认背景颜色
	function confirmBgColor(e) {
		if (bgColor.value != null) {
			const o = bgColor.value!
			const n = e.rgba
			if (o.r == n.r && o.g == n.g && o.b == n.b) {
				return
			}
		}
		bgColor.value = e.rgba
		singleDrawboard.value.updateBgColor(bgColor.value)
	}
	
	// 选择线条颜色
	function chooseLineColor() {
		lineColorPicker.value.open()
		singleDrawboard.value.updateIsShowPicker(true)
	}
	
	// 确认线条颜色
	function confirmLineColor(e) {
		if (lineColor.value != null) {
			const o = lineColor.value!
			const n = e.rgba
			if (o.r == n.r && o.g == n.g && o.b == n.b) {
				return
			}
		}
		lineColor.value = e.rgba
		singleDrawboard.value.updateLineColor(lineColor.value)
	}
	
	// 关闭颜色选择弹窗
	function closePicker() {
		singleDrawboard.value.updateIsShowPicker(false)
	}
	
	// 处理图层变化事件
	function onLayerChanged(e) {
		console.log(`>>> layers:${e.layers.length}, historyIndex: ${e.historyIndex}`)
	}
	
	// 保存相册
	async function save() {
		_didSave()
	}
	async function _didSave() {
		uni.showLoading({
			title: '生成图片'
		})
		let path = await singleDrawboard.value.canvasToTempFilePath()
		if (path != '') {
			checkPermissionAndSaveToPhotosAlbum(path)
		}
		uni.hideLoading()
	}
</script>

<style scoped lang="scss">
	@import '../../../../static/css/base.scss';
	
	.page-container {
		width: 100vw;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: start;
		.content-part {
			flex: 1;
			width: 100vw;
			background-color: #F8F8F8;
			display: flex;
			flex-direction: column;
			.other-box {
				display: flex;
				flex-direction: row;
				justify-content: center;
				align-items: center;
				.picker-group {
					font-size: 13px;
					font-weight: bold;
					color: $app-color-black18;
					display: flex;
					align-items: center;
					padding: 18px 10px 3px 10px;
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
			.other {
				flex: 1;
			}
		}
		
		.handle-bar {
			width: 100vw;
			background-color: #ffffff;
			border-top: 1px solid #efefef;
			.content {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 100%;
				.save-btn {
					width: 680rpx;
					height: 44px;
					background: $app-color-black18;
					font-size: 16px;
					border-color: black;
					color: white;
					font-weight: bold;
					border-radius: 22px;
					display: flex;
					justify-content: center;
					align-items: center;
				}
			}
		}
	}
</style>