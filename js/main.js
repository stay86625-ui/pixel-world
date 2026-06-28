window.Game = window.Game || {};

(function () {
    // 必須在 Application 建立前設定，否則 texture 已建立就來不及
    PIXI.settings.SCALE_MODE   = PIXI.SCALE_MODES.NEAREST;  // 消除 tile 穿模/模糊
    PIXI.settings.ROUND_PIXELS = true;                        // 像素對齊，消除縫隙

    const CFG   = Game.Config;
    const W     = CFG.WIDTH;   // 320
    const H     = CFG.HEIGHT;  // 180
    const SCALE = CFG.SCALE;   // 3 → 960x540 顯示

    const app = new PIXI.Application({
        width:           W * SCALE,
        height:          H * SCALE,
        backgroundColor: CFG.PALETTE.BLACK,
        antialias:       false,
        roundPixels:     true,
        resolution:      1,
    });
    document.getElementById('game-container').appendChild(app.view);
    app.view.style.imageRendering = 'pixelated';
    app.view.style.width  = (W * SCALE) + 'px';
    app.view.style.height = (H * SCALE) + 'px';

    const root = new PIXI.Container();
    root.scale.set(SCALE);
    app.stage.addChild(root);

    const worldStage = new PIXI.Container();
    const uiStage    = new PIXI.Container();
    root.addChild(worldStage);
    root.addChild(uiStage);

    // 載入畫面
    const loadText = new PIXI.Text('Loading...', {
        fontFamily: 'monospace', fontSize: 10, fill: 0xffffff
    });
    loadText.x = 10; loadText.y = 10;
    uiStage.addChild(loadText);

    Game.SpriteLoader.load(() => {
        uiStage.removeChild(loadText);

        Game.ChunkManager.init(worldStage);
        Game.Camera.init(worldStage);
        Game.HUD.init(uiStage);

        const player = new Game.Player();
        player.x = 240;
        player.y = 240;
        worldStage.addChild(player.sprite);

        const keys = {};
        window.addEventListener('keydown', e => { keys[e.key] = true; e.preventDefault(); });
        window.addEventListener('keyup',   e => { keys[e.key] = false; });

        app.ticker.add((delta) => {
            const dt = delta / 60;
            Game.ChunkManager.update(player.x, player.y);
            player.update(dt, keys);
            Game.Camera.follow(player.x, player.y - 8, dt);
            Game.HUD.update(player.hp, player.maxHp);
        });
    });
})();
