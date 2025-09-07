import { AppModel } from "../../app_model";
import { Cmd } from "../cmd";
import { BlePeripheralManager } from "./ble_peripheral_manager";

/// 外围设备数据发送器
export class PeripheralSender {
	/// 发送测试数据
	static async test(data :Uint8Array) {
		await BlePeripheralManager.sendData(Cmd.test, data)
	}
	
	/// 确认建立画板
	static async sendCreateDrawboardConfirm() {
		await BlePeripheralManager.sendData(Cmd.createDrawboardConfirm, new Uint8Array());
	}
	
	/// 向对方推送绘制状态
	static async sendDrawState(isDrawing :boolean) {
		await BlePeripheralManager.sendData(Cmd.postDrawState, new Uint8Array([isDrawing ? 1 : 0]))
	}
	
	/// 推送画板数据
	static async postLayerData(data :Uint8Array) {
		await BlePeripheralManager.sendData(Cmd.postLayerData, data);
	}
	
	/// 发送画板配置
	static async sendDrawboardConfig() {
		const op = AppModel.genRoomOptions
		let data = [
			op?.gridSize ?? 12, 
			op?.bgColor?.r ?? 255, 
			op?.bgColor?.g ?? 255, 
			op?.bgColor?.b ?? 255, 
			op?.lineColor?.r ?? 188, 
			op?.lineColor?.g ?? 188, 
			op?.lineColor?.b ?? 188
		]
		await BlePeripheralManager.sendData(Cmd.drawboardConfig, new Uint8Array(data))
	}
}