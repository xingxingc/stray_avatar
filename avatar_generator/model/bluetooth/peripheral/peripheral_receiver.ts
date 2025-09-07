import { EventBus, EventDrawEnterRoom } from "../../event_bus";
import { Cmd } from "../cmd";
import { GetNewLayerDataCallback, GetRemoteDrawStateCallback } from "../common";
import { BlePeripheralManager } from "./ble_peripheral_manager";
import { PeripheralSender } from "./peripheral_sender";

/// 外围设备数据接收器
export class PeripheralReceiver {
	static getLayerDataCallback :GetNewLayerDataCallback|null
	static getRemoteDrawStateCallback :GetRemoteDrawStateCallback|null
	
	/// 处理来自中心端的数据包
	static onReceiveData(cmd :number, data :Uint8Array) {
		console.log(`###数据包: \n${cmd},\n${data}`)
		
		switch(cmd) {
			case Cmd.setMtu:
				PeripheralReceiver.onSetMtu(data)
				break
			case Cmd.test:
				PeripheralReceiver.onTestData(data)
				break
			case Cmd.createDrawboard:
				PeripheralReceiver.onCreateDrawboard(data)
				break
			case Cmd.postDrawState:
				PeripheralReceiver.onPostDrawState(data)
				break
			case Cmd.postLayerData:
				PeripheralReceiver.onPostLayerData(data)
				break
		}
	}
	
	/// 设置mtu
	private static onSetMtu(data :Uint8Array) {
		if (data.length != 2) return
		const mtu = data[0] << 8 | data[1]
		BlePeripheralManager.mtu = mtu
		console.log(`>>> 设置mtu: ${mtu}`)
	}
	
	/// 测试数据
	private static onTestData(data) {
		console.log(`>> 测试数据: ${data}`)
	}
	
	/// 创建画布
	private static onCreateDrawboard(data) {
		BlePeripheralManager.bindDrawboard = true
		uni.hideLoading()
		
		BlePeripheralManager.stopAdvertising()
		
		uni.navigateTo({
			url: '/pages/draw/drawboard/double/room?type=peripheral'
		})
		
		// 发送确认创建画板
		PeripheralSender.sendCreateDrawboardConfirm()
		
		EventBus.emit(EventDrawEnterRoom)
		
		setTimeout(() => {
			// 发送画板配置
			PeripheralSender.sendDrawboardConfig()
		}, 200)
	}
	
	/// 处理对方推送过来的绘制状态
	private static onPostDrawState(data) {
		if (this.getRemoteDrawStateCallback != null) {
			this.getRemoteDrawStateCallback(data[0] == 1)
		}
	}
	
	/// 处理对方推送的画板数据
	private static onPostLayerData(data) {
		if (this.getLayerDataCallback != null) {
			this.getLayerDataCallback(data)
		}
	}
}