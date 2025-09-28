import { AppModel } from "../model/app_model";

/// 保存图片到相册
export function checkPermissionAndSaveToPhotosAlbum(filePath) {
	wx.getSetting({
	    success: (res) => {
	      // 如果未授权
	      if (!res.authSetting['scope.writePhotosAlbum']) {
	        wx.authorize({
	          scope: 'scope.writePhotosAlbum',
	          success: () => {
	            doSaveImage(filePath); // 授权后保存
	          },
	          fail: () => {
	            // 引导用户手动开启权限
	            wx.showModal({
	              title: '提示',
	              content: '需要您授权保存图片到相册',
	              confirmText: '去设置',
	              success: (modalRes) => {
	                if (modalRes.confirm) {
	                  wx.openSetting(); // 打开设置页
	                }
	              }
	            });
	          }
	        });
	      } else {
	        // 已授权，直接保存
	        doSaveImage(filePath);
	      }
	    }
	});
}
function doSaveImage(filePath) {
    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success: () => {
        wx.showToast({ title: '保存成功', icon: 'success' });
      },
      fail: (err) => {
        console.error('保存失败', err);
        wx.showToast({ title: '保存失败', icon: 'none' });
      },
	  complete: (_) => {
		  try {
			const fs = wx.getFileSystemManager();
			fs.unlinkSync(filePath)
		  	console.debug(`删除png文件：${filePath}`)
		  } catch (e) {
		  	console.error(`删除png文件报错`, e)
		  }
	  }
    });
}

/// 随机生成token
export function randomToken() {
	const A = randomString(10);
	const B = randomString(9);
	const C = randomString(8);
	return `==${A}.${B}.${C}`;
}
export function randomString(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
  let result = '';
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// svgContent: SVG字符串
// token: 你的token字符串
export function postSvgToPng(svgContent, token) {
	if (AppModel.lastGenPngTime != null) {
		const now = new Date()
		const interval = (now.getTime() - AppModel.lastGenPngTime.getTime()) / 1000
		if (interval < 5) {
			uni.showModal({
				title: '操作频繁',
				content: '两次保存的时间间隔不能小于5秒',
				showCancel: false
			})
			return null
		}
	}

  return new Promise((resolve, reject) => {
	  AppModel.lastGenPngTime = new Date()
	  
    uni.request({
      url: AppModel.svgToPngApi,
      method: 'POST',
      header: {
        'Content-Type': 'image/svg+xml',
        'token': token
      },
      data: svgContent,
      responseType: 'arraybuffer', // 关键，返回二进制
      success: (res) => {
        if (res.statusCode === 200) {
          // 返回的是PNG二进制数据
          // 可转为base64用于img展示
          const base64 = uni.arrayBufferToBase64(res.data);
          resolve(base64);
        } else {
          // 处理错误提示
          const msg = String.fromCharCode.apply(null, new Uint8Array(res.data));
          reject(msg || '请求失败');
        }
      },
      fail: (err) => {
        reject(err.errMsg || '网络错误');
      }
    });
  });
}

/// 将png数据保存到文件并返回文件路径的promise
export function savePngToFile(base64String) {
  return new Promise((resolve) => {
    const fileSystemManager = uni.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/result_${Date.now()}.png`;
	console.debug(`>>> filePath: ${filePath}`)
    fileSystemManager.writeFile({
      filePath: filePath,
      data: base64String,
      encoding: 'base64',
      success: () => {
        resolve(filePath);
      },
      fail: (err) => {
		console.error(err);
        resolve(null);
      }
    });
  });
}

/// 延迟执行
export function delay(ms) :Promise<void> {
	return new Promise((resolve, _) => {
		setTimeout(() => resolve(), ms)
	})
}

/// 显示不带图标的文字提示
export function showTextToast(text :string) {
	uni.showToast({
		title: text,
		icon: 'none'
	})
}