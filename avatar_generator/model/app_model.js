export const AppModel = {
	// svg转png的API
	svgToPngApi: 'https://[你自己的域名]/avatar-generator/api/svg/toPng',
	// cute_doy图片资源
	cuteDogImagesUrl: 'https://github.com/xingxingc/stray_avatar/tree/main/assets/cute_dog.zip',
	// cryptopunks图片地址
	cryptopunksBaseUrl: 'https://www.larvalabs.com/public/images/cryptopunks/',
	// draw_puppy图片资源
	drawPuppyBaseUrl: 'https://github.com/xingxingc/stray_avatar/tree/main/assets/draw_puppy.zip',
	// 上一次生成png图片的时间
	lastGenPngTime: null,
	// 创建一起画画板的参数
	// {
	// 	gridSize: 12,
	// 	bgColor: {r: 0, g: 0, b: 0},
	// 	lineColor: {r: 0, g: 0, b: 0},
	// }
	genRoomOptions: null,
	randomNames: [
		'微笑向阳', '天生赢家', 'Dwyane Wade', '忘事小天才',
		'微笑天使', '独步芳华', 'Kobe Bryant', '电梯等我星人',
		'我可真棒', '无敌存在', 'Allen Iverson', '被窝粘人精',
		'星河有你', '独领风骚', 'Dirk Nowitzki', '表情包富翁',
		'元气满格', '超凡入圣', 'Manu Ginóbili', '剩饭清理专员',
		'笑眼弯弯', '万人迷', 'Michael Jordan', 'WiFi 满格信徒',
		'星光未眠', '风华绝代', 'Michael Jackson', '闹钟对抗大师',
		'清茶煮雨', '独步天下', '球球', '服了你个老六', '快递签收侠',
		'心有桃花', '魅力无限', '琳琳', '社恐天花板', '躺平协会会长',
		'暖阳小鹿', '美艳无双', '若曦', '栓 Q', '绝绝子', '减肥失败选手',
		'月亮打烊我上班', '会说话的土豆', '发呆冠军候选人', '干饭不排队真君',
		'躺平摸鱼怪', '欧皇批发商', '赛博广场舞王', '花影旧纹', '烬雪',
	]
}