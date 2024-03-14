const Magnitude = (v) => Math.sqrt(v[0]**2 + v[1]**2);

const Add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const Sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const Prod = (a, b) => [a[0] * b[0], a[1] * b[1]];
const Quot = (a, b) => [a[0] / b[0], a[1] / b[1]];

const Inc = (a, s) => [a[0] + s, a[1] + s];
const Dec = (a, s) => [a[0] - s, a[1] - s];
const Mult = (a, s) => [a[0] * s, a[1] * s];
const Div = (a, s) => {
    const S = 1/s;
    [a[0] * S, a[1] * S];
};

const FromUnitCircle = (rad) => [Math.cos(rad), Math.sin(rad)];
const D_R = 0.0174532925199;
const R_D = 57.2957795131;

const Normalized = (v) => {
    const sql = v[0]**2 + v[1]**2;
    if(sql == 1) return v;
    const M = 1/Math.sqrt(sql);
    return [v[0]*M, v[1]*M];
};

const SetMag = (v, l) => {
    const sql = v[0]**2 + v[1]**2;
    if(sql == l**2) return v;
    const M = 1/Math.sqrt(sql);
    return [v[0]*M*l, v[1]*M*l];
};

const ConstrainMagHigh = (v, mh) => {
    const sql = v[0]**2 + v[1]**2;
    if(sql <= mh**2) return v;
    const M = 1/Math.sqrt(sql);
    return [v[0]*M*mh, v[1]*M*mh];
};

const ConstrainMagLow = (v, ml) => {
    const sql = v[0]**2 + v[1]**2;
    if(sql >= ml**2) return v;
    const M = 1/Math.sqrt(sql);
    return [v[0]*M*ml, v[1]*M*ml];
};

const ConstrainMag = (v, ml, mh) => {
    const sql = v[0]**2 + v[1]**2;

    const L = sql >= ml**2;
    if(L && sql <= mh**2) return v;
    const M = 1/Math.sqrt(sql);

    return L? [v[0]*M*mh, v[1]*M*mh]:[v[0]*M*ml, v[1]*M*ml];
};