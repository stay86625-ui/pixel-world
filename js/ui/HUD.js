window.Game = window.Game || {};

Game.HUD = (function () {
    const P = Game.Config.PALETTE;
    let container = null;
    let hpBar = null, hpFill = null;

    function init(uiStage) {
        container = new PIXI.Container();
        uiStage.addChild(container);

        // 血條背景
        hpBar = new PIXI.Graphics();
        hpBar.beginFill(P.HP_EMPTY);
        hpBar.drawRect(0, 0, 60, 6);
        hpBar.endFill();
        hpBar.x = 8;
        hpBar.y = 8;
        container.addChild(hpBar);

        // 血條填充
        hpFill = new PIXI.Graphics();
        hpFill.x = 8;
        hpFill.y = 8;
        container.addChild(hpFill);

        // 外框
        const border = new PIXI.Graphics();
        border.lineStyle(1, P.UI_BORDER);
        border.drawRect(0, 0, 60, 6);
        border.x = 8;
        border.y = 8;
        container.addChild(border);
    }

    function update(hp, maxHp) {
        const ratio = Math.max(0, hp / maxHp);
        hpFill.clear();
        hpFill.beginFill(P.HP_FULL);
        hpFill.drawRect(0, 0, Math.floor(60 * ratio), 6);
        hpFill.endFill();
    }

    return { init, update };
})();
