// SKETCH CONFIGURATION

const SKETCH = "Parabola Focus Demonstration"; // Name of the sketch and window

// BEGIN SKETCH

const _ = { p:[], v:[], a:[] };
let N = 0;

const _Spawn = (p) => {
    const spawn_props = {
        p:p,
        v:[0, 0],
        a:[0, 0]
    };

    for(const K in _) _[K][N] = spawn_props[K];
    return ++N;
};
const _Despawn = (id) => {
    if(N == 0) return 0;

    for(const K in _) _[K].splice(id, 1);
    
    return --N;
};

const _UpdateAll = () => {
    if(N == 0) return;
    
    for(let i = 0; i < N; i++) {
        _.a[i][1] = 0.025;
        
        let np = _.p[i].slice();

        _.v[i] = Add(_.v[i], _.a[i]);
        np = Add(np, _.v[i]);
        
        let nx = map(np[0], 10, width - 10, -1, 1, true);
        let ny = map(np[1], height/2 - 10, height - 10, 1, 0, true);
        
        if(ny <= nx**2) {
            const mny = np[1];
            const mnx = map(2*nx**2 - ny, 1, 0, height/2 - 10, height - 10, true);
            np[1] = mnx;
            
            const perp = (x) => nx**2 - 0.5*(1/nx)*(x - nx);
            const nv = Normalized(Sub([0.98*nx, perp(0.98*nx)], [nx, perp(nx)]));

            _.v[i] = SetMag(Sub(Mult(nv, 2), Normalized(_.v[i])), Magnitude(_.v[i]));
            _.v[i][1] *= -1;
        }
        
        _.p[i] = np;
        _.a[i] = [0, 0];
    }
};

function setup() {
    createCanvas(500, 500);

    const NR = 1250;
    for(let i = 0; i < NR; i++) {
        _Spawn([map(i, 0, NR-1, 75, width - 75, true), height/2 - 10]);
        _.v[N-1] = [0, 0.1];
    }
}

function DrawParabola(o, w, h) {
    const VERTS = 30;
    
    const DX = 1/VERTS;
    beginShape(LINES);
    for(let x = -1; x < 1; x += DX) {
        let vx = map(x, -1, 1, o[0], o[0] + w, true);
        let vy = map(x**2, 1, 0, o[1], o[1] + h, true);
        vertex(vx, vy);
        
        vx = map(x + DX, -1, 1, o[0], o[0] + w, true);
        vy = map((x + DX)**2, 1, 0, o[1], o[1] + h, true);
        vertex(vx, vy);
    }
    endShape();
}

function draw() {
    background(200);

    strokeWeight(3);
    stroke(0);
    for(const P of _.p) point(...P);
    _UpdateAll();

    strokeWeight(2);
    stroke(20);
    DrawParabola([10, height/2 - 10], width - 20, height/2);
}