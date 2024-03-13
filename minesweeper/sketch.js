// CHEAT CODES (paste into console)

/* reveal 25 random empty spaces

let r = []; for(let i = 0; i < 25; i++) { let [x, y] = [ceil(random(1, BOARD_LENGTH + 1)), ceil(random(1, BOARD_LENGTH + 1))]; if(GetBoardState(board_i, x, y) != 0) { i--; continue; } r.push([x, y]); } for(const coord of r) { toReveal.add(coord); }

*/

// SKETCH CONFIGURATION 

const SKETCH = "Minesweeper"; // Name of the sketch and window

const SCREEN_LENGTH = 500; // Length of the square canvas in pixels

let BOARD_LENGTH = 14; // Length of the square board in tiles
let BOARD_MINES = 25; // Number of mines on the board

// BEGIN SKETCH

// board_i holds the state of the internal board (0, 1, 2, 3, M, etc.)
// board_e holds the state of the external board (R, C, F)

let board_i, board_e;

const ConvertCoords = (x, y) => (x - 1) + (y - 1)*BOARD_LENGTH;

const GetBoardState = (board, x, y) => board[ConvertCoords(x, y)];
const SetBoardState = (board, x, y, value) => {
    const crd = ConvertCoords(x, y);
    board[crd] = value;
    return board_i[crd];
};

const PrintBoard = (board) => {
    for(let y = 1; y <= BOARD_LENGTH; y++) {
        const row = [];
        for(let x = 1; x <= BOARD_LENGTH; x++) {
         row[x-1] = GetBoardState(board, x, y);
        }
        console.log(row);
    }
};

const MineCheck = (x, y) => GetBoardState(board_i, x, y) == 'M';

const inValidRange = (x, y) => {
    if(x > BOARD_LENGTH) return false;
    if(x < 1) return false;
    if(y > BOARD_LENGTH) return false;
    if(y < 1) return false;

    return true;
};

const i_IAdj = (x, y) => {
    for(let yo = -1; yo <= 1; yo++) {
        for(let xo = -1; xo <= 1; xo++) {
            if(xo == 0 && yo == 0) continue;

            const oCoord = [x + xo, y + yo];

            if(!inValidRange(...oCoord)) continue;

            const adjState = GetBoardState(board_i, ...oCoord);

            if(adjState == 'M') continue;

            SetBoardState(board_i, ...oCoord, adjState + 1);
        }
    }
};

let board_mine_set = new TupleSet();
const CreateBoards = () => {
    board_i = new Array(BOARD_LENGTH**2).fill(0);
    board_e = new Array(BOARD_LENGTH**2).fill('C');
    board_mine_set.clear()  ;

    for(let i = 0; i < BOARD_MINES; i++) {
        const [x, y] = [floor(random(1, BOARD_LENGTH + 1)), floor(random(1, BOARD_LENGTH + 1))];
        
        if(MineCheck(x, y)) {
            i--;
            continue;
        }

        SetBoardState(board_i, x, y, 'M');
        board_mine_set.add([x, y]);
        i_IAdj(x, y);
    }
};

function setup() {
    createCanvas(SCREEN_LENGTH, SCREEN_LENGTH);
    document.querySelector("canvas").addEventListener("contextmenu", e => e.preventDefault());

    frameRate(40);
    CreateBoards();
}

const mapMouse = (sL) => [ceil(mouseX / sL), ceil(mouseY / sL)];
function RenderBoards() {
    const sL = SCREEN_LENGTH / BOARD_LENGTH;
    const mouseSel = mapMouse(sL);
    
    push();
    rectMode(CENTER);
    textFont("Arial");
    textAlign(CENTER, CENTER);
    textSize(sL/1.75);

    for(let y = 1; y <= BOARD_LENGTH; y++) {
        for(let x = 1; x <= BOARD_LENGTH; x++) {   
            const e_STATE = GetBoardState(board_e, x, y);
            
            push();
            switch(e_STATE) {
            case 'R': // Revelaed tile styling
                fill(210);
                noStroke();//strokeWeight(0.5);
                if(x == mouseSel[0] && y == mouseSel[1] && mouseIsPressed && mouseButton == LEFT) {
                    fill(200);
                }
                break;
            case 'C': // Concealed tile styling
                noStroke();//strokeWeight(2);
                if(x == mouseSel[0] && y == mouseSel[1]) {
                    if(mouseIsPressed && mouseButton == LEFT) {
                        fill(215);
                    } else {
                        fill(230);
                    }
                }
                break;
            case 'F': // Flagged tile styling
                noStroke();
                fill(240, 210, 210);
                break;
            }
            const local_center = [x*sL - sL/2, y*sL - sL/2];
            
            rect(...local_center, sL, sL);
            if(e_STATE == 'R') {
                const i_STATE = GetBoardState(board_i, x, y);
                if(i_STATE != 0 && i_STATE != 'M') {
                    fill(0);
                    text(i_STATE, ...local_center);
                }    
            }
            pop();
        }
    }
    pop();
}

let toReveal = new TupleSet();

const mouse_tile_interaction = (tile_coord, tile_external_state) => { switch(tile_external_state) {
    case 'R':
        if(mouseButton == LEFT) {
            let adj_c = [], adj_f = 0;
            for(let yo = -1; yo <= 1; yo++) {
                for(let xo = -1; xo <= 1; xo++) {
                    if(xo == 0 && yo == 0) continue;
                    const oCoord = [tile_coord[0] + xo, tile_coord[1] + yo];
        
                    if(!inValidRange(...oCoord)) {
                        continue;
                    }
        
                    switch(GetBoardState(board_e, ...oCoord)) {
                    case 'F':
                        adj_f++;
                        break;
                    case 'C':
                        adj_c.push(oCoord)
                        break;
                    }
                }
            }
            if(adj_f == GetBoardState(board_i, ...tile_coord)) {
                for(const c_t of adj_c) toReveal.add(c_t);
            }
        }
        break;
    case 'C':
        if(mouseButton == LEFT) {
            toReveal.add(tile_coord);
        } else if(mouseButton == RIGHT) {
            SetBoardState(board_e, ...tile_coord, 'F');
        }
        break;
    case 'F':
        if(mouseButton == RIGHT) {
            SetBoardState(board_e, ...tile_coord, 'C');
        }
        break;
    } 
};
function mouseReleased() {
    const mouseSel = mapMouse(SCREEN_LENGTH / BOARD_LENGTH);
    const selectedTile = GetBoardState(board_e, ...mouseSel);
    
    if(typeof(mouseSel) == "undefined") return;

    mouse_tile_interaction(mouseSel, selectedTile);
}

const allSafeTilesRevealed = () => {
    for(let y = 1; y <= BOARD_LENGTH; y++) {
        for(let x = 1; x <= BOARD_LENGTH; x++) {
            if(board_mine_set.has([x, y])) continue;

            if(GetBoardState(board_e, x, y) != 'R') return false;
        }
    }
    return true;
};

const StartNewGame = (grid_length, mine_count) => {
    BOARD_LENGTH = grid_length;
    BOARD_MINES = mine_count;

    CreateBoards();
    toReveal.clear();
};

const PushReveals = () => {
    const tmpReveals = new TupleSet(toReveal);
    toReveal.clear();

    for(const coord of tmpReveals) {
        const i_STATE = SetBoardState(board_e, ...coord, 'R');

        if(i_STATE != 0) {
            if(i_STATE == 'M') {
                console.log("LOSE");
                StartNewGame(BOARD_LENGTH, BOARD_MINES);
                return;
            }

            toReveal.remove(coord);
            continue;
        }

        for(let yo = -1; yo <= 1; yo++) {
            for(let xo = -1; xo <= 1; xo++) {
                if(xo == 0 && yo == 0) continue;
                const oCoord = [coord[0] + xo, coord[1] + yo];
    
                if(!inValidRange(...oCoord)) {
                    continue;
                }
    
                if(GetBoardState(board_e, ...oCoord) != 'C') {
                    continue;
                }

                toReveal.add(oCoord);
            }
        }

        toReveal.remove(coord);
    }
    if(allSafeTilesRevealed()) {
        console.log("WIN");
        StartNewGame(BOARD_LENGTH, BOARD_MINES);
    }
};



function draw() {
    PushReveals();
    RenderBoards();
}