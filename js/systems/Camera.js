window.Game = window.Game || {};

Game.Camera = (function () {
    let x = 0, y = 0;
    let stage = null;
    const LERP = 0.1; // 跟隨平滑度

    const W = Game.Config.WIDTH;
    const H = Game.Config.HEIGHT;

    function init(s) { stage = s; }

    function follow(targetX, targetY, dt) {
        // 平滑插值到目標（以玩家為中心）
        const goalX = targetX - W / 2;
        const goalY = targetY - H / 2;
        x += (goalX - x) * Math.min(LERP * dt * 60, 1);
        y += (goalY - y) * Math.min(LERP * dt * 60, 1);
        // 套用到 world stage（反向偏移）
        stage.x = -Math.round(x);
        stage.y = -Math.round(y);
    }

    function toWorld(screenX, screenY) {
        return { x: screenX + x, y: screenY + y };
    }

    return { init, follow, toWorld, get x() { return x; }, get y() { return y; } };
})();
