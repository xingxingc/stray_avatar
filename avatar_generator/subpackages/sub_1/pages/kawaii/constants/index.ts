export const MOODS = ['sad', 'shocked', 'happy', 'blissful', 'lovestruck', 'excited', 'ko'] as const;

export const SHAPES = ['astronaut', 'backpack', 'browser', 'cat', 'chocolate', 'creditCard', 'cyborg', 'file', 'folder', 'ghost', 'humanCat', 'humanDinosaur', 'iceCream', 'mug', 'planet', 'speechBubble'] as const;

export const DEFAULT_PROPS = {
  size: 240,
  mood: 'blissful',
  color: '#FFD882',
  bg: '#FFFFFF',
} as const;

export const PROPS_DATA = [
  {
    name: 'size',
    type: 'number | string',
    description: 'Size of the SVG in px.',
    default: DEFAULT_PROPS.size
  },
  {
    name: 'color',
    type: 'string',
    description: 'Color of the SVG.',
    default: DEFAULT_PROPS.color
  },
  {
    name: 'bg',
    type: 'string',
    description: 'Background color of the SVG.',
    default: DEFAULT_PROPS.bg
  },
  {
    name: 'mood',
    type: 'KawaiiMood',
    description: `Mood of the Kawaii face. Choose one of: ${MOODS.map((mood) => `"${mood}"`).join(', ')}`,
    default: DEFAULT_PROPS.mood
  }
];