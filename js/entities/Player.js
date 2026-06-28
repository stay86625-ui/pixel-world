window.Game = window.Game || {};

Game.Player = (function () {
    const SPD = Game.Config.PLAYER_SPEED;
    const T   = Game.Config.TILE;  // 16

    class Player {
        constructor() {
            this.x = 0; this.y = 0;
            this.vx = 0; this.vy = 0;
            this.hp = 100; this.maxHp = 100;
            this.facing = 'right';
            this._stepTimer = 0;
            this._step = 0;         // 0 or 1，用於腳步 bob
            this._moving = false;

            const tex = Game.SpriteLoader.textures.CHAR_KNIGHT;
            this.sprite = new PIXI.Sprite(tex);
            this.sprite.anchor.set(0.5, 0.5); // 中心錨點，腳部在 y+8
            this.sprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        }

        update(dt, keys) {
            this.vx = 0; this.vy = 0;
            if (keys['ArrowLeft']  || keys['a'] || keys['A']) this.vx = -SPD;
            if (keys['ArrowRight'] || keys['d'] || keys['D']) this.vx =  SPD;
            if (keys['ArrowUp']    || keys['w'] || keys['W']) this.vy = -SPD;
            if (keys['ArrowDown']  || keys['s'] || keys['S']) this.vy =  SPD;

            // 斜向標準化
            if (this.vx !== 0 && this.vy !== 0) { this.vx *= 0.707; this.vy *= 0.707; }

            // 碰撞
            const nx = this.x + this.vx * dt;
            const ny = this.y + this.vy * dt;
            if (!this._solid(nx, this.y)) this.x = nx;
            if (!this._solid(this.x, ny)) this.y = ny;

            // 朝向
            if (this.vx < 0) this.facing = 'left';
            if (this.vx > 0) this.facing = 'right';

            this._moving = (this.vx !== 0 || this.vy !== 0);

            // 腳步 bob：每 0.15 秒切換一次 ±1px Y 偏移
            if (this._moving) {
                this._stepTimer += dt;
                if (this._stepTimer >= 0.15) {
                    this._stepTimer = 0;
                    this._step = 1 - this._step;
                }
            } else {
                this._step = 0; this._stepTimer = 0;
            }

            // 套用到 sprite（整數座標消除穿模）
            const bobY = this._moving ? (this._step === 0 ? 0 : -1) : 0;
            this.sprite.scale.x = this.facing === 'left' ? -1 : 1;
            this.sprite.x = Math.round(this.x);
            this.sprite.y = Math.round(this.y + bobY);
        }

        _solid(px, py) {
            const checks = [
                [px - 4, py + 6], [px + 4, py + 6],  // 腳底兩側
                [px - 4, py - 2], [px + 4, py - 2],   // 身體上半
            ];
            for (const [wx, wy] of checks) {
                const tile = Game.ChunkManager.getTileAt(wx, wy);
                if (tile && Game.Tile.isSolid(tile.type)) return true;
            }
            return false;
        }

        get tileX() { return Math.floor(this.x / T); }
        get tileY() { return Math.floor(this.y / T); }
    }

    return Player;
})();
