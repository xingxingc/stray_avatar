import { DEFAULT_PROPS } from '../constants';
import { KawaiiProps } from '../types';
import { getFaceScale } from '../utils/getFaceScale';
import { getFaceSvg } from './common/Face';

export const getBrowserSvg = ({
  size = 240,
  mood = 'blissful',
  color = '#A6E191',
  bg = '#FFFFFF',
  uniqueId = 'default'
}: KawaiiProps = DEFAULT_PROPS): string => {
  const figmaFaceScale = getFaceScale(52.78);
  const figmaFaceXYPosition = '93.58 115.38';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 240 240" fill="none">
      <rect
        width="240"
        height="240"
        fill="${bg}"
      />
	  <path
        fill="${color}"
        d="M199.67 122.166V83.164c-.002-9.99-8.186-18.166-18.191-18.164l-123.292.004C48.184 65.004 40 73.18 40 83.17v73.614l.044-.008c.322 2.904 2.829 18.249 19.777 18.249 18.72 0 115.623 1.102 122.23 0 6.608-1.101 17.619-3.303 17.619-18.721v-34.138Z"
      />
      <path
        fill="#121212"
        d="M182.131 175.025c6.607-1.101 17.619-3.303 17.619-18.721v-73.14c-.002-9.99-8.186-18.166-18.192-18.164h-8.339c9.956.057 18.081 8.21 18.083 18.164v73.14c0 15.418-11.012 17.62-17.619 18.721-2.012.336-12.394.467-26.391.487 18.14.023 32.44-.087 34.839-.487Z"
        opacity="0.1"
      />
      <path
        fill="#111"
        d="M40.078 83.164c0-9.984 8.18-18.16 18.18-18.16L181.51 65c10.002-.002 18.183 8.173 18.185 18.164"
      />
      <path
        fill="#fff"
        d="M175.121 76.433a2.717 2.717 0 0 0 2.719-2.715c0-1.5-1.217-2.716-2.719-2.716a2.718 2.718 0 0 0-2.719 2.716c0 1.5 1.218 2.715 2.719 2.715Zm8.973 0a2.718 2.718 0 0 0 2.719-2.715c0-1.5-1.218-2.716-2.719-2.716a2.717 2.717 0 0 0-2.719 2.716c0 1.5 1.217 2.715 2.719 2.715Z"
      />
      <rect width="116.585" height="8.448" x="50.419" y="69.506" fill="#fff" rx="4.224" />
      <mask
        id="Browser_svg__a"
        width="25"
        height="15"
        x="107"
        y="128"
        maskUnits="userSpaceOnUse"
        style="mask-type:luminance"
      >
        <path
          fill="#fff"
          fill-rule="evenodd"
          d="M108.832 135.197c-.572-1.275-.909-2.65-.91-4.064 0-.649.271-1.284.744-1.742a2.595 2.595 0 0 1 1.796-.722h17.779c.669 0 1.323.263 1.796.722a2.44 2.44 0 0 1 .744 1.742c-.006 2.122-.748 4.15-1.945 5.899a12.236 12.236 0 0 1-4.939 4.182 10.913 10.913 0 0 1-4.545 1.006c-2.452 0-4.686-.849-6.474-2.124a12.242 12.242 0 0 1-4.046-4.899Z"
          clip-rule="evenodd"
        />
      </mask>

      ${getFaceSvg({ mood, uniqueId, transform: `translate(${figmaFaceXYPosition}) scale(${figmaFaceScale})` })}
    </svg>`;
};
