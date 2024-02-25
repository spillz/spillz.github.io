//@ts-check
import * as eskv from "../eskv/lib/eskv.js";
import { parse } from "../eskv/lib/modules/markup.js";
import { TileMap, SpriteSheetSelector, TileMapPainter } from "./tilemap.js";

//For now you have to register all classes that you access in markup
eskv.App.registerClass('TileMap', TileMap, 'Widget');
eskv.App.registerClass('TileMapPainter', TileMapPainter, 'TileMap');
eskv.App.registerClass('SpriteSheetSelector', SpriteSheetSelector, 'TileMap');

//The markup specifies the overall UI layout in the App
const markup = `
App:
    prefDimW: 20
    prefDimH: 20
    tileSize: 16
    BoxLayout:
        orientation: 'horizontal'
        hints: {center_x:0.5, center_y:0.5, w:1, h:1}
        TileMapPainter:
            brush: spriteSelector.activeCellIndex
            hints: {w:null, h:null}
            w: 20
            h: 20
            id: 'map'
            spriteSrc: "./colored-transparent_packed.png"
            spriteSize: 16
            tileW: 20
            tileH: 20
        BoxLayout:
            paddingX: '1'
            paddingY: '1'
            ScrollView:
                SpriteSheetSelector:
                    hints: {w:null, h:null}
                    w: 49
                    h: 22
                    id: 'spriteSelector'
                    spriteSrc: "./colored-transparent_packed.png"
                    spriteSize: 16
                    tileW: 49
                    tileH: 22
`;


parse(markup);

const gameMap = /**@type {TileMap}*/(eskv.App.get().findById('map'));
gameMap._data.fill(3);
for(let pos of gameMap.iterRect([1,1,18,18])) {
    gameMap.set(pos, Math.floor(0));
}

const spriteSelector = /**@type {TileMap}*/(eskv.App.get().findById('spriteSelector'));
let i=0;
for(let pos of spriteSelector.iterAll()) {
    spriteSelector.set(pos, i);
    i++;
}


//Start the app
eskv.App.get().start();
