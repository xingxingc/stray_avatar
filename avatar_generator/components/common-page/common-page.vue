<template>
	<view class="base_page">
		<view class="nav-bar" >
			<view class="content" :style="{marginTop: deviceBarMarginTop, height: deviceBarHeight}">
				<view class="leftPart">
					<view v-if="$slots.left">
						<slot name="left"></slot>
					</view>
					<view v-else-if="showBack" @click="navBackAction()">
						<image :src="navLeftIcon" mode="aspectFit" class="backIcon" />
					</view>
				</view>
				<view class="titleView">
					<view v-if="$slots.title">
						<slot name="title"></slot>
					</view>
					<view v-else>
						<text class="navTitle">{{title}}</text>
					</view>
				</view>
				<view class="rightPart"></view>
			</view>
		</view>
		<view type="list" class="scroll-area">
			<slot name="default"></slot>
		</view>
	</view>
</template>

<script lang="ts">
	export default {
		name: "common-page",
		props: {
			title: {
				type: String,
				required: false 
			},
			showBack: {
				type: Boolean,
				default: false,
				required: false 
			}
		},
		data() {
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
			const navHeight = 44;
			const statusBarHeight = menuButtonInfo.top - (navHeight-menuButtonInfo.height)/2;
			
			return {
				navLeftIcon: '../../static/image/nav_back.png',
				deviceBarMarginTop: statusBarHeight + 'px',
				deviceBarHeight: navHeight + 'px',
			};
		},
		mounted() {
			/// 设置状态栏颜色
			uni.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#000000'
			})
		},
		methods: {
			navBackAction() {
				uni.navigateBack();
			}
		}
	}
</script>

<style lang="scss">
	@import '../../static/css/base.scss';
	page {
		width: 100vw;
		height: 100vh;
		background-color: $app-color-background;
	}
	.base_page {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow-y: hidden;
		.nav-bar {
			width: 100vw;
			background-color: $app-color-background;
			.content {
				display: flex;
				flex-direction: row;
				justify-content: start;
				align-items: center;
				.leftPart {
					width: 44px;
					height: 34px;
					.backIcon {
						margin: 5px 9px 5px 15px;
						width: 21px;
						height: 21px;
					}
				}
				.titleView {
					flex: 1;
					display: flex;
					justify-content: center;
					align-items: center;
					.navTitle {
						color: black;
						font-size: 18px;
						font-weight: 500;
					}
				}
				.rightPart {
					width: 34px;
				}
			}
		}
		.scroll-area {
			flex: 1;
			width: 100%;
			overflow-y: scroll;
		}
	}
</style>