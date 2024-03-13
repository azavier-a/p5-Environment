const Magnitude = (v) => Math.sqrt(v[0]**2 + v[1]**2);

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

const LimitMag = (v, l) => {
    const sql = Math.sqrt(v[0]**2 + v[1]**2);
    if(sql <= l) return v;
    const M = 1/sql;
    return [v[0]*M*l, v[1]*M*l];
};