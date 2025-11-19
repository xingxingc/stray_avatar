<template>
	<common-page :show-back="true">
		<view class="container">
			<view class="input-box">
				<input placeholder="输入任意字符串生成头像" v-model="inputText" class="input" @confirm="generateAvatar" />
				<image src="/static/image/random.png" class="refresh" @click="refreshInputText"></image>
			</view>
			
			<view class="other-box">
				<!-- 网格数选择 -->
				<view class="picker-group arrow">
					<picker mode="selector" :range="gridSizeOptions" :value="gridSizeIndex" @change="onGridSizeChange"
						class="picker">
						<text class="title">网格:</text>
						<text>{{ gridSizeOptions[gridSizeIndex] }}</text>
					</picker>
				</view>

				<!-- 形状选择 -->
				<view class="picker-group arrow">
					<picker mode="selector" :range="shapes" range-key="name" :value="shapeIndex" @change="onShapeChange"
						class="picker">
						<text class="title">形状:{{ shapes[shapeIndex].name }}</text>
					</picker>
				</view>

				<!-- 形状颜色选择 -->
				<view class="picker-group" @click="chooseShapeColor">
					<text class="title">前景:</text>
					<view class="dot"
						:style="{ background: 'rgba(' + shapeColor.r + ',' + shapeColor.g + ',' + shapeColor.b + ',' + shapeColor.a + ')' }" />
				</view>

				<!-- 背景颜色选择 -->
				<view class="picker-group" @click="chooseBgColor">
					<text class="title">背景:</text>
					<view class="dot"
						:style="{ background: 'rgba(' + bgColor.r + ',' + bgColor.g + ',' + bgColor.b + ',' + bgColor.a + ')' }" />
				</view>
			</view>
			<view class="avatar-canvas">
				<canvas v-if="!isShowColorPicker" canvas-id="avatarCanvas"
					:style="{width: canvasSize + 'px', height: canvasSize + 'px'}"></canvas>
			</view>
			<button @click="randomAvatar()">随机生成</button>
			<button @click="saveAvatar">保存相册</button>
			<view class="spacer"></view>
		</view>
	</common-page>
	<t-color-picker ref="shapeColorPicker" :color="shapeColor" @confirm="confirmShapeColor" @close="closePicker"></t-color-picker>
	<t-color-picker ref="bgColorPicker" :color="bgColor" @confirm="confirmBgColor" @close="closePicker"></t-color-picker>
</template>

<script>
	import {
		randomString, showTextToast
	} from '../../../util/util';

	export default {
		data() {
			return {
				rewardedService: null,
				inputText: '',
				avatarData: null,
				generating: false,
				canvasSize: 240,
				isShowColorPicker: false,
				// 网格数选择
				gridSizeIndex: 3, // 默认选择8×8
				gridSizeOptions: ['5×5', '6×6', '7×7', '8×8', '9×9', '10×10', '11×11', '12×12'],
				// 形状选择
				shapeIndex: 0,
				shapes: [{
						name: '矩形',
						value: 'rect'
					},
					{
						name: '圆形',
						value: 'circle'
					},
					{
						name: '菱形',
						value: 'diamond'
					},
					{
						name: '三角形',
						value: 'triangle'
					},
					{
						name: '六边形',
						value: 'hexagon'
					},
					{
						name: '五角星',
						value: 'star'
					},
					{
						name: '心形',
						value: 'heart'
					}
				],
				// 颜色设置
				shapeColor: {
					r: 165,
					g: 88,
					b: 35,
					a: 1.0
				}, // 默认形状颜色
				bgColor: {
					r: 255,
					g: 255,
					b: 255,
					a: 1.0
				}, // 默认背景颜色
			}
		},
		computed: {
			gridSize() {
				return parseInt(this.gridSizeOptions[this.gridSizeIndex].split('×')[0]);
			}
		},
		onLoad() {
			this.randomAvatar(5, 0, {r:83,g:68,b:188,a:1.0}, {r:225,g:225,b:225,a:1.0})
		},
		onUnload() {
			this.rewardedService.destory()
		},
		methods: {
			chooseShapeColor() {
				this.$refs.shapeColorPicker.open()
				this.isShowColorPicker = true
			},
			chooseBgColor() {
				this.$refs.bgColorPicker.open()
				this.isShowColorPicker = true
			},
			closePicker() {
				this.isShowColorPicker = false
				this.generateAvatar()
			},
			confirmShapeColor(e) {
				this.shapeColor = e.rgba
				this.generateAvatar()
			},
			confirmBgColor(e) {
				this.bgColor = e.rgba
				this.generateAvatar()
			},
			onGridSizeChange(e) {
				this.gridSizeIndex = e.detail.value;
				this.generateAvatar();
			},
			onShapeChange(e) {
				this.shapeIndex = e.detail.value;
				this.generateAvatar();
			},
			randomInput() {
				const length = 10 + Math.floor(Math.random() * 10)
				this.inputText = randomString(length)
			},
			randomGrid() {
				this.gridSizeIndex = Math.floor(Math.random() * this.gridSizeOptions.length)
			},
			randomShape() {
				this.shapeIndex = Math.floor(Math.random() * this.shapes.length)
			},
			refreshInputText() {
				this.randomInput()
				this.generateAvatar()
			},
			randomAvatar(gridSizeIndex, shapIndex, shapColor, bgColor) {
				this.randomInput()
				
				if (gridSizeIndex == undefined) {
					this.randomGrid()
				} else {
					this.gridSizeIndex = gridSizeIndex
				}
				
				if (shapIndex == undefined) {
					this.randomShape()
				} else {
					this.shapeIndex = shapIndex
				}
				
				if (shapColor == undefined) {
					this.shapeColor = {
						r: this.genColorSeed(),
						g: this.genColorSeed(),
						b: this.genColorSeed(),
						a: 1
					}
				} else {
					this.shapeColor = shapColor
				}
				
				if (bgColor == undefined) {
					this.bgColor = {
						r: this.genColorSeed(),
						g: this.genColorSeed(),
						b: this.genColorSeed(),
						a: 1
					}
				} else {
					this.bgColor = bgColor
				}
				
				this.generateAvatar();
			},
			genColorSeed() {
				return Math.random() * 255;
			},
			generateAvatar() {
				if (this.inputText.length == 0) return;


				this.generating = true;

				setTimeout(() => {
					try {
						// 获取选中的形状
						const shape = this.shapes[this.shapeIndex].value;

						// 转换颜色格式
						const sc = this.shapeColor;
						const bc = this.bgColor;
						const shapeColor = `rgba(${sc.r}, ${sc.g}, ${sc.b}, ${sc.a})`;
						const bgColor = `rgba(${bc.r}, ${bc.g}, ${bc.b}, ${bc.a})`;

						// 生成网格数据
						const grid = [];
						for (let i = 0; i < this.gridSize; i++) {
							grid[i] = [];
							for (let j = 0; j < this.gridSize; j++) {
								// 创建对称图案
								const pos = j < Math.ceil(this.gridSize / 2) ? j : this.gridSize - 1 - j;
								// 根据输入文本或随机值决定是否填充
								const shouldFill = this.inputText ?
									(this.inputText.charCodeAt((i * this.gridSize + pos) % this.inputText.length) %
										2 === 0) :
									(Math.random() > 0.5);
								grid[i][j] = shouldFill;
							}
						}

						this.avatarData = {
							shapeColor,
							bgColor,
							grid,
							shape
						};

						this.drawAvatar();
					} catch (e) {
						console.error(e);
						uni.showToast({
							title: '生成失败',
							icon: 'none'
						});
					} finally {
						this.generating = false;
					}
				}, 50);
			},

			drawAvatar() {
				const {
					shapeColor,
					bgColor,
					grid,
					shape
				} = this.avatarData;
				const ctx = uni.createCanvasContext('avatarCanvas', this);
				const cellSize = this.canvasSize / (this.gridSize + 2);

				// 绘制背景
				ctx.setFillStyle(bgColor);
				ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);

				// 绘制形状
				ctx.setFillStyle(shapeColor);

				for (let i = 0; i < this.gridSize; i++) {
					for (let j = 0; j < this.gridSize; j++) {
						if (grid[i][j]) {
							const x = (j + 1) * cellSize;
							const y = (i + 1) * cellSize;
							this.drawShape(ctx, shape, x, y, cellSize, cellSize, i, j);
						}
					}
				}

				ctx.draw();
			},

			drawShape(ctx, shapeType, x, y, width, height, i, j) {
				const centerX = x + width / 2;
				const centerY = y + height / 2;
				const minSize = Math.min(width, height);

				switch (shapeType) {
					case 'rect':
						ctx.fillRect(x, y, width, height);
						break;

					case 'circle':
						ctx.beginPath();
						ctx.arc(centerX, centerY, minSize / 2, 0, 2 * Math.PI);
						ctx.fill();
						break;

					case 'diamond':
						ctx.beginPath();
						ctx.moveTo(centerX, y);
						ctx.lineTo(x + width, centerY);
						ctx.lineTo(centerX, y + height);
						ctx.lineTo(x, centerY);
						ctx.closePath();
						ctx.fill();
						break;

					case 'triangle':
						ctx.beginPath();
						const triangleType = (i + j) % 3;
						if (triangleType === 0) {
							ctx.moveTo(centerX, y);
							ctx.lineTo(x + width, y + height);
							ctx.lineTo(x, y + height);
						} else if (triangleType === 1) {
							ctx.moveTo(x, y);
							ctx.lineTo(x + width, y);
							ctx.lineTo(centerX, y + height);
						} else {
							ctx.moveTo(x + width, centerY);
							ctx.lineTo(x, y);
							ctx.lineTo(x, y + height);
						}
						ctx.closePath();
						ctx.fill();
						break;

					case 'hexagon':
						ctx.beginPath();
						const hexHeight = height * 0.866;
						ctx.moveTo(x + width / 4, y);
						ctx.lineTo(x + width * 3 / 4, y);
						ctx.lineTo(x + width, y + height / 2);
						ctx.lineTo(x + width * 3 / 4, y + height);
						ctx.lineTo(x + width / 4, y + height);
						ctx.lineTo(x, y + height / 2);
						ctx.closePath();
						ctx.fill();
						break;

					case 'star':
						ctx.beginPath();
						const spikes = 5;
						const outerRadius = minSize / 2;
						const innerRadius = outerRadius * 0.4;
						let rot = Math.PI / 2 * 3;
						let currentX = centerX;
						let currentY = centerY;
						const step = Math.PI / spikes;

						ctx.moveTo(centerX, centerY - outerRadius);
						for (let k = 0; k < spikes; k++) {
							currentX = centerX + Math.cos(rot) * outerRadius;
							currentY = centerY + Math.sin(rot) * outerRadius;
							ctx.lineTo(currentX, currentY);
							rot += step;

							currentX = centerX + Math.cos(rot) * innerRadius;
							currentY = centerY + Math.sin(rot) * innerRadius;
							ctx.lineTo(currentX, currentY);
							rot += step;
						}
						ctx.lineTo(centerX, centerY - outerRadius);
						ctx.closePath();
						ctx.fill();
						break;

					case 'heart':
						ctx.beginPath();
						const topCurveHeight = height * 0.3;
						ctx.moveTo(centerX, centerY + height / 4);
						ctx.bezierCurveTo(
							centerX, centerY,
							x, centerY,
							x, centerY - topCurveHeight
						);
						ctx.bezierCurveTo(
							x, y,
							centerX, y,
							centerX, centerY - topCurveHeight
						);
						ctx.bezierCurveTo(
							centerX, y,
							x + width, y,
							x + width, centerY - topCurveHeight
						);
						ctx.bezierCurveTo(
							x + width, centerY,
							centerX, centerY,
							centerX, centerY + height / 4
						);
						ctx.closePath();
						ctx.fill();
						break;
				}
			},

			saveAvatar() {
				if (!this.avatarData) {
					uni.showToast({
						title: '请先生成头像',
						icon: 'none'
					});
					return;
				}
				
				this._didSaveAvatar()
			},
			
			_didSaveAvatar() {
				uni.showLoading({
					title: '保存中...'
				});
				
				uni.canvasToTempFilePath({
					canvasId: 'avatarCanvas',
					success: (res) => {
						uni.hideLoading();
						uni.saveImageToPhotosAlbum({
							filePath: res.tempFilePath,
							success: () => {
								uni.showToast({
									title: '保存成功',
									icon: 'success'
								});
							},
							fail: (err) => {
								console.error(err);
								uni.showToast({
									title: '保存失败，请检查权限设置',
									icon: 'none'
								});
							}
						});
					},
					fail: (err) => {
						uni.hideLoading();
						console.error(err);
						uni.showToast({
							title: '生成图片失败',
							icon: 'none'
						});
					}
				}, this);
			}
		}
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
		.input-box {
			margin-top: 10px;
			width: 85vw;
			display: flex;
			justify-content: start;
			align-items: center;
			.input {
				flex: 1;
				padding: 10px 12px;
				border: 2px solid $app-color-black18;
				border-radius: 8px;
				background-color: #fff;
				font-size: 15px;
				font-weight: bold;
			}
			.refresh {
				width: 20px;
				height: 20px;
				padding: 10px 8px 10px 15px;
			}
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
			margin-bottom: 20px;
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
		
		.spacer {
			flex: 1;
		}
	}
</style>