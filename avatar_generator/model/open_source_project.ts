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

export const kOpenSourceProjectList = [
	new OpenSourceProject("ugly-avatar", "唐煊", "“丑头像”随机生成图片的方法基于该项目", "https://github.com/txstc55/ugly-avatar"),
	new OpenSourceProject("duck-duck-duck", "唐煊", "“无聊鸭”随机生成图片的方法基于该项目", "https://github.com/txstc55/duck-duck-duck"),
	new OpenSourceProject("pixelpunks", "sweeterio", "“朋克像素”里使用的资源参考了该项目", "https://github.com/sweeterio/pixelpunks"),
	new OpenSourceProject("boring-avatars", "boringdesigners", "“简单微笑”里的方法参考了该项目", "https://github.com/boringdesigners/boring-avatars"),
]