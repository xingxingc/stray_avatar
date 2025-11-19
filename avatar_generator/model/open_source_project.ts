export class OpenSourceProject {
	name: string
	author: string
	desc: string
	link: string
	
	constructor(name :string, author :string, desc :string, link :string) {
	    this.name = name
		this.author = author
		this.desc = desc
		this.link = link
	}
}

export class MyOpenSouces {
	target: string
	link: string
	
	constructor(target :string, link :string) {
	    this.target = target
		this.link = link
	}
}

export const kOpenSourceProjectList = [
	new OpenSourceProject("randomAvatar", "thisago", "“几何堆叠”效仿于该项目", "https://github.com/thisago/randomAvatar"),
	new OpenSourceProject("Blobby", "enjeck", "“萌眼小团”的方法基于该项目", "https://github.com/enjeck/Blobby"),
	new OpenSourceProject("DoggoFace", "ingriddraagen", "“小狗涂鸦”的方法基于该项目", "https://github.com/ingriddraagen/DoggoFace"),
	new OpenSourceProject("ugly-avatar", "唐煊", "“丑头像”的方法基于该项目", "https://github.com/txstc55/ugly-avatar"),
	new OpenSourceProject("duck-duck-duck", "唐煊", "“无聊鸭”的方法基于该项目", "https://github.com/txstc55/duck-duck-duck"),
	new OpenSourceProject("pixelpunks", "sweeterio", "“朋克像素”里使用的资源参考了该项目", "https://github.com/sweeterio/pixelpunks"),
	new OpenSourceProject("boring-avatars", "boringdesigners", "“简单微笑”里的方法参考了该项目", "https://github.com/boringdesigners/boring-avatars"),
	new OpenSourceProject("jdenticon", "dmester", "“字符图形”的方法基于该项目", "https://github.com/dmester/jdenticon"),
	new OpenSourceProject("faceGenerator", "copperdong", "“复古阿呆”的方法基于该项目", "https://github.com/copperdong/faceGenerator"),
	new OpenSourceProject("facitars", "mugendi", "“怪诞显眼包”的方法效仿于该项目", "https://github.com/mugendi/facitars"),
	new OpenSourceProject("monsterid.js", "KevinGaudin", "“像素怪兽”的方法基于该项目", "https://github.com/KevinGaudin/monsterid.js"),
	new OpenSourceProject("monsterid", "arokettu", "“幽菌怪”的方法基于该项目", "https://github.com/arokettu/monsterid"),
	new OpenSourceProject("solacon", "naknomum", "“旋叶”的方法效仿于该项目", "https://github.com/naknomum/solacon"),
	new OpenSourceProject("react-kawaii", "elizabetdev", "“卡哇伊”的方法效仿于该项目", "https://github.com/elizabetdev"),
	new OpenSourceProject("dogatars", "TheNando", "“憨憨犬”的方法基于该项目", "https://github.com/TheNando/dogatars"),
]

export const kMyOpenSources = [
	new MyOpenSouces('github: stray_avatar', 'https://github.com/xingxingc/stray_avatar'),
	new MyOpenSouces('gitee: stray_avatar', 'https://gitee.com/lucifer_c/stray_avatar')
]