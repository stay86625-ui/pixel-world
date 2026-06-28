window.Game = window.Game || {};

// TileArt：直接從載入的 CC0 素材取 texture
Game.TileArt = (function () {
    function get(tileType) {
        const T = Game.SpriteLoader.textures;
        switch (tileType) {
            case 'GRASS':         return T.GRASS;
            case 'GRASS_DARK':    return T.GRASS_DARK;
            case 'DIRT':          return T.DIRT;
            case 'STONE':         return T.STONE_FLOOR;
            case 'WATER':         return T.WATER;
            case 'WATER_SHALLOW': return T.WATER2;
            case 'SAND':          return T.SAND;
            case 'ICE':           return T.ICE;
            case 'LAVA':          return T.LAVA;
            case 'VOID':          return T.CAVE_FLOOR;
            default:              return T.DIRT;
        }
    }
    return { get };
})();
