<template>
	<common-page :show-back="false" title="随机头像">
		<template v-slot:left>
			<view class="leftPart">
				<image src="../../static/image/nav_info.png" mode="aspectFit" class="backIcon" @click="toSetPage" />
			</view>
		</template>
		<view class="list">
			<view class="list-content">
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
			title: '卡哇伊',
			icon: '/static/image/random/random_kawaii.png',
			path: '/subpackages/sub_1/pages/kawaii/kawaii'
		},
		{
			title: '丑头像',
			icon: '/static/image/random/random_ugly.png',
			path: '/pages/random/ugly/ugly'
		},
		{
			title: '憨憨犬',
			icon: '/static/image/random/random_dog.png',
			path: '/subpackages/sub_1/pages/cute_dog/cute_dog'
		},
		{
			title: '朋克像素',
			icon: '/static/image/random/randm_punks.png',
			path: '/pages/random/cryptopunks/cryptopunks'
		},
		{
			title: '怪诞显眼包',
			icon: '/static/image/random/random_facitars.png',
			path: '/pages/random/facitars/facitars'
		},
		{
			title: '简单微笑',
			icon: '/static/image/random/random_smile.png',
			path: '/pages/random/boringbeam/boringbeam'
		},
		{
			title: '像素怪兽',
			icon: '/static/image/random/random_pixel_monster.png',
			path: '/pages/random/pixel-monster/pixel-monster'
		},
		{
			title: '字符图形',
			icon: '/static/image/random/random_jdenticon.png',
			path: '/pages/random/jdenticon/jdenticon'
		},
		{
			title: '幽菌怪',
			icon: '/static/image/random/random_monsterid.png',
			path: '/subpackages/sub_1/pages/random_monsterid/monsterid'
		},
		{
			title: '旋叶',
			icon: '/static/image/random/random_solacon.png',
			path: '/pages/random/solacon/solacon'
		},
		{
			title: '复古阿呆',
			icon: '/static/image/random/random_silly.png',
			path: '/pages/random/silly/silly'
		},
		{
			title: '哈希对称',
			icon: '/static/image/random/random_hash.png',
			path: '/pages/random/hash/hash'
		},
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
		width: 100vw;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		.list-content {
			flex: 1;
			justify-content: start;
			align-items: center;
			width: 100vw;
			overflow-y: scroll;
			.item {
				margin-left: 18rpx;
				height: 150rpx;
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
					margin-left: 26rpx;
					width: 110rpx;
					height: 110rpx;
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
					margin-right: 24rpx;
					width: 40rpx;
					height: 40rpx;
				}
			}
		}
	}
</style>