window.Game = window.Game || {};

Game.TileArt = (function () {
    function get(tileType) {
        const T = Game.SpriteLoader.textures;
        switch (tileType) {
            case 'GRASS':         return T.GRASS;
            case 'GRASS_DARK':    return T.GRASS_DARK;
            case 'DIRT':          return T.DIRT;
            case 'STONE':         return T.STONE;
            case 'WATER':         return T.WATER;
            case 'WATER_SHALLOW': return T.WATER_SHALLOW;
            case 'SAND':          return T.SAND;
            case 'ICE':           return T.ICE;
            case 'LAVA':          return T.LAVA;
            case 'VOID':          return T.VOID;
            default:              return T.DIRT;
        }
    }
    return { get };
})();
