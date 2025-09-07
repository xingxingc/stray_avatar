/// 单包数据格式：
/// 包类型：1byte 首包:0b100|中间包:0b010|尾包:0b001
/// 整个数据包的长度：2bytes
/// cmd命令：1byte
/// 内容：x bytes
/// checksum：1byte

/// 接收完整包回调
export type OnReceivedDataCallback = (cmd :number, data :Uint8Array) => void

export class DataPacker {
	/// 接收缓存
	private static _receiveSegment = new Array<number>()
	
	/// 包类型
	static readonly packTypeFirstOnly = 1 << 2 // 首包标识
	static readonly packTypeMid = 1 << 1 // 中间包标识
	static readonly packTypeLastOnly = 1 // 尾包标识
	static readonly packTypeFirstAndLast = (this.packTypeFirstOnly | this.packTypeLastOnly) //既是首包也是尾包
	
	/// 整包数据回调
	private static _onReceiveData :OnReceivedDataCallback|null
	static get onReceiveData() {
		return this._onReceiveData
	}
	static set onReceiveData(value) {
		if (value != null && this._onReceiveData != null) {
			this._onReceiveData = null
		}
		this._onReceiveData = value
	}
	
	/// 封装包
	static packData(cmd :number, data :Uint8Array, mtu :number) :Uint8Array[] {
		let packs :Uint8Array[] = []
		
		const singleSize = this._singlePackContentSize(mtu)
		const nPack = (data.length != 0 && data.length % singleSize == 0) ? Math.floor(data.length / singleSize) : Math.floor(data.length / singleSize) + 1
		
		for (let i = 0; i < nPack; i++) {
			let start = i * singleSize
			let end = start + singleSize
			if (end > data.length) {
				end = data.length
			}
			let pack = this._genSinglePacket(cmd, data.slice(start, end), i, nPack)
			packs.push(pack);
		}
		
		return packs
	}
	
	/// 解包
	static unpackData(data :Uint8Array) {
		const type = data[0]
		const length = (data[1] << 8 | data[2]) - 5
		const cmd = data[3]
		const content = data.slice(4, 4+length)
		
		if (type == this.packTypeFirstOnly || type == this.packTypeFirstAndLast) {
			this._receiveSegment = new Array<number>()
		}
		
		if (content.length != 0) {
			this._receiveSegment.push(...content)
		}
		
		if (type == this.packTypeLastOnly || type == this.packTypeFirstAndLast) {
			console.log(`收到完整的数据包(cmd:${cmd})`, this._receiveSegment)
			if (this.onReceiveData != null) {
				this.onReceiveData(cmd, new Uint8Array(this._receiveSegment))
			}
		}
	}
	
	/// 单包能够容纳的最大的内容的数据量大小
	private static _singlePackContentSize(mtu :number) :number {
		return mtu - 5
	}
	
	/// 封装单个数据包（每一次发送的数据）
	private static _genSinglePacket(cmd: number, data :Uint8Array, index :number, total :number) :Uint8Array {
		let result = []
		
		let type = 0
		if (index == 0) {
			type |= this.packTypeFirstOnly
		}
		if (index == total - 1) {
			type |= this.packTypeLastOnly
		} else if (index != 0) {
			type |= this.packTypeMid
		}
		result.push(type)
		
		let length = data.length + 5
		result.push((length >> 8) & 0xFF)
		result.push(length & 0xFF)

		result = [...result, cmd, ...data]
		
		let checksum = 0
		for (let s of result) {
			checksum += s
		}
		checksum = checksum & 0xFF
		
		result.push(checksum)
		
		return new Uint8Array(result)
	}
}