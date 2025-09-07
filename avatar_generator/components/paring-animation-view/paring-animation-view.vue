<template>
	<view class="animation-container">
		<view class="circle"></view>
		<view class="circle"></view>
		<view class="circle"></view>
		<view class="circle"></view>
		<view class="circle"></view>
		<image class="search-icon" src="/static/image/draw/bluetooth.png"></image>
	</view>
</template>

<script>
	export default {
		name:"paring-animation-view",
		data() {
			return {
				
			};
		}
	}
</script>

<style lang="scss">
	@import '../../static/css/base.scss';
	
	@keyframes anim {
		from {
			opacity: 1;
			transform: scale(0);
		}
	
		to {
			opacity: 0;
			transform: scale(3);
		}
	}
	
	.animation-container {
		width: 90px;
		height: 90px;
		display: flex;
		justify-content: center;
		align-items: center;
		.circle {
			position: absolute;
			width: 30px;
			height: 30px;
			border-radius: 50%;
			background-color: $app-color-black18;
			&:nth-child(2) {
				animation: anim 3s linear -3s infinite;
			}
			&:nth-child(3) {
				animation: anim 3s linear -2.25s infinite;
			}
			&:nth-child(4) {
				animation: anim 3s linear -1.5s infinite;
			}
			&:nth-child(5) {
				animation: anim 3s linear -0.75s infinite;
			}
		}
		.search-icon {
			position: absolute;
			width: 15px;
			height: 15px;
		}
	}
</style>