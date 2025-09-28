import { MOODS, SHAPES } from '../constants'

export type KawaiiMood = (typeof MOODS)[number]

export type KawaiiShapre = (typeof SHAPES)[number]

export type KawaiiProps = {
  size?: number | string;
  color?: string;
  mood?: KawaiiMood;
  uniqueId?: string;
  bg? :string;
}

export type KawaiiFaceProps = {
  mood?: KawaiiMood;
  uniqueId?: string;
  transform?: string;
}

export function kMoodName(type :KawaiiMood) :string {
	switch (type) {
		case 'sad':
			return '难过'
		case 'shocked':
			return '惊讶'
		case 'happy':
			return '微笑'
		case 'blissful':
			return '开心'
		case 'lovestruck':
			return '痴恋'
		case 'excited':
			return '兴奋'
		case 'ko':
			return '宕机'
	}
}

export function kShapeName(shape :KawaiiShapre) :string {
	switch (shape) {
		case 'astronaut':
			return '宇航员'
		case 'backpack':
			return '背包'
		case 'browser':
			return '浏览器'
		case 'cat':
			return '猫星人'
		case 'chocolate':
			return '巧克力'
		case 'creditCard':
			return '信用卡'
		case 'cyborg':
			return '机器人'
		case 'file':
			return '文件'
		case 'folder':
			return '文件夹'
		case 'ghost':
			return '幽灵'
		case 'humanCat':
			return '猫猫服'
		case 'humanDinosaur':
			return '恐龙'
		case 'iceCream':
			return '冰棒'
		case 'mug':
			return '杯子'
		case 'planet':
			return '星球'
		case 'speechBubble':
			return '对话框'
	}
}