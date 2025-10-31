import { AppModel } from "../../../../model/app_model"
import { delay, showTextToast } from "../../../../util/util"

export class DrawPuppyData {
	static readonly imageDir = `${wx.env.USER_DATA_PATH}/draw_puppy/`
	static readonly imagePathPrefix = `${this.imageDir}/draw_puppy/`
	
	/// 柴犬图片数据是否存在
	static ifImagesExist :Boolean = false
	
	/// 脸型
	static readonly face_data = { name: '脸型', prefix: 'face_', list: [
		{name: '方墩墩', index: 1},
		{name: '圆滚滚', index: 2},
		{name: '毛尖尖', index: 3},
		{name: '肉乎乎', index: 4},
		{name: '卷蓬蓬', index: 5},
	]}
	/// 眼睛
	static readonly eyes_data = { name: '眼睛', prefix: 'eyes_',  list: [
		{name: '旋旋', index: 1},
		{name: '潮酷镜', index: 2},
		{name: '豆豆', index: 3},
		{name: '懒懒', index: 4},
		{name: '月牙', index: 5},
		{name: '小揪', index: 6},
		{name: '梦梦', index: 7},
		{name: '圆圆', index: 8},
		{name: '倔倔', index: 9},
		{name: '可爱', index: 10},
		{name: '叉叉', index: 11},
		{name: '点点', index: 12},
		{name: '黑框镜', index: 13},
		{name: '半框镜', index: 14},
		{name: '绿潮镜', index: 15},
		{name: '小绿镜', index: 16},
		{name: '弯弯', index: 17},
		{name: '豆豆鼻', index: 18},
		{name: '绒绒', index: 19},
		{name: '单双异', index: 20},
		{name: '旋旋', index: 21},
		{name: '点点', index: 22},
		{name: '萌萌', index: 23},
		{name: '拱拱', index: 24},
	]}
	/// 鼻子
	static readonly nose_data = { name: '鼻子', prefix: 'nose_', list: [
		{name: '心型', index: 1},
		{name: '小T', index: 2},
		{name: '心勾', index: 3},
		{name: '椭圆', index: 4},
		{name: '微笑', index: 5},
		{name: '小土', index: 6},
		{name: '蝴蝶', index: 7},
		{name: 'J型', index: 8},
		{name: '红嘟', index: 9},
	]}
	/// 耳朵
	static readonly ears_data = { name: '耳朵', prefix: 'ears_', list: [
		{name: '杏仁', index: 1},
		{name: '卷卷', index: 2},
		{name: '三角', index: 3},
		{name: '水滴', index: 4},
		{name: '长筒', index: 5},
		{name: '弯弯', index: 6},
		{name: '炸开', index: 7},
		{name: '椭圆', index: 8},
		{name: '毛茸', index: 9},
		{name: '折角', index: 10},
		{name: '扭扭', index: 11},
		{name: '长尖', index: 12},
		{name: '带纹', index: 13},
		{name: '杏仁2', index: 14},
		{name: '圆圆', index: 15},
		{name: '锯齿', index: 16},
		{name: 'D型', index: 17},
	]}
	/// 胡子
	static readonly mouth_data = { name: '胡子', prefix: 'mouth_', list: [
		{name: '炸开', index: 1},
		{name: '锯齿', index: 2},
		{name: '椭圆', index: 3},
		{name: '弯月', index: 4},
		{name: '多边', index: 5},
		{name: '爱心', index: 6},
		{name: '小麻点', index: 7},
		{name: '毛边', index: 8},
		{name: '斑点', index: 9},
		{name: '大V胡', index: 10},
	]}
	/// 帽子
	static readonly hat_data = { name: '帽子', prefix: 'hat_', list: [
		{name: '无', index: 0},
		{name: '紫星水滴', index: 1},
		{name: '荧光椭圆', index: 2},
		{name: '复古牛仔', index: 3},
		{name: '红帽黄流苏', index: 4},
		{name: '厨师高', index: 5},
		{name: '粉边棕', index: 6},
		{name: '黑帽红带', index: 7},
		{name: '粉钻皇冠', index: 8},
		{name: '黄棒球', index: 9},
		{name: '金钻皇冠', index: 10},
		{name: '彩条装饰', index: 11},
		{name: '蓝黑造型', index: 12},
		{name: '民族风', index: 13},
		{name: '绿色创意', index: 14},
		{name: '粉黑蝴蝶结', index: 15},
		{name: '棕黄纹理', index: 16},
		{name: '黄红火焰', index: 17},
		{name: '粉红小花', index: 18},
		{name: '橙黄小花', index: 19},
		{name: '紫黄小花', index: 20},
		{name: '珍珠簇', index: 21},
		{name: '空白', index: 22},
		{name: '花簇', index: 23},
		{name: '黄纹水滴', index: 24},
		{name: '红桃', index: 25},
		{name: '绿藤红坠', index: 26},
	]}
	/// 纹理
	static readonly skin_data = { name: '纹理', prefix: 'skin_', list: [
		{name: '棕斑', index: 1},
		{name: '绿心紫底', index: 2},
		{name: '代码风', index: 3},
		{name: '粉橙斑马', index: 4},
		{name: '纯粉', index: 5},
		{name: '纯橙', index: 6},
		{name: '粉底龟背叶', index: 7},
		{name: '紫底橙星', index: 8},
		{name: '纯黄', index: 9},
		{name: '黄底龟背叶1', index: 10},
		{name: '黄底龟背叶2', index: 11},
		{name: '黑墨点', index: 12},
		{name: '棕点米底', index: 13},
		{name: '棕底编织', index: 14},
		{name: '红心形米底', index: 15},
		{name: '粉曲线紫底', index: 16},
		{name: '彩虹渐变', index: 17},
		{name: '纯棕1', index: 18},
		{name: '纯棕2', index: 19},
		{name: '橙底模糊', index: 20},
		{name: '棕褐异形', index: 21},
		{name: '棕底圆斑', index: 22},
		{name: '粉星满铺', index: 23},
		{name: '粉底闪电', index: 24},
		{name: '红蓝斜纹', index: 25},
		{name: '黄褐云状', index: 26},
		{name: '紫橙渐变', index: 27},
	]}
	/// 随机背景色基数
	static readonly randomBgColorSeeds = [
		{ r: 160, g: 222, b: 254, a: 1 },
		{ r: 130, g: 130, b: 130, a: 1 },
		{ r: 177, g: 222, b: 164, a: 1 },
		{ r: 183, g: 139, b: 204, a: 1 },
		{ r: 212, g: 118, b: 102, a: 1 },
		{ r: 254, g: 219, b: 130, a: 1 },
	]
	
	/// 检查小狗涂鸦图片数据是否存在
	/// 不存在则去下载
	static checkImagesData() :Promise<boolean> {
		return new Promise(async resolve => {
			const fs = wx.getFileSystemManager()
			let isExist = false
			try {
			  fs.accessSync(this.imageDir) // 同步判断
			  isExist = true
			} catch (e) {
			  console.error('文件夹不存在', e)
			}
			if (isExist) {
				this.ifImagesExist = true
				resolve(true)
				return
			}
			resolve(await this.downloadImagesData())
		})
	}
	
	/// 判断是否能够生成图片，否的话弹窗提示
	static shouldGenImage() :Boolean {
		if (!this.ifImagesExist) {
			uni.showModal({
				title: '提示',
				content: '资源处理错误，请先退出页面再重试～',
				showCancel: false,
				confirmColor: '#181818'
			})
		}
		return this.ifImagesExist
	}
	
	/// 下载图片资源
	private static downloadImagesData() :Promise<boolean> {
		return new Promise((resolve) => {
			uni.showLoading({title: '生成中'})
			uni.downloadFile({
				url: AppModel.drawPuppyBaseUrl,
				success: async res => {
					const path = res.tempFilePath
					console.log(`>>> draw_puppy zip: ${path}`)
					await this.handleDownloadFile(path)
					this.ifImagesExist = true
					resolve(true)
				},
				fail: async err => {
					console.error('下载图片失败', err)
					await delay(200)
					showTextToast('资源加载失败', 'error')
					resolve(false)
				},
				complete: async _ => {
					uni.hideLoading()
				}
			})
		})
	}
	
	/// 处理下载的zip文件
	private static handleDownloadFile(path :string) :Promise<void> {
		const fs = wx.getFileSystemManager()
		// 确保目标文件夹存在
		try {
			fs.accessSync(this.imageDir)
		} catch (e) {
			fs.mkdirSync(this.imageDir, true)
		}
		// 解压文件
		return new Promise((resolve, reject) => {
			fs.unzip({
				zipFilePath: path,
				targetPath: this.imageDir,
				success: _ => {
					console.log('cute_dog资源处理成功')
					resolve()
				},
				fail: err => {
					console.error('cute_dog资源处理失败', err)
					reject(err)
				}
			})
		})
	}
}