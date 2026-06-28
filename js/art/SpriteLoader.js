window.Game = window.Game || {};

Game.SpriteLoader = (function () {
    const TILE_PATH = 'assets/tiles/';
    const CHAR_PATH = 'assets/characters/';

    // roguelike-rpg.png 和 caves.png 都是 17px stride（16+1 gap）
    function cut(baseName, col, row) {
        const s  = 17;
        const bt = PIXI.utils.TextureCache[baseName];
        if (!bt) return PIXI.Texture.WHITE;
        const rect = new PIXI.Rectangle(col * s, row * s, 16, 16);
        const tex  = new PIXI.Texture(bt.baseTexture, rect);
        tex.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        return tex;
    }

    function load(onDone) {
        const loader = PIXI.Loader.shared;

        loader.add('sheet_rpg',   TILE_PATH + 'roguelike-rpg.png');
        loader.add('sheet_caves', TILE_PATH + 'roguelike-caves.png');
        // 只載入玩家用的騎士 tile
        loader.add('char_knight', CHAR_PATH + 'tile_0087.png');

        loader.load((_l, res) => {
            // 確保 baseTexture 也是 NEAREST
            res.sheet_rpg.texture.baseTexture.scaleMode   = PIXI.SCALE_MODES.NEAREST;
            res.sheet_caves.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
            res.char_knight.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

            // 根據顏色分析確認的座標（roguelike-rpg.png，stride=17）
            // col=5,row=0 → 鮮綠草地  col=0,row=0 → 青藍水
            // col=6,row=0 → 棕色泥土  col=7,row=0 → 灰色石地
            // col=8,row=0 → 米色沙地  col=0,row=6 → 深橄欖草
            Game.SpriteLoader.textures = {
                GRASS         : cut('sheet_rpg',   5,  0),
                GRASS_DARK    : cut('sheet_rpg',   0,  6),
                DIRT          : cut('sheet_rpg',   6,  0),
                STONE         : cut('sheet_rpg',   7,  0),
                SAND          : cut('sheet_rpg',   8,  0),
                WATER         : cut('sheet_rpg',   0,  0),
                WATER_SHALLOW : cut('sheet_rpg',   3,  0),
                ICE           : cut('sheet_rpg',   9,  0),
                LAVA          : cut('sheet_caves', 1,  3),
                VOID          : cut('sheet_caves', 5,  3),

                // 角色：只用騎士單幀，走路用 bob 動畫
                CHAR_KNIGHT: res.char_knight.texture,
            };

            onDone();
        });
    }

    return { load };
})();
