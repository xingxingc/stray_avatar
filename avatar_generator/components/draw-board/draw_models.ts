/// 绘制类型
export enum DrawType {
	/// 填充
	fill,
	/// 清除
	clear,
	/// 移动
	move,
	/// 替换颜色
	replaceColor
}

/// 图层
export class DrawLayer {
	points :DrawPoint[] = []
	
	copy() {
		let o = new DrawLayer()
		for (let item of this.points) {
			o.points.push(item.copy())
		}
		return o
	}
}

/// 点
export class DrawPoint {
	x :number = 0
	y :number = 0
	r :number = 0
	g :number = 0
	b :number = 0
	
	constructor(x: number, y: number, r: number, g: number, b: number) {
	    this.x = x
		this.y = y
		this.r = r
		this.g = g
		this.b = b
	}
	
	copy() {
		return new DrawPoint(this.x, this.y, this.r, this.g, this.b)
	}
}
