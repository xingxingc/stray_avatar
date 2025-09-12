export default function head(canvas, ctx) {
    const bounds = {t: 10, r: 200, b: 200, l: 0};
    const height = 200;
    const width = 200;
    let yCenter = Math.floor(Math.random() * 40) + 80;
    let borderDiff = Math.floor(Math.random() * 40) + 10;

    const h = {
        l: [width - borderDiff, yCenter],
        r: [borderDiff, yCenter],
    };

    function topBeziers(def, b = bounds) {
        let {l, r} = def;
        let xL = l[0];
        let yL = b.t;
        let yR = b.t;
        let xR = r[0];
        const lBeziers = [xL, yL];
        const rBeziers = [xR, yR];

        return [...lBeziers, ...rBeziers];
    }

    function bottomBeziers(def, b = bounds) {
        let {l, r} = def;
        let headMinw = 10;
        let headTopW = headMinw + Math.floor(Math.random()) * (r[0] - l[0]);
        let xL = l[0];
        let yL = b.b;
        let yR = b.b;
        let xR = r[0];
        const lBeziers = [xL, yL];
        const rBeziers = [xR, yR];

        return [...rBeziers, ...lBeziers];
    }

    function generateSkinTone() {
        let reds = 135 + (Math.floor(Math.random() * 120));
        let greens = reds - (Math.floor(Math.random() * 90));
        let blues = reds - (Math.floor(Math.random() * 40));
        return reds + ',' + greens + ',' + blues;
    }

    const head = canvas.createPath2D();
    //head.beginPath();
    head.moveTo(...h.l);

    head.bezierCurveTo(...topBeziers(h), ...h.r);
    head.bezierCurveTo(...bottomBeziers(h), ...h.l);
    //ctx.arc(50,50,40,0,10);
    //headtop
	ctx.fillStyle = 'rgb(' + generateSkinTone() + ')';
    //ctx.stroke();
    ctx.fill(head);
    ctx.closePath();
    ctx.save();
    return head;
}