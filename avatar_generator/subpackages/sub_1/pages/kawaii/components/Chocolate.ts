import { DEFAULT_PROPS } from '../constants';
import { KawaiiProps } from '../types';
import { getFaceScale } from '../utils/getFaceScale';
import { getFaceSvg } from './common/Face';

export const getChocolateSvg = ({
  size = 240,
  mood = 'blissful',
  color = '#A6E191',
  bg = '#FFFFFF',
  uniqueId = 'default'
}: KawaiiProps = DEFAULT_PROPS): string => {
  const figmaFaceScale = getFaceScale(53.99);
  const figmaFaceXYPosition = '93 156.26';
  const chocolateFillColor = '#8C6A57';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 240 240" fill="none">
      <rect
        width="240"
        height="240"
        fill="${bg}"
      />
	  <path
        d="M166.389 201.19a4 4 0 0 1-4 4H78a4 4 0 0 1-4-4V39a4 4 0 0 1 4-4h84.389a4 4 0 0 1 4 4v162.19Z"
        fill="${chocolateFillColor}"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M86.156 41.483h-3.673a2 2 0 0 0-2 2v23.555a2 2 0 0 0 2 2h32.47a2 2 0 0 0 2-2V43.483a2 2 0 0 0-2-2H86.157Zm22.313 21.072a2 2 0 0 0 2-2V49.966a2 2 0 0 0-2-2H88.967a2 2 0 0 0-2 2v10.587a2 2 0 0 0 2 2h19.502ZM129.109 41.483h-3.673a2 2 0 0 0-2 2v23.555a2 2 0 0 0 2 2h32.469a2 2 0 0 0 2-2V43.483a2 2 0 0 0-2-2h-28.796Zm22.313 21.072a2 2 0 0 0 2-2V49.966a2 2 0 0 0-2-2h-19.503a2 2 0 0 0-2 2v10.587a2 2 0 0 0 2 2h19.503ZM86.156 75.521h-3.673a2 2 0 0 0-2 2v23.555a2 2 0 0 0 2 2h32.47a2 2 0 0 0 2-2V77.521a2 2 0 0 0-2-2H86.157Zm22.313 21.071a2 2 0 0 0 2-2V84.005a2 2 0 0 0-2-2H88.967a2 2 0 0 0-2 2v10.587a2 2 0 0 0 2 2h19.502ZM129.109 75.521h-3.673a2 2 0 0 0-2 2v23.555a2 2 0 0 0 2 2h32.469a2 2 0 0 0 2-2V77.521a2 2 0 0 0-2-2h-28.796Zm22.313 21.071a2 2 0 0 0 2-2V84.005a2 2 0 0 0-2-2h-19.503a2 2 0 0 0-2 2v10.587a2 2 0 0 0 2 2h19.503ZM86.156 109.559h-3.673a2 2 0 0 0-2 2v23.555a2 2 0 0 0 2 2h32.47a2 2 0 0 0 2-2v-23.555a2 2 0 0 0-2-2H86.157Zm22.313 21.071a2 2 0 0 0 2-2v-10.587a2 2 0 0 0-2-2H88.967a2 2 0 0 0-2 2v10.587a2 2 0 0 0 2 2h19.502ZM129.109 109.559h-3.673a2 2 0 0 0-2 2v23.555a2 2 0 0 0 2 2h32.469a2 2 0 0 0 2-2v-23.555a2 2 0 0 0-2-2h-28.796Zm22.313 21.071a2 2 0 0 0 2-2v-10.587a2 2 0 0 0-2-2h-19.503a2 2 0 0 0-2 2v10.587a2 2 0 0 0 2 2h19.503Z"
        fill="#fff"
        fill-opacity="0.1"
      />
      <path d="m74 136.303 92.389-26.339V202a4 4 0 0 1-4 4H78a4 4 0 0 1-4-4v-65.697Z" fill="${color}" />
      <path d="M74 136.316h82.911l9.478-26.352L74 136.316Z" fill="${color}" />
      <path d="M74 136.316h82.911l9.478-26.352L74 136.316Z" fill="#000" fill-opacity="0.15" />

      ${getFaceSvg({ mood, uniqueId, transform: `translate(${figmaFaceXYPosition}) scale(${figmaFaceScale})` })}
    </svg>`;
};
