window.Game = window.Game || {};

// 預載入所有素材，完成後呼叫 callback
Game.SpriteLoader = (function () {
    const TILE_PATH = 'assets/tiles/';
    const CHAR_PATH = 'assets/characters/';

    // 從 roguelike-rpg.png spritesheet 切出指定格（17px stride: 16px tile + 1px gap）
    function sheetTex(baseTexName, col, row) {
        const stride = 17;
        const base = PIXI.utils.TextureCache[baseTexName];
        if (!base) return PIXI.Texture.WHITE;
        return new PIXI.Texture(base.baseTexture,
            new PIXI.Rectangle(col * stride, row * stride, 16, 16));
    }

    function load(onDone) {
        const loader = PIXI.Loader.shared;

        // 地形個別 tiles
        const tiles = [1, 3, 5, 7, 8, 14, 31, 43, 44];
        tiles.forEach(n => {
            const name = 'tile_' + String(n).padStart(4, '0');
            loader.add(name, TILE_PATH + name + '.png');
        });

        // Spritesheet
        loader.add('sheet_rpg',   TILE_PATH + 'roguelike-rpg.png');
        loader.add('sheet_caves', TILE_PATH + 'roguelike-caves.png');

        // 角色幀
        [85, 86, 87, 88, 89, 90, 91, 92].forEach(n => {
            const name = 'char_' + String(n).padStart(4, '0');
            loader.add(name, CHAR_PATH + 'tile_' + String(n).padStart(4, '0') + '.png');
        });

        loader.load(() => {
            // 從 RPG spritesheet 預切草地和其他 tile
            Game.SpriteLoader.textures = {
                // tiny-dungeon 個別 tiles
                STONE_FLOOR : PIXI.utils.TextureCache['tile_0031'],
                STONE_WALL  : PIXI.utils.TextureCache['tile_0003'],
                STONE_WALL2 : PIXI.utils.TextureCache['tile_0005'],
                DIRT        : PIXI.utils.TextureCache['tile_0043'],
                DIRT2       : PIXI.utils.TextureCache['tile_0044'],
                BRICK       : PIXI.utils.TextureCache['tile_0001'],
                WATER       : PIXI.utils.TextureCache['tile_0007'],
                WATER2      : PIXI.utils.TextureCache['tile_0008'],
                WATER3      : PIXI.utils.TextureCache['tile_0014'],

                // 從 RPG spritesheet 切割（草地在左上角）
                GRASS       : sheetTex('sheet_rpg', 1, 0),
                GRASS2      : sheetTex('sheet_rpg', 2, 0),
                GRASS3      : sheetTex('sheet_rpg', 0, 1),
                GRASS_DARK  : sheetTex('sheet_rpg', 0, 2),
                SAND        : sheetTex('sheet_rpg', 4, 7),
                ICE         : sheetTex('sheet_rpg', 0, 10),

                // 洞窟 spritesheet（cave 石頭地板）
                CAVE_FLOOR  : sheetTex('sheet_caves', 5, 3),
                CAVE_FLOOR2 : sheetTex('sheet_caves', 6, 3),
                LAVA        : sheetTex('sheet_caves', 0, 12),

                // 角色幀（騎士 0087-0090）
                CHAR: [
                    PIXI.utils.TextureCache['char_0087'],
                    PIXI.utils.TextureCache['char_0088'],
                    PIXI.utils.TextureCache['char_0089'],
                    PIXI.utils.TextureCache['char_0090'],
                ],
            };
            onDone();
        });
    }

    return { load };
})();
