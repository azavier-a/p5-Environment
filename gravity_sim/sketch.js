// SKETCH CONFIGURATION

const SKETCH = "Gravity Simulation"; // Name of the sketch and window

const CWID = 550;

const G = 6.67408*10**-11;

let Focus = 0;

let SCALE, W, HW, SCREEN_CENTER_WORLD_SPACE, tracer_graphics, SCALE_RATIO;
// BEGIN SKETCH
let CAMP = [0, 0];
const _Focus = (id = undefined) => {
    if(id??-1 == -1) CAMP = _.p[Focus];
    Focus = id;
    background(...BGCOL);
};

const _Scale = (s) => {
    SCALE = s;
    SCALE_RATIO = 1/SCALE;
    
    W = SCALE_RATIO*CWID;
    HW = W*0.5;
    SCREEN_CENTER_WORLD_SPACE = [HW, HW];
    //CAMP = MULT(CAMP, SCALE);
    background(...BGCOL);
    //_refresh();
};

const _ = { p:[], v:[], a:[], m:[], r:[] };
const BINARIES = [];
let N = 0;

const _Spawn = (mass, radius) => {
    const spawn_props = {
        p:[random(0, CWID*SCALE_RATIO), random(0, CWID*SCALE_RATIO)],
        v:[0, 0],
        a:[0, 0],
        m:mass,
        r:radius
    };

    for(const K in _) _[K][N] = spawn_props[K];
    return ++N;
};
const _Despawn = (id) => {
    if(N == 0) return 0;

    for(const K in _) _[K].splice(id, 1);

    for(let L = 0; L < BINARIES.length; L++) {
        const BI = BINARIES[L];
        const A = BI[0] > id, B = BI[1] > id;

        if(BI[0] == id || BI[1] == id) {
            BINARIES.splice(L, 1);
            L--;
            continue;
        }

        BINARIES[L] = SUM(BINARIES[L], [A? -1:0, B? -1:0]);
    }
    
    return --N;
};

const _Closest = (xy) => {
    let closest_i = NaN;
    for(let [i, c_sqd] = [0, Infinity]; i < N; i++) {
        const p = _.p[i];
        const sqdist = (p[0] - xy[0])**2 + (p[1] - xy[1])**2;
        if(sqdist < c_sqd) {
            c_sqd = sqdist;
            closest_i = i;
        }
    }
    return closest_i;
};

const _ApplyForce = (id, f, m = 1) => {
    const M = m / _.m[id];
    _.a[id][0] += f[0] * M;
    _.a[id][1] += f[1] * M;
};


let grav_cache = [];
const gravity_force = (id) => { 
    for(let i = 0; i < N; i++) {
        if(id == i || grav_cache[id+''+i]) continue; // if we already applied the force which brings id to i

        const TO = [ _.p[i][0] - _.p[id][0], _.p[i][1] - _.p[id][1] ];
        const F = SetMag(TO, ( G*_.m[i]*_.m[id] )/( TO[0]**2 + TO[1]**2 ));

        _ApplyForce(id, F);
        _ApplyForce(i, [-F[0], -F[1]]);
        grav_cache[i+''+id] = true; // equal and opposite force, i is brought to id
    }
};

const _UpdateAll = () => {
    if(N == 0) return;

    for(let i = 0; i < N; i++) {
        gravity_force(i);
    }
    grav_cache = [];

    for(let i = 0; i < N; i++) {
        _.v[i][0] += _.a[i][0]; _.v[i][1] += _.a[i][1];
        const np = [ _.p[i][0] + _.v[i][0], _.p[i][1] + _.v[i][1] ];

        _.p[i] = np;
        _.a[i] = [0, 0];
    }
};

function keyPressed() {
    if(key == 'f' || key == 'F') {
        _Focus();
    } 
}

function mousePressed() {

    const F = (Focus ?? -1) > -1 ? _.p[Focus] : CAMP;
    const WorldSpace = (a, i) => map(a, 0, CWID, F[i] + HW, F[i] - HW);
    const xy = [WorldSpace(mouseX, 0), WorldSpace(mouseY, 1)]

    //const xy = ;
    const c_id = _Closest(xy);

    if(mouseButton == LEFT) {
        _Focus(c_id);
    }
}

function scroll(event) {
    SCF += (keyIsPressed&&keyCode==SHIFT? 0.3:0.075)*(event.deltaY < 0? -1:1)*SCALE_RATIO;
    SCF = min(max(SCF, 0.1), 100000);
    _Scale(1/SCF);
}

const SUM = (a, b) => [a[0] + b[0], a[1] + b[1]];
const PROD = (a, b) => [a[0] * b[0], a[1] * b[1]];
const MULT = (v, s) => [v[0] * s, v[1] * s];


const D_R = 3.141592/360;

const BGCOL = [150];
const _COM = (a_id, b_id) => SUM(_.p[a_id], MULT(SUM(_.p[b_id], MULT(_.p[a_id], -1)), _.m[b_id]/(_.m[a_id] + _.m[b_id])));
function setup() {
    const cnv = createCanvas(CWID, CWID);
    cnv.mouseWheel(scroll);
    ellipseMode(RADIUS);
    frameRate(60); // 60 frames = 1 sec => 1 frame = 1/60 sec
    fill(0);
    
    _Scale(10);
    tracer_graphics = createGraphics(CWID, CWID);
    tracer_graphics.frameRate(60);
    tracer_graphics.stroke(0);
    tracer_graphics.blendMode(REPLACE);
    tracer_graphics.colorMode(RGB, 255, 255, 255, 1);
    
    const ORBIT = (a_id, b_id, r, f = 1, binary = false, combined_mass = 0, center_of_mass) => SUM(_.v[b_id], SetMag(PROD(SUM(_.p[a_id], MULT(binary? center_of_mass:_.p[b_id], -1)), [-f, f]).reverse(), Math.sqrt(( G*(binary? (7/30)*combined_mass:_.m[b_id])/r))));
    const _Orbit = (a_id, b_id, r, deg_off = 0, dir = 1, binary = false, about_id) => {
        if(binary) {
            _.p[a_id] = SUM(_.p[about_id], SetMag([cos(deg_off*D_R), sin(deg_off*D_R)], r/2));
            _.p[b_id] = SUM(_.p[about_id], SetMag([cos((deg_off + 180)*D_R), sin((deg_off + 180)*D_R)], r/2));
            const AM = _.m[a_id];
            const BM = _.m[b_id];
            const combined_mass = AM + BM;
            const AB = SUM(_.p[b_id], MULT(_.p[a_id], -1));
            const CC0 = BM/combined_mass;

            const AD = r * CC0;
            const BD = r - CC0;


            const COM = SUM(_.p[a_id], SetMag(AB, AD));

            _.v[a_id] = ORBIT(a_id, about_id, AD, dir, true, combined_mass, COM);
            _.v[b_id] = ORBIT(b_id, about_id, BD, dir, true, combined_mass, COM);
            BINARIES.push([a_id, b_id]);
            return;
        }
        _.p[a_id] = SUM(_.p[b_id], SetMag([cos(deg_off*D_R), sin(deg_off*D_R)], r));
        _.v[a_id] = ORBIT(a_id, b_id, r, dir);
    };
    /*
    const _BOrbit = (a_id, b_id, r0, deg_off0 = 0, dir0 = 1, about_id = -1, r1, deg_off1 = 0, dir1 = 1) => {
        _Spawn(0, 0);
        const C0 = about_id > -1;
        _.p[N-1] = [0, 0];
        if(C0) _Orbit(N-1, about_id, r1, deg_off1, dir1);
        
        //const AM = _.m[a_id];
        //const BM = _.m[b_id];

        const CM = _.m[a_id] + _m[b_id];
        const R = 500;
        const D = 5000;
        _Spawn(M, R);
        _Orbit(N-1, N-2, 0.5*D, 180, 1, true, CM);
        _.p[N-1] = SUM(_.p[N-2], SetMag([cos((deg_off0 + 180)*D_R), sin((deg_off0 + 180)*D_R)], r));
        _.v[N-1] = ORBIT(N-1, N-2, r, dir, binary, combined_mass);
        _Spawn(M, R);
        _Orbit(N-1, N-3, 0.5*D,   0, 1, true, CM);
    };*/

    { // Big system demonstration
        _Spawn(0, 0);
        _.p[0] = [0, 0];

        let M = 2*10**23, R = 100000;
        _Spawn(M, R);
        _Spawn(M, R);
        _Orbit(1, 2, 2.2*10**7, 0, 1, true, 0);
        
        _Despawn(0);
        
        _Spawn(8.2*10**16, 250);
        _Orbit(2, 1, 1250000);
        
        _Spawn(8.75*10**14, 25);
        _Orbit(3, 2, 2250);
        
        _Spawn(1*10**5, 2);
        _Orbit(4, 3, 180, 0, -1);
        
        _Spawn(0, 0);
        _Orbit(5, 0, 1000000);
        
        M = 5*10**17;
        R = 500;
        _Spawn(M, R);
        _Spawn(M*0.75, R);
        _Orbit(6, 7, 5000, 0, 1, true, 5);
        
        _Despawn(5);
        
        _Focus(5);
    }
}

let SCF = 0.1, dSCF = false;
function draw() {
    if(keyIsPressed) {
        const R = (key == 'd')||(key == 'D');
        const D = (key == 's')||(key == 'S');
        const I = (key == 'i')||(key == 'I');

        const _refresh = () => {
            background(...BGCOL);
            //SCREEN_CENTER_WORLD_SPACE = [HW - CAMP[0], HW - CAMP[1]];
        };

        switch(key) {
        case 'a':
        case 'A':
        case 'd':
        case 'D':
            CAMP[0] += (Focus??0 == 0)? (R? -1:1)*0.5*SCALE_RATIO:0;
            _refresh();
            break;
        case 'w':
        case 'W':
        case 's':
        case 'S':
            CAMP[1] += (Focus??0 == 0)? (D? -1:1)*0.5*SCALE_RATIO:0;
            _refresh();
            break;
        case 'o':
        case 'O':
        case 'i':
        case 'I':
            SCF += (I? -1:1)*0.1*SCALE_RATIO;
            SCF = min(max(SCF, 0.1), 100000);
            _Scale(1/SCF);
            break;
        }
    }

    scale(SCALE);
    
    _UpdateAll();
    
    image(tracer_graphics, 0, 0, SCALE_RATIO*CWID, SCALE_RATIO*CWID);
    for(let i = 0; i < N; i++) {
        const R = _.r[i];//*(i == 0 ? 1 : 500);
        
        let F = (Focus ?? -1) > -1 ? _.p[Focus] : CAMP;
        for(let B of BINARIES) {
            if(Focus == B[0] || Focus == B[1]) {
                F = _COM(B[0], B[1]);
                break;
            }
        }
        const P = SUM(SUM(F, SCREEN_CENTER_WORLD_SPACE), MULT(_.p[i], -1));
        ellipse(...P, R, R);
        
    }
    tracer_graphics.background(...BGCOL, 0.15);
}