import head from './head';
import hair from './hair';
import eyes from './eyes';
import nose from './nose';
import mouth from './mouth';

import shirt from './shirt';

const headGenerator = function (canvas, ctx) {
	ctx.clearRect(0, 0, 200, 200)
	
	ctx.fillStyle = randomFillStyle()
	ctx.fillRect(0, 0, 200, 200)
	
    shirt(canvas, ctx);
    hair(canvas, ctx);
    head(canvas, ctx);
    eyes(canvas, ctx);
    nose(canvas, ctx);
    mouth(canvas, ctx);
}

function randomFillStyle() {
    let reds = Math.floor(Math.random() * 255);
    let greens = Math.floor(Math.random() * 255);
    let blues = Math.floor(Math.random() * 255);
    return 'rgb(' + reds + ',' + greens + ',' + blues + ')';
}

export default headGenerator;