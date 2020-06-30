class Cmplx {
    
    constructor(a, b) {
        this.re = a;
        this.im = b
    }

    add(z) {
        this.re += z.re;
        this.im += z.im;
    }

    mult(z) {
        const re = this.re * z.re - this.im * z.im;
        const im = this.re * z.im + this.im * z.re;
        return new Cmplx(re, im);
    }

    div(r) {
        const re = this.re / r;
        const im = this.im / r;
        return new Cmplx(re, im);
    }

    amp() {
        const amp = sqrt(this.re * this.re + this.im * this.im);
        return amp;
    }

    phase() {
        const phase = atan2(this.im, this.re);
        return phase;
    }

}

function dft(y) {
    const Y = [];
    const N = y.length;

    for (let n = 0; n < N; n++) {
        let sum = new Cmplx(0, 0);
        for (let k = 0; k < N; k++) {
            const phi = (- TWO_PI * k * n) / N;
            const c = new Cmplx(cos(phi), sin(phi));
            let convY = new Cmplx(y[k].re, y[k].im)
            sum.add(convY.mult(c));
        }
        sum = sum.div(N);

        let freq = n;
        let amp = sum.amp();
        let phase = sum.phase();
        Y[n] = { re: sum.re, im: sum.im, freq: freq, amp, phase };
    }
    return Y;
}