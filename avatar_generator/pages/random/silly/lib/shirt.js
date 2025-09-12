export default function shirt(canvas, ctx) {
    const bounds = {t: 0, r: 200, b: 200, l: 0};
    const height = 200;
    const width = 200;
    let yCenter = Math.floor(Math.random() * 190) + 20;
    let borderDiff = Math.floor(Math.random() * 120) + -60;
    const h = {
        l: [width - borderDiff, height],
        r: [borderDiff, height],
    };

    const head = canvas.createPath2D();
    head.moveTo(...h.l);

    head.bezierCurveTo(...topBeziers(h), ...h.r);
    head.bezierCurveTo(200, 200, 0, 200, ...h.l);

	ctx.fillStyle = `rgb(${generateShirtTone()})`
    ctx.fill(head);
    ctx.closePath();
    return head;

    function generateShirtTone() {
        let reds = Math.floor(Math.random() * 255);
        let greens = Math.floor(Math.random() * 255);
        let blues = Math.floor(Math.random() * 255);
        return reds + ',' + greens + ',' + blues;
    }

    function topBeziers(def, b = bounds) {
        let {l, r} = def;
        let y = b.t - Math.random()*40;
        let headMinw = 20;
        let headTopW = headMinw + Math.floor(Math.random()) * (r[0] - l[0]);
        let xL = l[0];
        let yL = y;
        let yR = y;
        let xR = r[0];
        const lBeziers = [xL, yL];
        const rBeziers = [xR, yR];

        return [...lBeziers, ...rBeziers];
    }
}