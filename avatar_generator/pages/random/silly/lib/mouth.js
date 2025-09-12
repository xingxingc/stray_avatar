export default function mouth(canvas, ctx) {
    const mouthY = 140 - Math.random() * 20;
    const mouthWidth = 20 + Math.floor(Math.random() * 30);
    const m = {
        l: [100 - mouthWidth, mouthY],
        r: [100 + mouthWidth, mouthY]
    };
    const smileOrFrown = mouthY + Math.floor(Math.random() * 40) - 20;
    const smileOrFrown2 = mouthY + Math.floor(Math.random() * 40) - 20;

    ctx.beginPath();
    ctx.moveTo(...m.l);

    ctx.bezierCurveTo(m.l[0], smileOrFrown, m.r[0], smileOrFrown, ...m.r);
    ctx.bezierCurveTo(m.r[0], smileOrFrown2, m.l[0], smileOrFrown2, ...m.l);

    ctx.stroke();
	ctx.fillStyle = 'black';
	
    ctx.fill();
    ctx.closePath();
}