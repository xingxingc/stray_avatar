export default function nose(canvas, ctx){
    function generateSkinTone() {
        let reds = 245 + (Math.floor(Math.random() * 10));
        let greens = 170 + (Math.floor(Math.random() * 30));
        let blues = 140 + (Math.floor(Math.random() * 30));
        return reds + ',' + greens + ',' + blues;
    }

    const noseY = 100 - Math.random()*10;
	const noseWidth = 4 + Math.floor(Math.random()*10);
	const m={
        l:[100-noseWidth,noseY],
        r:[100+noseWidth, noseY]
	};
	const noseUpOrDown = noseY + Math.floor(Math.random()*60)-30;

    ctx.beginPath();
    ctx.moveTo(...m.l);
    
    ctx.bezierCurveTo(m.l[0], noseUpOrDown,m.r[0],noseUpOrDown, ...m.r);
    ctx.bezierCurveTo(m.r[0], noseUpOrDown+6,m.l[0],noseUpOrDown+7, ...m.l);
    
    ctx.fillStyle = `rgb(${generateSkinTone()})`
    ctx.fill();
    ctx.closePath();
}