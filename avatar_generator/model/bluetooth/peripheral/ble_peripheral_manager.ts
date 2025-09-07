import { delay } from "../../../util/util"
import { BleConst } from "../common"
import { DataPacker } from "../data_packer"
import { PeripheralReceiver } from "./peripheral_receiver"

export class BlePeripheralManager {
	static server :BLEPeripheralServer|null
	
	static mtu :number = 20
	
	static bindDrawboard = false
	
	static room :string = ''
	
	/// 是否支持外设API
	static isSupport(): Boolean {
		return wx.canIUse('createBLEPeripheralServer')
	}
	
	/// 初始化
	static async initial() :Promise<boolean> {
		const setting = await wx.getSetting()
		const bluetoothEnable = setting.authSetting["scope.bluetooth"] ?? false
		if (!bluetoothEnable) {
			try {
				await wx.authorize({
					scope: 'scope.bluetooth',
				})
			} catch (e) {
				wx.showModal({
				  title: '需要蓝牙权限',
				  content: '需要您授权蓝牙权限，否则无法连接您的设备。请前往设置页面开启权限。',
				  confirmText: '去设置',
				  cancelText: '暂不开启',
				  success(res) {
				    if (res.confirm) {
				      // 跳转小程序设置页
				      wx.openSetting({
				        success(settingRes) {
				          if (settingRes.authSetting['scope.bluetooth']) {
							  BlePeripheralManager.initial()
				          }
				        }
				      });
				    }
				  }
				});
			}
			return false
		} 
		
		// 特地添加此代码块用来判断蓝牙是否可用，原因如下：
		// await wx.openBluetoothAdapter({mode: 'peripheral'})
		// 这个代码在iOS上(iPhone 14 Pro, iOS18.4.1)，即使把手机蓝牙关闭也会返回成功
		try {
			try {
				await wx.openBluetoothAdapter()
				DataPacker.onReceiveData = PeripheralReceiver.onReceiveData
			} catch (e) {
				let msg = ''
				switch (e.errCode) {
					case 10001:
						msg = '请先开启蓝牙'
						break
					case 10000:
						msg = '请授权使用蓝牙'
						break
					default:
						msg = '蓝牙初始化失败'
						break
				}
				uni.showModal({
					title: '提示',
					content: msg,
					showCancel: false,
					confirmColor: '#181818'
				})
				return false
			}
			await wx.closeBluetoothAdapter()
		} catch (_) {
			uni.showModal({
				title: '提示',
				content: '蓝牙初始化失败',
				showCancel: false,
				confirmColor: '#181818'
			})
			return false
		}
		
		try {
			await wx.openBluetoothAdapter({
				mode: 'peripheral'
			})
			return true
		} catch (err) {
			console.log('open error', err)
			uni.showModal({
				title: '提示',
				content: '蓝牙初始化失败',
				showCancel: false,
				confirmText: '好的',
				confirmColor: '#181818'
			})
			return false
		}
	}
	
	/// 销毁
	static async dispose() {
		DataPacker.onReceiveData = null
		this.stopServer()
		await wx.closeBluetoothAdapter()
	}
	
	/// 开启外设服务
	static async startServer() :Promise<boolean> {
		try {
			const result = await wx.createBLEPeripheralServer()
			this.server = result.server
			
			let notifyCharacteristic = {
				uuid: BleConst.kNotiyCharacteristicUuid,
				properties: {
					notify: true,
					read: true,
				},
				permission: {
					read: true,
					readable: true,
					write: true,
					writeable: true
				},
				value: new Uint8Array([0x02]).buffer
			}
			const deviceInfo = wx.getDeviceInfo()
			if (deviceInfo.platform === 'android') {
				notifyCharacteristic['descriptors'] = [
					/**
					 * 虽然在 properties 里写了 notify: true，但是微信小程序 peripheral server 在某些情况下 
					 * 不会自动给这个特征生成 Client Characteristic Configuration Descriptor (CCCD, UUID 0x2902)，
					 * 所以中央设备（你的另一个小程序 / 手机）订阅时就报了：notifyBLECharacteristicValueChange:fail:no descriptor
					 * 说明：
					 * 1、0x2902 描述符是必须的：
					 * 		这是 BLE 协议规定的，客户端要写这个 descriptor 才能打开/关闭通知。
					 * 		没有它，wx.notifyBLECharacteristicValueChange 就会报 no descriptor
					 * 2、初始值 [0x00, 0x00]
					 * 		表示通知关闭；
					 * 		当客户端订阅时，微信小程序会自动写成 [0x01, 0x00]（打开 notify）。
					 * 3、properties.notify: true 和 descriptor 配合使用
					 * 		光有 notify: true 还不够，必须加上 0x2902 描述符。
					 */
					{
					    uuid: "00002902-0000-1000-8000-00805f9b34fb", // CCCD
					    permission: {
							read: true,
							readable: true,
							write: true,
							writeable: true
					    },
					    value: new Uint8Array([0x00, 0x00]).buffer // 初始关闭 notify
					}
				]
			}
			
			// 添加服务和特征
			// iOS端适配，characteristics下的value必须设置值，否则无法正常添加服务和特征，会
			// 出现：{errno: 1509000, errMsg: "addBLEPeripheralService:ok"} 的错误
			this.server.addService({
				service: {
					uuid: BleConst.kServiceUuid,
					characteristics: [
						{
							uuid: BleConst.kWriteCharacteristicUuid,
							properties: {
								writeNoResponse: true,
							},
							permission: {
								read: true,
								readable: true,
								write: true,
								writeable: true
							},
							value: new Uint8Array([0x01]).buffer
						},
						notifyCharacteristic,
					]
				},
				success: (res) => {
					console.log('addService success', res)
					// 设置连接状态回调
					// iOS系统接口限制，从机模式没有连接状态变化相关的系统回调，
					// onBLEPeripheralConnectionStateChanged仅安卓支持
					wx.onBLEPeripheralConnectionStateChanged((listener) => {
						console.log('peripheral connection state change', listener)
						if (res.connected) {
							console.log('>>> 设备连接')
						} else {
							console.log('>>> 连接断开')
						}
						
						if (listener.connected) {
							this.stopAdvertising()
						} else {
							this.startAdvertising()
						}
					})
					
					this.server.onCharacteristicSubscribed((res) => {
						console.log(`>>> characteristic subscribed `, res)
					})
					
					this.server.onCharacteristicUnsubscribed((res) => {
						console.log(`>>> characteristic unsubscribed `, res)
					})
					
					this.server.onCharacteristicWriteRequest((res) => {
						console.log(`>>> on characteristic write `, res)
						DataPacker.unpackData(new Uint8Array(res.value))
					})
				},
				fail: (res) => {
					console.error('addService fail', res)
					this.dispose()
					uni.showModal({
						title: '发生错误',
						content: '初始化失败,请退出重试',
						showCancel: false,
						cancelColor: '#181818'
					})
				}
			})
			
			// 必须延迟比较久再开始广播
			// 否则在iOS上this.server.startAdvertising有时会没有回调
			setTimeout(() => {
				this.startAdvertising()
			}, 3000)
			return true
		} catch (e) {
			console.error('start error', e)
			return false
		}
	}
	
	/// 关闭外设服务
	static stopServer() {
		this.mtu = 20
		
		wx.offBLEPeripheralConnectionStateChanged()
		
		this.stopAdvertising()
		
		if (this.server == null) return
		
		this.server.offCharacteristicSubscribed()
		this.server.offCharacteristicUnsubscribed()
		this.server.offCharacteristicWriteRequest()
		this.server.close({
			success: (res) => {
				console.debug('stop server success', res)
			},
			fail: (res) => {
				console.error('stop server fail', res)
			},
			complete: () => {
				this.server = null
			}
		})
	}
	
	/// 开始广播
	static startAdvertising() {
		if (this.server == null) return
		
		const deviceName = `${BleConst.kDeviceNamePrefix}${this.room}`
		console.log(`开始广播：${deviceName}`)
		this.server.startAdvertising({
			advertiseRequest: {
				connectable: true,
				deviceName: deviceName
			},
			powerLevel: 'medium',
			success: (res) => {
				console.log('startAdvertising success', res)
			},
			fail: (res) => {
				console.log('startAdvertising fail', res)
			}
		})
	}
	
	/// 停止广播
	static stopAdvertising() {
		this.server?.stopAdvertising({
			success: (res) => {
				console.log('stopAdvertising success', res)
			},
			fail: (res) => {
				console.error('stopAdvertising fail', res)
			}
		})
	}
	
	/// 向中心设备发送数据
	static async sendData(cmd :number, data :Uint8Array|null) {
		if (this.server == null) return
		
		const packets = DataPacker.packData(cmd, new Uint8Array(data) , this.mtu)
		
		for (let p of packets) {
			this.server.writeCharacteristicValue({
				serviceId: BleConst.kServiceUuid,
				characteristicId: BleConst.kNotiyCharacteristicUuid,
				value: p.buffer,
				needNotify: true,
				success: (res) => {
					console.log(`>>> write success`, res)
				},
				fail: (res) => {
					console.error(`>>> write fail`, res)
				}	
			})
			await delay(10)
		}
	}
}