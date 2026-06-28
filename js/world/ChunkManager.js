window.Game = window.Game || {};

Game.ChunkManager = (function () {
    const CS = Game.Config.CHUNK_SIZE;
    const RADIUS = 4; // 玩家周圍 ±4 chunk 載入

    const loaded = new Map(); // key:"cx,cy" → Chunk
    let worldStage = null;

    function key(cx, cy) { return `${cx},${cy}`; }

    function init(stage) {
        worldStage = stage;
    }

    function update(playerX, playerY) {
        const T = Game.Config.TILE;
        const pcx = Math.floor(playerX / (CS * T));
        const pcy = Math.floor(playerY / (CS * T));

        // 載入視野內 chunk
        for (let dy = -RADIUS; dy <= RADIUS; dy++) {
            for (let dx = -RADIUS; dx <= RADIUS; dx++) {
                const cx = pcx + dx;
                const cy = pcy + dy;
                const k = key(cx, cy);
                if (!loaded.has(k)) {
                    const chunk = new Game.Chunk(cx, cy);
                    chunk.generate();
                    chunk.build(worldStage);
                    loaded.set(k, chunk);
                }
            }
        }

        // 卸載超出範圍的 chunk
        for (const [k, chunk] of loaded) {
            const dx = Math.abs(chunk.cx - pcx);
            const dy = Math.abs(chunk.cy - pcy);
            if (dx > RADIUS + 1 || dy > RADIUS + 1) {
                chunk.destroy(worldStage);
                loaded.delete(k);
            }
        }
    }

    // 取得世界座標(px) 的 tile 資料
    function getTileAt(wx, wy) {
        const T  = Game.Config.TILE;
        const cx = Math.floor(wx / (CS * T));
        const cy = Math.floor(wy / (CS * T));
        const tx = Math.floor(wx / T) - cx * CS;
        const ty = Math.floor(wy / T) - cy * CS;
        const chunk = loaded.get(key(cx, cy));
        return chunk ? chunk.getTile(tx, ty) : null;
    }

    return { init, update, getTileAt };
})();
