import  {App, Widget, ImageWidget, WidgetAnimation, Label, BoxLayout, Vec2, math} from './lib/eskv/lib/eskv.js'; //Import ESKV objects into an eskv namespace


class Level {
    constructor() {
        this.levelSeed = null;
        this.tileSet = 'CCVVVVVVVVVAAAAAFFFFFSS';
    }
}

class Level1 extends Level {
    constructor() {
        super();
        this.id = 1;
        this.map = `
            ppppp
            pmmmpp
            pmmmmpp
            pmwmmmpp
            pfwffmmpp
            ppwfffpp
            ppwwffp
            pppwwf
            ppppw
        `;
        this.start = [4, 4];
        this.startTile = 'C';
        this.tileSet = 'CCVVVVVVVVVAAAAAFFFFFSS';
    }
}

var levels = [new Level1()];

// Load Images function
const terrainImages = {
    'p': 'tiles/terrain_plain.png',
    'f': 'tiles/terrain_forest.png',
    'm': 'tiles/terrain_mountain.png',
    'w': 'tiles/terrain_water.png',
    '1': 'tiles/terrain_water_edge_n.png',
    '2': 'tiles/terrain_water_edge_ne.png',
    '3': 'tiles/terrain_water_edge_se.png',
    '4': 'tiles/terrain_water_edge_s.png',
    '5': 'tiles/terrain_water_edge_sw.png',
    '6': 'tiles/terrain_water_edge_nw.png',
    'C': 'tiles/tile_castle.png',
    'V': 'tiles/tile_village.png',
    'A': 'tiles/tile_abbey.png',
    'F': 'tiles/tile_farm.png',
    'M': 'tiles/tile_mine.png',
    'S': 'tiles/tile_stronghold.png',
    'T': 'tiles/tile_tradeship.png'
};


// Color Average function
function colorAverage(a, b, aWgt = 0.0) {
    return a;
    return a.map((x, i) => aWgt * x + (1 - aWgt) * b[i]);
}

// Base Tile class
class Tile extends ImageWidget {
    code = '';
    value = 0;
    selected = false;
    selectablePos = -1;
    hexPos = [-1, -1];
    tileColor = [];
    textColor = [];
    score = 0;
    constructor(player = null) {
        super();
        this.wLabel = null;
        this.player = player;
    }
    
    place(hexPos, centerPos, player) {
        if (this.selected) {
            this.hexPos = hexPos;
            let a = new WidgetAnimation();
            a.add({center_x:centerPos[0], center_y:centerPos[1]}, 100);
            a.start(this);
        }
    }
    
    on_touch_down(event, touch) {
        if(this.collide(touch.rect)) {
            if (this.parent.on_touch_down_tile(this, touch)) {
                return true;
            }
        }
        return false;
    }
    
    on_selected(event, value) {
        if (value) {
            let a = new WidgetAnimation();
            a.add({x:this.parent.selectPos[0], y:this.parent.selectPos[1]}, 100);
            a.start(this);
        } else {
            let x = this.selectablePos;
            let pos = [0 * (this.parent.hexSide * 2 + 0.01 * this.parent.w), 
                this.parent.h - (1 + x) * (this.parent.hexSide * 2 + 0.01 * this.parent.w)];
            let a = new WidgetAnimation();
            a.add({x:pos[0], y:pos[1]}, 100);
            a.start(this);
        }
    }
}

class Castle extends Tile {
    constructor(player=null) {
        super(player);        
        this.code = 'C';
        this.scoreTiles = {'C': -1, 'V': 1, 'S': 1, 'M': -1, 'T': 1, 'A': 1, 'F': -1, '': 0};
        this.scoreTerrain = {'p': 1, 'f': 1, 'm': 0, 'w': null};
        this.tileColor = 'purple';
        this.textColor = 'white';
        this.src = terrainImages['C'];
    }
}

class Village extends Tile {
    constructor(player=null) {
        super(player);        
        this.code = 'V';
        this.scoreTiles = {'C': 1, 'V': -1, 'S': 1, 'M': 1, 'T': 1, 'A': 1, 'F': 1, '': 0};
        this.scoreTerrain = {'p': 1, 'f': 1, 'm': 0, 'w': null};
        this.tileColor = 'yellow';
        this.textColor = 'white';
        this.src = terrainImages['V'];
    }
}

class Stronghold extends Tile {
    constructor(player=null) {
        super(player);        
        this.code = 'S';
        this.scoreTiles = {'C': -1, 'V': 1, 'S': -1, 'M': 1, 'T': 1, 'A': 1, 'F': 1, '': 0};
        this.scoreTerrain = {'p': 1, 'f': 0, 'm': 1, 'w': null};
        this.tileColor = 'red';
        this.textColor = 'white';
        this.src = terrainImages['S'];
    }
}

class Mine extends Tile {
    constructor(player=null) {
        super(player);        
        this.code = 'M';
        this.scoreTiles = {'C': -1, 'V': 1, 'S': -1, 'M': -1, 'T': 1, 'A': 1, 'F': 1, '': 0};
        this.scoreTerrain = {'p': 1, 'f': 0, 'm': 2, 'w': null};
        this.tileColor = 'grey';
        this.textColor = 'white';
        this.src = terrainImages['M'];
    }
}

class Tradeship extends Tile {
    constructor(player=null) {
        super(player);        
        this.code = 'T';
        this.scoreTiles = {'C': 1, 'V': 1, 'S': -1, 'M': 1, 'T': -1, 'A': 1, 'F': 1, '': 0};
        this.scoreTerrain = {'p': null, 'f': null, 'm': null, 'w': 2};
        this.tileColor = [0.4, 0.2, 0.2, 1.0];
        this.textColor = 'white';
        this.src = terrainImages['T'];
    }
}

class Abbey extends Tile {
    constructor(player=null) {
        super(player);        
        this.code = 'A';
        this.scoreTiles = {'C': -1, 'V': 1, 'S': -1, 'M': -1, 'T': 1, 'A': -1, 'F': 1, '': 0};
        this.scoreTerrain = {'p': 1, 'f': 1, 'm': 1, 'w': null};
        this.tileColor = [0.7, 0.4, 0.4, 1.0];
        this.textColor = 'white';
        this.src = terrainImages['A'];
    }
}

class Farm extends Tile {
    constructor(player=null) {
        super(player);        
        this.code = 'F';
        this.scoreTiles = {'C': -1, 'V': 1, 'S': -1, 'M': -1, 'T': 1, 'A': 1, 'F': -1, '': 0.5};
        this.scoreTerrain = {'p': 2, 'f': 1, 'm': null, 'w': null};
        this.tileColor = [0.2, 0.5, 0.2, 1.0];
        this.textColor = 'white';
        this.src = terrainImages['F'];
    }
}

const tileDict = {
    'C': Castle,
    'V': Village,
    'S': Stronghold,
    'M': Mine,
    'T': Tradeship,
    'A': Abbey,
    'F': Farm,
};

class TerrainMap extends Array {
    constructor(level, boardHexCount) {
        super(); //total number of cells in the x direction
        for(let i=0; i<boardHexCount; ++i) {
            this.push([]);
        }
        this.boardHexCount = boardHexCount
        let i = 0;
        let terrainmap = level.map.replace(/\n/g, '').replace(/ /g, '');
        for (let x = 0; x < this.boardHexCount; x++) {
            let yHeight = this.boardHexCount - Math.abs((this.boardHexCount - 1) / 2 - x);
            for (let y = 0; y < yHeight; y++) {
                let ht = new terrainClass[terrainmap[i]]({hexPos: [x, y]});
                this[x].push(ht);
                i++;
            }
        }
    }
    *iter() {
        for(let a of this) {
            for (let hex of a) {
                yield hex;
            }
        }
    }
    at(x, y) {
        try {
            return this[x][y];
        } catch(error) {
            return undefined;
        }
    }
    set(x, y, terrain) {
        this[x][y] = terrain;
    }
}

class TerrainHex extends ImageWidget {
    code = '';
    hexWidth = 0.0;
    hexHeight = 0.0;
    hexLen = 0.0;
    hexPosX = 0.0;
    hexPosY = 0.0;
    get hexPos() { return [this.hexPosX, this.hexPosY]; }
    set hexPos(pos) { [this.hexPosX, this.hexPosY] = pos; }
    texture = {};

    constructor(props=null) {
        super();
        this.updateProperties(props);
        this.tile = null;
        // this.src = this.board.terrainImages[this.code];
        this.allowStretch = true;
    }

    on_touch_down(event, touch) {
        if(this.collide(touch.rect)) { //TODO: Scale it
            this.parent.on_touch_down_terrain(this, touch);
        }
    }
}

class Plain extends TerrainHex {
    constructor(props) {
        super(props);
        this.code = 'p';
        this.src = terrainImages['p']; 
    }
}

class Forest extends TerrainHex {
    constructor(props) {
        super(props);
        this.code = 'f';
        this.src = terrainImages['f']; 
    }
}

class Mountain extends TerrainHex {
    constructor(props) {
        super(props);
        this.code = 'm';
        this.src = terrainImages['m'];         
    }
}

class Water extends TerrainHex {
    constructor(props) {
        super(props);
        this.code = 'w';
        this.src = terrainImages['w']; 
    }
}

const terrainClass = {
    'p': Plain,
    'f': Forest,
    'm': Mountain,
    'w': Water
};

class ScoreBoard extends BoxLayout {

}

class Board extends Widget {
    constructor() {
        super();
        this.boardHexCount = null;
        this.boardWidth = null;
        this.boardHeight = null;
        this.hexWidth = null;
        this.hexSide = null;
        this.hexHeight = null;
        this.bgColor = 'blue'; //'Ocean Blue';

        this.terrain = null;
        this.tiles = [];
        this.selectableTiles = [];
        this.tileStack = [];
        this.selectedTile = null;
        this.activePlayer = 0;
        this.players = [];
        this.scoreboard = new ScoreBoard({align:'right', hints:{right:0.99, top:0.01, w:1, h:0.05}});
        this.addChild(this.scoreboard);
        this.gameOver = false;
        this.wStateLabel = new Label({text: '', color: 'white', align: 'right', hints: {right: 0.99, bottom: 0.99, w:1, h:0.05}});
        this.addChild(this.wStateLabel);
    }

    removePlayers() {
        this.activePlayer = 0;
        this.selectedTile = null;
        for (let p of this.players) {
            p.delete();
        }
        this.players = [];
    }

    clearLevel() {
        if (this.terrain !== null) {
            for (let hp in this.terrain) {
                this.removeWidget(this.terrain[hp]);
            }
            this.terrain = null;
        }
        for (let st of this.selectableTiles) {
            this.removeWidget(st);
        }
        this.selectableTiles = [];
    }

    setupLevel(level = null) {
        if (level !== null) {
            this.level = level;
        }
        this.terrain = new TerrainMap(this.level, this.boardHexCount)
        for(let thex of this.terrain.iter()) {
            this.addChild(thex);
        }
        this.selectableTiles = [new Castle(this), new Village(this), new Village(this)];
        let x = 0;
        for (let st of this.selectableTiles) {
            st.selectablePos = x;
            this.addChild(st);
            x++;
        }
        this.tileStack = [...this.level.tileSet].map(t => new tileDict[t]());
        this.tileStack.sort(() => Math.random() - 0.5);
        let startTile = new tileDict[this.level.startTile]();
        startTile.hexPos = this.level.start;
        this.addChild(startTile);
        this.terrain.at(...this.level.start).tile = startTile;
        this.players[this.activePlayer].placedTiles.push(startTile);
    }

    setupGame(playerSpec, level = null) {
        this.gameOver = false;
        this.wStateLabel.text = '';
        this.wStateLabel.color = 'white';
        this.removePlayers();
        this.clearLevel();
        
        // This code could be simplified as the values are the same for every condition, 
        // but I'm keeping it to retain the structure in case you want to change values for specific conditions later.
        if (playerSpec.length === 1) {
            this.boardHexCount = 9;
            this.tilesCount = 24;
        } else if (playerSpec.length === 2) {
            this.boardHexCount = 9;
            this.tilesCount = 24;
        } else if (playerSpec.length === 3) {
            this.boardHexCount = 9;
            this.tilesCount = 24;
        } else if (playerSpec.length === 4) {
            this.boardHexCount = 9;
            this.tilesCount = 24;
        } else { // Assuming 5 or more
            this.boardHexCount = 9;
            this.tilesCount = 24;
        }
        
        for (let p of playerSpec) {
            if (p.type === 0) { // human
                this.players.push(new Player(p.name, p.color, this));
            } else if (p.type === 1) { // computer
                this.players.push(new AIPlayer(p.name, p.color, this));
            } else if (p.type === 2) { // network
                this.players.push(new NetworkPlayer(p.name, p.color, this));
            }
        }
        this.setupLevel(level);
    }

    startGame() {
        this.nextPlayer();
    }

    nextPlayer() {
        if (this.activePlayer >= 0) {
            this.players[this.activePlayer].endTurn();
            if (this.selectableTiles.length === 0) {
                this.showGameOver();
                return;
            }
        }
        this.activePlayer += 1;
        if (this.activePlayer >= this.players.length) {
            this.activePlayer = 0;
        }
        let p = this.players[this.activePlayer];
        p.startTurn();
        if (p.localControl) {
            this.wStateLabel.text = 'Select tile';
            this.wStateLabel.color = colorAverage('white', p.color);
        } else {
            this.wStateLabel.text = '';
            this.wStateLabel.color = 'white';
        }
    }
    
    showGameOver() {
        let scores = this.players.map(p => p.scoreMarker.score);
        let hiScore = Math.max(...scores);
        let winners = this.players.filter((player, idx) => scores[idx] === hiScore);
        this.gameOver = true;
    
        if (this.players.length === 1) {
            let rating = 'You bankrupted the kingdom!';
            if (hiScore > 40) rating = 'Time to find another job';
            if (hiScore > 60) rating = 'The people are happy';
            if (hiScore > 80) rating = 'The people are joyous!';
            if (hiScore > 90) rating = 'Welcome to the history books';
            if (hiScore > 100) rating = 'Hail to the king!';
            this.wStateLabel.color = colorAverage('white', winners[0].color);
            this.wStateLabel.text = `Game over - ${rating}`;
        } else if (winners.length === 1) {
            this.wStateLabel.color = colorAverage('white', winners[0].color);
            this.wStateLabel.text = `Game over - ${winners[0].name} wins`;
        } else {
            this.wStateLabel.color = 'white';
            this.wStateLabel.text = 'Game over - draw';
        }
    }
    
    drawNewTile() {
        if (this.tileStack.length === 0) {
            return;
        }
        let t = this.tileStack.pop();
    
        this.selectableTiles.push(t);
        this.addChild(t);
        for (let x = 0; x < this.selectableTiles.length; x++) {
            let st = this.selectableTiles[x];
            st.selectablePos = x;
            [st.x, st.y] = [
                0 * (this.hexSide * 2 + 0.01 * this.w),
                this.h - (1 + x) * (this.hexSide * 2 + 0.01 * this.w)
            ];
            [st.w, st.h] = [this.hexSide * 2, this.hexSide * 2];
        }
    }
    
    layoutChildren() {
        this.hexSide = Math.min(
            this.w / (1.5 * this.boardHexCount + 1),
            0.95 * this.h / (this.boardHexCount * Math.sqrt(3))
        );
        this.hexWidth = this.hexSide * 2;
        this.hexHeight = this.hexSide * Math.sqrt(3);
        this.boardHeight = this.hexHeight * this.boardHexCount;
        this.boardWidth = this.hexSide * (1.5 * this.boardHexCount + 1);
    
        if (this.terrain !== null) {
            for (let x = 0; x < this.boardHexCount; x++) {
                let yHeight = this.boardHexCount - Math.abs(Math.floor((this.boardHexCount - 1) / 2) - x);
                for (let y = 0; y < yHeight; y++) {
                    let center = this.pixelPos([x, y]);
                    let thex = this.terrain.at(x, y)
                    thex.w = this.hexWidth;
                    thex.h = this.hexWidth;
                    thex.center_x = center[0];
                    thex.center_y = center[1];
                    thex.layoutChildren();
                }
            }
        }

        this.selectPos = [
            3 * (this.hexSide * 2 + 0.01 * this.w),
            this.h - this.hexSide * 2 - 0.01 * this.w
        ];

        for (let p of this.players) {
            p.boardResize(this.hexSide);
        }    
        // this.scoreboard.size = [
        //     60 * this.players.length + 0.01 * this.w * (this.players.length - 1),
        //     80
        // ];
        // this.scoreboard.right = 0.99 * this.w;
        // this.scoreboard.top = this.h - 0.01 * this.w;
        this.applyHints(this.scoreboard);
        this.scoreboard.layoutChildren();
    
        for (let x = 0; x < this.selectableTiles.length; x++) {
            let st = this.selectableTiles[x];
            if(st.selected) {
                [st.x, st.y] = this.selectPos;
            } else {
                st.x = 0 * (this.hexSide * 2 + 0.01 * this.w);
                st.y = this.h - (1 + x) * (this.hexSide * 2 + 0.01 * this.w);    
            }
            st.w = this.hexSide * 2, 
            st.h = this.hexSide * 2;
            st.layoutChildren();
        }
    
        this.applyHints(this.wStateLabel);
        this.wStateLabel.layoutChildren();
        this._needsLayout = false;
        console.log("Layout")
    }

    pixelPos(hexPos) {
        return [
            this.center_x + this.hexSide * 1.5 * (hexPos[0] - Math.floor(this.boardHexCount / 2)),
            this.center_y + this.hexHeight * (hexPos[1] - Math.floor(this.boardHexCount / 2) + Math.abs(hexPos[0] - Math.floor(this.boardHexCount / 2)) / 2.0)
        ];
    }
    
    hexPos(pixelPos) {
        const hpos = Math.round((pixelPos[0] - this.center_x) / (this.hexSide * 1.5) + Math.floor(this.boardHexCount / 2));
        const vpos = Math.round((pixelPos[1] - this.center_y) / this.hexHeight + Math.floor(this.boardHexCount / 2) - Math.abs(hpos - Math.floor(this.boardHexCount / 2)) / 2);
        if (0 <= hpos && hpos < this.boardHexCount && 0 <= vpos && vpos < this.boardHexCount) {
            return [hpos, vpos];
        } else {
            return null;
        }
    }
    
    *neighborIter(hexPos) {
        const yOffsetLeft = hexPos[0] <= Math.floor(this.boardHexCount / 2);
        const yOffsetRight = hexPos[0] >= Math.floor(this.boardHexCount / 2);
        const offsets = [
            [0, -1],
            [0, +1],
            [-1, -yOffsetLeft],
            [-1, +1 - yOffsetLeft],
            [+1, -yOffsetRight],
            [+1, +1 - yOffsetRight]
        ];
    
        for (let offset of offsets) {
            const x = hexPos[0] + offset[0];
            const y = hexPos[1] + offset[1];
            if (this.terrain.at(x,y)) {
                yield this.terrain.at(x,y);
            }
        }
    }
    
    getNeighborCount(hexPos) {
        let value = 0;
        for (let t of this.neighborIter(hexPos)) {
            if (t.tile !== null) {
                value += 1;
            }
        }
        return value;
    }

    update_terrain_and_neighbors(terrain) {
    }

    scoreTile(terrHex) {
        const tile = terrHex.tile;
        tile.score = tile.scoreTerrain[terrHex.code];
        for (let nterr of this.neighborIter(tile.hexPos)) {
            if (nterr.tile !== null) {
                tile.score += tile.scoreTiles[nterr.tile.code];
            }
        }
        return tile.score;
    }
    
    updateScores(terrain = null) {
        if (terrain !== null) {
            this.scoreTile(terrain);
            for (let terr of this.neighborIter(terrain.hexPos)) {
                if (terr.tile !== null) {
                    this.scoreTile(terr);
                }
            }
        }
        for (let p of this.players) {
            let score = 0;
            for (let pt of p.placedTiles) {
                score += pt.score;
            }
            p.scoreMarker.score = score;
        }
    }
    
    placeTile(terrain, serverCheck = true) {
        if (!this.gameOver && this.selectedTile !== null) {
            const hexPos = terrain.hexPos;
            if (this.terrain.at(...hexPos).tile !== null) {
                return;
            }
            const centerPos = this.pixelPos(hexPos);
            this.selectedTile.place(hexPos, centerPos, this.players[this.activePlayer]);
            const index = this.selectableTiles.indexOf(this.selectedTile);
            if (index > -1) {
                this.selectableTiles.splice(index, 1);
            }
            terrain.tile = this.selectedTile;
            this.players[this.activePlayer].placedTiles.push(this.selectedTile);
            this.selectedTile.selectablePos = -1;
            this.selectedTile = null;
//            this.updateTerrainAndNeighbors(terrain);
            this.updateScores(terrain);
            this.drawNewTile();
            this.nextPlayer();
        }
    }

    selectTile(tile, notifyServer = true) {
        if (this.selectedTile !== null && this.selectedTile !== tile) {
            this.selectedTile.selected = false;
            this.selectedTile = null;
        }
        if (!this.gameOver && this.selectedTile === null && this.selectableTiles.includes(tile)) {
            const tileNum = this.selectableTiles.indexOf(tile);
            tile.selected = true;
            this.selectedTile = tile;
        }
        return false;
    }
    
    on_touch_down_terrain(terrain, touch) {
        if (this.gameOver) return true;
        if (this.selectedTile === null) return true;
        if (this.selectedTile.scoreTerrain[terrain.code] === null) return true;
        const player = this.players[this.activePlayer];
        if (!player.localControl) return true;
        if (player.placedTiles.length > 0) {
            let hasNeighbor = false;
            for (let t of this.neighborIter(terrain.hexPos)) {
                if (player.placedTiles.includes(t.tile)) {
                    hasNeighbor = true;
                    break;
                }
            }
            if (!hasNeighbor) return true;
        }
        return this.placeTile(terrain);
    }
    
    on_touch_down_tile(tile, touch) {
        if (this.gameOver) return true;
        if (tile.hexPos[0] !== -1 && tile.hexPos[1] !== -1) return true;
        const p = this.players[this.activePlayer];
        if (!p.localControl) return true;
        else {
            this.wStateLabel.text = 'Place tile';
            this.wStateLabel.color = colorAverage('white', p.color);
        }
        return this.selectTile(tile);
    }
    
}

class GameScreen extends BoxLayout {
    constructor() {
        super();
        this.board = new Board();
        this.addChild(this.board);
    }
}

class PlayerSpec {
    constructor(name, color, type) {
        this.name = name;
        this.color = color;
        this.type = type;
    }
}

class PlayerScore extends Label {
    constructor(identity, color) {
        super();
        this.ident = identity;
        this.color = color;
        this.score = 0.0;
        this.activeTurn = false;
        this.align = 'right';
    }
    on_score() {
        this.text = 'Score: '+Math.floor(this.score)
    }
}

class Player {
    constructor(name, color, board) {
        this.localControl = true;
        this.name = name;
        this.color = color;
        this.board = board;
        this.placedTiles = [];
        this.scoreMarker = new PlayerScore(this.name.substring(0, 2), color);
        this.board.scoreboard.addChild(this.scoreMarker);
    }

    delete() {
        this.reset();
        this.board.scoreboard.removeWidget(this.scoreMarker);
        for (let pt of this.placedTiles) {
            this.board.removeChild(pt);
        }
        this.placedTiles = [];
    }

    reset() {
        this.scoreMarker.activeTurn = false;
        this.scoreMarker.score = 0;
        for (let pt of this.placedTiles) {
            this.board.removeChild(pt);
        }
        this.placedTiles = [];
    }

    startTurn() {
        this.scoreMarker.activeTurn = true;
    }

    endTurn() {
        this.scoreMarker.activeTurn = false;
    }

    boardResize(hexSide) {
        for (let pt of this.placedTiles) {
            if(pt._animation) continue;
            pt.w = hexSide*2;
            pt.h = hexSide*2;
            [pt.center_x,pt.center_y] = pt.parent.pixelPos(pt.hexPos);
        }
    }
}


const colorLookup = {
    0: [0.6, 0, 0, 1],
    1: [0, 0.6, 0, 1],
    2: [0, 0, 0.6, 1],
    3: [0.5, 0, 0.5, 1],
    4: [0.5, 0.5, 0, 1]
};

class LevelHex extends ImageWidget {
    constructor(level_id, source_id = 'tiles/terrain_plain.png') {
        super();
        this.src = source_id;
        this.lid = level_id;
        this.level_id = String(level_id);
    }

    on_touch_up(touch) {
        if (this.collide(touch.rect)) {
//        if (Math.pow(touch.pos[0] - this.center_x, 2) + Math.pow(touch.pos[1] - this.center_y, 2) < Math.pow(this.size[0] / 2, 2)) {
            this.parent.on_touch_up_level(this, touch);
        }
    }
}

class LevelPicker extends Widget {
    constructor(gameMenu) {
        super();
        this.levels = {};
        for (let l of levels.Level.subclasses()) {
            this.levels[l.id] = l;
        }
        this.gameMenu = gameMenu;
        for (let i of Object.keys(this.levels).sort()) {
            this.addChild(new LevelHex(i));
        }
        this.bind('size', this.onSize);
    }

    layoutChildren() {
        super.layoutChildren();
        let W = this.w;
        let H = this.h;
        let N = this.children.length;
        if (W === 0 || W === null || N === 0) {
            return;
        }
        let x = Math.ceil(Math.sqrt(1.0 * N * W / H));
        let y = Math.ceil(1.0 * x / N);
        let i = 0;
        for (let w of this.children.reverse()) {
            w.size = [W * 0.1, H * 0.1];
            w.center = [(i + 1) * 3 * w.size[0], this.size[1] / 2];
            i++;
        }
    }

    on_touch_up_level(terrain, touch) {
        this.gameMenu.startSpGame(this.levels[terrain.lid]);
    }
}

class GameMenu extends BoxLayout {
    constructor(props) {
        super(props);
        this.playerCount = 0;
        this.players = [];
        this.wGame = new GameScreen();
        this.addChild(this.wGame);
        this.level = levels[0]
        this.startSpGame()
    }

    restartGame() {
        let board = this.wGame.children[0];
        board.setupGame(this.playerSpec, levels[0]);
        board.startGame();
        this.current = 'game';
    }

    startGame() {
        let ps = new PlayerSpec('Player ' + String(1), colorLookup[0], 0);
        this.playerSpec = [ps];
        let board = this.wGame.children[0];
        board.setupGame(this.playerSpec, levels[0]);
        board.startGame();
        this.current = 'game';
    }

    startSpGame(level) {
        let board = this.wGame.children[0];
        this.playerSpec = [new PlayerSpec('Player ' + String(1), 'white', 0)];
        board.setupGame(this.playerSpec, levels[0]);
        board.startGame();
        this.current = 'game';
    }
}

class StatusLabel extends Label {
    constructor(text, bgColor, color, hints) {
        super({text:text, bgColor:bgColor, color:color, hints:hints});
    }
}

class PuzzleKingdomApp extends App {
    constructor() {
        super();
        this._baseWidget.children = [ 
            new GameMenu({hints: {x:0, y:0, w:1, h:1}})
        ];
    }

}

var pk = new PuzzleKingdomApp();
pk.start();