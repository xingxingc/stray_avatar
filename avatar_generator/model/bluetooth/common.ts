/// 蓝牙部分的常量
export class BleConst {
	static readonly kDeviceNamePrefix = '0x0x'
	static readonly kServiceUuid = 'bbc88164-620a-4acc-86b8-ad8ef42328d2'.toUpperCase()
	static readonly kWriteCharacteristicUuid = '2f5f0e40-07f9-4712-8755-052954a7ba13'.toUpperCase()
	static readonly kNotiyCharacteristicUuid = 'eab5b7d3-bfe3-451c-8f7e-2560de2fec6f'.toUpperCase()
}

/// 获取到新图层数据的回调
export type GetNewLayerDataCallback = (data :Uint8Array) => void
/// 对方推送过来的绘制状态的回调
export type GetRemoteDrawStateCallback = (isDrawing :boolean) => void
/// 外围设备向中心设备发送画板配置 
export type GetDrawboardConfigCallback = (config :any) => void;