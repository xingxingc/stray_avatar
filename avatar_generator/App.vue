<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		onUnload: function() {
			console.log('App Unload')
		}
	}
</script>

<style>
	#app {
	  font-family: Avenir, Helvetica, Arial, sans-serif;
	  -webkit-font-smoothing: antialiased;
	  -moz-osx-font-smoothing: grayscale;
	  text-align: center;
	}
	
	/* 针对 Android 设置滚动条样式为透明 */
	::-webkit-scrollbar {
	  display: none; /* 对于Webkit浏览器，如Chrome，Safari */
	  width: 0; /* 对于IE以及FireFox */
	  height: 0; /* 对于IE以及FireFox */
	  background: transparent; /* 对于IE以及FireFox */
	}
</style>
