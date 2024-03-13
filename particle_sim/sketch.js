// SKETCH CONFIGURATION

const SKETCH = "Particle Simulator"; // Name of the sketch and window

// BEGIN SKETCH
const fe = document.getElementById("framerate");

const prts = [];

function setup() {
    createCanvas(500, 500);
    //frameRate(15);

    /* Density Map Example
    let prt = new Party(13000, 325, 5);
    prt.spawn_v = () => [0, 0];
    //prt.spawn_v = () => Normalized([random(-5, 5), random(-5, 5)]);
    prt.spawn_m = () => random(0.01, 5);
    prt.m_force = (inf, qt) => {
        let mouseForce = [0, 0];
        if(mouseIsPressed && mouseButton == LEFT) {
            const ump = [mouseX, mouseY];
            mouseForce = [ump[0] - inf[0][0], ump[1] - inf[0][1]];
        }
        return LimitMag(mouseForce, 12);
    };
    prts.push(prt);
    prt = new Party(500, 20, 4);
    prt.spawn_v = () => SetMag([random(-5, 5), random(-5, 5)], random(0.25, 1.5));
    prt.display_p = (inf, qt) => {
        const DTY = prts[0].nrInRad(inf[0], 400);
        if(DTY < 26) return;
        strokeWeight(map(DTY, 25, 900, 0.05, 8, true))
        //strokeWeight(2);
        const DL = map(DTY, 25, 70, 0, 255, true),
              DM = map(DTY, 70, 200, 255, 0, true),
              DB = map(DTY, 200, 600, 0, 255, true);
        stroke(DL, DM, DB);
        point(...inf[0]);
    };
    prts.push(prt);*/

    /*
    let prt = new Party(2500, 150, 4);
    prt.spawn_v = () => SetMag([random(-1, 1), random(-1, 1)], 0.25);
    prt.m_force = (inf, qt) => {
        const N = qt.queryRadius(inf[0], 16);
        if(N.length < 2) return [0, 0];

        let sepDir = [0, 0], sepForce = 1, M = 1/N.length;
        for(const n of  N) {
            sepForce += (n[0] - inf[0][0])**2 + (n[1] - inf[0][1])**2;
            sepDir[0] += n[0];
            sepDir[1] += n[1];
        }
        sepForce *= M*0.75;
        sepForce = 1/sepForce;
        sepDir[0] *= M;
        sepDir[1] *= M;
        return [sepForce*(inf[0][0] - sepDir[0]), sepForce*(inf[0][1] - sepDir[1])];
    }
    prt.display_p = (inf, qt) => {
        const DTY = qt.nrInRadius(inf[0], 50);
        if(DTY < 3) return;
        strokeWeight(map(DTY, 2, 6, 0.05, 6, true));
        const DL = map(DTY, 2, 8, 160, 0, true);
        stroke(DL);
        point(...inf[0]);
    }
    prts.push(prt);
    */

    // Gravity simulation
    const EARTH_MASS = 59722*(10**25); // Floating point precision errors anyone?
    const PERSON_MASS = 59722*(10**20); // This is actualy irrelevant for the force felt by a person. The term gets cancelled out

    // Thanks newton
    const GRAVITY_FORCE_MAGNITUDE = (earth, mass, sqdist) => (6.674*(10**-11))*(earth*mass)/sqdist;
    const GRAVITY_A_B = (Ap, Am, Bp, Bm) => {
        const B_A = [Bp[0]-Ap[0], Bp[1]-Ap[1]];
        const MAG = ( 6.674*(10**-11)*(Am*Bm) )/(B_A[0]**2 + B_A[1]**2);
        return SetMag(B_A, MAG);
    }
    const GRAVITY_FORCE = (inf, qt) => {
        const ALL = qt.queryBounds(...qt.Bounds());
        if(ALL.length < 2) return [0, 0];

        const SUM_FORCE = [0, 0];
        for(const P of ALL) {
            if(P[0] == inf[0][0] && P[1] == inf[0][1]) continue;
            const F = GRAVITY_A_B(inf[0], inf[2], P, inf[2]);
            SUM_FORCE[0] += F[0]; SUM_FORCE[1] += F[1];
        }
        return SUM_FORCE;
    }

    const prt = new Party(2);
    prt.m_force = GRAVITY_FORCE;
    prt.spawn_m = () => {
        return PERSON_MASS;
    }

    prts.push(prt);

    stroke(100);
    strokeWeight(5);
}

function draw() {
    fe.innerHTML = int(frameRate());
    background(255);

    /* Density Map Example
    for(const p of prts) p.updateParty();
    prts[1].showParty();*/ 
    prts[0].updateParty();
    prts[0].showParty();
}