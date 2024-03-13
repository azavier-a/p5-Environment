const CircleContains = (o, sqr, c) => (o[0] - c[0])**2 + (o[1] - c[1])**2 < sqr;
const BoundContains = (ce, hw, c) => {
    if(abs(ce[0] - c[0]) > hw) return false;
    if(abs(ce[1] - c[1]) > hw) return false;
    return true;
};

function QuadTree(boundary, capacity, maxDepth, depth = 0) { // Designed for 2-value tuple data types e.x. [2, 1]
    this.sdvd = false;
    this.elements = [];

    this.Bounds = () => boundary;

    this.clear = () => {
        this.elements = [];
        this.sdvd = false;
    }

    this.queryAll = () => {
        if(this.sdvd) {
            const ret = [];
            for(const tree of this.elements) ret.push(...tree.queryAll());
            
            return ret;
        }
        return this.elements;
    };
    this[Symbol.iterator] = () => this.queryAll().values();

    this.queryRadius = (c, r) => {
        const ret = [];
        if(this.sdvd) {
            for(const tree of this.elements) ret.push(...tree.queryRadius(c, r));
            
            return ret;
        }
        for(const e of this.elements) if(CircleContains(c, r, e)) ret.push(e);
        
        return ret;
    };
    this.nrInRadius = (c, r) => {
        let ret = 0;
        if(this.sdvd) {
            for(const tree of this.elements) ret += tree.nrInRadius(c, r);
            
            return ret;
        }
        for(const e of this.elements) if(CircleContains(c, r, e)) ret++;
        
        return ret;
    };

    this.queryBounds = (c, hw) => {
        const ret = [];
        if(this.sdvd) {
            for(const tree of this.elements) ret.push(...tree.queryBounds(c, hw));
            
            return ret;
        }
        for(const e of this.elements) if(BoundContains(c, hw, e)) ret.push(e);
        
        return ret;
    };

    this.pushPoint = (c) => {
        if(!BoundContains(...boundary, c)) return false; // Only add points within the bounds of the tree
        
        const els = this.elements;

        if(this.sdvd) { // If divided, attempt to insert the point into all subtrees
            for(const stree of els) if(stree.pushPoint(c)) return true;

            return false;
        }
        els.push(c); // If not divided, push point into current list of elements
        if(els.length <= capacity || depth == maxDepth) return true; // if capacity isn't over, insertion is complete. If we're at maxDepth, we don't care about capacity
        // if capacity is over, subdivide the tree
        let subdivisions = [];
        const newHW = boundary[1]/2, bc = boundary[0];
        for(let y = -1; y <= 1; y += 2) {
            for(let x = -1; x <= 1; x += 2) {
                const newBound = [[bc[0] + x*newHW, bc[1] + y*newHW], newHW];
                const newTree = new QuadTree(newBound, capacity, maxDepth, depth + 1);
                // New subtrees take the points from parent trees
                let inds = [];
                for(let i = 0; i < els.length; i++) { // Insert all possible elements
                    if(!newTree.pushPoint(els[i])) continue;

                    inds.push(i);
                }
                for(let ind = 0; ind < inds.length; ind++) { // Remove all inserted elements from original array
                    els.splice(inds[ind], 1);
                    for(let ind_1 = ind + 1; ind_1 < inds.length; ind_1++) inds[ind_1]--;
                }
                subdivisions.push(newTree);
            }
        }
        this.elements = subdivisions; // Elements list holds trees after the parent is subdivided
        this.sdvd = true;
        return true;
    };
}