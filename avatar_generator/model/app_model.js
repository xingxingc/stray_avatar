export const AppModel = {
	// svg转png的API
	svgToPngApi: 'https://您自己的域名/avatar-generator/api/svg/toPng',
	// 朋克像素图片资源路径，建议把资源下载到自己服务器并替换该地址
	punkBaseUrl: 'https://www.larvalabs.com/public/images/cryptopunks/',
	// 上一次生成png图片的时间
	lastGenPngTime: null,
	// 创建一起画画板的参数
	// {
	// 	gridSize: 12,
	// 	bgColor: {r: 0, g: 0, b: 0},
	// 	lineColor: {r: 0, g: 0, b: 0},
	// }
	genRoomOptions: null,
}