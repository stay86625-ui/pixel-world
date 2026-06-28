window.Game = window.Game || {};

Game.Player = (function () {
    const SPD = Game.Config.PLAYER_SPEED;

    class Player {
        constructor() {
            this.x = 0; this.y = 0;
            this.vx = 0; this.vy = 0;
            this.hp = 100; this.maxHp = 100;
            this.facing = 'right';
            this.animFrame = 0;
            this.animTimer = 0;
            this.ANIM_FPS = 8;

            const frames = Game.SpriteLoader.textures.CHAR;
            this.sprite = new PIXI.AnimatedSprite(frames);
            this.sprite.anchor.set(0.5, 1); // 腳底為錨點，置中
            this.sprite.scale.set(2);       // 2× 放大讓角色更清晰
        }

        update(dt, keys) {
            this.vx = 0; this.vy = 0;
            if (keys['ArrowLeft']  || keys['a'] || keys['A']) this.vx = -SPD;
            if (keys['ArrowRight'] || keys['d'] || keys['D']) this.vx =  SPD;
            if (keys['ArrowUp']    || keys['w'] || keys['W']) this.vy = -SPD;
            if (keys['ArrowDown']  || keys['s'] || keys['S']) this.vy =  SPD;

            if (this.vx !== 0 && this.vy !== 0) { this.vx *= 0.707; this.vy *= 0.707; }

            const nx = this.x + this.vx * dt;
            const ny = this.y + this.vy * dt;
            if (!this._solid(nx, this.y)) this.x = nx;
            if (!this._solid(this.x, ny)) this.y = ny;

            if (this.vx !== 0) this.facing = this.vx > 0 ? 'right' : 'left';

            const moving = this.vx !== 0 || this.vy !== 0;
            if (moving) {
                this.animTimer += dt;
                if (this.animTimer >= 1 / this.ANIM_FPS) {
                    this.animTimer = 0;
                    this.animFrame = (this.animFrame + 1) % 4;
                }
            } else {
                this.animFrame = 0; this.animTimer = 0;
            }

            this.sprite.texture = this.sprite.textures[this.animFrame];
            this.sprite.scale.x = this.facing === 'left' ? -2 : 2;
            this.sprite.x = Math.round(this.x);
            this.sprite.y = Math.round(this.y);
        }

        _solid(px, py) {
            const T = Game.Config.TILE;
            for (const [ox, oy] of [[2, 0],[13, 0],[2, -8],[13, -8]]) {
                const tile = Game.ChunkManager.getTileAt(px + ox, py + oy);
                if (tile && Game.Tile.isSolid(tile.type)) return true;
            }
            return false;
        }
    }

    return Player;
})();
