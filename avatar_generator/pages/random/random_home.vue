<template>
	<common-page :show-back="false" title="随机头像">
		<template v-slot:left>
			<view class="leftPart">
				<image src="../../static/image/nav_info.png" mode="aspectFit" class="backIcon" @click="toSetPage" />
			</view>
		</template>
		<view class="list">
			<view 
				v-for="(item,index) in data" 
				:key="index" 
				class="item"
				@click="toItemPage(item.path)">
				<image :src="item.icon" mode="widthFix" class="icon" />
				<text class="name">{{item.title}}</text>
				<view class="flex"></view>
				<image src="/static/image/random/arrow_right.png" class="right"></image>
			</view>
		</view>
	</common-page>
</template>

<script setup lang="ts">
	import { onLoad } from '@dcloudio/uni-app'
	
	const data = [
		{
			title: '无聊鸭',
			icon: '/static/image/random/random_duck.png',
			path: '/pages/random/duck/duck'
		},
		{
			title: '丑头像',
			icon: '/static/image/random/random_ugly.png',
			path: '/pages/random/ugly/ugly'
		},
		{
			title: '朋克像素',
			icon: '/static/image/random/randm_punks.png',
			path: '/pages/random/cryptopunks/cryptopunks'
		},
		{
			title: '简单微笑',
			icon: '/static/image/random/random_smile.png',
			path: '/pages/random/boringbeam/boringbeam'
		},
		{
			title: '哈希对称',
			icon: '/static/image/random/random_hash.png',
			path: '/pages/random/hash/hash'
		}
	]
	
	/// 跳转子页面
	function toItemPage(url :string) {
		uni.navigateTo({
			url: url
		})
	}
	
	/// 跳转设置页
	function toSetPage() {
		uni.switchTab({
			url: '/pages/setting/setting'
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
	@import '../../static/css/base.scss';
	.leftPart {
		width: 44px;
		height: 34px;
		.backIcon {
			margin: 5px 9px 5px 15px;
			width: 21px;
			height: 21px;
		}
	}
	.list {
		display: flex;
		flex-direction: column;
		justify-content: start;
		align-items: center;
		width: 100vw;
		.item {
			height: 160rpx;
			width: calc(100% - 40rpx);
			border: 1px solid $app-color-black18;
			border-radius: 20rpx;
			margin-bottom: 20rpx;
			display: flex;
			flex-direction: row;
			align-items: center;
			&:first-child {
				margin-top: 20rpx;
			}
			.icon {
				margin-left: 30rpx;
				width: 120rpx;
				height: 120rpx;
				border-radius: 20rpx;
			}
			.name {
				margin-left: 30rpx;
				color: $app-color-black18;
				font-weight: bold;
				font-size: 36rpx;
			}
			.flex {
				flex: 1;
			}
			.right {
				margin-right: 30rpx;
				width: 44rpx;
				height: 44rpx;
			}
		}
	}
</style>