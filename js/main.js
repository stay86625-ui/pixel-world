window.Game = window.Game || {};

(function () {
    const CFG   = Game.Config;
    const W     = CFG.WIDTH;
    const H     = CFG.HEIGHT;
    const SCALE = CFG.SCALE;

    const app = new PIXI.Application({
        width:  W * SCALE,
        height: H * SCALE,
        backgroundColor: CFG.PALETTE.BLACK,
        antialias: false,
        resolution: 1,
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

    // 顯示載入畫面
    const loadText = new PIXI.Text('Loading...', {
        fontFamily: 'monospace', fontSize: 14, fill: 0xffffff
    });
    loadText.x = 10; loadText.y = 10;
    uiStage.addChild(loadText);

    // 等素材全部載入後才啟動遊戲
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
            // anchor 在腳底，camera 對準腳底上方 8px
            Game.Camera.follow(player.x, player.y - 8, dt);
            Game.HUD.update(player.hp, player.maxHp);
        });
    });
})();
