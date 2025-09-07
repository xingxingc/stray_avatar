import { Cmd } from "../cmd"
import { BleCentralManager } from "./ble_central_manager"

/// 中心设备数据发送器
export class CentralSender {
	/// 发送mtu大小
	static async sendMtu(mtu :number) {
		let data = []
		data.push(mtu >> 8 & 0xFF)
		data.push(mtu & 0xFF)
		await BleCentralManager.sendData(Cmd.setMtu, new Uint8Array(data))
	}
	
	/// 测试数据
	static async test(data :Uint8Array) {
		await BleCentralManager.sendData(Cmd.test, data)
	}
	
	/// 发送创建房间命令
	static async sendCreateDrawboard() {
		await BleCentralManager.sendData(Cmd.createDrawboard, new Uint8Array())
	}
	
	/// 向对方推送绘制状态
	static async sendDrawState(isDrawing :boolean) {
		await BleCentralManager.sendData(Cmd.postDrawState, new Uint8Array([isDrawing ? 1 : 0]))
	}
	
	/// 推送画板数据
	static async postLayerData(data :Uint8Array) {
		await BleCentralManager.sendData(Cmd.postLayerData, data);
	}
}