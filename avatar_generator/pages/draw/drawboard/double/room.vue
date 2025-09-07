<template>
	<common-page show-back="true" title="一起画">
		<view class="page-container">
			<view class="content-part">
				<draw-board 
					ref="singleDrawboard" 
					:gridCount="gridSize" 
					:bgColor="bgColor" 
					:borderColor="lineColor" 
					:enableHistory="false"
					:should-paint="shouldDraw"
					@layer-update="onLayerChanged"
					@painting-state-change="onPaintingChanged"
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
	import { computed, getCurrentInstance, ref } from 'vue';
	import { checkPermissionAndSaveToPhotosAlbum, showTextToast } from '../../../../util/util';
	import { onLoad, onUnload } from '@dcloudio/uni-app'
	import { BleCentralManager } from '../../../../model/bluetooth/central/ble_central_manager';
	import { BlePeripheralManager } from '../../../../model/bluetooth/peripheral/ble_peripheral_manager';
	import { PeripheralReceiver } from '../../../../model/bluetooth/peripheral/peripheral_receiver';
	import { CentralReceiver } from '../../../../model/bluetooth/central/central_receiver';
	import { PeripheralSender } from '../../../../model/bluetooth/peripheral/peripheral_sender';
	import { CentralSender } from '../../../../model/bluetooth/central/central_sender';
	import { AppModel } from '../../../../model/app_model';
	
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
	
	let isPeripheral = false
	const remotePainting = ref(false)
	
	onLoad((options) => {
		// 启用阻止返回提示
		wx.enableAlertBeforeUnload({
		  message: "您确定要离开吗？", // 提示的消息内容
		  success: (res) => {
		    console.log("启用成功", res);
		  },
		  fail: (err) => {
		    console.error("启用失败", err);
		  },
		});
		
		isPeripheral = options.type === 'peripheral'
		console.log(`>> isPeripheral: ${isPeripheral}`)
		if (isPeripheral) {
			PeripheralReceiver.getLayerDataCallback = (data) => handleReceiveNewLayerData(data) 
			PeripheralReceiver.getRemoteDrawStateCallback = (isDrawing) => handleReceiveDrawingStateChanged(isDrawing)
			// 设置画板配置
			setTimeout(() => {
				singleDrawboard.value.resetCanvas(AppModel.genRoomOptions.gridSize)
				singleDrawboard.value.updateBgColor(AppModel.genRoomOptions.bgColor)
				singleDrawboard.value.updateLineColor(AppModel.genRoomOptions.lineColor)
			}, 300)
		} else {
			CentralReceiver.getLayerDataCallback = (data) => handleReceiveNewLayerData(data) 
			CentralReceiver.getRemoteDrawStateCallback = (isDrawing) => handleReceiveDrawingStateChanged(isDrawing)
			CentralReceiver.getDrawboardConfigCallback = (data) => handleReceiveDrawboardConfig(data)
		}
	})
	
	onUnload(() => {
		// 在页面卸载时最好禁用一下
		wx.disableAlertBeforeUnload();
		 
		if (isPeripheral) {
			PeripheralReceiver.getLayerDataCallback = null
			PeripheralReceiver.getRemoteDrawStateCallback = null
			BlePeripheralManager.dispose()
		} else {
			CentralReceiver.getLayerDataCallback = null
			CentralReceiver.getRemoteDrawStateCallback = null
			CentralReceiver.getDrawboardConfigCallback = null
			BleCentralManager.dispose()
		}
	})
	
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
		let layer = e.layers[e.historyIndex]
		let data :number[] = []
		for (let p of layer.points) {
			data.push(...[p.x, p.y, p.r, p.g, p.b])
		}
		let sendData = new Uint8Array(data)
		if (isPeripheral) {
			PeripheralSender.postLayerData(sendData)
		} else {
			CentralSender.postLayerData(sendData)
		}
	}
	
	// 处理绘制中状态变化事件
	function onPaintingChanged(e) {
		if (isPeripheral) {
			PeripheralSender.sendDrawState(e)
		} else {
			CentralSender.sendDrawState(e)
		}
	}
	
	// 保存相册
	async function save() {
		uni.showLoading({
			title: '生成图片'
		})
		let path = await singleDrawboard.value.canvasToTempFilePath()
		if (path != '') {
			checkPermissionAndSaveToPhotosAlbum(path)
		}
		uni.hideLoading()
	}
	
	/// 处理通过蓝牙接收到的图层信息
	function handleReceiveNewLayerData(data :Uint8Array) {
		singleDrawboard.value.handleReceiveNewLayerData(data)
	}
	
	/// 处理对方发送过来的绘制中状态变化
	function handleReceiveDrawingStateChanged(isDrawing :boolean) {
		remotePainting.value = isDrawing
		console.log(`>>> 对方绘制状态变化: ${isDrawing}`)
	}
	
	/// 处理外设端发过来的画板配置数据
	function handleReceiveDrawboardConfig(config) {
		singleDrawboard.value.resetCanvas(config.gridSize)
		singleDrawboard.value.updateBgColor(config.bgColor)
		singleDrawboard.value.updateLineColor(config.lineColor)
	}
	
	/// 是否可以绘制
	function shouldDraw() {
		if (remotePainting.value) {
			showTextToast('对方正在绘制中，请稍后~')
		}
		return !remotePainting.value
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