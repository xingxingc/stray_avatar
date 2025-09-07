/// 通用命令
export enum Cmd {
	/// 设置mtu(微信小程序外围设备无法直接获取mtu的值)
	setMtu = 0x01,
	
	/// 建立画板 Central -> Peripheral
	createDrawboard = 0x02,
	/// 确认建立 Peripheral -> Central
	createDrawboardConfirm = 0x03,
	/// 画板配置信息 Peripheral -> Central
	/// 7bytes[gridSize 1byte][bgColor 3byte][lineColor 3byte]
	drawboardConfig = 0x04,
	
	/// 测试
	test = 0xf0,
	
	/// 向对方推送绘制状态
	postDrawState = 0x11,
	/// 推送画板数据
	postLayerData = 0x12
}