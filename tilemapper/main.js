//@ts-check
import * as eskv from "../eskv/lib/eskv.js";
import { parse } from "../eskv/lib/modules/markup.js";
import { TileMap } from "../eskv/lib/modules/sprites.js";
import { SpriteSheetSelector, TileMapPainter, PainterUI, AnimatorUI, TilestampUI, AutoTilerUI } from "./tilemap.js";
import * as util from "./util.js";

eskv.App.resources['sprites'] = new eskv.sprites.SpriteSheet('./colored-transparent_packed.png', 16);
//For now you have to register all classes that you access in markup
eskv.App.registerClass('TileMapPainter', TileMapPainter, 'TileMap');
eskv.App.registerClass('SpriteSheetSelector', SpriteSheetSelector, 'TileMap');
eskv.App.registerClass('PainterUI', PainterUI, 'BoxLayout');
eskv.App.registerClass('AnimatorUI', AnimatorUI, 'BoxLayout');
eskv.App.registerClass('TilestampUI', TilestampUI, 'BoxLayout');
eskv.App.registerClass('AutoTilerUI', AutoTilerUI, 'BoxLayout');

eskv.App.rules.add('Label', {sizeGroup:"'commonText'"});
eskv.App.rules.add('TextInput', {sizeGroup:"'commonText'", ignoreSizeForGroup:true});
eskv.App.rules.add('Button', {sizeGroup:"'commonText'"});
eskv.App.rules.add('ToggleButton', {sizeGroup:"'commonText'"});

/**
 * @param {eskv.Widget} widget 
 * @param {string} name
 * @param {number} scale 
 * @param {string|null} background
 */
function exportWidgetToPNG(widget, name, scale, background=null) {
    const offscreen = new OffscreenCanvas(widget.w*scale, widget.h*scale);

    const ctx = offscreen.getContext("2d");
    if(!ctx) return;
    if(background) {
        const ofs = ctx.fillStyle;
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, widget.w*scale, widget.h*scale);
        ctx.fillStyle = ofs;
    }
    if(!ctx) return;
    ctx.scale(scale, scale);
    ctx.translate(-widget.x, -widget.y);
    widget._draw(eskv.App.get(), ctx, 0);

    const dataURL = offscreen.convertToBlob().then(blob => {
        const url = URL.createObjectURL(blob);
    
        // To prompt the user to download the image
        const a = document.createElement('a');
        a.href = url;
        a.download = name+'.png';
        a.click();
    
        URL.revokeObjectURL(url);
        document.removeChild(a);
    });    
}

class FPS extends eskv.Label {
    _counter = 0;
    _frames = 0;
    _worst = 300;
    _tref = Date.now()
    _badFrameCount = 0;
    /**@type {eskv.Label['update']} */
    update(app, millis) {
        super.update(app, millis);
        const tref = Date.now()
        this._counter += tref - this._tref;
        this._frames += 1;
        const currentFPS = 1000/(tref-this._tref);
        this._tref= tref;
        this._badFrameCount += currentFPS<50?1:0;
        if(currentFPS<this._worst) this._worst = currentFPS;
        if(this._counter>=1000) {
            this.text = `FPS: ${Math.round(this._frames/this._counter*1000)} (worst: ${Math.round(this._worst)}, # >20ms: ${Math.round(this._badFrameCount)})`;
            this._counter = 0;
            this._frames = 0;
            this._worst = 300;
            this._badFrameCount = 0;
        }
    }
}

eskv.App.registerClass('FPS', FPS, 'Label');


//@ts-ignore
window.exporter = exportWidgetToPNG;
//@ts-ignore
window.uploader = util.loadUserImage;

//TODO: Add upload and export commands (export prefab, animation, autotiles, and tileStamp)
//TODO: How to handle multiple layers on a tilemap?
//TODO: Reference a spriteSheet as an App.resources object? (define App.resources as a Map<string, object>)
//TODO: The markup problem that ID's should be searched locally from the root to be able to handle duplicate IDs
//TODO: Tabbed page widget

//The markup specifies the overall UI layout in the App
const markup = `
<Caption@Label>:
    hints: {h:'0.5'}
    align: 'left'


<AnimatorToolbar@BoxLayout>:
    id: 'animatortoolbar'
    orientation: 'horizontal'
    Button:
        text: ' + '
        hints: {w:null}
    Button:
        text: ' X '
        hints: {w:null}
    Button:
        text: '...'
        hints: {w:null}
    ScrollView:
        SpriteSheetSelector:
            spriteSheet: resources['sprites']
            tileDim: [10, 1]

<TilestampToolbar@BoxLayout>:
    tileDim: [10,1]
    hints: {w:null, h:null}
    w:20
    h:1
    orientation: 'horizontal'
    hints: {h:'1'}
    Button:
        text: ' + '
        hints: {w:null}
    Button:
        text: ' X '
        hints: {w:null}
    Button:
        text: '...'
        hints: {w:null}
    ScrollView:
        SpriteSheetSelector:
            spriteSheet: resources['sprites']
            tileDim: [10, 1]
    
<AutotileToolbar@BoxLayout>:
    orientation: 'horizontal'
    Button:
        text: ' + '
        hints: {w:null}
    Button:
        text: ' X '
        hints: {w:null}
    Button:
        text: '...'
        hints: {w:null}
    ScrollView:
        SpriteSheetSelector:
            spriteSheet: resources['sprites']
            tileDim: [10, 1]
    
App:
    prefDimW: 20
    prefDimH: 20
    integerTileSize: true
    tileSize: 16
    BoxLayout:
        orientation: 'horizontal'
        hints: {center_x:0.5, center_y:0.5, w:1, h:1}
        TabbedNotebook:
            BoxLayout:
                hints: {w:1, h:1}
                orientation: 'vertical'
                name: 'Tilemap'
                PainterUI:
                    id: 'painterui'
                    spriteSheet: resources['sprites']
                BoxLayout:
                    orientation: 'horizontal'
                    hints: {h:'1'}
                    Button:
                        text: 'Export image'
                        on_press:
                            const painter = window.app.findById('painterui').painter;
                            const ac = painter.activeCell;
                            painter.activeCell = null;
                            window.exporter(painter, painter.id??'tilemap', painter.spriteSheet.spriteSize);
                            painter.activeCell = ac;
                    Button:
                        text: 'Export on black'
                        on_press:
                            const painter = window.app.findById('painterui').painter;
                            const ac = painter.activeCell;
                            painter.activeCell = null;
                            window.exporter(painter, painter.id??'tilemap', painter.spriteSheet.spriteSize, 'black');
                            painter.activeCell = ac;
                    Button:
                        text: 'Copy'
                        on_press:
                            const painter = window.app.findById('painterui').painter;
                            const clipData = painter.serialize();
                            navigator.clipboard.writeText(JSON.stringify(clipData, null, 2));
            TilestampUI:
                id: 'tilestampui'
                name: 'Tilestamps'
                spriteSheet: resources['sprites']
            AnimatorUI:
                id: 'animatorui'
                name: 'Animations'
                spriteSheet: resources['sprites']
            AutoTilerUI:
                id: 'autotilerui'
                name: 'Autotiles'
                spriteSheet: resources['sprites']
        BoxLayout:
            orientation: 'vertical'
            paddingX: '1'
            paddingY: '1'
            FPS:
                hints: {h:'1'}
            Caption:
                text: 'Animations'
            AnimatorToolbar:
                id:'animatortoolbar'
                hints: {h:'1'}
            Caption:
                text: 'Autotiles'
            AutotileToolbar:
                id:'autotiletoolbar'
                hints: {h:'1'}
            Caption:
                text: 'Tilestamps'
            TilestampToolbar:
                id:'tilestamptoolbar'
                hints: {h:'1'}
            Caption:
                text: 'Spritesheet'
            ScrollView:
                SpriteSheetSelector:
                    fullSheet: true
                    flipped: painterui.painter.flipped
                    angle: painterui.painter.angle
                    hints: {w:null, h:null}
                    id: 'spriteSelector'
                    spriteSheet: resources['sprites']
                    on_activeCellIndex:
                        const animator = window.app.findById('animatorui');
                        animator.brush = this.activeCellIndex;
                        const painter = window.app.findById('painterui').painter;
                        painter.brush = this.activeCellIndex;
                        const cellName = window.app.findById('cellTextInput');
                        cellName.text = this.spriteSheet.getAlias(this.activeCellIndex)??'<enter alias>';
                        this.calcTransformedCellIndex();
            BoxLayout:
                hints: {h:'1'}
                orientation: 'horizontal'
                Label:
                    text: 'Sprite size:'
                    hints: {w:null}
                TextInput:
                    text: String(spriteSelector.spriteSheet?.spriteSize??'null');
                    on_focus:
                        if(!this.focus) {
                            const spriteSelector = window.app.findById('spriteSelector');
                            const size = parseInt(this.text);
                            spriteSelector.spriteSheet.spriteSize = size;
                            this.text = size;
                        }
                Label:
                    text: \`Tile: [\${spriteSelector.activeCell[0]}, \${spriteSelector.activeCell[1]}] (#\${spriteSelector.transformedCellIndex})\`
                    hints: {w:'5'}
                TextInput:
                    hints: {w:'3'}
                    id: 'cellTextInput'
                    text: '<enter alias>'
                    on_focus:
                        if(!this.focus) {
                            const spriteSelector = window.app.findById('spriteSelector');
                            const aliasInd = spriteSelector.spriteSheet.aliases.get(this.text);
                            if(aliasInd===this.activeCellIndex || aliasInd===undefined) {
                                spriteSelector.spriteSheet.aliases.set(this.text, spriteSelector.activeCellIndex);
                            } else {
                                this.text = '<name in use>';
                            }    
                        }
                Label:
                    text: 'Flipped'
                    align: 'right'
                CheckBox:
                    hints: {w:'1'}
                    on_check: 
                        window.app.findById('painterui').painter.flipped = this.check;
                        window.app.findById('spriteSelector').flipped = this.check;
                        window.app.findById('animatorui').flipped = this.check;
                Button:
                    text: 'Angle: 0'
                    on_press: 
                        const painter = window.app.findById('painterui').painter;
                        painter.angle = painter.angle<3?painter.angle+1:0;
                        const selector = window.app.findById('spriteSelector');
                        selector.angle = painter.angle;
                        const animator = window.app.findById('animatorui');
                        animator.angle = painter.angle;
                        this.text = \`Angle: \${painter.angle*90}\`;
            BoxLayout:
                hints: {h:'1'}
                orientation: 'horizontal'
                Button:
                    text: 'Spritesheet'
                    on_press:
                        const spriteSelector = window.app.findById('spriteSelector');
                        window.uploader(spriteSelector.spriteSheet.sheet);
                Button:
                    text: 'Save'
                    on_press:
                        const spriteSelector = window.app.findById('spriteSelector');
                        localStorage.setItem('TileMapper/TileMaps/default', JSON.stringify(spriteSelector.spriteSheet.serialize()));
                Button:
                    text: 'Load'
                    on_press:
                        const spriteSelector = window.app.findById('spriteSelector');
                        const storageData = localStorage.getItem('TileMapper/TileMaps/default');
                        if(storageData) spriteSelector.spriteSheet.deserialize(JSON.parse(storageData));
                        spriteSelector.activeCellIndex = 0;
                        const animator = window.app.findById('animatorui');
                        animator.updateAnimations();
                Button:
                    text: 'Copy'
                    on_press:
                        const spriteSelector = window.app.findById('spriteSelector');
                        const clipData = JSON.stringify(spriteSelector.spriteSheet.serialize(), null, 2);
                        navigator.clipboard.writeText(clipData);
#                Button:
#                    text: 'Paste'
            `;


parse(markup);

const gameMap = /**@type {PainterUI}*/(eskv.App.get().findById('painterui'));
gameMap.painter._data.fill(3);
for(let pos of gameMap.painter.data.iterRect([1,1,18,18])) {
    gameMap.painter.set(pos, Math.floor(0));
}

const spriteSelector = /**@type {TileMap}*/(eskv.App.get().findById('spriteSelector'));
let i=0;
for(let pos of spriteSelector.data.iterAll()) {
    spriteSelector.set(pos, i);
    i++;
}

//Start the app
eskv.App.get().start();
