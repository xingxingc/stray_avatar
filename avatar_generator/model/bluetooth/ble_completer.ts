/// 用于蓝牙命令发送-接收的事件处理
export class BleCompleter {
	private static manualPromise :ManualPromise|null
	
	/// 执行单条蓝牙命令的入口
	/// params:
	///  - [invocation] 蓝牙命令执行体, 只允许执行单个ble命令
	///  - [timeoutMs] 超时时长(ms)
	///  - [retryTime] 失败时的重试次数
	static async run(invocation :VoidFunction, timeoutMs :number = 5000, retryTime :number = 0) :Promise<BleCompleterResult> {
		if (this.manualPromise != null) return
		
		this.manualPromise = new ManualPromise()
		
		let result :BleCompleterResult|null
		
		try {
			invocation()
			result = await Promise.race([
				timeout(timeoutMs),
				this.manualPromise.future()
			])
		} catch (error) {
			result = new BleCompleterResult(false, null, error)
		}
		
		this.end()
		
		if (!result.isSuccess && retryTime > 0) {
			return this.run(invocation, timeoutMs, retryTime-1)
		}
		
		return result
	}
	
	static finish(isSuccess :Boolean, content :Uint8Array|null, error: Error|null) {
		if (this.manualPromise == null) return
		
		this.manualPromise.complete(new BleCompleterResult(isSuccess, content, error));
		
		this.end()
	}
	
	private static end() {
		this.manualPromise = null
	}
}

/// Ble命令执行结果
export class BleCompleterResult {
  isSuccess :Boolean
  content :Uint8Array|null
  error: Error|null
  constructor(isSuccess: Boolean, content: Uint8Array|null, error: Error|null) {
	  this.isSuccess = isSuccess
	  this.content = content
	  this.error = error
  }
}

/// 超时函数
function timeout(ms :number) :Promise<BleCompleterResult> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new BleCompleterResult(false, null, new Error('timeout'))), ms)
  })
}

/// completer实现
class ManualPromise {
	private _resolve: (value: BleCompleterResult) => void
	private _reject: (reason?: BleCompleterResult) => void
	_promise: Promise<BleCompleterResult>
	constructor() {
		this._promise = new Promise((resolve, reject) => {
			this._resolve = resolve
			this._reject = reject
		})
	}
 
	complete(value: BleCompleterResult) {
		this._resolve(value)
	}
 
	completeError(error: any) {
		this._reject(error)
	}
 
	future() :Promise<BleCompleterResult> {
		return this._promise
	}
}