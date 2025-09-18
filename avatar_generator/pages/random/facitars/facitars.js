// 定义常量
const Size = 80; // 内部坐标系尺寸
const OutputSize = 240; // 输出的SVG尺寸

/**
 * 基于种子生成确定性的颜色
 * @param {string} seed - 种子字符串
 * @returns {string} - 十六进制颜色值
 */
const generateSeedColor = (seed) => {
  // 使用种子生成哈希值
  const hash = [...seed].reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  // 使用哈希值生成RGB颜色
  const r = (hash & 0xFF0000) >> 16;
  const g = (hash & 0x00FF00) >> 8;
  const b = hash & 0x0000FF;
  
  // 转换为十六进制颜色值
  return `#${[r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('')}`;
};

/**
 * 提亮颜色
 * @param {string} hex - 十六进制颜色
 * @param {number} percent - 提亮百分比
 * @returns {string} - 提亮后的颜色
 */
const brightenColor = (hex, percent) => {
  hex = hex.replace(/^\s*#|\s*$/g, '');
  if (hex.length === 3) {
    hex = hex.replace(/(.)/g, '$1$1');
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 2), 16);
  const b = parseInt(hex.substring(4, 2), 16);

  return `#${[r, g, b].map(c => 
    Math.floor((1 << 8) + c + ((256 - c) * percent) / 100)
    .toString(16)
    .substring(1)
  ).join('')}`;
};

export class Facitars {
  // 类字段声明
  #count = 0;
  #seed = '';
  #colorHex = '';

  /**
   * 从给定的数组中基于种子值获取一个固定的随机元素
   * @param {Array} arr - 可选值数组
   * @param {string} type - 类型标识符
   * @returns {any} - 数组中的一个元素
   */
  #getSeedVal = (arr, type = '') => {
    if (!Array.isArray(arr) || arr.length === 0) {
      throw new Error('getSeedVal需要一个非空数组参数');
    }

    this.#count++;
    
    // 添加计数以生成种子唯一性
    const seed = this.#seed + '-' + type + '-' + this.#count * 10000;
    
    // 生成权重数组
    const w_arr = new Array(arr.length)
      .fill(0)
      .map(() => Math.ceil(100 / arr.length));
    
    // 使用种子生成稳定的索引
    const hash = [...seed].reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const index = Math.abs(hash) % arr.length;
    return arr[index];
  }

  /**
   * 生成背景
   */
  #generateBackground = () => {
    const lightColor = brightenColor(
      this.#colorHex,
      this.#getSeedVal([80, 90])
    );

    // 基础背景
    let background = `
      <rect width="${Size}" height="${Size}" fill="${this.#getSeedVal(['#FFF', lightColor])}"/>
    `;

    // 图案背景
    const rectSize = this.#getSeedVal([10, 20, 40]);
    const patternLightColor = brightenColor(
      this.#colorHex,
      this.#getSeedVal([60, 70, 80])
    );
    
    const patternId = `pattern-${Math.random().toString(36).substring(2, 9)}`;
    const patternRotation = this.#getSeedVal([0, 10, 30, 45, 60, 90, 135]);
    
    const pattern = `
      <defs>
        <pattern id="${patternId}" x="0" y="0" width="${rectSize}" height="${rectSize}" patternUnits="userSpaceOnUse">
          <rect width="${rectSize}" height="${rectSize}" fill="${patternLightColor}"/>
          <rect width="${rectSize/2}" height="${rectSize/2}" fill="#FFF"/>
          <rect x="${rectSize/2}" y="${rectSize/2}" width="${rectSize/2}" height="${rectSize/2}" fill="#FFF"/>
        </pattern>
      </defs>
    `;

    // 渐变背景
    const gradientLightColor = brightenColor(
      this.#colorHex,
      this.#getSeedVal([160, 70, 80])
    );
    const opacityOrder = this.#getSeedVal([
      [0, 0.5, 1],
      [1, 0, 0.5],
      [0, 0, 1],
      [1, 0.5, 0],
    ]);
    const gradientType = this.#getSeedVal(['linear', 'radial']);
    const gradientId = `gradient-${Math.random().toString(36).substring(2, 9)}`;
    
    const gradient = `
      <defs>
        <${gradientType}Gradient id="${gradientId}">
          <stop offset="0" stop-color="${gradientLightColor}" stop-opacity="${opacityOrder[0]}"/>
          <stop offset="0.5" stop-color="${gradientLightColor}" stop-opacity="${opacityOrder[1]}"/>
          <stop offset="1" stop-color="#FFF" stop-opacity="${opacityOrder[2]}"/>
        </${gradientType}Gradient>
      </defs>
    `;

    const bgType = this.#getSeedVal(['none', 'pattern', 'gradient']);
    
    if (bgType === 'pattern') {
      background += pattern;
      background += `<rect width="${Size}" height="${Size}" fill="url(#${patternId})" transform="rotate(${patternRotation} ${Size/2} ${Size/2})"/>`;
    } else if (bgType === 'gradient') {
      background += gradient;
      background += `<rect width="${Size}" height="${Size}" fill="url(#${gradientId})"/>`;
    }

    return background;
  }

  /**
   * 生成脸部
   */
  #generateFace = () => {
    const faces_arr = [
      {
        shape: 'rect',
        args: [Size, Size],
      },
      {
        shape: 'rect',
        args: [Size * 0.6, Size],
      },
      {
        shape: 'rect',
        args: [Size * 0.6, Size],
        move: [Size * 0.5, 0],
      },
      {
        shape: 'rect',
        args: [Size, Size * 0.6],
      },
      {
        shape: 'rect',
        args: [Size, Size * 0.6],
        move: [0, Size * 0.5],
      },
      {
        shape: 'rect',
        args: [Size, Size],
        radius: Size * this.#getSeedVal([0.1, 0.2, 0.3]),
      },
      {
        shape: 'rect',
        args: [Size, Size * 0.6],
        radius: Size * this.#getSeedVal([0.1, 0.2, 0.3]),
        move: [0, Size * -0.1],
      },
      {
        shape: 'rect',
        args: [Size, Size * 0.6],
        radius: Size * this.#getSeedVal([0.1, 0.2, 0.3]),
        move: [0, Size * 0.5],
      },
      {
        shape: 'rect',
        args: [Size, Size],
        radius: Size * this.#getSeedVal([0.1, 0.2, 0.3]),
      },
      { 
        shape: 'circle', 
        args: [Size] 
      },
      {
        shape: 'polygon',
        args: [`0,0 ${Size / 2},${Size} ${Size},0`],
      },
      {
        shape: 'polygon',
        args: [
          `${Size * 0.2},0 ${Size * 0.8},0 ${Size},${Size * 0.5} ${
            Size * 0.5
          },${Size} ${0}, ${Size * 0.5}`,
        ],
      },
      {
        shape: 'polygon',
        args: [
          `0,0 ${
            Size * this.#getSeedVal([0.0, 0.3, 0.5, 0.8])
          },0  ${
            Size * this.#getSeedVal([0.0, 0.3, 0.5, 0.8])
          },${Size} 0,${Size}`,
        ],
      },
    ];

    const { shape, args, radius, move } = this.#getSeedVal(faces_arr);
    
    let faceElement = '';
    
    if (shape === 'rect') {
      const [width, height] = args;
      const x = move ? move[0] : 0;
      const y = move ? move[1] : 0;
      const rx = radius || 0;
      faceElement = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="${this.#colorHex}"/>`;
    } else if (shape === 'circle') {
      const [diameter] = args;
      const radius = diameter / 2;
      faceElement = `<circle cx="${Size/2}" cy="${Size/2}" r="${radius}" fill="${this.#colorHex}"/>`;
    } else if (shape === 'polygon') {
      const [points] = args;
      faceElement = `<polygon points="${points}" fill="${this.#colorHex}"/>`;
    }
    
    return faceElement;
  }

  /**
   * 生成眼睛
   */
  #generateEyes = () => {
    const pupils_arr = [
      {
        l: [Size * 0.3, Size * 0.3],
        r: [Size * 0.7, Size * 0.3],
      },
    ];

    const eyeballs_arr = [
      {
        l: [Size * 0.3, Size * 0.3],
        r: [Size * 0.7, Size * 0.3],
        pupils: this.#getSeedVal(pupils_arr),
      },
      {
        l: [Size * 0.3, Size * 0.3],
        r: [Size * 0.7, Size * 0.2],
        pupils: this.#getSeedVal(pupils_arr),
      },
      {
        l: [Size * 0.3, Size * 0.2],
        r: [Size * 0.7, Size * 0.3],
        pupils: this.#getSeedVal(pupils_arr),
      },
    ];

    const pos = this.#getSeedVal(eyeballs_arr);

    // 生成随机眼睛大小
    const eyeSizeMultiplier = this.#getSeedVal([0.33, 0.3, 0.27, 0.25, 0.23, 0.21, 0.19, 0.17]);
    const eyeSize = Size * eyeSizeMultiplier;
    
    // 瞳孔大小是眼睛大小的*倍
    const pupilRatio = this.#getSeedVal([0.25, 0.27, 0.29, 0.31, 0.33, 0.35, 0.37, 0.4, 0.42, 0.45, 0.47, 0.5]);
    const pupilSize = eyeSize * pupilRatio;
    
    const eyeballs_shape_arr = [
      {
        l: {
          shape: 'circle',
          args: [eyeSize],
        },
        r: {
          shape: 'circle',
          args: [eyeSize],
        },
      },
      {
        l: {
          shape: 'ellipse',
          args: [eyeSize, eyeSize * 0.8],
        },
        r: {
          shape: 'ellipse',
          args: [eyeSize, eyeSize * 0.8],
        },
      },
      {
        l: {
          shape: 'ellipse',
          args: [eyeSize * 0.8, eyeSize],
        },
        r: {
          shape: 'ellipse',
          args: [eyeSize * 0.8, eyeSize],
        },
      },
      {
        l: {
          shape: 'ellipse',
          args: [eyeSize * 0.8, eyeSize],
        },
        r: {
          shape: 'ellipse',
          args: [eyeSize, eyeSize * 0.8],
        },
      },
    ];

    const eyes_arr = [
      {
        eyeballs: this.#getSeedVal(eyeballs_shape_arr),
        pupils: { shape: 'circle', args: [pupilSize] },
      },
    ];

    const { eyeballs, pupils } = this.#getSeedVal(eyes_arr);
    const eye_fill = this.#getSeedVal(['#FFF']);

    let eyesElement = '';

    // 左眼
    if (eyeballs.l.shape === 'circle') {
      const [radius] = eyeballs.l.args;
      eyesElement += `<circle cx="${pos.l[0]}" cy="${pos.l[1]}" r="${radius}" fill="${eye_fill}" stroke="#000" stroke-width="2"/>`;
    } else if (eyeballs.l.shape === 'ellipse') {
      const [rx, ry] = eyeballs.l.args;
      eyesElement += `<ellipse cx="${pos.l[0]}" cy="${pos.l[1]}" rx="${rx}" ry="${ry}" fill="${eye_fill}" stroke="#000" stroke-width="2"/>`;
    }

    // 左眼瞳孔
    if (pupils.shape === 'circle') {
      const [radius] = pupils.args;
      eyesElement += `<circle cx="${pos.pupils.l[0]}" cy="${pos.pupils.l[1]}" r="${radius}" fill="#000"/>`;
    }

    // 右眼
    if (eyeballs.r.shape === 'circle') {
      const [radius] = eyeballs.r.args;
      eyesElement += `<circle cx="${pos.r[0]}" cy="${pos.r[1]}" r="${radius}" fill="${eye_fill}" stroke="#000" stroke-width="2"/>`;
    } else if (eyeballs.r.shape === 'ellipse') {
      const [rx, ry] = eyeballs.r.args;
      eyesElement += `<ellipse cx="${pos.r[0]}" cy="${pos.r[1]}" rx="${rx}" ry="${ry}" fill="${eye_fill}" stroke="#000" stroke-width="2"/>`;
    }

    // 右眼瞳孔
    if (pupils.shape === 'circle') {
      const [radius] = pupils.args;
      eyesElement += `<circle cx="${pos.pupils.r[0]}" cy="${pos.pupils.r[1]}" r="${radius}" fill="#000"/>`;
    }

    return eyesElement;
  }

  /**
   * 生成鼻子
   */
  #generateNose = () => {
    const nose_arr = [
      `M30,45 L35,50 L39,40 L44,50 L48,40`,
      `M30,45 L35,50 L39,40`,
      `M30,40 Q35,55 40,30`,
    ];
    
    const path = this.#getSeedVal(nose_arr);
    return `<path d="${path}" stroke="#000" stroke-width="3" stroke-linecap="round" fill="none"/>`;
  }

  /**
   * 生成嘴巴
   */
  #generateMouth = () => {
    const mouth_arr = [
      {
        mouth: `10,50 30,60 50,60 70,50 50,70 30,70`,
        teeth: this.#getSeedVal([
          [`30,62 35,62 35,65 30,65`, `45,62 50,62 50,65 45,65`],
          [
            `30,62 35,62 35,65 30,65`,
            `37,70 37,65 43,65 43,70`,
            `45,62 50,62 50,65 45,65`,
          ],
          [''],
        ]),
        smileLines: this.#getSeedVal([
          [['M10,40 L5,50 L15,50'], ['M70,40 L75,50 L65,50']],
          [['M10,40 L5,50 L20,60'], ['M70,40 L75,50 L60,60']],
          [''],
        ]),
      },
      {
        mouth: `10,60 30,55 50,55 70,60 50,70 30,70`,
        teeth: this.#getSeedVal([
          [''],
          [`30,55 35,55 35,60 30,60`, `45,55 50,55 50,60 45,60`],
          [`10,60 30,63 50,63 70,60 50,56 30,56`],
          [
            `30,55 35,55 35,60 30,60`,
            `37,70 37,65 43,65 43,70`,
            `45,55 50,55 50,60 45,60`,
          ],
          [''],
        ]),
      },
      {
        mouth: `10,60 30,65 50,65 70,60 50,70 30,70`,
      },
      {
        mouth: `10,60 30,55 50,65 70,60 50,70 30,70`,
        teeth: this.#getSeedVal([[`30,55 45,63 30,60 20,57`], [``]]),
      },
      {
        mouth: `10,60 30,65 50,55 70,60 50,70 30,70`,
        teeth: this.#getSeedVal([[`40,60 50,55 70,60 50,65`], [``]]),
      },
    ];

    const { mouth, teeth, smileLines } = this.#getSeedVal(mouth_arr);
    
    let mouthElement = '';
    
    // 嘴巴主体
    mouthElement += `<polygon points="${mouth}" stroke="#bbb" stroke-width="1" stroke-linecap="round" fill="${this.#getSeedVal(['#222', '#444', 'black'])}"/>`;
    
    // 牙齿
    if (teeth) {
      for (let tooth of teeth) {
        if (tooth) {
          mouthElement += `<polygon points="${tooth}" fill="#FFF"/>`;
        }
      }
    }
    
    // 微笑线
    if (smileLines) {
      for (let smileLine of smileLines) {
        if (smileLine) {
          mouthElement += `<path d="${smileLine}" stroke="#444" stroke-width="1" fill="none"/>`;
        }
      }
    }
    
    return mouthElement;
  }

  /**
   * 应用变换
   */
  #transform = (element, rotateArr = [0, 10, -10]) => {
    const rotation = this.#getSeedVal(rotateArr);
    return `<g transform="rotate(${rotation} ${Size/2} ${Size/2})">${element}</g>`;
  }

  // SVG生成方法
  generateSvg = () => {
    if (!this.#colorHex) {
      throw new Error('颜色未初始化');
    }

    return `
      <svg width="${OutputSize}" height="${OutputSize}" viewBox="0 0 ${Size} ${Size}" xmlns="http://www.w3.org/2000/svg">
        ${this.#generateBackground()}
        ${this.#generateFace()}
        ${this.#generateEyes()}
        ${this.#generateMouth()}
        ${this.#generateNose()}
      </svg>
    `;
  }

  // 清理方法
  cleanup = () => {
    this.#count = 0;
    this.#seed = '';
    this.#colorHex = '';
  }

  // 异步生成方法
  generate = async (seed, size = 80) => {
    if (!seed) {
      throw new Error('需要提供seed参数!');
    }
    
    seed = String(seed);
    
    this.#seed = `${seed}-${seed.length}-${[...seed].reverse().join('')}`;
    this.#colorHex = generateSeedColor(this.#seed);
    
    // 生成SVG字符串
    const svgString = this.generateSvg();

    return {
      svg: svgString,
      color: this.#colorHex
    };
  }
}