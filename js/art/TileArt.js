window.Game = window.Game || {};

// 代碼生成 Tile 紋理，回傳 PIXI.Texture
Game.TileArt = (function () {
    const T = Game.Config.TILE; // 16
    const cache = {};

    // 在 offscreen canvas 上畫像素，轉成 PIXI.Texture
    function makeTexture(key, drawFn) {
        if (cache[key]) return cache[key];
        const canvas = document.createElement('canvas');
        canvas.width = T;
        canvas.height = T;
        const ctx = canvas.getContext('2d');
        drawFn(ctx);
        const tex = PIXI.Texture.from(canvas);
        cache[key] = tex;
        return tex;
    }

    // 填底色 + noise 抖動點
    function noisyFill(ctx, baseHex, lightHex, density = 0.25) {
        const [br, bg, bb] = Game.Palette.toRGB(baseHex);
        const [lr, lg, lb] = Game.Palette.toRGB(lightHex);
        // 底色
        ctx.fillStyle = `rgb(${br},${bg},${bb})`;
        ctx.fillRect(0, 0, T, T);
        // 隨機亮點
        for (let y = 0; y < T; y++) {
            for (let x = 0; x < T; x++) {
                if (Math.random() < density) {
                    ctx.fillStyle = `rgb(${lr},${lg},${lb})`;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }

    // 水面波紋
    function waterPattern(ctx, deepHex, midHex, lightHex, t = 0) {
        const [dr, dg, db] = Game.Palette.toRGB(deepHex);
        const [mr, mg, mb] = Game.Palette.toRGB(midHex);
        const [lr, lg, lb] = Game.Palette.toRGB(lightHex);
        ctx.fillStyle = `rgb(${dr},${dg},${db})`;
        ctx.fillRect(0, 0, T, T);
        // 橫向波紋
        for (let y = 0; y < T; y++) {
            const wave = Math.sin((y + t) * 0.8) > 0.3;
            const bright = Math.sin((y + t) * 0.8) > 0.7;
            if (wave || bright) {
                const [cr, cg, cb] = bright ? [lr, lg, lb] : [mr, mg, mb];
                for (let x = 0; x < T; x++) {
                    const offset = Math.sin(x * 0.5 + y * 0.3 + t) > 0.5;
                    if (offset) {
                        ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }
        }
    }

    // 石頭：規則裂縫
    function stonePattern(ctx, darkHex, lightHex) {
        noisyFill(ctx, darkHex, lightHex, 0.15);
        const [dr, dg, db] = Game.Palette.toRGB(darkHex);
        ctx.fillStyle = `rgb(${dr},${dg},${db})`;
        // 橫裂縫
        ctx.fillRect(0, 5,  T, 1);
        ctx.fillRect(0, 11, T, 1);
        // 縱裂縫（交錯）
        ctx.fillRect(8, 0, 1, 5);
        ctx.fillRect(4, 6, 1, 5);
        ctx.fillRect(12, 12, 1, 4);
    }

    // ── 對外 API ──

    const TileArt = {
        // 依照 tileType 取得紋理
        get(tileType, biome) {
            const p = Game.Palette[biome] || Game.Palette.FOREST;
            const key = `${tileType}_${biome}`;

            switch (tileType) {
                case 'GRASS':
                    return makeTexture(key, ctx => noisyFill(ctx, p.GROUND_MID, p.GROUND_LIGHT, 0.2));

                case 'GRASS_DARK':
                    return makeTexture(key, ctx => noisyFill(ctx, p.GROUND_DARK, p.GROUND_MID, 0.15));

                case 'DIRT':
                    return makeTexture(key, ctx => noisyFill(ctx, p.DIRT, p.DIRT_LIGHT, 0.2));

                case 'STONE':
                    return makeTexture(key, ctx => stonePattern(ctx, p.STONE, p.STONE_LIGHT));

                case 'WATER':
                    return makeTexture(key, ctx => waterPattern(ctx, p.WATER_DEEP, p.WATER_MID, p.WATER_LIGHT));

                case 'WATER_SHALLOW':
                    return makeTexture(key, ctx => waterPattern(ctx, p.WATER_MID, p.WATER_LIGHT, p.WATER_FOAM));

                // 生態區特有
                case 'LAVA':
                    return makeTexture(key, ctx => waterPattern(ctx,
                        Game.Palette.VOLCANO.LAVA_DARK,
                        Game.Palette.VOLCANO.LAVA_MID,
                        Game.Palette.VOLCANO.LAVA_GLOW));

                case 'ICE':
                    return makeTexture(key, ctx => noisyFill(ctx,
                        Game.Palette.SNOW.ICE,
                        Game.Palette.SNOW.ICE_LIGHT, 0.1));

                case 'SAND':
                    return makeTexture(key, ctx => noisyFill(ctx,
                        Game.Palette.DESERT.GROUND_MID,
                        Game.Palette.DESERT.GROUND_HIGH, 0.3));

                case 'VOID':
                    return makeTexture(key, ctx => noisyFill(ctx,
                        Game.Palette.ABYSS.VOID,
                        Game.Palette.ABYSS.GROUND_DARK, 0.05));

                default:
                    return makeTexture(key + '_fallback', ctx => {
                        ctx.fillStyle = '#ff00ff';
                        ctx.fillRect(0, 0, T, T);
                    });
            }
        },

        clearCache() {
            Object.keys(cache).forEach(k => delete cache[k]);
        },
    };

    return TileArt;
})();
