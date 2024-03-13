function Party(size = 100, treeCap = 10, treeDepth = 2) {
    const mp = [], mv = [], ma = [], mm = [];

    const HW = width/2;
    const tree = new QuadTree([[HW, HW], HW], treeCap, treeDepth);

    this.mbrcnt = 0;

    this.nrInRad = (c, r) => tree.nrInRadius(c, r);
    this.inRad = (c, r) => tree.queryRadius(c, r);

    this.spawn_p = () => [random(0, width), random(0, height)];
    this.spawn_v = () => [0, 0];
    this.spawn_m = () => random(1, 2);
    this.populate = (ind = 0) => {
        if(ind == 5000 || this.mbrcnt == size) return true;

        mp.push(this.spawn_p());
        mv.push(this.spawn_v());
        ma.push([random(0, width), random(0, height)]);
        mm.push(1/this.spawn_m());

        this.mbrcnt++;
        return this.populate(++ind);
    };

    this.m_force = (inf, qt) => [0, 0];
    this.updateParty = () => {
        tree.clear();
        for(let i = 0; i < this.mbrcnt; i++) { // push all members into the tree, remove those that don't fit.
            if(!tree.pushPoint(mp[i])) {
                mp.splice(i, 1);
                mv.splice(i, 1);
                ma.splice(i, 1);
                mm.splice(i, 1);
                this.mbrcnt--;
                i--;
            }
        }
        this.populate();
        for(let i = 0; i < this.mbrcnt; i++) { // update all members
            // F/M = A

            const force = this.m_force([mp[i], mv[i], mm[i]], tree);
            console.log(force);
            ma[i] = [force[0], force[1]];
            mv[i][0] += ma[i][0]; mv[i][1] += ma[i][1];
            const NP = [mp[i][0] + mv[i][0], mp[i][1] + mv[i][1]];
            //if(this.nrInRad(NP, 0.5) < 2) {
            mp[i][0] = NP[0]; mp[i][1] = NP[1];
            //}
            ma[i] = [0, 0];
        }
    };

    this.display_p = (inf, qt) => point(...inf[0]);
    this.showParty = () => { for(let i = 0; i < this.mbrcnt; i++) this.display_p([mp[i]], tree) };
}