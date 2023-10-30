//@ts-check
import * as eskv from "../eskv/lib/eskv.js";
import { QDraw } from "./app.js";

function setColor(event, object, value) {
    let sel = QDraw.get().controlSurface.selection;
    if(sel.length===0) sel = [QDraw.get().drawing];
    const affects = QDraw.get().palette.affects
    if(affects==="fill") {
        sel.forEach((sh)=>sh.fillColor = object.bgColor);
    } else if (affects==="stroke") {
        sel.forEach((sh)=>sh.lineColor = object.bgColor);
    }
}

function clearColor(event, object, value) {
    let sel = QDraw.get().controlSurface.selection;
    if(sel.length===0) sel = [QDraw.get().drawing];
    const affects = QDraw.get().palette.affects
    if(affects==="fill") {
        sel.forEach((sh)=>sh.fillColor = null);
    } else if (affects==="stroke") {
        sel.forEach((sh)=>sh.lineColor = null);
    }
}

async function loadPaletteList() {
    const response = await fetch('./palettes/palettes.list');
    const text = await response.text();
    return text.split('\n');
}

function palettePicker(e, o, v) {
    let loader = new eskv.ModalView({
        orientation: 'vertical',
        hints: {x:0.3,y:0.3,w:0.4,h:0.4},
    });
    let scroll = new eskv.ScrollView({scrollW:false, hints:{x:0,y:0,w:1,h:1}});
    let box = new eskv.BoxLayout({scrollW:false, hints:{x:0,y:0,w:1,h:null}, paddingX:'1.0'});
    loader.children = [scroll];
    scroll.children = [box];
    loader.popup();

    loadPaletteList().then((lines) => {
        for(let line of lines) {
            box.addChild(new eskv.Button({
                text: line.trim(),
                on_press: (e, o, v) => {
                    const qpalette = QDraw.get().palette.customPalette
                    const palFile = './palettes/'+o.text;
                    fetchGimpPalette(palFile).then((palette)=>qpalette.setup(palette));
                    loader.close();
                }
            }));
        }
        QDraw.get().requestFrameUpdate();
    });
}    


class PaletteColor {
    constructor(r, g, b, name) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.name = name;
    }
}

class GimpPalette {
    constructor() {
        this.type = "";
        this.name = "";
        this.columns = 0;
        this.comments = "";
        this.colors = [];
    }

    addColor(color) {
        this.colors.push(color);
    }

    get rows() {
        return Math.ceil(this.colors.length/this.columns);
    }
}

/**
 * 
 * @param {string} filePath 
 * @returns 
 */
async function fetchGimpPalette(filePath) {
    const response = await fetch(filePath);
    const text = await response.text();
    const lines = text.split('\n');
    const palette = new GimpPalette();
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        if (line.startsWith("GIMP")) {
            palette.type = "Gimp palette";
        } else if (line.startsWith("Name:")) {
            palette.name = line.split("Name:")[1].trim();
        } else if (line.startsWith("Columns:")) {
            palette.columns = parseInt(line.split("Columns:")[1].trim(), 10);
        } else if (line.startsWith("#")) {
            palette.comments = line.slice(1).trim();
        } else {
            const parts = line.split(/\s+/);
            const r = parseInt(parts[0], 10);
            const g = parseInt(parts[1], 10);
            const b = parseInt(parts[2], 10);
            const name = parts.slice(3).join(' ');
            const color = new PaletteColor(r, g, b, name);
            palette.addColor(color);
        }
    }
    return palette;
}


class LabeledSlider extends eskv.BoxLayout {
    /**@type {eskv.BoxLayout['orientation']} */
    orientation = "horizontal";
    /**
     * 
     * @param {import("../eskv/lib/modules/widgets.js").BoxLayoutProperties|null} props 
     */
    constructor(props = null) {
        super({orientation: 'horizontal'});
        this.label = new eskv.Label({fontSize: '0.02ah', align:'left'});
        this.slider = new eskv.Slider({orientation: 'horizontal', hints:{w:0.8}});
        this.children = [this.label, this.slider]
        if(props!==null) this.updateProperties(props);
    }
    set min(value) {
        this.slider.min = value;
    }
    set max(value) {
        this.slider.max = value;
    }
    set text(value) {
        this.label.text = value;
    }
}

class ColorPickedPopup extends eskv.ModalView {
    color = `rgb(0,0,0)`;
    /**
     * 
     * @param {import("../eskv/lib/modules/widgets.js").ModalViewProperties|null} props 
     */
    constructor(props=null) {
        super();
        if(props) this.updateProperties(props);
        this.children = [
            new eskv.Widget({bgColor: this.color, hints:{h:"0.08ah"}}),
            new eskv.Button({text:'Set fill', on_press: (e,o,v) => {
                let sel = QDraw.get().controlSurface.selection;
                if(sel.length===0) sel = [QDraw.get().drawing];
                for(let sh of sel) {
                    sh.fillColor = this.color;
                }
                this.close();
            }}),
            new eskv.Button({text:'Set stroke', on_press: (e,o,v) => {
                let sel = QDraw.get().controlSurface.selection;
                if(sel.length===0) sel = [QDraw.get().drawing];
                for(let sh of sel) {
                    sh.lineColor = this.color;
                }
                this.close();
            }}),
            new eskv.Button({text:'Edit color', on_press: (e,o,v) => {
            }}),
        ]
    }
}

export class QCustomPalette extends eskv.BoxLayout {
    /**@type {'vertical'|'horizontal'} */
    orientation = "vertical";
    /**@type {"fill"|"stroke"} */
    affects = "fill";
    /**
     * 
     * @param {import("../eskv/lib/modules/widgets.js").BoxLayoutProperties|null} properties 
     */
    constructor(properties=null) {
        super();
        if(properties) this.updateProperties(properties)
        let qpalette = this;
        // fetchGimpPalette('./palettes/Android-icon-palette.gpl').then((palette)=>qpalette.setup(palette));
        // fetchGimpPalette('./palettes/Grafxkid-2016-01-23-TLP.gpl').then((palette)=>qpalette.setup(palette));
        fetchGimpPalette('./palettes/Windows-MFC-hexagonal.gpl').then((palette)=>qpalette.setup(palette));

    }
    setup(gimpPalette) {
        let K = gimpPalette.columns;
        let N = gimpPalette.rows;
        let grid = new eskv.GridLayout({
            orientation:"vertical",
            numX: K,
            numY: K,
        });
        this.affecs = "fill";
        this.grid = grid;
        this.layoutFile = new eskv.BoxLayout({orientation:'horizontal', hints:{h:'0.04ah'},
            children: [
                // new eskv.Button({text:'New'}),
                // new eskv.Button({text:'Save'}),
                new eskv.Button({text:'Palette library', on_press:palettePicker}),
            ]
        });
        this.layoutGridNumColors = new eskv.BoxLayout({orientation:'horizontal', hints:{h:'0.04ah'},
            children: [
                new eskv.Label({text:'Colors'}),
                new eskv.TextInput({text:''+gimpPalette.colors.length}),
            ]
        });
        this.layoutGridRows = new eskv.BoxLayout({orientation:'horizontal', hints:{h:'0.04ah'},
            children: [
                new eskv.Label({text:'Rows'}),
                new eskv.TextInput({text:''+grid.numY}),
            ]
        });
        for(let c of gimpPalette.colors) {
            grid.addChild(new eskv.Button({text:'', outlineColor:'black', 
                hints: {},
                bgColor: eskv.color.Color.stringFromValues(c.r, c.g, c.b),
                on_press: setColor, 
            }));
        }
        this.children = [
            this.grid,
            this.layoutGridNumColors,
            this.layoutGridRows,
            this.layoutFile,
        ];
        QDraw.get().requestFrameUpdate();
    }
}


export class QDynamicPalette extends eskv.BoxLayout {
    /**@type {'vertical'|'horizontal'} */
    orientation = "vertical";
    deSat = 0;
    deVal = 0;
    deHue = 0;
    /**
     * 
     * @param {import("../eskv/lib/modules/widgets.js").BoxLayoutProperties|null} properties 
     */
    constructor(properties=null) {
        super();
        const palette = [];
        let K = 16;
        let N = 4;
        this.numY = N;
        this.numX = N;
        if(properties) this.updateProperties(properties)

        this.hueSlider = new LabeledSlider({text: 'Hue', orientation:"horizontal", min:0,max:1/K, hints:{h:0.05}});
        this.satSlider = new LabeledSlider({text: 'Sat', orientation:"horizontal", max:1/N, hints:{h:0.05}});
        this.valSlider = new LabeledSlider({text: 'Val', orientation:"horizontal", hints:{h:0.05}});
        let grid = new eskv.GridLayout({
            orientation:"horizontal",
            numX: N,
            numY: N,
        })
        this.grid = grid;
        for (let h = 0; h < 1; h += 1/K) { // Covering all hues from 0 to 1 (360 degrees)
            for (let n = 1; n < N+1; n++) {
                grid.addChild(new eskv.Button({text:'', outlineColor:'black',
                    hints: {},
                    on_press: setColor,
                }));
            }
        }
        this.addChild(grid);
        this.addChild(this.hueSlider);
        this.addChild(this.satSlider);
        this.addChild(this.valSlider);
        let cb = (event,object,data)=>this.tweakPalette(event, object, data);
        this.hueSlider.slider.bind('value', cb);
        this.satSlider.slider.bind('value', cb);
        this.valSlider.slider.bind('value', cb);
        this.hueSlider.slider.value = 0;
    }
    tweakPalette(event, object, data) {
        let K = 16;
        let N = 4;
        let deSat = this.satSlider.slider.value;
        let deHue = this.hueSlider.slider.value;
        let deVal = this.valSlider.slider.value;
        let i = 0;
        for (let h = 0; h < 1; h += 1/K) { // Covering all hues from 0 to 1 (360 degrees)
            for (let n = 1; n < N+1; n++) {
                let hue = h+deHue;
                let s = n/N-deSat; //(n % Math.sqrt(N+1)) / Math.sqrt(N+1);
                let v = 1-deVal;//(N+1-n)/(N+1); //- Math.floor(n / Math.sqrt(N+1)) / Math.sqrt(N+1);
                let color = eskv.color.Color.fromHSV(hue*360, s*100, v*100);
                let bgColor = color.toString();
                this.grid.children[i].bgColor = bgColor;
                i++;
            }
        }

    }

}



export class QPalette extends eskv.BoxLayout {
    /**@type {'vertical'|'horizontal'} */
    orientation = "vertical";
    /**@type {'fill'|'stroke'} */
    affects = 'fill';
    /**
     * 
     * @param {import("../eskv/lib/modules/widgets.js").BoxLayoutProperties|null} properties 
     */
    constructor(properties=null) {
        super();
        this.dynamicPalette = new QDynamicPalette({});
        this.customPalette = new QCustomPalette({});
        if(properties) this.updateProperties(properties);
        this.children = [
            new eskv.Label({text: 'Palette', align:'left', fontSize:'0.015ah', hints:{h:'0.02ah'}}),
            new eskv.BoxLayout({orientation:'horizontal', hints: {h:'0.04ah'},
                children: [
                    new eskv.ToggleButton({text:'Dynamic', group: 'palettePicker', press:true,
                        on_press: (e,o,v) => {
                            if(!this._children.find(c=>c===this.customPalette)) return
                            this.removeChild(this.customPalette, false);
                            this.addChild(this.dynamicPalette);
                        }
                    }),
                    new eskv.ToggleButton({text:'Custom', group: 'palettePicker',
                        on_press: (e,o,v) => {
                            if(!this._children.find(c=>c===this.dynamicPalette)) return
                            this.removeChild(this.dynamicPalette, false);
                            this.addChild(this.customPalette);
                        }
                }),
                ],
            }),
            new eskv.BoxLayout({orientation:'horizontal', hints: {h:'0.04ah'},
            children: [
                new eskv.Button({ //Toggle mode between fill and stroke 
                    text: 'Fill',
                    on_press: (event,object,value)=>{
                        object.text = object.text==="Fill"? "Stroke":"Fill";
                        this.affects = object.text==="Fill"? "fill": "stroke";    
                    }
                }),
                new eskv.Button({ //Clear out color
                    text: 'X',
                    on_press: clearColor,
                }),
                new eskv.Button({ //Black
                    text: '',
                    bgColor: 'rgba(0,0,0,1)',
                    on_press: setColor, 
                }),
                new eskv.Button({ //White
                    text: '',
                    bgColor: 'rgba(255,255,255,1)',
                    on_press: setColor, 
                }),   
            ],
        }),
        this.dynamicPalette,
        ]
    }

}
