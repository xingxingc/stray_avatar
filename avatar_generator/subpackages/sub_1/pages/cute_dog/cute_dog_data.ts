import { AppModel } from "../../../../model/app_model"
import { delay, showTextToast } from "../../../../util/util"

export class CuteDogData {
	static readonly imageDir = `${wx.env.USER_DATA_PATH}/cute_dog/`
	static readonly imagePathPrefix = `${this.imageDir}/cute_dog/`
	
	/// 柴犬图片数据是否存在
	static ifImagesExist :Boolean = false
	
	/// 身体
	static readonly body_data = { name: '身躯', prefix: 'body_', list: [
		{name: '灰毛', index: 0},
		{name: '棕毛', index: 1},
		{name: '橘毛', index: 2},
		{name: '砖石', index: 3},
		{name: '西方龙', index: 4},
		{name: '小金狗', index: 5},
		{name: '灰点', index: 6},
		{name: '褐点', index: 7},
		{name: '橘点', index: 8},
		{name: '奶绿', index: 9},
		{name: '琉璃', index: 10},
		{name: '暗影', index: 11},
	]}
	/// 眼睛
	static readonly eyes_data = { name: '眼睛', prefix: 'eyes_',  list: [
		{name: '圆点', index: 0},
		{name: '微笑', index: 1},
		{name: '冷漠', index: 2},
		{name: '闭眼', index: 3},
		{name: '眼镜1', index: 4},
		{name: '眼镜2', index: 5},
		{name: '眼镜3', index: 6},
		{name: '镭射眼', index: 7},
		{name: '空洞', index: 8},
		{name: '眼镜4', index: 9},
		{name: '眯眼', index: 10},
		{name: '眼镜5', index: 11},
		{name: '哀伤', index: 12},
		{name: '眼镜6', index: 13},
		{name: '白眼', index: 14},
	]}
	/// 首饰
	static readonly glove_data = { name: '爪饰', prefix: 'glove_', list: [
		{name: '无', index: 0},
		{name: '金戒', index: 1},
		{name: '钻戒', index: 2},
		{name: '银戒', index: 3},
		{name: '运动表', index: 4},
		{name: '金表', index: 5},
		{name: '金镯子', index: 6},
		{name: '银镯子', index: 7},
		{name: '灭霸手套', index: 8},
		{name: '棕色手套', index: 9},
		{name: '机械手', index: 10},
		{name: '皮手套', index: 11},
		{name: '蓝手套', index: 12},
	]}
	/// 帽子
	static readonly hat_data = { name: '头饰', prefix: 'hat_', list: [
		{name: '无', index: 0},
		{name: '蓝色贝壳', index: 1},
		{name: '棕色贝雷', index: 2},
		{name: '深棕迷你', index: 3},
		{name: '蓝色棒球', index: 4},
		{name: '紫色巫师', index: 5},
		{name: '深棕立圆', index: 6},
		{name: '复古礼帽', index: 7},
		{name: '绿色帽子', index: 8},
		{name: '浅棕宽檐', index: 9},
		{name: '粉色兔耳', index: 10},
		{name: '海军', index: 11},
		{name: '牛仔', index: 12},
		{name: '皇冠', index: 13},
		{name: '绿蜻蜓', index: 14},
		{name: '护士帽', index: 15},
		{name: '小老虎', index: 16},
	]}
	/// 嘴巴
	static readonly mouth_data = { name: '嘴巴', prefix: 'mouth_', list: [
		{name: '平淡褐', index: 0},
		{name: '吐舌', index: 1},
		{name: '微笑', index: 2},
		{name: '烟斗', index: 3},
		{name: '虎牙', index: 4},
		{name: '泡泡', index: 5},
		{name: '叼棍', index: 6},
		{name: '披萨', index: 7},
		{name: '口罩', index: 8},
		{name: '香蕉', index: 9},
		{name: '红包', index: 10},
		{name: '平淡黑', index: 11},
	]}
	/// 服饰
	static readonly shirt_data = { name: '服饰', prefix: 'shirt_', list: [
		{name: '无', index: 0},
		{name: '大金链', index: 1},
		{name: '霸犬环', index: 2},
		{name: '灰色衣', index: 3},
		{name: '橘色围脖', index: 4},
		{name: '绿T', index: 5},
		{name: '蓝条纹', index: 6},
		{name: '棕色衣', index: 7},
		{name: '棕色卫衣', index: 8},
		{name: '礼服', index: 9},
		{name: '休闲蓝', index: 10},
		{name: '休闲绿', index: 11},
		{name: '砖石链', index: 12},
		{name: '墨绿衣', index: 13},
		{name: '服务员', index: 14},
		{name: '中式喜庆', index: 15},
	]}
	/// 爪子
	static readonly hand_data = { name: '爪子', prefix: 'hand_', list: [
		{name: '爪子', index: 0},
	]}
	/// 卡片
	static readonly card_data = { name: '卡片', prefix: 'card_', list: [
		{name: '白色', index: 0},
		{name: '旧纸张', index: 1},
		{name: '金色', index: 2},
		{name: '不显示', index: 3},
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
	
	/// 检查柴犬图片数据是否存在
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
				url: AppModel.cuteDogImagesUrl,
				success: async res => {
					const path = res.tempFilePath
					console.log(`>>> cute_dog zip: ${path}`)
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