import { getAstronautSvg } from './components/Astronaut';
import { getBackpackSvg } from './components/Backpack';
import { getBrowserSvg } from './components/Browser';
import { getCatSvg } from './components/Cat';
import { getChocolateSvg } from './components/Chocolate';
import { getCreditCardSvg } from './components/CreditCard';
import { getCyborgSvg } from './components/Cyborg';
import { getFileSvg } from './components/File';
import { getFolderSvg } from './components/Folder';
import { getGhostSvg } from './components/Ghost';
import { getHumanCatSvg } from './components/HumanCat';
import { getHumanDinosaurSvg } from './components/HumanDinosaur';
import { getIceCreamSvg } from './components/IceCream';
import { getMugSvg } from './components/Mug';
import { getPlanetSvg } from './components/Planet';
import { getSpeechBubbleSvg } from './components/SpeechBubble';
import { KawaiiMood, KawaiiShapre } from './types';

export const genKawaiiSvg = (
	shape: KawaiiShapre,
	mood: KawaiiMood,
	color: string,
	bg: string,
) : string => {
	switch (shape) {
		case 'astronaut':
			return getAstronautSvg({
				mood:mood, 
				color:color,
				bg:bg
			})
		case 'backpack':
			return getBackpackSvg({
				mood:mood,
				color:color,
				bg:bg
			})
		case 'browser':
			return getBrowserSvg({
				mood:mood,
				color:color,
				bg:bg
			})
		case 'cat':
			return getCatSvg({
				mood:mood,
				color:color,
				bg:bg
			})
		case 'chocolate':
			return getChocolateSvg({
				mood:mood,
				color:color,
				bg:bg
			})
		case 'creditCard':
			return getCreditCardSvg({
				mood:mood,
				color:color,
				bg:bg
			})
		case 'cyborg':
			return getCyborgSvg({
				mood:mood,
				color:color,
				bg:bg
			})
		case 'file':
			return getFileSvg({
				mood:mood,
				color:color,
				bg:bg
			})
		case 'folder':
			return getFolderSvg({
				mood:mood,
				color:color,
				bg:bg
			})
		case 'ghost':
			return getGhostSvg({
				mood:mood,
				color:color,
				bg:bg
			})
		case 'humanCat':
			return getHumanCatSvg({
				mood:mood,
				color:color,
				bg:bg
			})
		case 'humanDinosaur':
			return getHumanDinosaurSvg({
				mood:mood,
				color:color,
				bg:bg
			})
		case 'iceCream':
			return getIceCreamSvg({
				mood:mood,
				color:color,
				bg:bg
			})
		case 'mug':
			return getMugSvg({
				mood:mood,
				color:color,
				bg:bg
			})
		case 'planet':
			return getPlanetSvg({
				mood:mood,
				color:color,
				bg:bg
			})
		case 'speechBubble':
			return getSpeechBubbleSvg({
				mood:mood,
				color:color,
				bg:bg
			})
		default:
			return ''
	}
}