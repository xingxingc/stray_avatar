// 辅助函数
function divide(count) {
  const deg = 360 / count;
  const arr = new Array(count).fill(0);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = Math.floor(i * deg);
  }
  return arr;
}

function shuf(listForShuffle) {
  const shuffledList = [...listForShuffle];
  // Fisher-Yates 洗牌算法
  for (let i = shuffledList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]];
  }
  return shuffledList;
}

function randPoint(val, minv, maxv) {
  let radius = minv + val * (maxv - minv);
  if (radius > maxv) {
    radius = radius - minv;
  } else if (radius < minv) {
    radius = radius + minv;
  }
  return radius;
}

function point(origin, radius, degree) {
  const x = origin + radius * Math.cos((degree * Math.PI) / 180);
  const y = origin + radius * Math.sin((degree * Math.PI) / 180);
  return [Math.round(x), Math.round(y)];
}

// 从随机点创建点
function createPoints(size, minGrowth, edgesNum) {
  const outerRad = size / 2;
  const innerRad = minGrowth * (outerRad / 10);
  const center = size / 2;
  const slices = divide(edgesNum);
  const destPoints = [];

  for (let item of slices) {
    const p = randPoint(Math.random() * (1.1 - 0.1) + 0.1, innerRad, outerRad);
    const end = point(center, p, item);
    destPoints.push(end);
  }

  return destPoints;
}

// 从点创建 SVG 路径
function createSvgPath(points) {
  let svgPath = "";
  const mid = [
    (points[0][0] + points[1][0]) / 2,
    (points[0][1] + points[1][1]) / 2,
  ];
  svgPath += "M" + mid[0] + "," + mid[1];

  for (let i = 0; i < points.length; i++) {
    const p1 = points[(i + 1) % points.length];
    const p2 = points[(i + 2) % points.length];
    const mid = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
    svgPath +=
      "Q" +
      p1[0] +
      "," +
      p1[1] +
      "," +
      mid[0] +
      "," +
      mid[1];
  }
  svgPath += "Z";
  return svgPath;
}

// 颜色列表，从中随机选择颜色
// 最好使用预定义颜色而不是随机生成
const colors = [
  "#CEE5D0",
  "#ff8080",
  "#79B4B7",
  "#6B7AA1",
  "#DEBA9D",
  "#F6AE99",
  "#FFBCBC",
  "#B5EAEA",
  "#CEE5D0",
  "#c0dba9",
  "#b8e0b6",
  "#9A8194",
  "#d8db76",
  "#E8E9A1",
  "#ECB390",
  "#CFDAC8",
  "#f0c0c0",
  "#E5EDB7",
  "#F6DEF6",
];

const bgColors = [
  "#FAF4EF",
  "#EFFAEF",
  "#EFF4FA",
  "#FAEFFA",
  "#EFF4FA",
  "#F4EFFA",
  "#FAFAEF",
  "#FAEFF4",
  "#EFFAFA",
  "#EFF7EB",
  "#DBDBDB",
  "#EDF1F7",
  "#EFF7EB",
  "#F7F7E9",
  "#EFEFEF",
];

// 创建眼睛
function createEyes(size) {
  const randNum = Math.floor(Math.random() * 10);
  const randPositionX = Math.random() * (2 - -2) + -2;
  const randPositionY = Math.random() * (2 - -2) + -2;
  // 根据随机数生成一只或两只眼睛
  if (randNum < 5) {
    return `<g id="eye" transform="translate(50, 50)"><circle id="iris" cx="0" cy="0" r="${size}" stroke="#000" stroke-width="2" fill="#fff"></circle><circle id="pupil" cx="${randPositionX}" cy="${randPositionY}" r="${size / 2}" fill="#000"></circle></g>`;
  } else {
    const pupilSize1 = Math.round(Math.random() * (size / 3 - 3) + 3);
    const pupilSize2 = Math.round(Math.random() * (size / 3 - 3) + 3);
    return `<g><g transform="translate(38, 50)"><circle cx="0" cy="0" r="${size}" stroke="#000" stroke-width="2" fill="#fff"></circle><circle cx="${randPositionX}" cy="${randPositionY}" r="${pupilSize1}" fill="#000"></circle></g><g transform="translate(58, 50)"><circle cx="0" cy="0" r="${size}" stroke="#000" stroke-width="2" fill="#fff"></circle><circle cx="${randPositionX}" cy="${randPositionY}" r="${pupilSize2}" fill="#000"></circle></g></g>`;
  }
}

// 创建 SVG 数据
function generateCharacter() {
  // 使用随机值创建 blob 和眼睛
  const blobPoints = createPoints(
    Math.round(Math.random() * (105 - 95) + 95),
    Math.round(Math.random() * (7 - 4) + 4),
    Math.round(Math.random() * (8 - 6) + 6)
  );
  const blob = createSvgPath(blobPoints);
  const eyes = createEyes(Math.round(Math.random() * (10 - 6) + 6));

  // blob 和背景颜色的随机索引
  const randColorIndex = Math.floor(Math.random() * colors.length);
  const randBgIndex = Math.floor(Math.random() * bgColors.length);

  // 编译各个部分
  const header = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="400" height="400">\n`;
  const footer = `</svg>`;
  const background = `<rect x="0" y="0" width="100" height="100" fill="${bgColors[randBgIndex]}"/>`;
  const body = `<path stroke="transparent" stroke-width="0" fill="${colors[randColorIndex]}" d="${blob}" />`;
  const stroke = `<path transform="translate(-3, -3)" stroke="#000" stroke-width="2" fill="none" d="${blob}" />`;
  const blush = `<g><circle transform="translate(70, 65)" cx="0" cy="0" r="6" fill="rgb(255,255,255)" opacity="0.4"></circle><circle transform="translate(30, 65)" cx="0" cy="0" r="6" fill="rgb(255,255,255)" opacity="0.4"></circle></g>`;

  // 将所有部分组合在一起
  const fullCharacter = header + background + body + blush + stroke + eyes + footer;
  return fullCharacter;
}

export {
  generateCharacter,
  createPoints,
  createSvgPath,
  createEyes,
  divide,
  shuf,
  randPoint,
  point,
  colors,
  bgColors,
};
export default generateCharacter;
