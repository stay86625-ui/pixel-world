window.Game = window.Game || {};

Game.TileArt = (function () {
    const T = 16;
    const cache = {};

    // ── 像素工具 ──
    function pxh(d, x, y, hex) {
        if (x < 0 || x >= T || y < 0 || y >= T) return;
        const i = (y * T + x) * 4;
        d[i] = (hex >> 16) & 0xff; d[i+1] = (hex >> 8) & 0xff; d[i+2] = hex & 0xff; d[i+3] = 255;
    }
    function fill(d, hex) {
        for (let i = 0; i < T * T; i++) {
            d[i*4]   = (hex >> 16) & 0xff;
            d[i*4+1] = (hex >>  8) & 0xff;
            d[i*4+2] =  hex        & 0xff;
            d[i*4+3] = 255;
        }
    }
    function darken(hex, a) {
        return (Math.max(0, ((hex>>16)&0xff)-a)<<16)|(Math.max(0,((hex>>8)&0xff)-a)<<8)|Math.max(0,(hex&0xff)-a);
    }
    function lighten(hex, a) {
        return (Math.min(255,((hex>>16)&0xff)+a)<<16)|(Math.min(255,((hex>>8)&0xff)+a)<<8)|Math.min(255,(hex&0xff)+a);
    }
    // 4×4 Bayer 有序抖動
    const BAYER = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
    function dither(d, x, y, hexA, hexB, t) {
        pxh(d, x, y, t > BAYER[y%4][x%4]/16 ? hexA : hexB);
    }
    // 位置決定性雜湊（不用 Math.random，每次結果相同）
    function hash(x, y, m) { return ((x * 7 + y * 13 + x * y * 3) >>> 0) % m; }

    // ── Tile 繪製函式 ──

    function drawGrass(d, p) {
        // 底色三層抖動
        for (let y = 0; y < T; y++) {
            for (let x = 0; x < T; x++) {
                const h = hash(x, y, 16);
                dither(d, x, y, p.GROUND_LIGHT, p.GROUND_MID, h / 16);
            }
        }
        // 深色斑塊（葉陰影）
        const dark = [[1,2],[5,0],[9,3],[13,1],[3,6],[7,5],[11,7],[0,10],[4,9],[8,11],[12,8],[15,10],[2,13],[6,12],[10,14],[14,12]];
        for (const [x, y] of dark) {
            dither(d, x, y, p.GROUND_DARK, p.GROUND_MID, 0.7);
        }
        // 草尖高光（亮點）
        const tips = [[2,1],[6,0],[10,2],[14,0],[4,4],[8,3],[12,4],[1,7],[5,6],[9,8],[13,6],[3,11],[7,10],[11,12],[15,9]];
        for (const [x, y] of tips) pxh(d, x, y, p.ACCENT1);
        // 頂邊高光、底邊暗影
        for (let x = 0; x < T; x++) {
            pxh(d, x, 0, p.GROUND_LIGHT);
            pxh(d, x, T-1, darken(p.GROUND_DARK, 15));
        }
        for (let y = 0; y < T; y++) pxh(d, T-1, y, darken(p.GROUND_DARK, 10));
    }

    function drawDirt(d, p) {
        for (let y = 0; y < T; y++) {
            for (let x = 0; x < T; x++) {
                const h = hash(x, y, 10);
                dither(d, x, y, p.DIRT_LIGHT, p.DIRT, h / 10);
            }
        }
        // 小碎石
        const stones = [[2,3],[8,1],[13,4],[5,8],[11,6],[1,12],[9,10],[14,13],[4,14],[7,7]];
        for (const [sx, sy] of stones) {
            pxh(d, sx,   sy,   darken(p.DIRT, 30));
            pxh(d, sx+1, sy,   darken(p.DIRT, 20));
            pxh(d, sx,   sy+1, lighten(p.DIRT, 15));
        }
        for (let x = 0; x < T; x++) pxh(d, x, T-1, darken(p.DIRT, 20));
    }

    function drawStone(d, p) {
        fill(d, p.STONE);
        // 石塊行（三行，砌牆交錯）
        const rows = [[0, 4, 7], [6, 10, 3], [12, 15, 7]];
        for (const [yStart, yEnd, splitX] of rows) {
            // 石塊底色
            for (let y = yStart; y <= yEnd; y++) {
                for (let x = 0; x < T; x++) {
                    const h = hash(x, y, 8);
                    pxh(d, x, y, h < 3 ? lighten(p.STONE, 12) : p.STONE);
                }
            }
            // 頂邊高光
            for (let x = 0; x < T; x++) pxh(d, x, yStart, p.STONE_LIGHT);
            // 左邊高光
            for (let y = yStart; y <= yEnd; y++) pxh(d, 0, y, p.STONE_LIGHT);
            if (splitX < T) for (let y = yStart; y <= yEnd; y++) pxh(d, splitX, y, p.STONE_LIGHT);
            // 底邊暗影
            for (let x = 0; x < T; x++) pxh(d, x, yEnd, darken(p.STONE, 20));
            // 右邊暗影
            for (let y = yStart; y <= yEnd; y++) pxh(d, T-1, y, darken(p.STONE, 15));
        }
        // 砌縫（深色橫線）
        for (let x = 0; x < T; x++) {
            pxh(d, x, 5,  darken(p.STONE, 30));
            pxh(d, x, 11, darken(p.STONE, 30));
        }
        // 砌縫（縱線交錯）
        for (let y = 0; y < 5; y++)   pxh(d, 7, y, darken(p.STONE, 30));
        for (let y = 6; y < 11; y++)  { pxh(d, 3, y, darken(p.STONE, 30)); pxh(d, 11, y, darken(p.STONE, 30)); }
        for (let y = 12; y < T; y++)  pxh(d, 7, y, darken(p.STONE, 30));
    }

    function drawWater(d, deepH, midH, lightH, foamH, offset) {
        for (let y = 0; y < T; y++) {
            for (let x = 0; x < T; x++) {
                const w = Math.sin((x + offset) * 0.75 + y * 0.35) * 0.5 + 0.5;
                dither(d, x, y, w > 0.6 ? lightH : midH, w > 0.6 ? midH : deepH, w);
            }
        }
        // 泡沫白點
        for (let y = 0; y < T; y++) {
            for (let x = 0; x < T; x++) {
                const w = Math.sin((x + offset) * 0.75 + y * 0.35) * 0.5 + 0.5;
                if (w > 0.82 && (x + y * 3) % 5 === 0) pxh(d, x, y, foamH);
            }
        }
        // 橫向波紋線
        for (const wy of [1, 5, 9, 13]) {
            for (let x = 0; x < T; x++) {
                if ((x + wy + offset) % 4 < 2) pxh(d, x, wy, lightH);
            }
        }
        // 頂邊高光
        for (let x = 0; x < T; x++) pxh(d, x, 0, lightH);
    }

    function drawSand(d, p) {
        for (let y = 0; y < T; y++) {
            for (let x = 0; x < T; x++) {
                const h = hash(x, y, 12);
                dither(d, x, y, p.GROUND_LIGHT, p.GROUND_MID, h / 12);
            }
        }
        // 風吹紋路（對角線）
        for (let d2 = 1; d2 < T * 2; d2 += 5) {
            for (let x = 0; x < T; x++) {
                const y = d2 - x;
                if (y >= 0 && y < T) pxh(d, x, y, lighten(p.GROUND_LIGHT, 12));
            }
        }
        // 小沙粒暗點
        const grains = [[3,2],[8,4],[13,1],[1,7],[6,6],[11,8],[4,11],[9,13],[14,10],[2,14]];
        for (const [x, y] of grains) pxh(d, x, y, darken(p.GROUND_DARK, 10));
        for (let x = 0; x < T; x++) pxh(d, x, T-1, darken(p.GROUND_MID, 15));
    }

    function drawIce(d, p) {
        fill(d, p.ICE);
        // 光澤條紋
        for (let y = 0; y < T; y++) {
            for (let x = 0; x < T; x++) {
                if (y % 4 === 0 && x % 2 === 0) pxh(d, x, y, p.ICE_LIGHT);
                else if ((x + y) % 7 === 0)     pxh(d, x, y, darken(p.ICE, 12));
            }
        }
        // 裂縫
        for (let x = 0; x < 10; x++) pxh(d, x, 6, darken(p.ICE, 25));
        for (let y = 6; y < 12; y++) pxh(d, 9, y, darken(p.ICE, 20));
        for (let x = 9; x < T; x++) pxh(d, x, 11, darken(p.ICE, 18));
        // 鏡面高光
        for (const [x, y] of [[1,1],[2,1],[1,2],[6,0],[7,0]]) pxh(d, x, y, p.ICE_LIGHT);
    }

    function drawLava(d, p) {
        for (let y = 0; y < T; y++) {
            for (let x = 0; x < T; x++) {
                const w = Math.sin(x * 0.6 + y * 0.4) * 0.5 + 0.5;
                const w2 = Math.cos(x * 0.3 - y * 0.5) * 0.5 + 0.5;
                dither(d, x, y, p.LAVA_MID, p.LAVA_DARK, (w + w2) * 0.5);
            }
        }
        // 熾熱亮點
        const hot = [[2,3],[7,1],[12,4],[4,8],[10,6],[1,12],[14,9],[8,13],[5,14]];
        for (const [x, y] of hot) {
            pxh(d, x,   y,   p.LAVA_GLOW);
            pxh(d, x+1, y,   p.LAVA_LIGHT);
            pxh(d, x,   y-1, p.LAVA_LIGHT);
        }
    }

    function drawVoid(d, p) {
        fill(d, p.VOID);
        // 紫色光氣
        const wisps = [[2,2],[7,4],[12,1],[4,9],[10,7],[1,13],[14,11],[8,14],[5,5],[11,12]];
        for (const [x, y] of wisps) {
            dither(d, x, y, p.GLOW_PURPLE, p.GROUND_DARK, 0.4);
            dither(d, x+1, y, p.CRYSTAL_M, p.VOID, 0.3);
        }
        // 星點
        const stars = [[1,1],[5,6],[11,3],[3,11],[13,8],[8,13],[15,1],[0,14],[6,2],[14,5]];
        for (const [x, y] of stars) pxh(d, x, y, p.STAR);
    }

    // ── 主 API ──
    function makeTexture(key, drawFn) {
        if (cache[key]) return cache[key];
        const canvas = document.createElement('canvas');
        canvas.width = T; canvas.height = T;
        const ctx = canvas.getContext('2d');
        const img = ctx.createImageData(T, T);
        drawFn(img.data);
        ctx.putImageData(img, 0, 0);
        const tex = PIXI.Texture.from(canvas);
        cache[key] = tex;
        return tex;
    }

    const TileArt = {
        get(tileType, biome) {
            const p = Game.Palette[biome] || Game.Palette.FOREST;
            const key = `${tileType}_${biome}`;

            switch (tileType) {
                case 'GRASS':        return makeTexture(key, d => drawGrass(d, p));
                case 'GRASS_DARK':   return makeTexture(key, d => {
                    const dp = { ...p, GROUND_LIGHT: p.GROUND_MID, GROUND_MID: p.GROUND_DARK,
                                 ACCENT1: darken(p.ACCENT1, 30), GROUND_DARK: darken(p.GROUND_DARK, 20) };
                    drawGrass(d, dp);
                });
                case 'DIRT':         return makeTexture(key, d => drawDirt(d, p));
                case 'STONE':        return makeTexture(key, d => drawStone(d, p));
                case 'WATER':        return makeTexture(key, d => drawWater(d, p.WATER_DEEP, p.WATER_MID, p.WATER_LIGHT, p.WATER_FOAM, 0));
                case 'WATER_SHALLOW':return makeTexture(key, d => drawWater(d, p.WATER_MID, p.WATER_LIGHT, p.WATER_FOAM, 0xeef8ff, 3));
                case 'SAND':         return makeTexture(key, d => drawSand(d, Game.Palette.DESERT));
                case 'ICE':          return makeTexture(key, d => drawIce(d, Game.Palette.SNOW));
                case 'LAVA':         return makeTexture(key, d => drawLava(d, Game.Palette.VOLCANO));
                case 'VOID':         return makeTexture(key, d => drawVoid(d, Game.Palette.ABYSS));
                default:             return makeTexture(key + '_fb', d => fill(d, 0xff00ff));
            }
        },
        clearCache() { Object.keys(cache).forEach(k => delete cache[k]); },
    };

    return TileArt;
})();
