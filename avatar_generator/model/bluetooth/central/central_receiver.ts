import { EventBus, EventDrawEnterRoom } from "../../event_bus";
import { Cmd } from "../cmd";
import { GetDrawboardConfigCallback, GetNewLayerDataCallback, GetRemoteDrawStateCallback } from "../common";

/// 中心设备数据接收器
export class CentralReceiver {
	static getLayerDataCallback :GetNewLayerDataCallback|null
	static getRemoteDrawStateCallback :GetRemoteDrawStateCallback|null
	static getDrawboardConfigCallback :GetDrawboardConfigCallback|null
	
	/// 处理来自设备端的数据包
	static onReceiceData(cmd :number, data :Uint8Array) {
		switch (cmd) {
			case Cmd.test:
				CentralReceiver.onTestData(data)
				break
			case Cmd.createDrawboardConfirm:
				CentralReceiver.onCreateDrawboardConfirm(data)
				break
			case Cmd.postDrawState:
				CentralReceiver.onPostDrawState(data)
				break
			case Cmd.postLayerData:
				CentralReceiver.onPostLayerData(data)
				break
			case Cmd.drawboardConfig:
				CentralReceiver.onReceiveConfig(data)
				break
			default:
				break
		}
	}

	/// 测试数据
	private static onTestData(data) {
		console.log(`>> 测试数据: ${data}`)
	}
	
	/// 接收到画板创建确认命令
	private static onCreateDrawboardConfirm(data) {
		console.log(`>> 确认创建画板: ${data}`)
		uni.navigateTo({
			url: '/pages/draw/drawboard/double/room?type=central',
		})
		EventBus.emit(EventDrawEnterRoom)
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
	
	/// 处理接收画板配置
	private static onReceiveConfig(data) {		
		if (data.length != 7) return
		
		let result = {
			gridSize: data[0],
			bgColor: {
				r: data[1],
				g: data[2],
				b: data[3],
			},
			lineColor: {
				r: data[4],
				g: data[5],
				b: data[6],
			}
		}
		if (this.getDrawboardConfigCallback != null) {
			this.getDrawboardConfigCallback(result)
		}
	}
}