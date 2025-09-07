<template>
	<view class="canvas-container">
		<view
			:style="{width: boardSize + 'px', 
					height: boardSize + 'px',
			}">
			<canvas
				v-if="!isShowColorPicker"
				:id="canvasId"
				:canvas-id="canvasId"
				:style="{
					width: boardSize + 'px',
					height: boardSize + 'px', 
					border: `1px solid rgb(${borderColor.r},${borderColor.g},${borderColor.b})`
				}"
				@touchstart="onPointerDown" 
				@touchmove.stop="onPointerMove" 
				@touchend="onPointerUp"
				@mousedown="onPointerDown" 
				@mousemove.stop="onPointerMove" 
				@mouseup="onPointerUp"></canvas>
		</view>
	</view>
	<view class="tool-bar">
		<view v-if="enableHistory" class="item" @click="backward">
			<image class="icon" src="/static/image/draw/backward.png" />
		</view>
		<view v-if="enableHistory" class="item" @click="forward">
			<image class="icon" src="/static/image/draw/forward.png" />
		</view>
		<view class="item" @click="chooseColor">
			<view class="color" :style="{background: `rgba(${selectedColor.r},${selectedColor.g},${selectedColor.b}, 1)`}" />
		</view>
		<view class="item" @click="chooseDrawType(DrawType.fill)">
			<image class="icon" :src="brushIcon" />
		</view>
		<view class="item" @click="chooseDrawType(DrawType.clear)">
			<image class="icon" :src="eraserIcon" />
		</view>
		<view class="item" @click="chooseDrawType(DrawType.move)">
			<image class="icon" :src="dragIcon" />
		</view>
		<view class="item" @click="chooseDrawType(DrawType.replaceColor)">
			<image class="icon" :src="daubIcon" />
		</view>
		<view class="item" @click="rotate">
			<image class="icon" src="/static/image/draw/rotation.png" />
		</view>
		<view class="item" @click="clearAction">
			<image class="icon" src="/static/image/draw/delete.png" />
		</view>
	</view>
	<t-color-picker ref="colorPicker" :color="selectedColor" @confirm="confirmColor" @close="closeColorPicker"></t-color-picker>
</template>

<script lang="ts" setup>
	import { onMounted, onUnmounted, ref, computed, getCurrentInstance } from 'vue'
	import { DrawType, DrawLayer, DrawPoint } from './draw_models'
	
	////////////////////////////
	// 定义、生命周期、对外方法定义
	////////////////////////////
	
	const canvasId = 'pixelCanvas'
	
	// 在 Vue3 的 Composition API 中，getCurrentInstance() 仅在组件 setup() 函数同步执行期间有效。
	const instance = getCurrentInstance() 
	
	const props = defineProps({
		gridCount: {
		  type: Number,
		  default: 12,
		},
		bgColor: {
			type: Object,
			default: { r: 255, g: 255, b: 255, a: 1}
		},
		borderColor: {
			type: Object,
			default: { r: 205, g: 205, b: 205, a: 1 }
		},
		enableHistory: {
			type: Boolean,
			default: true
		},
		// 外部传入的返回值为布尔的方法，用于判断是否可以绘制
		shouldPaint: {
			type: Function,
			default: null,
			required: true
		}
	})
	
	// 必须使用 defineExpose 暴露，外部才能通过 ref 访问到
	defineExpose({
		canvasId,
		resetCanvas,
		updateIsShowPicker,
		updateBgColor,
		updateLineColor,
		canvasToTempFilePath,
		handleReceiveNewLayerData
	})
	
	/// 重置画板
	function resetCanvas(_gridCount :number) {
		gridCount.value = _gridCount
		
		painting.value = false
		effectPoints = []
		layers = []
		dragStartPoint = null
		dragOffset = {x: 0, y: 0}
		historyIndex = -1
		drawType.value = DrawType.fill
		
		initSize()
		drawGrid()
	}
	
	function updateBgColor(_bgColor) {
		bgColor.value = _bgColor
		
		drawGrid()
		
		if (layers.length == 0) return
		if (layers[layers.length-1].points.length == 0) return 
		
		resetWithPoints(layers[layers.length-1].points)
	}
	
	function updateLineColor(_lineColor) {
		borderColor.value = _lineColor
		
		drawGrid()
		
		if (layers.length == 0) return
		if (layers[layers.length-1].points.length == 0) return 
		
		resetWithPoints(layers[layers.length-1].points)
	}
	
	async function canvasToTempFilePath() :Promise<string> {
		let p = await new Promise<string>((resolve, reject) => {
			uni.canvasToTempFilePath({
				canvasId: canvasId,
				success: res => {
					resolve(res.tempFilePath)
				},
				fail: err => {
					uni.showToast({
					    title: '转换失败',
					    icon: 'none'
					});
					console.error(err);
					resolve('');
				}
			}, instance)
		})
		return p
	}
	
	// 定义可触发的事件
	const emit = defineEmits(['layer-update', 'painting-state-change'])
	
	// 发送图层变化事件
	function emitLayerUpdate() {
		emit('layer-update', {
			layers: layers,
			historyIndex: historyIndex
		})
	}
	
	// 发送绘制状态变化事件
	function emitIsPaintingUpdate() {
		emit('painting-state-change', painting.value)
	}
	
	// 组件初始化
	onMounted(() => {
		initCanvas()
		drawGrid()
	})
	
	//////////////////
	// 内部处理逻辑部分
	//////////////////
	const gridCount = ref(props.gridCount)
	const bgColor = ref(props.bgColor)
	const borderColor = ref(props.borderColor)
	const selectedColor = ref({ r: 23, g: 23, b: 23, a: 1})
	const boardSize = ref(320)
	const cellSize = ref(20)
	const painting = ref(false)
	const ctx = ref(null)
	
	/// 历史图层
	let layers = new Array<DrawLayer>()
	/// 单次操作受影响的点
	let effectPoints = new Array<DrawPoint>()
	/// 移动操作
	let dragStartPoint = null
	let dragOffset = {x: 0, y: 0}
	/// 历史操作前进后退
	let historyIndex = -1
	
	const drawType = ref<DrawType>(DrawType.fill)
	const brushIcon = computed(() => {
		let active = drawType.value == DrawType.fill ? 'active' : 'inactive'
		return `/static/image/draw/brush_${active}.png`
	})
	const dragIcon = computed(() => {
		let active = drawType.value == DrawType.move ? 'active' : 'inactive'
		return `/static/image/draw/drag_${active}.png`
	})
	const eraserIcon = computed(() => {
		let active = drawType.value == DrawType.clear ? 'active' : 'inactive'
		return `/static/image/draw/eraser_${active}.png`
	})
	const daubIcon = computed(() => {
		let active = drawType.value == DrawType.replaceColor ? 'active' : 'inactive'
		return `/static/image/draw/daub_${active}.png`
	})
	
	const colorPicker = ref(null)
	const isShowColorPicker = ref(false)
	
	/// 操作历史往后
	function backward() {
		if (layers.length == 0) return
		if (historyIndex == -1) return
		
		historyIndex -= 1
		if (historyIndex == -1) {
			clearCanvas()
		} else {
			resetWithPoints(layers[historyIndex].points)
		}

		emitLayerUpdate()
	}
	
	/// 操作历史往前
	function forward() {
		if (layers.length == 0) return
		if (historyIndex == layers.length-1) return
		
		historyIndex += 1
		resetWithPoints(layers[historyIndex].points)
		
		emitLayerUpdate
	}
	
	/// 选择操作方式
	function chooseDrawType(type : DrawType) {
		if (drawType.value == type) return
	
		drawType.value = type
		
		if (type == DrawType.replaceColor) {
			replaceColor(selectedColor.value)
		}
	}
	
	/// 选择颜色
	function chooseColor() {
		updateIsShowPicker(true)
		colorPicker.value.open()
	}
	function confirmColor(e) {
		if (selectedColor.value.r != e.rgba.r || 
			selectedColor.value.g != e.rgba.g ||
			selectedColor.value.b != e.rgba.b) {
			// 避免confirm和close存在先后顺序的问题，此处添加延时处理
			setTimeout(() => {
				selectedColor.value = e.rgba
				if (drawType.value == DrawType.replaceColor) {
					replaceColor(selectedColor.value)
				}
			}, 100)
		}
	}
	function closeColorPicker() {
		updateIsShowPicker(false)
	}
	function updateIsShowPicker(value :boolean) {
		isShowColorPicker.value = value
		
		clearCanvas()
		
		if (layers.length == 0 || historyIndex == -1 || layers[historyIndex].points.length == 0) return 
		
		for (const p of layers[historyIndex].points) {
			paintCell(p.x, p.y, p)
		}
	}
	
	/// 替换颜色
	function replaceColor(color) {
		if (!props.shouldPaint()) return
		
		checkAndRecordHistory()
		
		if (layers.length == 0) return
		if (layers[layers.length-1].points.length == 0) return 
		
		let shoudAdd = false
		for (let p of layers[layers.length-1].points) {
			if (p.r != color.r || p.g != color.g || p.b != color.b) {
				shoudAdd = true
				break
			}
		}
		if (shoudAdd) {
			let layer = layers[layers.length-1].copy()
			for (let p of layer.points) {
				p.r = color.r
				p.g = color.g
				p.b = color.b
			}
			addNewLayerData(layer)
			
			resetWithPoints(layer.points)
		}
	}
	
	/// 顺时针旋转90度
	function rotate() {
		if (!props.shouldPaint()) return
		
		checkAndRecordHistory()
		
		if (layers.length == 0) return 
		if (layers[layers.length-1].points.length == 0) return 
		
		clearCanvas()
		
		let newLayer = layers[layers.length - 1].copy()
		for(let p of newLayer.points) {
			const x = p.x
			const y = p.y
			p.x = gridCount.value - 1 - y
			p.y = x
			paintCell(p.x, p.y, {r: p.r, g: p.g, b: p.b})
		}
		
		addNewLayerData(newLayer)
	}
	
	/// 移动
	function move(e) {
		if (layers.length == 0) return 
		if (layers[layers.length-1].points.length == 0) return 
		
		if (!props.shouldPaint()) return
		
		checkAndRecordHistory()
		
		const { x, y } = getPointerPos(e)
		const h = Math.floor((x - dragStartPoint.x) / cellSize.value)
		const v = Math.floor((y - dragStartPoint.y) / cellSize.value)
	
		if (dragOffset.x == h && dragOffset.y == v) return
		
		dragOffset = {x: h, y: v}
		
		clearCanvas()
		let points = layers[layers.length-1].copy().points
		for(let p of points) {
			p.x = (p.x + dragOffset.x + gridCount.value) % gridCount.value
			p.y = (p.y + dragOffset.y + gridCount.value) % gridCount.value
			paintCell(p.x, p.y, p)
		}
	}
	
	/// 移动结束
	function moveEnd() {
		if (!props.shouldPaint()) return
		
		if (layers.length == 0) return
		if (layers[layers.length-1].points.length == 0) return 
		if (dragOffset.x == 0 && dragOffset.y == 0) return 
		
		let newLayer = layers[layers.length - 1].copy()
		let points = newLayer.points
		for(let p of points) {
			p.x = (p.x + dragOffset.x + gridCount.value) % gridCount.value
			p.y = (p.y + dragOffset.y + gridCount.value) % gridCount.value
		}
		addNewLayerData(newLayer)
	}
	
	/// 清空当前画布
	function clearAction() {
		if (!props.shouldPaint()) return
		
		checkAndRecordHistory()
		
		if (layers.length == 0) return
		if (layers[layers.length-1].points.length == 0) return
		
		clearCanvas()
		
		let newLayer = new DrawLayer()
		addNewLayerData(newLayer)
	}
	
	/// 设置绘制中的状态
	function setPaintingValue(value :boolean) {
		painting.value = value
		emitIsPaintingUpdate()
	}
	
	////////////////////////
	///  手势处理
	////////////////////////
	async function onPointerDown(e) {
		if (!props.shouldPaint()) return
		
		const useful = [DrawType.fill, DrawType.clear, DrawType.move].includes(drawType.value)
		if (!useful) return
		
		setPaintingValue(true)
		
		checkAndRecordHistory()
		
		effectPoints = new Array()
		
		switch (drawType.value) {
			// 填充颜色
			case DrawType.fill:
				painWithPointer(e)
				break
			case DrawType.clear:
				clearWithPointer(e)
				break
			case DrawType.move:
				dragStartPoint = getPointerPos(e)
				dragOffset = {x: 0, y: 0}
				break
			default:
				break
		}
	}
	
	function onPointerMove(e) {
		if (!painting.value) return
		
		const useful = [DrawType.fill, DrawType.clear, DrawType.move].includes(drawType.value)
		if (!useful) return		
		
		switch (drawType.value) {
			case DrawType.fill:
				painWithPointer(e)
				break
			case DrawType.clear:
				clearWithPointer(e)
				break
			case DrawType.move:
				move(e)
				break
			default:
				break
		}
	}
	
	async function onPointerUp() {
		if (!painting.value) return
		
		const useful = [DrawType.fill, DrawType.clear, DrawType.move].includes(drawType.value)
		if (!useful) return	
		
		setPaintingValue(false)
		
		switch (drawType.value) {
			case DrawType.fill:
				if (effectPoints.length > 0) {
					fillNewLayerData(effectPoints)
				}
				break
			case DrawType.clear:
				if (effectPoints.length > 0) {
					clearNewLayerData(effectPoints)
				}
				break
			case DrawType.move:
				moveEnd()
				break
			default:
				break
		}
	}
	
	/// 擦除后新增图层数据
	function clearNewLayerData(effectPoints) {
		if (layers.length == 0) return 
		if (effectPoints.length == 0) return 
		
		let newLayer = layers[layers.length - 1].copy()
		for (let ep of effectPoints) {
			const index = newLayer.points.findIndex((item) => {
				return ep.x == item.x && ep.y == item.y
			})
			if (index != -1) {
				newLayer.points.splice(index, 1);
			}
		}
		addNewLayerData(newLayer)
	}
	
	/// 填充后新增图层数据
	function fillNewLayerData(effectPoints) {
		let isChanged = true
		if (layers.length > 0) {
			let lastLayer = layers[layers.length - 1]
			let isSame = true
			for (let s of effectPoints) {
				const index = lastLayer.points.findIndex((item) => {
					return s.x == item.x && 
						   s.y == item.y &&
						   s.r == item.r &&
						   s.g == item.g &&
						   s.b == item.b
				})
				if (index == -1) {
					isSame = false
					break
				}
			}
			if (isSame) {
				isChanged = false
			}
		}
		if (!isChanged) return
	
		let newLayer : DrawLayer = layers.length == 0 ? new DrawLayer() : layers[layers.length - 1].copy()
	
		for (let ep of effectPoints) {
			const index = newLayer.points.findIndex((item) => {
				return ep.x == item.x && ep.y == item.y
			})
			if (index == -1) {
				newLayer.points.push(new DrawPoint(ep.x, ep.y, ep.r, ep.g, ep.b))
			} else {
				let op = newLayer.points[index]
				op.r = ep.r
				op.g = ep.g
				op.b = ep.b
			}
		}
	
		addNewLayerData(newLayer)
	}
	
	/// 画板变化时判断是否为历史绘图，是则添加记录
	function checkAndRecordHistory() {
		if (historyIndex == -1 || historyIndex == layers.length-1) return 
		
		let newLayer = layers[historyIndex].copy()
		addNewLayerData(newLayer)
	}
	
	/// 新增图层数据
	function addNewLayerData(layer :DrawLayer) {
		layers.push(layer)
		historyIndex = layers.length-1
		
		emitLayerUpdate()
	}
	
	/// 处理通过蓝牙接收到的图层信息
	function handleReceiveNewLayerData(data :Uint8Array) {
		if (data.length % 5 != 0) return 
		
		let layer = new DrawLayer()
		let index = 0
		let point :DrawPoint
		for (let b of data) {
			const idx = index % 5
			switch (idx) {
				case 0:
					point = new DrawPoint(b, 0, 0, 0, 0)
					layer.points.push(point)
					break
				case 1:
					point.y = b
					break
				case 2:
					point.r = b
					break
				case 3:
					point.g = b
					break
				case 4:
					point.b = b
					break
			}
			index += 1
		}
		
		layers.push(layer)
		historyIndex = layers.length-1
		
		resetWithPoints(layer.points)
	}
	
	////////////////////////
	///  Canvas相关的方法  
	////////////////////////
	
	function initCanvas() {
		initSize()
		// 组件中使用canvas必须指定组件实例
		// 下方getCurrentInstance()在非setup语法里和this等价
		ctx.value = uni.createCanvasContext(canvasId, instance)
	}
	
	function initSize() {
		const sys = uni.getSystemInfoSync()
		boardSize.value = sys.windowWidth - 30
		cellSize.value = boardSize.value / gridCount.value
	}
	
	function drawGrid() {
		const c = ctx.value
		c.setFillStyle(`rgb(${bgColor.value.r},${bgColor.value.g},${bgColor.value.b})`)
		c.fillRect(0, 0, boardSize.value, boardSize.value)
		c.setStrokeStyle(`rgb(${borderColor.value.r},${borderColor.value.g},${borderColor.value.b})`)
		for (let i = 0; i <= gridCount.value; i++) {
			const pos = i * cellSize.value
			c.moveTo(pos, 0)
			c.lineTo(pos, boardSize.value)
			c.moveTo(0, pos)
			c.lineTo(boardSize.value, pos)
		}
		c.stroke()
		c.draw()
	}
	
	/// 填充点
	function painWithPointer(e) {
		const { x, y } = getPointerPos(e)
		const col = Math.floor(x / cellSize.value)
		const row = Math.floor(y / cellSize.value)
		if (col < 0 || row < 0 || col >= gridCount.value || row >= gridCount.value) return
		
		const index = effectPoints.findIndex((item) => {
			return item.x == col && item.y == row
		})
		let shouldPaint = true
		if (index == -1) {
			effectPoints.push(new DrawPoint(col, row, selectedColor.value.r, selectedColor.value.g, selectedColor.value.b))
		} else {
			const c = selectedColor.value
			const p = effectPoints[index]
			if (!(p.r == c.r && p.g == c.g && p.b == c.b)) {
				p.r = c.r
				p.g = c.g
				p.b = c.b
			} else {
				shouldPaint = false
			}
		}
		
		if (shouldPaint) {
			paintCell(col, row, selectedColor.value)
		}
	}
	
	/// 擦除点
	function clearWithPointer(e) {
		if (layers.length == 0) return
		if (layers[layers.length-1].points.length == 0) return
		
		const { x, y } = getPointerPos(e)
		const col = Math.floor(x / cellSize.value)
		const row = Math.floor(y / cellSize.value)
		
		const index1 = effectPoints.findIndex((item) => {
			return col == item.x && row == item.y
		})
		if (index1 != -1) return
		
		const lastLayerPoints = layers[layers.length-1].points
		const index2 = lastLayerPoints.findIndex((item) => {
			return col == item.x && row == item.y
		})
		if (index2 == -1) return
		
		effectPoints.push(lastLayerPoints[index2].copy())
		paintCell(col, row, bgColor.value)
	}
	
	function paintCell(col :number, row: number, color:any) {
		const c = ctx.value
		c.setFillStyle(`rgb(${color.r}, ${color.g}, ${color.b})`)
		c.fillRect(col * cellSize.value, row * cellSize.value, cellSize.value, cellSize.value)
		c.setStrokeStyle(`rgb(${borderColor.value.r},${borderColor.value.g},${borderColor.value.b})`)
		c.strokeRect(col * cellSize.value, row * cellSize.value, cellSize.value, cellSize.value)
		c.draw(true)
	}
	
	function getPointerPos(e) {
		let clientX, clientY
		if (e.touches && e.touches.length) {
			clientX = e.touches[0].x
			clientY = e.touches[0].y
		} else if (e.type.startsWith('mouse')) {
			clientX = e.offsetX
			clientY = e.offsetY
		}
		return { x: clientX, y: clientY }
	}
	
	/// 根据绘制点数据重画
	function resetWithPoints(points :Array<DrawPoint>) {
		drawGrid()
		for (let p of points) {
			paintCell(p.x, p.y, {r: p.r, g: p.g, b: p.b,})
		}
	}
	
	function clearCanvas() {
		drawGrid()
	}
</script>

<style lang="scss" scoped>
	.canvas-container {
		margin: 0;
		padding: 15px;
	}
	
	.tool-bar {
		width: 100vw;
		height: 40px;
		background-color: white;
		border-top: 0.5px solid #efefef;
		border-bottom: 0.5px solid #efefef;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		overflow-x: scroll;
	
		.item {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100%;
			width: 34px;
	
			.icon {
				width: 22px;
				height: 22px;
			}
		}
	
		.color {
			width: 16px;
			height: 16px;
			border-radius: 8px;
			border-width: 0.5px;
			border-color: #efefef;
			border-style: solid;
		}
	}
</style>