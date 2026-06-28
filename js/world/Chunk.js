window.Game = window.Game || {};

Game.Chunk = (function () {
    const CS = Game.Config.CHUNK_SIZE; // 16
    const T  = Game.Config.TILE;       // 16

    class Chunk {
        constructor(cx, cy) {
            this.cx = cx;
            this.cy = cy;
            this.tiles = [];      // CS*CS 個 { type, biome }
            this.container = null; // PIXI.Container
            this.built = false;
        }

        // 生成 tile 資料（由 WorldGen 呼叫）
        generate() {
            const noise = Game.Noise;
            this.tiles = [];
            for (let ty = 0; ty < CS; ty++) {
                for (let tx = 0; tx < CS; tx++) {
                    const wx = this.cx * CS + tx;
                    const wy = this.cy * CS + ty;
                    const scale = Game.Config.NOISE_SCALE;
                    const h = noise.sn(wx * scale, wy * scale);
                    const m = noise.sn(wx * scale + 500, wy * scale + 500);
                    const biome = Game.BiomeManager.getBiome(h);
                    const type  = Game.BiomeManager.getTileType(h, m);
                    this.tiles.push({ type, biome });
                }
            }
        }

        // 建立 PIXI 顯示物件
        build(stage) {
            if (this.built) return;
            this.built = true;
            this.container = new PIXI.Container();
            this.container.x = this.cx * CS * T;
            this.container.y = this.cy * CS * T;

            for (let ty = 0; ty < CS; ty++) {
                for (let tx = 0; tx < CS; tx++) {
                    const { type, biome } = this.tiles[ty * CS + tx];
                    const tex = Game.TileArt.get(type);
                    const sp = new PIXI.Sprite(tex);
                    sp.x = tx * T;
                    sp.y = ty * T;
                    this.container.addChild(sp);
                }
            }
            stage.addChildAt(this.container, 0);
        }

        // 從 stage 移除並釋放
        destroy(stage) {
            if (this.container) {
                stage.removeChild(this.container);
                this.container.destroy({ children: true });
                this.container = null;
            }
            this.built = false;
        }

        getTile(tx, ty) {
            return this.tiles[ty * CS + tx] || null;
        }
    }

    return Chunk;
})();
