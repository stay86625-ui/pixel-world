window.Game = window.Game || {};

Game.BiomeManager = (function () {
    // noise 閾值決定生態區（使用兩個 noise 頻道：高度 + 溫度）
    const BIOMES = [
        { name: 'ABYSS',     minH: -1.0, maxH: -0.55 },
        { name: 'VOLCANO',   minH: -0.55, maxH: -0.25 },
        { name: 'DESERT',    minH: -0.25, maxH:  0.0  },
        { name: 'GRASSLAND', minH:  0.0,  maxH:  0.3  },
        { name: 'FOREST',    minH:  0.3,  maxH:  0.65 },
        { name: 'SNOW',      minH:  0.65, maxH:  1.0  },
    ];

    function getBiome(heightNoise) {
        for (const b of BIOMES) {
            if (heightNoise >= b.minH && heightNoise < b.maxH) return b.name;
        }
        return 'GRASSLAND';
    }

    // 根據高度 noise 值決定 tileType
    function getTileType(h, moisture) {
        if (h < -0.7)  return 'VOID';
        if (h < -0.4)  return 'LAVA';
        if (h < -0.2)  return (moisture > 0.3 ? 'WATER' : 'SAND');
        if (h <  0.05) return (moisture > 0.5 ? 'WATER_SHALLOW' : 'DIRT');
        if (h <  0.5)  return (moisture > 0.6 ? 'GRASS_DARK' : 'GRASS');
        return 'ICE';  // 高山
    }

    return { getBiome, getTileType };
})();
