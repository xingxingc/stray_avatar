<template>
	<common-page title="像素画家">
		<view class="list">
			<view class="list-container">
				<image src="/static/image/draw/draw_single.png" class="item" mode="widthFix" @click="singlePage"/>
				<view class="space"/>
				<image src="/static/image/draw/draw_double.png" class="item" mode="widthFix" @click="doublePage"/>
			</view>
			<ad-custom unit-id="adunit-865238298f61239b"></ad-custom>
		</view>
	</common-page>
</template>

<script setup lang="ts">
	import { onLoad } from '@dcloudio/uni-app'
	
	function singlePage() {
		uni.navigateTo({
			url: '/pages/draw/drawboard/single/single'
		})
	}
	
	function doublePage() {
		uni.navigateTo({
			url: '/pages/draw/drawboard/double/type'
		})
	}
	
	onLoad(() => {
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline'],
			success() {
				console.debug('分享成功')
			},
			fail(e) {
				console.debug('分享失败')
				console.debug(e)
			}
		})
	})
	
</script>

<style lang="scss">
	.list {
		height: 100%;
		display: flex;
		flex-direction: column;
		.list-container {
			flex: 1;
			width: 100vw;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			.item {
				width: 238rpx;
			}
			.space {
				height: 50rpx;
			}
		}
	}
</style>
