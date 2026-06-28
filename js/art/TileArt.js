window.Game = window.Game || {};

Game.TileArt = (function () {
    const T = 16;
    const cache = {};

    function px(d, x, y, hex) {
        if (x < 0 || x >= T || y < 0 || y >= T) return;
        const i = (y * T + x) * 4;
        d[i] = (hex >> 16) & 0xff; d[i+1] = (hex >> 8) & 0xff; d[i+2] = hex & 0xff; d[i+3] = 255;
    }
    function fill(d, hex) {
        for (let i = 0; i < T * T; i++) {
            d[i*4] = (hex>>16)&0xff; d[i*4+1] = (hex>>8)&0xff; d[i*4+2] = hex&0xff; d[i*4+3] = 255;
        }
    }
    function dk(hex, a) {
        return (Math.max(0,((hex>>16)&0xff)-a)<<16)|(Math.max(0,((hex>>8)&0xff)-a)<<8)|Math.max(0,(hex&0xff)-a);
    }
    function lt(hex, a) {
        return (Math.min(255,((hex>>16)&0xff)+a)<<16)|(Math.min(255,((hex>>8)&0xff)+a)<<8)|Math.min(255,(hex&0xff)+a);
    }

    // 決定性雜湊（位置決定，不用 random）
    function h(x, y) { return ((x * 1619 + y * 31337) ^ (x * y * 1013)) >>> 0; }

    // ── 標準草地（平整，帶輕微色調變化）──
    function grass(d, base, light, dark, accent) {
        for (let y = 0; y < T; y++) {
            for (let x = 0; x < T; x++) {
                const v = h(x, y) % 12;
                px(d, x, y, v < 2 ? dark : v < 10 ? base : light);
            }
        }
        // 零散草尖（亮點）
        const tips = [[1,0],[4,1],[7,0],[10,1],[13,0],[2,3],[6,2],[9,3],[12,2],[15,3],
                      [0,6],[3,5],[8,6],[11,5],[14,6],[1,9],[5,8],[9,9],[13,8],[2,12],
                      [6,11],[10,12],[14,11],[3,14],[8,13],[12,14]];
        for (const [tx, ty] of tips) px(d, tx, ty, accent);
        // 頂邊一排亮線
        for (let x = 0; x < T; x++) px(d, x, 0, light);
        // 底邊一排暗線
        for (let x = 0; x < T; x++) px(d, x, T-1, dark);
    }

    // ── 石磚（Core Keeper 磚牆風格：3×2 排列，明顯縫隙）──
    function stone(d, base, light, dark) {
        // 背景填灰
        fill(d, base);
        // 砌磚 pattern（兩行，上：7+7，下：4+8 交錯）
        // ─ 砌縫橫線
        for (let x = 0; x < T; x++) { px(d, x, 0, dark); px(d, x, 6, dark); px(d, x, 7, dk(dark,20)); px(d, x, T-1, dark); }
        // ─ 砌縫縱線（上排 x=7）
        for (let y = 1; y < 6; y++) { px(d, 7, y, dark); px(d, 8, y, dk(dark,15)); }
        // ─ 砌縫縱線（下排 x=4, x=12）
        for (let y = 8; y < T-1; y++) { px(d, 4, y, dark); px(d, 5, y, dk(dark,15)); px(d, 12, y, dark); px(d, 13, y, dk(dark,15)); }
        // 磚塊高光（左上角亮邊）
        for (let x = 1; x < 7; x++) px(d, x, 1, light);  // 上排左磚
        for (let x = 9; x < T-1; x++) px(d, x, 1, light); // 上排右磚
        for (let y = 1; y < 6; y++) px(d, 1, y, light);
        for (let y = 1; y < 6; y++) px(d, 9, y, light);
        for (let x = 1; x < 4; x++) px(d, x, 8, light);   // 下排各磚
        for (let x = 6; x < 12; x++) px(d, x, 8, light);
        for (let x = 14; x < T-1; x++) px(d, x, 8, light);
        for (let y = 8; y < T-1; y++) { px(d, 1, y, light); px(d, 6, y, light); px(d, 14, y, light); }
        // 磚塊暗影（右下角暗邊）
        for (let x = 1; x < 7; x++) px(d, x, 5, dk(base,15));
        for (let x = 9; x < T-1; x++) px(d, x, 5, dk(base,15));
        for (let y = 1; y < 6; y++) px(d, 6, y, dk(base,10));
    }

    // ── 泥土 ──
    function dirt(d, base, light, dark) {
        for (let y = 0; y < T; y++) {
            for (let x = 0; x < T; x++) {
                const v = h(x+50, y+50) % 10;
                px(d, x, y, v < 2 ? dark : v < 8 ? base : light);
            }
        }
        // 頂邊亮、底邊暗
        for (let x = 0; x < T; x++) { px(d, x, 0, light); px(d, x, T-1, dark); }
    }

    // ── 水面 ──
    function water(d, deep, mid, light, foam) {
        for (let y = 0; y < T; y++) {
            for (let x = 0; x < T; x++) {
                const w = Math.sin(x * 0.8 + y * 0.4) * 0.5 + 0.5;
                px(d, x, y, w > 0.65 ? mid : deep);
            }
        }
        // 波紋高光橫條
        for (const wy of [1, 5, 9, 13]) {
            for (let x = 0; x < T; x++) {
                if ((x + wy) % 4 < 2) px(d, x, wy, light);
            }
        }
        // 泡沫點
        for (const [fx, fy] of [[2,2],[6,4],[10,1],[14,6],[1,10],[5,12],[9,8],[13,14]]) {
            px(d, fx, fy, foam);
        }
        for (let x = 0; x < T; x++) px(d, x, 0, light);
    }

    // ── 沙地 ──
    function sand(d, base, light, dark) {
        for (let y = 0; y < T; y++) {
            for (let x = 0; x < T; x++) {
                const v = h(x+100, y+100) % 10;
                px(d, x, y, v < 3 ? light : v < 8 ? base : dark);
            }
        }
        // 風紋斜線
        for (let offset = 0; offset < T * 2; offset += 5) {
            for (let x = 0; x < T; x++) {
                const y = offset - x;
                if (y >= 0 && y < T) px(d, x, y, lt(base, 18));
            }
        }
    }

    // ── 冰 ──
    function ice(d, base, light, dark) {
        fill(d, base);
        for (let y = 0; y < T; y++) {
            for (let x = 0; x < T; x++) {
                if ((x + y * 2) % 5 === 0) px(d, x, y, light);
            }
        }
        // 裂縫
        for (let x = 0; x < 9; x++) px(d, x, 5, dark);
        for (let y = 5; y < 11; y++) px(d, 8, y, dark);
        for (let x = 8; x < T; x++) px(d, x, 10, dark);
        // 高光角
        for (const [lx, ly] of [[1,1],[2,1],[1,2],[7,0]]) px(d, lx, ly, light);
    }

    // ── 熔岩 ──
    function lava(d, darkH, midH, glowH) {
        for (let y = 0; y < T; y++) {
            for (let x = 0; x < T; x++) {
                const w1 = Math.sin(x * 0.7 + y * 0.5) * 0.5 + 0.5;
                const w2 = Math.cos(x * 0.4 - y * 0.6) * 0.5 + 0.5;
                const w  = (w1 + w2) * 0.5;
                px(d, x, y, w > 0.65 ? midH : w > 0.35 ? darkH : dk(darkH, 20));
            }
        }
        for (const [gx, gy] of [[3,2],[8,5],[12,1],[5,9],[10,12],[2,13],[14,7]]) {
            px(d, gx,   gy,   glowH);
            px(d, gx+1, gy,   lt(midH, 30));
            px(d, gx,   gy-1, lt(midH, 20));
        }
    }

    // ── 虛空 ──
    function voidTile(d, voidH, glowH, starH) {
        fill(d, voidH);
        for (const [sx, sy] of [[1,1],[5,6],[11,3],[3,11],[13,8],[8,13],[15,2],[0,14],[6,9],[14,4]]) {
            px(d, sx, sy, starH);
        }
        for (const [gx, gy] of [[3,4],[9,7],[6,12],[12,2],[1,9]]) {
            px(d, gx, gy, glowH); px(d, gx+1, gy, dk(lt(voidH,30), 5));
        }
    }

    function makeTexture(key, fn) {
        if (cache[key]) return cache[key];
        const cv = document.createElement('canvas');
        cv.width = cv.height = T;
        const ctx = cv.getContext('2d');
        const img = ctx.createImageData(T, T);
        fn(img.data);
        ctx.putImageData(img, 0, 0);
        const tex = PIXI.Texture.from(cv);
        cache[key] = tex;
        return tex;
    }

    return {
        get(type, biome) {
            const p = Game.Palette[biome] || Game.Palette.FOREST;
            const k = type + '_' + biome;
            switch (type) {
                case 'GRASS':
                    return makeTexture(k, d => grass(d, p.GROUND_MID, p.GROUND_LIGHT, p.GROUND_DARK, p.ACCENT1));
                case 'GRASS_DARK':
                    return makeTexture(k, d => grass(d, p.GROUND_DARK, p.GROUND_MID, dk(p.GROUND_DARK,20), p.GROUND_MID));
                case 'DIRT':
                    return makeTexture(k, d => dirt(d, p.DIRT, p.DIRT_LIGHT, dk(p.DIRT,20)));
                case 'STONE':
                    return makeTexture(k, d => stone(d, p.STONE, p.STONE_LIGHT, dk(p.STONE,30)));
                case 'WATER':
                    return makeTexture(k, d => water(d, p.WATER_DEEP, p.WATER_MID, p.WATER_LIGHT, p.WATER_FOAM));
                case 'WATER_SHALLOW':
                    return makeTexture(k, d => water(d, p.WATER_MID, p.WATER_LIGHT, p.WATER_FOAM, 0xeef8ff));
                case 'SAND':
                    return makeTexture(k, d => sand(d, Game.Palette.DESERT.GROUND_MID, Game.Palette.DESERT.GROUND_LIGHT, Game.Palette.DESERT.GROUND_DARK));
                case 'ICE':
                    return makeTexture(k, d => ice(d, Game.Palette.SNOW.ICE, Game.Palette.SNOW.ICE_LIGHT, dk(Game.Palette.SNOW.ICE,30)));
                case 'LAVA':
                    return makeTexture(k, d => lava(d, Game.Palette.VOLCANO.LAVA_DARK, Game.Palette.VOLCANO.LAVA_MID, Game.Palette.VOLCANO.LAVA_GLOW));
                case 'VOID':
                    return makeTexture(k, d => voidTile(d, Game.Palette.ABYSS.VOID, Game.Palette.ABYSS.GLOW_PURPLE, Game.Palette.ABYSS.STAR));
                default:
                    return makeTexture(k+'_fb', d => fill(d, 0xff00ff));
            }
        },
        clearCache() { Object.keys(cache).forEach(k => delete cache[k]); },
    };
})();
