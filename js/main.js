window.Game = window.Game || {};

(function () {
    const CFG   = Game.Config;
    const W     = CFG.WIDTH;
    const H     = CFG.HEIGHT;
    const SCALE = CFG.SCALE;

    // ── PIXI 初始化 ──
    const app = new PIXI.Application({
        width:  W * SCALE,
        height: H * SCALE,
        backgroundColor: CFG.PALETTE.BLACK,
        antialias: false,
        resolution: 1,
    });
    document.getElementById('game-container').appendChild(app.view);

    // pixelated 縮放（CSS 層）
    app.view.style.imageRendering = 'pixelated';
    app.view.style.width  = (W * SCALE) + 'px';
    app.view.style.height = (H * SCALE) + 'px';

    // 內部縮放 container（世界空間以 1px = 1game-pixel 計算）
    const root = new PIXI.Container();
    root.scale.set(SCALE);
    app.stage.addChild(root);

    // 世界層 / UI 層
    const worldStage = new PIXI.Container();
    const uiStage    = new PIXI.Container();
    root.addChild(worldStage);
    root.addChild(uiStage);

    // ── 系統初始化 ──
    Game.ChunkManager.init(worldStage);
    Game.Camera.init(worldStage);
    Game.HUD.init(uiStage);

    // ── 玩家 ──
    const player = new Game.Player();
    player.x = 128;
    player.y = 128;
    worldStage.addChild(player.sprite);

    // ── 輸入 ──
    const keys = {};
    window.addEventListener('keydown', e => { keys[e.key] = true; });
    window.addEventListener('keyup',   e => { keys[e.key] = false; });

    // 滑鼠世界座標
    let mouseW = { x: 0, y: 0 };
    app.view.addEventListener('mousemove', e => {
        const rect = app.view.getBoundingClientRect();
        const sx = (e.clientX - rect.left) / SCALE;
        const sy = (e.clientY - rect.top)  / SCALE;
        mouseW = Game.Camera.toWorld(sx, sy);
    });

    // ── 主迴圈 ──
    app.ticker.add((delta) => {
        const dt = delta / 60; // 秒

        // 先更新 chunk（以玩家位置為中心）
        Game.ChunkManager.update(player.x, player.y);

        // 更新玩家
        player.update(dt, keys, mouseW.x, mouseW.y);

        // 攝影機跟隨
        Game.Camera.follow(player.x + 12, player.y + 16, dt);

        // HUD
        Game.HUD.update(player.hp, player.maxHp);
    });
})();
