class Polybezier {

    constructor(inputCoord) {
        this.points = this.importAbsCoord(inputCoord);
    }

    importAbsCoord(inputCoord) {
        inputCoord = inputCoord.replace(/ C /g, " ");
        let splitCoord = inputCoord.split(" ");
        let points = [];
        for (let k = 0; k < splitCoord.length; k++) {
            let xy = splitCoord[k].split(",")
            points[k] = { x: parseFloat(xy[0]), y: - parseFloat(xy[1]) };
        }
        return points;
    }

    getPoint(p0, p1, p2, p3, t) {
        let x = p0.x * pow(1 - t, 3) + 3 * p1.x * t * pow(1 - t, 2)
            + 3 * p2.x * pow(t, 2) * (1 - t) + p3.x * pow(t, 3);
        let y = p0.y * pow(1 - t, 3) + 3 * p1.y * t * pow(1 - t, 2)
            + 3 * p2.y * pow(t, 2) * (1 - t) + p3.y * pow(t, 3);
        return new Cmplx(x, y);
    }

    samplePoints(N) {
        let s = 1.000000 / N;
        let M = this.points.length / 3;
        let sampledPoints = [];

        console.log("# total points = " + this.points.length +
            "; # interpolated points = " + this.points.length / 3);

        for (let j = 0; j < M; j++) {
            let points = {
                p0: this.points[3 * j], p1: this.points[1 + 3 * j],
                p2: this.points[2 + 3 * j], p3: this.points[(3 + 3 * j) % this.points.length]
            };
            for (let k = 0; k < N; k++) {
                sampledPoints[k + j * N] = this.getPoint(points.p0, points.p1, points.p2, points.p3, k * s);
            }
        }

        return sampledPoints;
    }

}