<template>
	<common-page :show-back="false">
		<view class="list_content">
			<view class="header">
				<image class="logo" src="/static/image/logo.png"></image>
				<text class="title">潦草头像</text>
				<text class="desc">潦草头像是一款随机生成用户头像的工具类应用</text>
				<view class="tip" @click="tipAction">
					<image src="/static/image/coffee.png" class="icon" mode="widthFix" />
					<text>鼓励一杯咖啡</text>
				</view>
			</view>
			<view class="thrid_part">
				<view class="h">【开源声明】</view>
				<view class="c">本项目遵循MIT开源协议。</view>
				<view v-for="(item,index) in kMyOpenSources" :key="index" class="my-list">
					<view class="name">
						<text>• {{ item.target }}</text>
					</view>
					<view class="copy" @click="copy(item.link)">
						<image src="/static/image/copy_link.png" />
						<text>链接</text>
					</view>
				</view>
				<view class="h">【致谢声明】</view>
				<view class="c">站在巨人的肩膀上，感恩开源。在本小程序中使用或借鉴了下方列出的开源项目里的功能，在此，向所有开发者致以诚挚的感谢。</view>
				<view v-for="(item,index) in kOpenSourceProjectList" :key="index" class="list-item">
					<view class="name">• [{{ item.name }}]（作者：{{ item.author }}）</view>
					<view class="desc">
						<text>{{ item.desc }}</text>
						<view class="copy" @click="copy(item.link)">
							<image src="/static/image/copy_link.png" />
							<text>链接</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</common-page>
</template>

<script setup>
	import { onLoad, onUnload } from '@dcloudio/uni-app'
	import { kOpenSourceProjectList, kMyOpenSources } from '../../model/open_source_project'
	import { showTextToast } from '../../util/util'
	
	function copy(link) {
		uni.setClipboardData({
			data: link,
			success: () => {
				uni.showToast({
					title: '已复制到剪贴板',
					icon: 'success'
				})
			},
			fail: (_) => {
				uni.showToast({
					title: '复制失败',
					icon:'fail'
				})
			}
		})
	}
	
	function tipAction() {
		rewardedService.showAd(res => {
			console.debug('give me a coffee', res)
			if (res.isEnded) {
				setTimeout(() => {
					showTextToast('感谢您的鼓励～')
				}, 280)
			}
		})
	}
	
</script>

<style lang="scss">
	@import '../../static/css/base.scss';
	
	.list_content {
		padding: 0 15px;
		display: flex;
		flex-direction: column;
		justify-content: start;
		align-items: center;
		
		.header {
			display: flex;
			flex-direction: column;
			align-items: center;
			.logo {
				width: 88px;
				height: 88px;
				border-radius: 10px;
			}
			.title {
				margin: 12px 0 12px 0;
				font-size: 18px;
				color: $app-color-black18;
				font-weight: bold;
			}
			.desc {
				font-size: 13px;
				color: $app-color-grey77;
			}
			.tip {
				margin-top: 12px;
				padding: 6px 10px 6px 10px;
				font-size: 10px;
				display: flex;
				flex-direction: row;
				color: $app-color-black18;
				align-items: center;
				border-radius: 8px;
				border-width: 0.5px;
				border-color: $app-color-greyCE;
				border-style: solid;
				.icon {
					margin-right: 5px;
					width: 12px;
				}
			}
		}
		
		.thrid_part {
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: start;
			font-size: 13px;
			.list-item {
				font-size: 13px;
				margin-top: 6px;
				&:last-child {
					margin-bottom: 20px;
				}
				.name {
					font-weight: bold;
					color: $app-color-black18;
					margin-bottom: 2px;
				}
				.desc {
					display: flex;
					align-items: center;
					color: $app-color-grey77;
					font-weight: normal;
					.copy {
						color: #1296db;
						font-size: 12px;
						display: flex;
						align-items: center;
						padding: 5px;
						image {
							margin-right: 2px;
							width: 12px;
							height: 12px;
						}
					}
				}
			}
			.h {
				margin-top: 20px;
				color: $app-color-black18;
				font-weight: bold;
			}
			.c {
				margin-top: 10px;
				color: $app-color-grey77;
				font-weight: normal;
			}
			.my-list {
				font-size: 13px;
				margin-top: 6px;
				display: flex;
				flex-direction: row;
				align-items: center;
				.name {
					font-weight: bold;
					color: $app-color-black18;
					margin-bottom: 2px;
				}
				.copy {
					color: #1296db;
					font-size: 12px;
					display: flex;
					align-items: center;
					padding: 5px;
					image {
						margin-right: 2px;
						width: 12px;
						height: 12px;
					}
				}
			}
		}
	}
</style>