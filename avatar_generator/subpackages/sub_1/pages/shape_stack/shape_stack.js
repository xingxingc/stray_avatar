/**
 * randomAvatar - 生成随机 SVG 头像
 * 适配 Uniapp 微信小程序
 */

// 头像颜色映射表
const avatarColors = {
  "aliceblue": "rgb(240, 248, 255)",
  "antiquewhite": "rgb(250, 235, 215)",
  "aqua": "rgb(0, 255, 255)",
  "aquamarine": "rgb(127, 255, 212)",
  "azure": "rgb(240, 255, 255)",
  "beige": "rgb(245, 245, 220)",
  "bisque": "rgb(255, 228, 196)",
  "black": "rgb(0, 0, 0)",
  "blanchedalmond": "rgb(255, 235, 205)",
  "blue": "rgb(0, 0, 255)",
  "blueviolet": "rgb(138, 43, 226)",
  "brown": "rgb(165, 42, 42)",
  "burlywood": "rgb(222, 184, 135)",
  "cadetblue": "rgb(95, 158, 160)",
  "chartreuse": "rgb(127, 255, 0)",
  "chocolate": "rgb(210, 105, 30)",
  "coral": "rgb(255, 127, 80)",
  "cornflowerblue": "rgb(100, 149, 237)",
  "cornsilk": "rgb(255, 248, 220)",
  "crimson": "rgb(220, 20, 60)",
  "cyan": "rgb(0, 255, 255)",
  "darkblue": "rgb(0, 0, 139)",
  "darkcyan": "rgb(0, 139, 139)",
  "darkgoldenrod": "rgb(184, 134, 11)",
  "darkgray": "rgb(169, 169, 169)",
  "darkgrey": "rgb(169, 169, 169)",
  "darkgreen": "rgb(0, 100, 0)",
  "darkkhaki": "rgb(189, 183, 107)",
  "darkmagenta": "rgb(139, 0, 139)",
  "darkolivegreen": "rgb(85, 107, 47)",
  "darkorange": "rgb(255, 140, 0)",
  "darkorchid": "rgb(153, 50, 204)",
  "darkred": "rgb(139, 0, 0)",
  "darksalmon": "rgb(233, 150, 122)",
  "darkseagreen": "rgb(143, 188, 143)",
  "darkslateblue": "rgb(72, 61, 139)",
  "darkslategray": "rgb(47, 79, 79)",
  "darkslategrey": "rgb(47, 79, 79)",
  "darkturquoise": "rgb(0, 206, 209)",
  "darkviolet": "rgb(148, 0, 211)",
  "deeppink": "rgb(255, 20, 147)",
  "deepskyblue": "rgb(0, 191, 255)",
  "dimgray": "rgb(105, 105, 105)",
  "dimgrey": "rgb(105, 105, 105)",
  "dodgerblue": "rgb(30, 144, 255)",
  "firebrick": "rgb(178, 34, 34)",
  "floralwhite": "rgb(255, 250, 240)",
  "forestgreen": "rgb(34, 139, 34)",
  "fuchsia": "rgb(255, 0, 255)",
  "gainsboro": "rgb(220, 220, 220)",
  "ghostwhite": "rgb(248, 248, 255)",
  "gold": "rgb(255, 215, 0)",
  "goldenrod": "rgb(218, 165, 32)",
  "gray": "rgb(128, 128, 128)",
  "grey": "rgb(128, 128, 128)",
  "green": "rgb(0, 128, 0)",
  "greenyellow": "rgb(173, 255, 47)",
  "honeydew": "rgb(240, 255, 240)",
  "hotpink": "rgb(255, 105, 180)",
  "indianred": "rgb(205, 92, 92)",
  "indigo": "rgb(75, 0, 130)",
  "ivory": "rgb(255, 255, 240)",
  "khaki": "rgb(240, 230, 140)",
  "lavender": "rgb(230, 230, 250)",
  "lavenderblush": "rgb(255, 240, 245)",
  "lawngreen": "rgb(124, 252, 0)",
  "lemonchiffon": "rgb(255, 250, 205)",
  "lightblue": "rgb(173, 216, 230)",
  "lightcoral": "rgb(240, 128, 128)",
  "lightcyan": "rgb(224, 255, 255)",
  "lightgoldenrodyellow": "rgb(250, 250, 210)",
  "lightgray": "rgb(211, 211, 211)",
  "lightgrey": "rgb(211, 211, 211)",
  "lightgreen": "rgb(144, 238, 144)",
  "lightpink": "rgb(255, 182, 193)",
  "lightsalmon": "rgb(255, 160, 122)",
  "lightseagreen": "rgb(32, 178, 170)",
  "lightskyblue": "rgb(135, 206, 250)",
  "lightslategray": "rgb(119, 136, 153)",
  "lightslategrey": "rgb(119, 136, 153)",
  "lightsteelblue": "rgb(176, 196, 222)",
  "lightyellow": "rgb(255, 255, 224)",
  "lime": "rgb(0, 255, 0)",
  "limegreen": "rgb(50, 205, 50)",
  "linen": "rgb(250, 240, 230)",
  "magenta": "rgb(255, 0, 255)",
  "maroon": "rgb(128, 0, 0)",
  "mediumaquamarine": "rgb(102, 205, 170)",
  "mediumblue": "rgb(0, 0, 205)",
  "mediumorchid": "rgb(186, 85, 211)",
  "mediumpurple": "rgb(147, 112, 219)",
  "mediumseagreen": "rgb(60, 179, 113)",
  "mediumslateblue": "rgb(123, 104, 238)",
  "mediumspringgreen": "rgb(0, 250, 154)",
  "mediumturquoise": "rgb(72, 209, 204)",
  "mediumvioletred": "rgb(199, 21, 133)",
  "midnightblue": "rgb(25, 25, 112)",
  "mintcream": "rgb(245, 255, 250)",
  "mistyrose": "rgb(255, 228, 225)",
  "moccasin": "rgb(255, 228, 181)",
  "navajowhite": "rgb(255, 222, 173)",
  "navy": "rgb(0, 0, 128)",
  "oldlace": "rgb(253, 245, 230)",
  "olive": "rgb(128, 128, 0)",
  "olivedrab": "rgb(107, 142, 35)",
  "orange": "rgb(255, 165, 0)",
  "orangered": "rgb(255, 69, 0)",
  "orchid": "rgb(218, 112, 214)",
  "palegoldenrod": "rgb(238, 232, 170)",
  "palegreen": "rgb(152, 251, 152)",
  "paleturquoise": "rgb(175, 238, 238)",
  "palevioletred": "rgb(219, 112, 147)",
  "papayawhip": "rgb(255, 239, 213)",
  "peachpuff": "rgb(255, 218, 185)",
  "peru": "rgb(205, 133, 63)",
  "pink": "rgb(255, 192, 203)",
  "plum": "rgb(221, 160, 221)",
  "powderblue": "rgb(176, 224, 230)",
  "purple": "rgb(128, 0, 128)",
  "rebeccapurple": "rgb(102, 51, 153)",
  "red": "rgb(255, 0, 0)",
  "rosybrown": "rgb(188, 143, 143)",
  "royalblue": "rgb(65, 105, 225)",
  "saddlebrown": "rgb(139, 69, 19)",
  "salmon": "rgb(250, 128, 114)",
  "sandybrown": "rgb(244, 164, 96)",
  "seagreen": "rgb(46, 139, 87)",
  "seashell": "rgb(255, 245, 238)",
  "sienna": "rgb(160, 82, 45)",
  "silver": "rgb(192, 192, 192)",
  "skyblue": "rgb(135, 206, 235)",
  "slateblue": "rgb(106, 90, 205)",
  "slategray": "rgb(112, 128, 144)",
  "slategrey": "rgb(112, 128, 144)",
  "snow": "rgb(255, 250, 250)",
  "springgreen": "rgb(0, 255, 127)",
  "steelblue": "rgb(70, 130, 180)",
  "tan": "rgb(210, 180, 140)",
  "teal": "rgb(0, 128, 128)",
  "thistle": "rgb(216, 191, 216)",
  "tomato": "rgb(255, 99, 71)",
  "turquoise": "rgb(64, 224, 208)",
  "violet": "rgb(238, 130, 238)",
  "wheat": "rgb(245, 222, 179)",
  "white": "rgb(255, 255, 255)",
  "whitesmoke": "rgb(245, 245, 245)",
  "yellow": "rgb(255, 255, 0)",
  "yellowgreen": "rgb(154, 205, 50)",
  "myColor": "#181722",
  "custom1": "#181722",
  "custom2": "#0E3E53",
  "custom3": "#222A37",
  "custom4": "#479C9C"
};

// 常量定义
const IMG_SIZE = 300;
const MAX_ELEMENT_SIZE = 150;

/**
 * 生成随机数（包含 min，不包含 max）
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @returns {number}
 */
function random(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * 随机选择数组中的一个元素
 * @param {Array} arr 数组
 * @returns {*} 随机元素
 */
function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 生成随机 SVG 头像
 * @param {string} color 颜色值（rgb 或 hex 格式）
 * @returns {string} SVG 字符串
 */
function genAvatar(color) {
  let svgElements = [];
  
  // SVG 开始标签
  svgElements.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${IMG_SIZE} ${IMG_SIZE}" width="${IMG_SIZE}" height="${IMG_SIZE}">`);
  
  // 背景黑色矩形
  svgElements.push(`<rect x="0" y="0" width="${IMG_SIZE}" height="${IMG_SIZE}" fill="black" />`);
  
  // 半透明颜色层
  svgElements.push(`<rect x="0" y="0" width="${IMG_SIZE}" height="${IMG_SIZE}" fill="${color}" fill-opacity="0.2" />`);
  
  // 生成 100 个随机元素
  for (let i = 0; i < 100; i++) {
    const x = random(0, IMG_SIZE * 1.5) - IMG_SIZE / 2;
    const y = random(0, IMG_SIZE * 1.5) - IMG_SIZE / 2;
    const opacity = random(0, 50) / 100;
    
    if (sample([true, false])) {
      // 生成圆形
      const radius = random(0, MAX_ELEMENT_SIZE / 2);
      const strokeOpacity = random(0, 70) / 100;
      svgElements.push(
        `<circle cx="${x}" cy="${y}" r="${radius}" stroke="${color}" fill="${color}" fill-opacity="${opacity}" stroke-opacity="${strokeOpacity}" />`
      );
    } else {
      // 生成矩形
      const width = random(0, MAX_ELEMENT_SIZE);
      const height = random(0, MAX_ELEMENT_SIZE);
      const strokeOpacity = random(0, 70) / 100;
      svgElements.push(
        `<rect x="${x}" y="${y}" width="${width}" height="${height}" stroke="${color}" fill="${color}" fill-opacity="${opacity}" stroke-opacity="${strokeOpacity}" />`
      );
    }
  }
  
  // SVG 结束标签
  svgElements.push('</svg>');
  
  return svgElements.join('');
}

/**
 * 根据名称获取随机头像 SVG
 * @param {string} name 颜色名称（可选，不传则随机选择）
 * @returns {string} SVG 字符串
 */
function getAvatarByName(name = null) {
  let color;
  if (name && avatarColors[name]) {
    color = avatarColors[name];
  } else {
    // 随机选择一个颜色
    const colorNames = Object.keys(avatarColors);
    const randomName = colorNames[Math.floor(Math.random() * colorNames.length)];
    color = avatarColors[randomName];
  }
  return genAvatar(color);
}

/**
 * 根据颜色值生成头像
 * @param {string} color 颜色值
 * @returns {string} SVG 字符串
 */
function getAvatarByColor(color) {
  return genAvatar(color);
}

// 导出模块
export {
  avatarColors,
  genAvatar,
  getAvatarByName,
  getAvatarByColor
};
