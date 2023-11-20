//@ts-check

import * as eskv from '../eskv/lib/eskv.js';
import * as colors from './colors.js';

const sounds = {
    CANCEL_SELECTION: new Audio('sounds/cancel_selection.mp3'),
    LEVEL_COMPLETED: new Audio('sounds/level_completed.mp3'),
    LEVEL_FAILED: new Audio('sounds/level_failed.mp3'),
    MENU: new Audio('sounds/menu.mp3'),
    SELECT: new Audio('sounds/select.mp3'),
    WORD_COMPLETED: new Audio('sounds/word_completed.mp3'),    
}

const boardSize = 7;

//Letter, Tile Value, Number of Tiles
/**@type {[string, number, number][]} */
const tiles = [
['B', 2, 2],
['C', 2, 2],
['D', 1, 4],
['F', 2, 2],
['G', 2, 3],
['H', 3, 2],
['J', 4, 1],
['K', 3, 2],
['L', 0, 3],
['M', 2, 3],
['N', 1, 3],
['P', 2, 3],
['Q', 4, 1],
['R', 1, 4],
['S', 1, 4],
['T', 1, 4],
['V', 4, 1],
['W', 3, 2],
['X', 4, 1],
['Y', 3, 2],
['Z', 4, 1],]

/**@type {[string, number, number][]} */
const vowels = [
['A', 0, 4],
['E', 0, 5],
['I', 0, 4],
['O', 0, 4],
['U', 1, 3],
]

/**
 * 
 * @param {Array<string>} elements 
 * @param {number} length 
 */
function* permutations(elements, length) {
    if (length === 1) {
        for (let elem of elements) {
            yield [elem];
        }
    } else {
        for (let i = 0; i < elements.length; i++) {
            let remainingElements = elements.slice(0, i).concat(elements.slice(i + 1));
            for (let perm of permutations(remainingElements, length - 1)) {
                yield [elements[i]].concat(perm);
            }
        }
    }
}

function repeat(value, reps) {
    return Array(reps).fill(value);
}

/**@type {[string, number][]} */
const tileSet = []
for(let t of tiles) tileSet.push(...repeat([t[0],t[1]+1],t[2]))

/**@type {[string, number][]} */
const vowelSet = []
for(let t of vowels) vowelSet.push(...repeat([t[0],t[1]+1],t[2]))

async function loadWords(url) {
    try {
        const response = await fetch(url);
        const text = await response.text();
        const words = new Set(text.split('\n'));
        return words;
    } catch (err) {
        console.error('Error loading file:', err);
    }
}



class Tile extends eskv.Widget {
    /**
     * 
     * @param {Board} board 
     * @param {number} x 
     * @param {number} y 
     * @param {string} letter 
     * @param {number} value 
     * @param {number} row 
     * @param {boolean} active 
     */
    constructor(board, x, y, letter, value, row, active = false) {
        super();
        this.children = [
            new eskv.Label({
                text: letter,
                color: (app)=>app.colors['tileLetterText'],
                fontSize: '0.8wh',
                hints: {x:0,y:0,w:1,h:1},
            }),
            new eskv.Label({
                text: ''+value,
                color: (app)=>app.colors['tileLetterText'],
                fontSize: '0.8wh',
                hints: {x:0.67,y:0.67,w:.33,h:.33},
            })
        ]
        this.bgColor = SevenWordsApp.get().colors['tile'];
        SevenWordsApp.get().bind('colors', (e,o,v)=>{
            this.updateBgColor();
        })
        this.letter = letter;
        this.value = value;
        this.gposX = x;
        this.gposY = y;
        this.oposX = this.gposX;
        this.oposY = this.gposY;
        this.cposX = this.gposX;
        this.cposY = this.gposY;
        [this.x, this.y] = this.gpos;
        this.board = board;
        this.row = row;
        this.selected = false;
        this.active = active;
    }

    on_letter(event, object, value) {
        this.children[0].text = value;
    }

    on_value(event, object, value) {
        this.children[1].text = ''+value;
    }

    updateBgColor() {
        let colors = SevenWordsApp.get().colors;
        this.bgColor = this.selected? colors['tileSelected']: this.active? colors['tile'] : colors['tileInactive'];
    }

    on_active(event, object, value) {
        this.updateBgColor();
    }

    on_selected(event, object, value) {
        this.updateBgColor();
    }

    on_gpos(event, object, value) {
        if (this.cpos[0] === -1 && this.cpos[1] === -1) {
            this.opos = [...this.gpos];
            this.cpos = [...this.gpos];
        }
        const a = new eskv.WidgetAnimation();
        a.add({ x: this.gpos[0], y: this.gpos[1]}, 250 );
        a.start(this);
    }

    /**@type {eskv.Widget['on_touch_down']} */
    on_touch_down(event, object, touch) {
        if (this.board.blockGposUpdates) {
            return false;
        }
        if (!this.active) {
            return false;
        }
        if (this.collide(touch.rect)) {
            if (this.selected) {
                this.board.deselect(this);
            } else {
                this.board.select(this);
                sounds.SELECT.play();
            }
            return true;
        }
        return false;
    }

    // Getter and setter for gpos, opos, and cpos to trigger events
    get gpos() {
        return [this.gposX, this.gposY];
    }

    set gpos(value) {
        [this.gposX, this.gposY] = value;
        this.emit('gpos', value);
    }

    get opos() {
        return [this.oposX, this.oposY];
    }

    set opos(value) {
        [this.oposX, this.oposY] = value;
    }

    get cpos() {
        return [this.cposX, this.cposY];
    }

    set cpos(value) {
        [this.cposX, this.cposY] = value;
    }
}

class Star extends eskv.Widget {
    bgColor = 'rgba(128,128,128,1.0)';
    altColor = 'rgba(52,192,52,1.0)';
    numberColor = 'rgba(252,252,0,1.0)';
    textColor = 'rgba(255,255,255,1)';
    target = 999;
    active = false;
    constructor(props = {}) {
        super();
        this.updateProperties(props);

        const label = new eskv.Label({
            fontSize: '0.3wh',
            hints: {x:0, y:0, w:1, h:1},
        })
        this.children = [label];
        this.bind('textColor', (event, star, data)=>{label.color = /**@type {Star}*/(star).textColor});
        this.bind('target', (event, star, data)=>{label.text = ''+ /**@type {Star}*/(star).target});
    }
    /**@type {eskv.Widget['draw']} */
    draw(app, ctx) {
        ctx.fillStyle = this.active? this.altColor:this.bgColor;
        // Triangle:
        //     points: [self.x, (self.y+self.center_y)/2, self.right, (self.y+self.center_y)/2, self.center_x, self.top]
        ctx.beginPath()
        ctx.moveTo(this.x, (this.y+this.center_y)/2);
        ctx.lineTo(this.right, (this.y+this.center_y)/2);
        ctx.lineTo(this.center_x, this.bottom);
        ctx.closePath();
        ctx.fill();

        // Triangle:
        //     points: [self.x, (self.top+self.center_y)/2, self.right, (self.top+self.center_y)/2, self.center_x, self.y]
        ctx.beginPath()
        ctx.moveTo(this.x, (this.bottom+this.center_y)/2);
        ctx.lineTo(this.right, (this.bottom+this.center_y)/2);
        ctx.lineTo(this.center_x, this.y);
        ctx.closePath();
        ctx.fill();
    }
}


const instructionsText = 'Objective: Get the highest score you can by forming 7 words in the letter stack. '+
'Try to beat the bronze, silver, and gold target scores.\n\n'+
'Play: For each row in the letter stack, use one or more letters in the current active row '+
'and the free stack (top of screen) to form a word by touching the letter tiles in sequence. '+
'A score prompt will show for a valid word, which you can press to score the word. '+
'Press any of the selected letters to reset the current word.\n\n'+
'Tile use: You do not have to use all letters in a row and any unused letters will move to the free stack'+
'for use on futures rows.\\n\n'+
'Scoring: Each word scores the sum of the tile values multiplied by the length of the word.\n\n'+
'End game: The game ends when you have completed a word in all 7 rows in the letter stack '+
'or if you cannot form a valid word on any row.';


class Instructions extends eskv.ModalView {
    hints = {w:0.8,h:0.8,center_x:0.5, center_y:0.5}
    constructor() {
        super();
        this.bgColor = 'rgba(0,0,0,0.5)';
        this.children = [
            new eskv.Label({
                hints:{h:null},
                text: 'How to play',
                fontSize: '0.05ah',
            }),
            new eskv.ScrollView({ scrollW:false,
                children: [
                    new eskv.Label({
                        hints: {h:null},
                        text: instructionsText,
                        wrap: true,
                        wrapAtWord: true,
                        fontSize: '0.04ah',
                        align: 'left',
                        valign: 'middle',
                    })
                ],
            })
        ];
    }
}


class MenuButton extends eskv.BasicButton {
    constructor(props = {}) {
        props['color'] = (app)=>app.colors['menuButtonForeground'];
        props['selectColor'] = 'white';
        props['bgColor'] = null;
        super(props);
    }
    /**@type {eskv.BasicButton['draw']} */
    draw(app, ctx) {
        ctx.beginPath();
        ctx.fillStyle = this._touching? this.selectColor:this.color;
        ctx.rect(this.x+this.h/8, this.y+this.h*2/16, 3*this.w/4, this.h/8);
        ctx.rect(this.x+this.h/8, this.y+this.h*7/16, 3*this.w/4, this.h/8);
        ctx.rect(this.x+this.h/8, this.y+this.h*12/16, 3*this.w/4, this.h/8);
        ctx.fill();
    }    
}

class MenuOption extends eskv.Label {
    active = true;
    value = -1;
    constructor(props = {}) {
        super();
        props['bgColor'] = (app)=>app.colors['menuButtonBackground'];
        props['color'] = (app)=>this.active?app.colors['menuButtonForeground']:app.colors['menuButtonForegroundDisabled'];
        this.updateProperties(props);
    }
    on_active(e,o,v) {
        const app = SevenWordsApp.get();
        this.color = this.active?app.colors['menuButtonForeground']:app.colors['menuButtonForegroundDisabled'];
    }
}

class Menu extends eskv.ModalView {
    constructor() {
        super({hints:{w:0.8, h:0.8, center_y:0.5, center_x:0.5}});
        /**@type {eskv.ModalView['orientation']} */
        this.orientation = 'vertical';
        this.selection = -1;
        this.prevGame = false;
        this.nextGame = false;
        this.paddingY = '0.02ah';
        this.spacingY = '0.02ah';
        this.bgColor = null;//'rgba(0,0,0,0.5)'
        this.outlineColor = null;

        this.children = [
            new MenuOption({text: 'Restart Game', value:1}),
            new MenuOption({text: 'Next Game', value:2}),
            new MenuOption({text: 'Previous Game', value:3}),
            new MenuOption({text: 'Instructions', value:4}),
            new MenuOption({text: 'Leaderboard', value:5}),
            new MenuOption({text: 'Achievements', value:6}),
            new MenuOption({text: 'Theme', value:7}),
        ]
    }

    uiUpdate(scorebar) {
        this.prevGame = scorebar.gameId > 1;
        this.nextGame = scorebar.hiScore > scorebar.target[0] || scorebar.played > 10;
    }

    on_touch_down(event, object, touch) {
        super.on_touch_down(event, object, touch);
        if (this.collide(touch.rect)) {
            // touch.grab(this);
            return true;
        }
        return false;
    }

    on_touch_up(event, object, touch) {
        // if(touch.grabbed!==this) return false;
        // touch.ungrab();
        super.on_touch_up(event, object, touch);
        if (this.collide(touch.rect)) {
            for (let c of this.children) {
                if (c instanceof MenuOption && c.collide(touch.rect) && c.active) {
                    this.selection = c.value;
                    sounds.MENU.play();
                    return true;
                }
            }
            return true;
        }
        return false;
    }
}

class ScoreBar extends eskv.BoxLayout {
    score = 0;
    hiScore = 0;
    gameId = -1;
    id = 'scorebar';
    /**@type {'horizontal'|'vertical'}*/
    orientation = 'horizontal';
    target = [50, 150, 300];
    constructor(kwargs = {}) {
        super(kwargs);
        this.score = 0;
        this.hiScore = 0;
        this.gameId = -1;
        this.played = 0;

        this.children = [
            new eskv.BoxLayout({
                orientation: 'vertical',
                children: [
                    new eskv.Label({
                        hints: {h:0.33},
                        text: 'SCORE',
                        color: (app)=>app.colors['scoreText'],
                        align: 'left',
                        valign: 'bottom',
                    }),
                    new eskv.Label({
                        hints: {h:0.67},
                        text: (scorebar)=>''+scorebar.score,
                        color: (app)=>app.colors['scoreText'],
                        align: 'left',
                        valign: 'top',
                    }),    
                ]
            }),
            new eskv.BoxLayout({
                orientation: 'vertical',
                children: [
                    new eskv.Label({
                        hints: {h:0.33},
                        text: (scorebar)=>{return scorebar.gameId>0? `GAME ${scorebar.gameId}` : 'RANDOM GAME'},
                        color: (app)=>app.colors['scoreText'],
                        halign: 'center',
                        valign: 'middle',
                    }),
                    new eskv.BoxLayout({
                        hints: {h:0.67},
                        spacing: '0.02ah',
                        padding: '0.02ah',
                        orientation: 'horizontal',
                        children: [
                            new Star({
                                active: (scorebar)=>scorebar.score >= scorebar.target[0],
                                target: (scorebar)=>scorebar.target[0],
                                bgColor: (app)=>app.colors['bronzeOff'],
                                altColor: (app)=>app.colors['bronze'],
                                hints: {h:'1h', w:'1wh'},
                            }),
                            new Star({
                                active: (scorebar)=>scorebar.score >= scorebar.target[1],
                                target: (scorebar)=>scorebar.target[1],
                                bgColor: (app)=>app.colors['silverOff'],
                                altColor: (app)=>app.colors['silver'],
                                hints: {h:'1h', w:'1wh'},
                            }),
                            new Star({
                                active: (scorebar)=>scorebar.score >= scorebar.target[2],
                                target: (scorebar)=>scorebar.target[2],
                                bgColor: (app)=>app.colors['goldOff'],
                                altColor: (app)=>app.colors['gold'],
                                hints: {h:'1h', w:'1wh'},
                            }),
                        ]
                    })    
                ]
            }),
            new eskv.BoxLayout({
                orientation: 'horizontal',
                children: [
                    new eskv.BoxLayout({
                        orientation: 'vertical',
                        children: [
                            new eskv.Label({
                                hints: {h:0.33},
                                text: 'BEST',
                                color: (app)=>app.colors['scoreText'],
                                align: 'right',
                                valign: 'bottom',
                            }),
                            new eskv.Label({
                                hints: {h:0.67},
                                text: (scorebar)=>''+scorebar.hiScore,
                                color: (app)=>app.colors['scoreText'],
                                align: 'right',
                                valign: 'top',
                            })    
                        ]
                    }),
                    new MenuButton({id:'menubutton', hints:{h:'0.75h', w:'1wh'},
                        on_press: (e,o,v)=>SevenWordsApp.get().showMenu(),
                    }),            
                ]
            })
        ]

        try {
            // Assuming a similar JsonStore utility exists in JavaScript
            this.store = localStorage.getItem('7Words/scores.json');
        } catch (error) {
            this.store = null;
        }

        this.bind('gameId', (e,o,v)=>this.setGameId());
        this.bind('score', (e,o,v)=>this.scoreChanged());
        this.bind('played', (e,o,v)=>this.setPlayed());
    }

    getStatus() {
        try {
            const status = localStorage.getItem('7Words/status');
            if (status) {
                const data = JSON.parse(status)
                this.gameId = data.gameId??1;
            } else {
                this.gameId = 1;
            }
        } catch (error) {
            this.gameId = 1;
        }
    }

    setPlayed() {
        try {
            localStorage.setItem('7Words/games/'+String(this.gameId), JSON.stringify({ highScore: this.hiScore, played: this.played }));
        } catch (error) {
            // Log error or handle exception
        }
        console.info(`Played game ${this.gameId} ${this.played} times`);
    }

    setGameId() {
        console.info(`Setting game ${this.gameId}`);
        if (this.gameId > 0) {
            try {
                localStorage.setItem('7Words/status', JSON.stringify({ gameId: this.gameId }));
            } catch (error) {
                // Log error or handle exception
            }
        }
        try {
            const store = localStorage.getItem('7Words/games/'+String(this.gameId))
            if (store) {
                const data = JSON.parse(store);
                this.hiScore = data.highScore??0;
                this.played = data.played??0;
            } else {
                throw new Error();
            }
        } catch (error) {
            this.hiScore = 0;
            this.played = 0;
        }
        console.info(`High score ${this.hiScore}`);
        this.score = 0;
        eskv.rand.setSeed(this.gameId); // Seed random number generator
    }

    scoreChanged() {
        console.info(`Setting game score ${this.score} for game ${this.gameId}`);
        if (this.score > this.hiScore) {
            this.hiScore = this.score;
            try {
                localStorage.setItem('7Words/games/'+String(this.gameId), JSON.stringify({ highScore: this.hiScore, played: this.played }));
            } catch (error) {
                // Log error or handle exception
            }
        }
    }
}

class StatusBar extends eskv.BoxLayout {
    /**@type {eskv.BoxLayout['orientation']} */
    orientation = 'vertical';
    id = 'statusbar';
    word = '';
    wordScore = 0;
    constructor(kwargs = {}) {
        super();
        kwargs['bgColor'] = (app, statusbar)=>statusbar.word!==''?app.colors['wordScoreBackground']:app.colors['background'];
        this.updateProperties(kwargs);
        this.wordLabel = new eskv.Label({
            id: 'wordLabel',
            text: (statusbar)=>{return statusbar.wordScore>0?`${statusbar.word} for ${statusbar.wordScore}`: statusbar.wordScore<0?`${statusbar.word}` :''},
            color: (app)=>{return app.colors['wordScoreText']},
        });
        this.children = [
            this.wordLabel
        ]
    }
}

class MessageBar extends eskv.BoxLayout {
    id = 'messagebar';
    message = '';
    gameId = -1;
    /**@type {eskv.BoxLayout['orientation']} */
    orientation = 'vertical';
    constructor(kwargs = {}) {
        super(kwargs);
        this.children = [
            new eskv.Label({
                text: (messagebar)=>messagebar.message,
                color: (app)=>app.colors['scoreText'],
            })
        ]
    }

    gameChanged(scorebar, gameId) {
        this.gameId = gameId;
    }
}


class Board extends eskv.Widget {
    hints = {x:0, y:0, w:1, h:1};
    constructor() {
        super({bgColor: (app)=>app.colors['background']});
        this.scorebar = new ScoreBar();
        this.statusbar = new StatusBar();
        this.messagebar = new MessageBar();

        this.tileSpaceSize = 1
        this.tileSize = 1
        this.pyramidSize = 1
        this.offX = 0
        this.offY = 0

        // this.scorebar.bind('gameId', (e,o,v)=>this.messagebar.gameId=v);
        this.statusbar.wordLabel.bind('touch_down', (e,o,touch)=>this.confirmWord(this.statusbar, touch));

        this.addChild(this.scorebar);
        this.addChild(this.statusbar);
        this.addChild(this.messagebar);

        this.blockGposUpdates = false;
        this.activeRow = 0;
        this.scorebar.getStatus();

        this.pyramid = [];
        this.selection = [];
        this.free = [];
        this.gameOver = false;

        eskv.rand.setSeed(this.scorebar.gameId>0?this.scorebar.gameId:Date.now());
        const cons = eskv.rand.chooseN(tileSet, (boardSize-1)*boardSize/2);
        const vow = eskv.rand.chooseN(vowelSet, 3 + boardSize);
        const target = cons.concat(vow).map(l => l[1]).reduce((prev,cur)=>prev+cur);
        this.scorebar.target = [3 * target, 4 * target, 5 * target];

        for (let y = 0; y < boardSize; y++) {
            const letters = cons.slice(0, boardSize - y - 1).concat(vow.slice(0, 1));
            eskv.rand.shuffle(letters);
            this.pyramid.push(letters.map(([l, v]) => new Tile(this, -1, -1, l, v, y, y === 0)));
            cons.splice(0, boardSize - y - 1);
            vow.splice(0, 1);
            this.pyramid[y].forEach(w => this.addChild(w));
        }

        for (let x = 0; x < 3; x++) {
            const lv = vow.pop();
            if(lv) {
                let [l, v] = lv;                
                const t = new Tile(this, -1, -1, l, v, -1, true);
                this.free.push(t);
                this.addChild(t);    
            }
        }

        this.opyramid = this.pyramid.map(p => p.slice());
        this.ofree = this.free.slice();

        this.firstStart = true;
    }

    pos2gpos(pos) {
        return [
            Math.floor((pos[0] - this.offX) / this.tileSpaceSize),
            Math.floor((pos[1] - this.offY) / this.tileSpaceSize)
        ];
    }

    nextGame() {
        if (this.scorebar.score > 0) {
            this.scorebar.played += 1;
        }
        this.scorebar.gameId += 1;
        this.reset(true);
    }

    prevGame() {
        if (this.scorebar.gameId > 1) {
            if (this.scorebar.score > 0) {
                this.scorebar.played += 1;
            }
            this.scorebar.gameId -= 1;
        }
        this.reset(true);
    }

    restartGame() {
        if (this.scorebar.score > 0) {
            this.scorebar.played += 1;
        }
        this.reset();
    }

    reset(redraw = false) {
        setTimeout(() => this.resetTick(-1), 10);
        this.scorebar.score = 0;
        this.statusbar.word = '';
        this.statusbar.wordScore = 0;
        this.activeRow = 0;
        this.selection = [];
        this.pyramid = this.opyramid.map(p => p.slice());
        this.free = this.ofree.slice();

        if(redraw) {
            eskv.rand.setSeed(this.scorebar.gameId>0?this.scorebar.gameId:Date.now());
            const cons = eskv.rand.chooseN(tileSet, (boardSize-1)*(boardSize)/2);
            const vow = eskv.rand.chooseN(vowelSet, 3 + boardSize);
            const target = cons.concat(vow).map(l => l[1]).reduce((prev,cur)=>prev+cur);
            this.scorebar.target = [3 * target, 4 * target, 5 * target];
    
            for (const t of this.free) {
                const ls = vow.pop();
                if(ls) {
                    const [l,v] = ls
                    t.letter = l;
                    t.value = v;    
                }
                t.cpos = t.gpos = [-1, -1];
            }    
            for (const row of this.pyramid) {
                const letters = cons.slice(0, row.length - 1).concat(vow.slice(0, 1));
                eskv.rand.shuffle(letters);
                for (const t of row) {
                    const lv = letters.shift();
                    if(lv) {
                        t.letter = lv[0];
                        t.value = lv[1];    
                    }
                    t.cpos = [-1, -1];
                    t.gpos = [-1, -1];
                }
                cons.splice(0, row.length - 1);
                vow.splice(0, 1);
            }
        } else {
            for (const t of this.free) {
                t.cpos = t.gpos = [-1, -1];
            }    
            for (const row of this.pyramid) {
                for (const t of row) {
                    t.cpos = [-1, -1];
                    t.gpos = [-1, -1];
                }
            }
        }
        this._needsLayout = true;

        this.gameOver = false;
    }

    resetTick(i) {
        let arr;
        if (i === -1) {
            this.blockGposUpdates = true;
            arr = this.free;
        } else {
            arr = this.pyramid[i];
        }
        for (const t of arr) {
            t.gpos = t.cpos.slice();
            t.opos = t.cpos.slice();
            t.selected = false;
            t.active = t.row === this.activeRow || i === -1;
        }
        i += 1;
        if (i < boardSize) {
            setTimeout(() => this.resetTick(i), 100);
        } else {
            this.blockGposUpdates = false;
        }
    }

    updateSelection() {
        this.selection.forEach((t, i) => {
            t.gpos = this.spos2pos(i);
        });
    }

    updateFreeTiles() {
        this.free.forEach((t, i) => {
            const pos = this.fpos2pos(i);
            t.cpos = t.opos = t.gpos = pos;
        });
    }

    /**
     * 
     * @param {null|number} row 
     */
    updatePyramidRowTiles(row = null) {
        if (row === null) {
            row = this.activeRow;
        }
        const r = this.pyramid[this.activeRow];
        r.forEach((t, i) => {
            const pos = this.ppos2pos([i, this.activeRow]);
            t.cpos = t.opos = t.gpos = pos;
        });
    }

    convPos(gpos) {
        return [Math.floor(gpos[0]), Math.floor(gpos[1])];
    }

    ppos2pos(ppos) {
        if (ppos[0] === -1 && ppos[1] === -1) {
            return [this.size[0] / 2, this.size[1]];
        } else {
            return [
                this.center_x + this.tileSpaceSize * (ppos[0] - 0.5 * (this.pyramid[ppos[1]].length)),
                this.size[1] - (0.2 * this.size[1] + this.tileSpaceSize * (boardSize - 1 - ppos[1]))
            ];
        }
    }

    spos2pos(spos) {
        if (spos === -1) {
            return [this.size[0] / 2, this.size[1]];
        } else {
            return [
                this.center_x + this.tileSpaceSize * (spos - 0.5 * (this.selection.length)),
                0.25 * this.size[1]
            ];
        }
    }

    fpos2pos(fpos) {
        if (fpos === -1) {
            return [this.size[0] / 2, this.size[1]];
        } else {
            const sz = boardSize + 1;
            let rowLen = sz;
            if (Math.floor(fpos / sz) < Math.floor(this.free.length / sz)) {
                rowLen = sz;
            } else {
                rowLen = this.free.length % sz;
            }
            return [
                this.center_x + this.tileSpaceSize * (fpos % sz - 0.5 * rowLen),
                this.size[1] - (this.offY + 0.88 * this.size[1] - this.tileSpaceSize * Math.floor(fpos / sz))
            ];
        }
    }

    /**@type {eskv.BoxLayout['layoutChildren']} */
    layoutChildren() {
/*
1 Score              Game 1              Tile
2                    * * *
3
4            F R E E L E T T E R S
5
6               S E L E C T E D
7
8                A B C D E F G
9                 A B C D E F
10                 A B C D E
11                  A B C D
12                   A B C
13                    A B
14                     A
15
16             [WORD for 36 pts]
17
18
*/

        this.tileSpaceSize = Math.min(this.size[0], 0.5 * this.size[1]) / boardSize;
        this.tileSize = this.tileSpaceSize - 0.01*this.size[1]; // - 4;
        this.pyramidSize = boardSize * this.tileSpaceSize;
        this.offX = 0;
        this.offY = 0;
        
        [this.statusbar.w,this.statusbar.h]= [this.size[0] * 3 / 4, 0.06 * this.size[1]];
        [this.statusbar.x, this.statusbar.y] = [this.size[0] / 8, this.size[1]-(0.04 * this.size[1] + (this.offY + 0.04 * this.size[1] + 0.06 * this.size[1]) / 2)];
        [this.messagebar.w,this.messagebar.h] = [this.size[0], 0.04 * this.size[1]];
        [this.messagebar.x,this.messagebar.y] = [0, this.size[1]];
        [this.scorebar.w,this.scorebar.h] =  [this.size[0], 0.1 * this.size[1]];
        [this.scorebar.x,this.scorebar.y] =   [0, 0];

        this.pyramid.forEach((row, y) => {
            row.forEach((t, x) => {
                const pos = this.ppos2pos([x, y]);
                t.opos = t.gpos = pos;
                [t.w, t.h] = new eskv.Vec2([this.tileSize, this.tileSize]);
            });
        });

        this.free.forEach((t, x) => {
            const pos = this.fpos2pos(x);
            t.opos = t.gpos = pos;
            [t.w, t.h] = new eskv.Vec2([this.tileSize, this.tileSize]);
        });

        this.selection.forEach((t, x) => {
            t.gpos = this.spos2pos(x);
            [t.w, t.h] = [this.tileSize, this.tileSize];
        });

        if (this.firstStart) {
            this.firstStart = false;
        }
        super.layoutChildren();
    }

    updateWordBar() {
        const [word, wordScore] = this.isSelectionAWord();
        this.statusbar.word = word;
        this.statusbar.wordScore = wordScore;
    }

    deselect(tile) {
        this.blockGposUpdates = true;
        this.selection.forEach(t => {
            t.gpos = t.opos.slice();
            t.selected = false;
        });
        this.selection = [];
        this.blockGposUpdates = false;
        this.updateWordBar();
        sounds.CANCEL_SELECTION.play();
    }

    select(tile) {
        this.blockGposUpdates = true;
        this.selection.push(tile);
        tile.selected = true;
        this.updateSelection();
        this.blockGposUpdates = false;
        this.updateWordBar();
    }

    /**
     * Checks that the selected tiles form a valid word
     * @returns {[string, number]}
     */
    isSelectionAWord() {
        const candidate = this.selection.map(s => s.letter).join('');
        const sumValue = this.selection.reduce((acc, s) => acc + s.value, 0);
        if (SevenWordsApp.get().words.has(candidate)) {
            return [candidate, sumValue * candidate.length];
        }
        return ['', 0];
    }

    confirmWord(widget, touch) {
        if (!widget.collide(touch.rect)) {
            return;
        }
        if (this.gameOver) {
            if (this.statusbar.wordScore === -1) {
                sounds.MENU.play();
                this.nextGame();
            } else if (this.statusbar.wordScore === -2) {
                sounds.MENU.play();
                this.restartGame();
            }
            return;
        }
        if (this.statusbar.word === '') {
            return;
        }

        // if (platform === 'android') {
        //     const ws = this.statusbar.wordScore;
        //     const word = this.statusbar.word;
        //     if (word.length >= 3) {
        //         if (word.length >= 9) {
        //             App.getRunningApp().gsAchieve(`achievement_${word.length}_letter_word`);
        //         } else {
        //             App.getRunningApp().gsIncAchieve(`achievement_${word.length}_letter_word`);
        //         }
        //     }
        // }

        const wordScore = this.statusbar.wordScore;
        const hiScore = this.scorebar.hiScore;
        this.scorebar.score += wordScore;
        this.statusbar.word = '';
        this.statusbar.wordScore = 0;

        // Reset the selected tiles
        this.selection.forEach(t => {
            t.active = false;
            t.selected = false;
            if (this.free.includes(t)) {
                this.free.splice(this.free.indexOf(t), 1);
            }
        });

        // Remove unused tiles from the pyramid row to the free space
        this.pyramid[this.activeRow].forEach(t => {
            if (!this.selection.includes(t)) {
                this.free.push(t);
            }
        });

        this.updateFreeTiles();

        // Move the selection back to the pyramid
        this.pyramid[this.activeRow] = this.selection;
        this.updatePyramidRowTiles();

        // Empty the selection
        this.selection = [];

        // Update the position of the free tiles
        this.updateFreeTiles();

        // Now activate the next row
        this.activeRow += 1;
        if (this.activeRow < boardSize) {
            this.pyramid[this.activeRow].forEach(t => {
                t.active = true;
            });
        }

        sounds.WORD_COMPLETED.play();

        if (this.scorebar.score > hiScore) {
            if (this.scorebar.score >= this.scorebar.target[2] && this.scorebar.score - wordScore < this.scorebar.target[2]) {
                setTimeout(() => sounds.WORD_COMPLETED.play(), 250);
                setTimeout(() => sounds.WORD_COMPLETED.play(), 500);
                setTimeout(() => sounds.WORD_COMPLETED.play(), 750);
            } else if (this.scorebar.score >= this.scorebar.target[1] && this.scorebar.score - wordScore < this.scorebar.target[1]) {
                setTimeout(() => sounds.WORD_COMPLETED.play(), 250);
                setTimeout(() => sounds.WORD_COMPLETED.play(), 500);
            } else if (this.scorebar.score >= this.scorebar.target[0] && this.scorebar.score - wordScore < this.scorebar.target[0]) {
                setTimeout(() => sounds.WORD_COMPLETED.play(), 250);
            }
        }

        this.checkGameOver();
    }

    checkGameOver() {
        if (this.activeRow < boardSize) {
            const tiles = this.pyramid[this.activeRow].concat(this.free).map(t => t.letter);
            if (tiles.length <= 6) {
                // Check all permutations for small tile sets
                const words = SevenWordsApp.get().words;
                for (let i = 2; i <= 6; i++) {
                    for (let w of permutations(tiles, i)) {
                        if (words.has(w.join(''))) {
                            return;
                        }
                    }
                }
            } else {
                // Crude heuristic for larger tile sets
                const vlike = 'AEIOUY';
                for (let v of vlike) {
                    if (tiles.includes(v)) {
                        return;
                    }
                }
            }
        }

        if (this.activeRow < boardSize) {
            this.pyramid[this.activeRow].forEach(t => t.active = false);
        }
        this.free.forEach(t => t.active = false);
        this.gameOver = true;

        if (this.scorebar.hiScore >= this.scorebar.target[0]) {
            this.statusbar.word = 'NEXT GAME';
            this.statusbar.wordScore = -1;
            setTimeout(() => sounds.LEVEL_COMPLETED.play(), 1000);
        } else {
            this.statusbar.word = 'REPLAY GAME';
            this.statusbar.wordScore = -2;
            setTimeout(() => sounds.LEVEL_FAILED.play(), 1000);
        }
    }
}


class SevenWordsApp extends eskv.App {
    constructor(words) {
        super();
        this.words = words;
        this.instructions = new Instructions();
        this.menu = new Menu();
        this.menu.bind('selection', (e,o,v)=>this.menuChoice(this.menu,v));
        const themeName = localStorage.getItem('7Words/theme')??'beach';
        this.colors = colors.loadTheme(themeName);
        this.board = new Board();
        this.board.scorebar.bind('gameId', (e,o,v)=>{
            this.menu.uiUpdate(this.board.scorebar);
            this.board.messagebar.gameId=v;
        });
        this.board.scorebar.bind('score', (e,o,v)=>SevenWordsApp.get().menu.uiUpdate(this.board.scorebar));
        this.baseWidget.children = [
            this.board
        ];
    }
    showMenu() {
        this.menu.selection = -1;
        this.menu.popup();
    }
    hideMenu() {
        this.menu.close();
    }
    menuChoice(menu, selection) {
        switch (selection) {
            case 1:
                this.hideMenu();
                this.board.restartGame();
                break;
            case 2:
                this.hideMenu();
                this.board.nextGame();
                break;
            case 3:
                this.hideMenu();
                this.board.prevGame();
                break;
            case 4:
                this.hideMenu();
                this.instructions.popup();
                break;
            case 5:
                this.hideMenu();
                break;
            case 6:
                this.hideMenu();
                break;
            case 7:
                this.setNextTheme();
                this.hideMenu();
                this.showMenu();
                break;
        }
    }
    on_key_down(event, object, keyInfo) {
        if('Escape' in keyInfo.states && keyInfo.states['Escape']) {
            if(this.instructions.parent!==null) this.instructions.close();
            if(this.menu.parent===null) this.showMenu();
            else this.hideMenu();
        }
    }
    setNextTheme() {
        const themes = Object.keys(colors.themes);
        const ind = (themes.indexOf(this.colors['id'])+1)%themes.length;
        if(ind>=0) {
            this.colors = colors.loadTheme(themes[ind]);
            localStorage.setItem('7Words/theme', themes[ind]);
        }
    }
    /**
     * 
     * @returns {SevenWordsApp}
     */
    static get() {
        return /**@type {SevenWordsApp}*/(super.get());
    }
}

loadWords('resources/TWL06.txt').then(words => {
    var app = new SevenWordsApp(words);
    app.start();
});