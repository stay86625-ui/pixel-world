window.Game = window.Game || {};

// Tile 類型定義與屬性
Game.Tile = {
    // type id → 屬性
    TYPES: {
        GRASS:          { solid: false, liquid: false },
        GRASS_DARK:     { solid: false, liquid: false },
        DIRT:           { solid: false, liquid: false },
        STONE:          { solid: true,  liquid: false },
        WATER:          { solid: false, liquid: true  },
        WATER_SHALLOW:  { solid: false, liquid: true  },
        SAND:           { solid: false, liquid: false },
        ICE:            { solid: false, liquid: false },
        LAVA:           { solid: false, liquid: true  },
        VOID:           { solid: true,  liquid: false },
    },

    isSolid(type) {
        return this.TYPES[type]?.solid ?? false;
    },

    isLiquid(type) {
        return this.TYPES[type]?.liquid ?? false;
    },
};
