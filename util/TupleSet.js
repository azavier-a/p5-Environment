function TupleSet(set_template) { // Designed for 2-value tuple data types e.x. [2, 1]
    this.elements = set_template instanceof TupleSet 
                  ? set_template.elements
                  : [];

    this[Symbol.iterator] = () => this.elements.values();

    this.has = (el) => {
        for(const e of this.elements) {
            if(e[0] != el[0]) continue;
            if(e[1] != el[1]) continue;
            
            return true;
        }
        return false;
    };

    this.add = (element) => {
        if(this.has(element)) return;

        this.elements.push(element);
    };

    this.remove = (el) => { 
        const i_e = this.elements;
        for(let i = 0; i < i_e.length; i++) { 
            const e = i_e[i];
            
            if(e[0] != el[0]) continue;
            if(e[1] != el[1]) continue;
            
            i_e.splice(i, 1);

            return;
        }
    };

    this.subtract = (b) => {
        const ret = [];
        const i_e = this.elements;
        for(let i = 0; i < i_e.length; i++) {
            if(b.has(i_e[i])) continue;
            
            ret.push(i_e[i]);
        }
        this.elements = ret;
    };

    this.clear = () => this.elements = [];
}