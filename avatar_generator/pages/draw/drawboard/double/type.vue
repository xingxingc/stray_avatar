<template>
	<common-page title="一起画" show-back="true">
		<view class="list">
			<button class="button gen" @click="generateBoard()">创建画板</button>
			<button class="button find" @click="findBoard()">查找画板</button>
			<view class="step">
				<view>
					<text class="title">操作步骤:</text>
				</view>
				<uni-steps 
					:options="step" 
					direction="column" 
					activeColor="#181818" 
					deactive-color="#181818" 
					:active="step.length-1" />
			</view>
		</view>
		<view v-if="isShowGen" class="gen_modal modal">
			<view class="panel gen_content">
				<text class="title">创建画板</text>
				<paring-animation-view v-if="isGenerating" />
				<view v-else class="desc">
					<text>配置</text>
				</view>
				<view class="other-box">
					<!-- 网格数选择 -->
					<view class="picker-group arrow">
						<picker mode="selector" :range="gridSizeOptions" :value="gridSizeIndex" @change="onGridSizeChange"
							class="picker" :disabled="isGenerating">
							<text class="t">网格:</text>
							<text>{{ gridSize }}x{{ gridSize }}</text>
						</picker>
					</view>
					<!-- 形状颜色选择 -->
					<view class="picker-group" @click="chooseBgColor">
						<text class="t">背景:</text>
						<view class="dot"
							:style="{ background: 'rgb(' + bgColor.r + ',' + bgColor.g + ',' + bgColor.b + ')' }" />
					</view>
					<!-- 背景颜色选择 -->
					<view class="picker-group" @click="chooseLineColor">
						<text class="t">线条:</text>
						<view class="dot"
							:style="{ background: 'rgb(' + lineColor.r + ',' + lineColor.g + ',' + lineColor.b + ')' }" />
					</view>
				</view>
				<input
					class="gen_input"
					type="number" 
				    v-model="genInput"
				    placeholder="请输入画板号(3-6个数字)"
					:disabled = "isGenerating"
					cursor-color="#181818"
					@input="filterGenInput"
					confirm-type="done"/>
				<!-- 底部操作按钮 -->
				<view v-if="isGenerating" class="stop" @click="stopParing">
					<text>停止配对</text>
				</view>
				<view v-else class="normal">
					<view class="btn cancel" @click="cancelGen">
						<text>取消</text>
					</view>
					<view class="btn sure" @click="startParing">
						<text>开始配对</text>
					</view>
				</view>
			</view>
		</view>
		<view v-if="isSearching" class="search_modal modal">
			<view class="panel search_content">
				<text class="title">查找画板</text>
				<paring-animation-view />
				<text class="search_name">匹配中({{ searchingName }})...</text>
				<view class="stop" @click="stopSearching">
					<text>停止配对</text>
				</view>
			</view>
		</view>
	</common-page>
	<t-color-picker ref="lineColorPicker" :color="lineColor" @confirm="confirmLineColor" @close="closePicker"></t-color-picker>
	<t-color-picker ref="bgColorPicker" :color="bgColor" @confirm="confirmBgColor" @close="closePicker"></t-color-picker>
</template>

<script setup lang="ts">
	import { computed, ref, nextTick } from 'vue';
	import { BlePeripheralManager } from '../../../../model/bluetooth/peripheral/ble_peripheral_manager';
	import { DataPacker } from '../../../../model/bluetooth/data_packer';
	import { delay } from '../../../../util/util';
	import { BleCentralManager } from '../../../../model/bluetooth/central/ble_central_manager';
	import { CentralSender } from '../../../../model/bluetooth/central/central_sender';
	import { onLoad, onUnload } from '@dcloudio/uni-app'
	import { EventBus, EventDrawEnterRoom } from '../../../../model/event_bus';
	import { AppModel } from '../../../../model/app_model';

	// 操作步骤
	const step = [
		{
			title: '确保两台手机都打开了蓝牙功能，以及微信也授权了蓝牙权限',
		},
		{
			title: '手机A点击“创建画板”，发起画板服务，等待连接，建议使用安卓手机创建画板～',
		},
		{
			title: '手机B点击“查找画板”，输入画板号，等待配对画板服务',
		},
		{
			title: '配对成功，自动跳转到画板页面',
		},
		{
			title: '一起绘制你们专属的像素图片吧～',
		},
	]
	
	// 是否在创建画板中
	const isShowGen = ref(false)
	const isGenerating = ref(false)
	
	const gridSizeOptions = Array.from({ length: 30 - 6 + 1 }, (_, i) => 6 + i)
	const gridSizeIndex = ref(gridSizeOptions.indexOf(12))
	const gridSize = computed(() => gridSizeOptions[gridSizeIndex.value])
	const bgColor = ref({r: 255, g: 255, b: 255, a: 1})
	const lineColor = ref({r: 205, g: 205, b: 205, a: 1})
	const lineColorPicker = ref(null)
	const bgColorPicker = ref(null)
	const genInput = ref('')
	
	// 是否在查找画板中
	const isSearching = ref(false)
	const searchingName = ref('')
	
	// 发起画板
	function generateBoard() {
		if (!BlePeripheralManager.isSupport()) {
			uni.showModal({
				title: '提示',
				content: '您的手机不支持发起画板～',
				showCancel: false,
				confirmText: '好的',
				confirmColor: '#181818'
			})
			return
		}
		isShowGen.value = true
	}
	
	// 选择网格大小
	function onGridSizeChange(e) {
		if (gridSizeIndex.value == e.detail.value) return
		gridSizeIndex.value = e.detail.value
	}
	
	// 选择背景颜色
	function chooseBgColor() {
		if (isGenerating.value) return
		bgColorPicker.value.open()
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
		if (isGenerating.value) return
		lineColorPicker.value.open()
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
	}
	
	// 关闭颜色选择弹窗
	function closePicker() {}
	
	// 取消创建画板
	function cancelGen() {
		isShowGen.value = false
	}
	
	// 过滤创建面板输入
	const filterGenInput = async (e) => {
		const v = e.detail.value.replaceAll(/[^\d]/g, '')
		genInput.value = v
		await nextTick()
		if (v !== genInput.value) {
			console.log(`${v} !== ${genInput.value}`)
		}
	}
	
	// 开始匹配
	async function startParing() {
		let name = genInput.value.trim()
		if (name.length == 0) {
			uni.showToast({
				title: '请输入画板号',
				icon: 'none'
			})
			return
		}
		if (name.length < 3 || name.length > 6) {
			uni.showToast({
				title: '画板号长度不合规',
				icon: 'none'
			})
			return
		}
		
		uni.hideKeyboard()
		
		BlePeripheralManager.room = name
		
		/// 保存画板配置
		AppModel.genRoomOptions = {
			gridSize: gridSize.value,
			bgColor: bgColor.value,
			lineColor: lineColor.value
		}
		
		let flag = await BlePeripheralManager.initial()
		if (!flag) return
		
		await delay(200)
		
		let hasServer = await BlePeripheralManager.startServer()
		if (!hasServer) {
			uni.showToast({
				title: '启动失败',
				icon: 'error'
			})
			return
		}
		
		isGenerating.value = true
	}
	
	// 停止匹配
	async function stopParing() {
		await BlePeripheralManager.dispose()
		
		await delay(200)
		
		isGenerating.value = false
	}
	
	// 查找画板
	function findBoard() {
		uni.showModal({
			title: '请输入画板号进行匹配',
			editable: true,
			placeholderText: '3-6个数字',
			showCancel: true,
			confirmText: '确认',
			confirmColor: '#121212',
			cancelText: '取消',
			cancelColor: '#a0a0a0',
			success: (res) => {
				if (res.confirm) {
					let name = res.content.replaceAll(/[^\d]/g, '').trim()
					if (name.length == 0) {
						uni.showToast({
							title: '请输入画板号',
							icon: 'none'
						})
						return
					}
					if (name.length < 3 || name.length > 6) {
						uni.showToast({
							title: '画板号长度不合规',
							icon: 'none'
						})
						return
					}
					startSearching(name)
				}
			}
		})
	}
	
	// 开始查找画板
	async function startSearching(name :string) {
		searchingName.value = name
		
		let flag = await BleCentralManager.initial()
		if (!flag) return
		
		BleCentralManager.room = name
		await BleCentralManager.reScan()
		
		isSearching.value = true
	}
	
	// 停止查找画板
	async function stopSearching() {
		await BleCentralManager.dispose()
		
		isSearching.value = false
	}
	
	/// 处理进入一起画-画板页面事件
	const onEnterRoomHandler = () => {
		isSearching.value = false
		isGenerating.value = false
		isShowGen.value = false
	}
	
	onLoad(() => {
		// 监听进入画板页面事件
		EventBus.on(EventDrawEnterRoom, onEnterRoomHandler)
	})
	
	onUnload(() => {
		// 防止资源没被释放
		BleCentralManager.dispose()
		BlePeripheralManager.dispose()
		// 取消监听
		EventBus.off(EventDrawEnterRoom, onEnterRoomHandler)
	})
	
</script>

<style lang="scss" scoped>
	@import '../../../../static/css/base.scss';
	
	.list {
		position: relative;
		left: 0;
		top: 0;
		z-index: 1;
		width: 100vw;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		.button {
			margin-top: 12px;
			width: 180px;
			padding: 5px;
			border-width: 2px;
			font-size: 15px;
			border-color: black;
			font-weight: bold;
			user-select: none;
			border-radius: 10px;
		}
		.gen {
			background: $app-color-black18;
			color: white;
			box-shadow: 2px 2px 0px 0px rgba(128, 128, 128, 0.3);
		}
		.find {
			background: transparent;
			color: black;
			box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.75);
		}
		.step {
			width: calc(100% - 20px);
			margin-top: 20px;
			display: flex;
			flex-direction: column;
			align-items: start;
			justify-content: start;
			.title {
				color: $app-color-black18;
				font-size: 14px;
				margin-top: 10px;
				margin-bottom: 15px;
				font-weight: bold;
			}
		}
	}
	
	.modal {
		position: absolute;
		left: 0;
		top: 0;
		z-index: 10;
		width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: rgba(18, 18, 18, 0.65);
		.panel {
			background-color: white;
			border-radius: 10px;
			width: 280px;
		}
	}
	
	.gen_modal {
		.gen_content {
			display: flex;
			flex-direction: column;
			justify-content: start;
			align-items: center;
			height: 315px;
			.title {
				color: $app-color-black18;
				font-size: 18px;
				font-weight: bold;
				margin: 20px 0;
			}
			.desc {
				width: 90px;
				height: 90px;
				border-radius: 50%;
				background-color: $app-color-black18;
				color: white;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 16px;
				font-weight: bold;
			}
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
					padding: 15px 10px 15px 10px;
					.t {
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
						margin-left: 3px;            /* 三角与文本间距 */
						vertical-align: middle;      /* 与文本垂直对齐 */
						border-left: 3px solid transparent;
						border-right: 3px solid transparent;
						border-top: 3px solid $app-color-black18;  /* 三角颜色（向下） */
						pointer-events: none;        /* 不影响点击 */
					}
				}
			}
			.gen_input {
				height: 34px;
				width: 218px;
				border: 1px solid $app-color-black18;
				border-radius: 8px;
				font-size: 14px;
				color: $app-color-black18;
				padding: 0 5px;
				margin-bottom: 20px;
			}
			.stop {
				width: 165px;
				height: 38px;
				background-color: $app-color-black18;
				border-radius: 8px;
				color: white;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 14px;
			}
			.normal {
				width: 100%;
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: space-around;
				.btn {
					width: 120px;
					height: 38px;
					border-radius: 8px;
					font-size: 14px;
					display: flex;
					justify-content: center;
					align-items: center;
				}
				.sure {
					background-color: $app-color-black18;
					color: white;
				}
				.cancel {
					background-color: white;
					border-width: 1px;
					border-radius: 8px;
					border-color: $app-color-black18;
					border-style: solid;
					color: black;
				}
			}
		}
	}
	
	.search_modal {
		.search_content {
			display: flex;
			flex-direction: column;
			justify-content: start;
			align-items: center;
			height: 265px;
			.title {
				color: $app-color-black18;
				font-size: 18px;
				font-weight: bold;
				margin: 20px 0;
			}
			.search_name {
				font-size: 13px;
				color: $app-color-black18;
				margin: 20px 0;
			}
			.stop {
				width: 220px;
				height: 38px;
				background-color: $app-color-black18;
				border-radius: 8px;
				color: white;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 14px;
			}
		}
	}
</style>
