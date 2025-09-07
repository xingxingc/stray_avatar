import { delay } from "../../../util/util";
import { BleConst } from "../common";
import { DataPacker } from "../data_packer";
import { CentralReceiver } from "./central_receiver";
import { CentralSender } from "./central_sender";

/// 连接设备成功回调
export type ConnectedDeviceCallback = () => void

export class BleCentralManager {
	static deviceMap = new Map<string, BlueToothDevice>();
	
	private static deviceId :string|null
	private static serviceUuid :string|null
	private static writeUuid :string|null
	private static notifyUuid :string|null
	
	private static _mtu :number = 20
	static set mtu(value) {
		this._mtu = value
		if (this.notifyUuid) {
			// 发送mtu值
			CentralSender.sendMtu(value)
		}
	}
	static get mtu() {
		return this._mtu
	}
	
	static room :string = ''
	
	static connectedCallabck :ConnectedDeviceCallback|null
	
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
							BleCentralManager.initial()
				          }
				        }
				      });
				    }
				  }
				});
			}
			return false
		}
		
		try {
			await wx.openBluetoothAdapter({
				mode: 'central'
			})
			DataPacker.onReceiveData = CentralReceiver.onReceiceData
			return true
		} catch (err) {
			let msg = ''
			switch (err.errCode) {
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
	}
	
	/// 销毁
	static async dispose() {
		DataPacker.onReceiveData = null
		
		await this.disconnect()
		
		await this.stopScan()
		await wx.closeBluetoothAdapter()
	}
	
	/// 是否处于扫描中
	static async isScanning() :Promise<boolean> {
		const res = await wx.getBluetoothAdapterState()
		console.debug('isScanning', res)
		return res.discovering
	}
	
	/// 开始扫描
	static async startScan(powerLevel :string = 'high') {
		const isScanning = await this.isScanning()
		if (isScanning) return
		
		try {
			await wx.startBluetoothDevicesDiscovery({
				allowDuplicatesKey: true,
				powerLevel: powerLevel
			})
		} catch (e) {
			console.error('startScan error', e)
		}
	}
	
	/// 结束扫描
	static async stopScan() {
		this.deviceMap.clear()
		try {
			const isScanning = await BleCentralManager.isScanning()
			if (isScanning) {
				await wx.stopBluetoothDevicesDiscovery()
				wx.offBluetoothDeviceFound()
			}
			console.debug('stopScan success')
		} catch (e) {
			console.error('stopScan error', e)
		}
	}
	
	/// 重新扫描
	static async reScan(powerLevel :string = 'high') {
		const isScanning = await this.isScanning()
		if (isScanning) {
			await this.stopScan()
		}
		
		wx.onBluetoothDeviceFound((res) => {
			for (let d of res.devices) {
				this.deviceMap.set(d.deviceId, d)
			}
			this.onScannedDevice(this.deviceMap)
		})
		
		await this.startScan(powerLevel)
	}
	
	/// 处理扫描
	static async onScannedDevice(map) {
		let targetName = `${BleConst.kDeviceNamePrefix}${this.room}`
		for (const [key, device] of map.entries()) {
		  if (device.localName === targetName) {
			  this.onFoundDrawRoomDevice(device)
			  break
		  }
		}
	}
	
	/// 找到画板设备
	static async onFoundDrawRoomDevice(device) {
		uni.hideLoading()
		
		BleCentralManager.stopScan()
		
		const deviceId = device.deviceId
		const serviceId = BleConst.kServiceUuid
		const writeCharacteristicId = BleConst.kWriteCharacteristicUuid
		const notifyCharacteristicId = BleConst.kNotiyCharacteristicUuid
		
		uni.showLoading({
			title: '连接设备...'
		})
		const isSuccess = await BleCentralManager.connectDevice(
			deviceId, 
			serviceId, 
			writeCharacteristicId, 
			notifyCharacteristicId
		)
		uni.hideLoading()
		if (!isSuccess) {
			uni.showModal({
				title: '连接失败',
				showCancel: false
			})
			return
		}
		
		setTimeout(() => {
			CentralSender.sendCreateDrawboard()
			if (this.connectedCallabck != null) {
				this.connectedCallabck()
			}
		}, 300)
	}
	
	/// 连接设备
	static async connectDevice(
		deviceId :string, 
		serviceUuid :string, 
		writeUuid :string, 
		notifyUuid :string, 
		timeout :number = 10*1000
	) :Promise<boolean> {
		try {
			const dId = deviceId.toUpperCase()
			const sId = serviceUuid.toUpperCase()
			const wId = writeUuid.toUpperCase()
			const nId = notifyUuid.toUpperCase()
			
			const result = await wx.createBLEConnection({
				deviceId: deviceId,
				timeout: timeout
			})
			console.log('connectDevice success',result)
			
			// iOS上需要先调用getBLEDeviceServices和getBLEDeviceCharacteristics
			// 否则直接调用notifyBLECharacteristicValueChange的方法会报错
			let serviceList = (await wx.getBLEDeviceServices({deviceId: deviceId})).services
			console.log('所有服务：')
			console.log(serviceList)
			for (let s of serviceList) {
				if (s.uuid.toUpperCase() == sId) {
					console.log('>> 找到service,', s)
					let cList = (await wx.getBLEDeviceCharacteristics({
						deviceId: dId,
						serviceId: s.uuid
					})).characteristics
					for(let c of cList) {
						if (c.uuid.toUpperCase() == nId) {
							console.log('>> 找到通知特征,', c)
							await wx.notifyBLECharacteristicValueChange({
								deviceId: deviceId,
								serviceId: s.uuid,
								characteristicId: c.uuid,
								state: true,
								type: 'notification'
							})
							break
						}
					}
					break
				}
			}
			
			this.deviceId = dId
			this.serviceUuid = sId
			this.writeUuid = wId
			this.notifyUuid = nId
			
			wx.onBLEMTUChange((res) => {
				this.mtu = res.mtu - 3
				console.log(`>>> mtu: ${res.mtu} - 3 = ${this.mtu}`)
			})
			
			wx.onBLEConnectionStateChange(async (res) => {
				console.log(`>>> device ${res.deviceId} state has changed, connected: ${res.connected}`)
				if (res.deviceId == this.deviceId && !res.connected) {
					await this.disconnect()
				}
			})
			
			wx.onBLECharacteristicValueChange((res) => {
				const v = new Uint8Array(res.value)
				// 解包
				DataPacker.unpackData(v)
			})
			
			return true
		} catch (e) {
			console.error('connectDevice fail', e)
			return false
		}
	}
	
	/// 断开当前连接的设备
	static async disconnect() {		
		if (this.deviceId != null) {
			try {
				await wx.closeBLEConnection({
					deviceId: this.deviceId
				})
			} catch (e) {
				console.error('断开连接报错', e)
			}
		}
		
		wx.offBLEMTUChange()
		wx.offBLEConnectionStateChange()
		wx.offBLECharacteristicValueChange()
		
		this.deviceId = null
		this.serviceUuid = null
		this.writeUuid = null
		this.notifyUuid = null
		
		this.connectedCallabck = null
		
		this.mtu = 20
	}
	
	/// 发送数据
	static async sendData(cmd :number, data :Uint8Array) :Promise<boolean> {
		if (this.deviceId == null || this.serviceUuid == null || this.writeUuid == null) return
		
		try {
			const packets = DataPacker.packData(cmd, data, this.mtu)
			for (let packet of packets) {
				await wx.writeBLECharacteristicValue({
				  deviceId: this.deviceId,
				  serviceId: this.serviceUuid,
				  characteristicId: this.writeUuid,
				  value: packet.buffer
				});
			}
			console.log('发送数据成功', packets)
		} catch (e) {
			console.error('发送数据报错', e)
			return false
		}
		return true
	}
}