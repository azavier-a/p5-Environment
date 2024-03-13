// SKETCH CONFIGURATION

const SKETCH = "QuadTree"; // Name of the sketch and window

// BEGIN SKETCH
const tree = new QuadTree([[250, 250], 250], 7, 7);
const pts = [];

function mouseReleased() {
    pts.push([mouseX, mouseY]);
}

const RAD = 75, RAD2 = RAD*0.886226925;

function setup() {
    const SIZE = 500;
    createCanvas(SIZE, SIZE);

    rectMode(RADIUS);
    ellipseMode(RADIUS);
    noFill();

    for(let i = 0; i < 1000; i++) pts.push([random(0, width), random(0, height)]);
}

const RdrTree = (tr) => {
    const bnd = tr.Bounds();
    square(...bnd[0], bnd[1]);

    if(tr.sdvd) for(const t of tr.elements) RdrTree(t);
};

function draw() {
    for(const p of pts) tree.pushPoint(p);

    const px = [mouseX, mouseY];

    background(190);

    stroke(0);
    strokeWeight(0.2);
    RdrTree(tree);

    strokeWeight(2);
    stroke(150, 0, 0);
    for(const p of tree.queryRadius(px, RAD)) point(...p);

    tree.clear();
}
