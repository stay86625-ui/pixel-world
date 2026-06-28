window.Game = window.Game || {};

Game.Player = (function () {
    const T  = Game.Config.TILE;
    const SPD = Game.Config.PLAYER_SPEED;
    const W = 12, H = 20; // 角色像素尺寸（含在 16x24 格中置中）

    // ── 代碼生成玩家精靈 ──
    // 16×24 canvas，左右對稱，固定調色盤
    function buildFrames() {
        const SKIN   = [0xe8b87a, 0xc89050];
        const HAIR   = [0x3a2010, 0x5a3820];
        const SHIRT  = [0x3a60a0, 0x2a4880];
        const PANTS  = [0x2a3050, 0x1a2038];
        const SHOE   = [0x382010, 0x241408];
        const WEAPON = [0xc0c0c0, 0x808080, 0xa0a0a0];

        // 像素模板（16 寬 × 24 高），0=透明
        // 每個數字對應上方顏色陣列索引（+1）
        // 格式：[行0像素...] 共 24 行
        const TEMPLATE = [
            // 頭部 (y=0~7)
            [0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0],  // 頭頂髮
            [0,0,0,0,3,3,3,3,3,3,3,0,0,0,0,0],
            [0,0,0,3,3,1,1,1,1,1,3,3,0,0,0,0],  // 臉
            [0,0,0,3,1,1,2,1,1,2,1,3,0,0,0,0],  // 眼睛
            [0,0,0,3,1,1,1,1,1,1,1,3,0,0,0,0],
            [0,0,0,3,1,2,1,1,1,2,1,3,0,0,0,0],  // 嘴
            [0,0,0,3,3,1,1,1,1,1,3,3,0,0,0,0],
            [0,0,0,0,3,3,3,3,3,3,3,0,0,0,0,0],
            // 身體 (y=8~15)
            [0,0,0,3,4,4,4,4,4,4,4,3,0,0,0,0],  // 肩膀(髮色=領口)
            [0,0,3,3,4,4,4,4,4,4,4,3,3,0,0,0],
            [0,0,3,4,4,4,4,4,4,4,4,4,3,0,0,0],
            [0,0,3,4,4,4,4,4,4,4,4,4,3,0,0,0],
            [0,0,3,4,4,4,4,4,4,4,4,4,3,0,0,0],
            [0,0,3,1,4,4,4,4,4,4,4,1,3,0,0,0],  // 手腕
            [0,0,3,1,5,5,5,5,5,5,5,1,3,0,0,0],  // 腰部(褲)
            [0,0,0,3,5,5,5,5,5,5,5,3,0,0,0,0],
            // 腿部 (y=16~23)
            [0,0,0,3,5,5,3,0,3,5,5,3,0,0,0,0],
            [0,0,0,3,5,5,3,0,3,5,5,3,0,0,0,0],
            [0,0,0,3,5,5,3,0,3,5,5,3,0,0,0,0],
            [0,0,0,3,5,5,3,0,3,5,5,3,0,0,0,0],
            [0,0,0,3,6,6,3,0,3,6,6,3,0,0,0,0],  // 鞋
            [0,0,0,3,6,6,3,0,3,6,6,3,0,0,0,0],
            [0,0,0,3,6,6,6,0,6,6,6,3,0,0,0,0],
            [0,0,0,0,3,3,3,0,3,3,3,0,0,0,0,0],
        ];

        const palette = [
            null,
            SKIN[0], SKIN[1],
            HAIR[0], SHIRT[0], PANTS[0], SHOE[0],
        ];

        // 行走動畫：腿部交替位移（4 幀）
        const WALK_OFFSETS = [0, 1, 0, -1]; // 右腿 y 偏移

        const frames = [];
        for (let f = 0; f < 4; f++) {
            const canvas = document.createElement('canvas');
            canvas.width  = 16;
            canvas.height = 24;
            const ctx = canvas.getContext('2d');
            const img = ctx.createImageData(16, 24);
            const data = img.data;

            for (let py = 0; py < 24; py++) {
                for (let px = 0; px < 16; px++) {
                    let row = TEMPLATE[py];
                    let v = row[px];

                    // 行走動畫：y>=16 腿部交替
                    if (f > 0 && py >= 16) {
                        const isRightLeg = px >= 8;
                        const shift = isRightLeg ? WALK_OFFSETS[f] : -WALK_OFFSETS[f];
                        const srcY = Math.max(16, Math.min(23, py - shift));
                        v = TEMPLATE[srcY][px];
                    }

                    if (!v) continue;
                    const color = palette[v];
                    const i = (py * 16 + px) * 4;
                    data[i]   = (color >> 16) & 0xff;
                    data[i+1] = (color >> 8)  & 0xff;
                    data[i+2] =  color        & 0xff;
                    data[i+3] = 255;
                }
            }
            ctx.putImageData(img, 0, 0);
            frames.push(PIXI.Texture.from(canvas));
        }
        return frames;
    }

    // ── Player 物件 ──
    class Player {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.vx = 0;
            this.vy = 0;
            this.hp = 100;
            this.maxHp = 100;
            this.facing = 'down';   // up/down/left/right
            this.animFrame = 0;
            this.animTimer = 0;
            this.ANIM_FPS = 8;

            const frames = buildFrames();
            this.sprite = new PIXI.AnimatedSprite(frames);
            this.sprite.animationSpeed = 0;
            this.sprite.anchor.set(0, 0);
            this.sprite.scale.set(1);
        }

        update(dt, keys, mouseWorldX, mouseWorldY) {
            // 移動輸入
            this.vx = 0;
            this.vy = 0;
            if (keys['ArrowLeft']  || keys['a'] || keys['A']) this.vx = -SPD;
            if (keys['ArrowRight'] || keys['d'] || keys['D']) this.vx =  SPD;
            if (keys['ArrowUp']    || keys['w'] || keys['W']) this.vy = -SPD;
            if (keys['ArrowDown']  || keys['s'] || keys['S']) this.vy =  SPD;

            // 對角線正規化
            if (this.vx !== 0 && this.vy !== 0) {
                this.vx *= 0.707;
                this.vy *= 0.707;
            }

            const nx = this.x + this.vx * dt;
            const ny = this.y + this.vy * dt;

            // Tile 碰撞
            if (!this._solid(nx, this.y)) this.x = nx;
            if (!this._solid(this.x, ny)) this.y = ny;

            // 朝向（依移動方向）
            if (Math.abs(this.vx) > Math.abs(this.vy)) {
                this.facing = this.vx > 0 ? 'right' : 'left';
            } else if (this.vy !== 0) {
                this.facing = this.vy > 0 ? 'down' : 'up';
            }

            // 行走動畫
            const moving = this.vx !== 0 || this.vy !== 0;
            if (moving) {
                this.animTimer += dt;
                if (this.animTimer >= 1 / this.ANIM_FPS) {
                    this.animTimer = 0;
                    this.animFrame = (this.animFrame + 1) % 4;
                }
            } else {
                this.animFrame = 0;
                this.animTimer = 0;
            }

            this.sprite.texture = this.sprite.textures[this.animFrame];

            // 左右翻轉
            if (this.facing === 'left') {
                this.sprite.scale.x = -1;
                this.sprite.x = this.x + 16;
            } else {
                this.sprite.scale.x = 1;
                this.sprite.x = this.x;
            }
            this.sprite.y = this.y;
        }

        _solid(px, py) {
            const T = Game.Config.TILE;
            const offsets = [
                [2, 16], [13, 16],   // 腳底左右
                [2, 8],  [13, 8],    // 腰部左右
            ];
            for (const [ox, oy] of offsets) {
                const tile = Game.ChunkManager.getTileAt(px + ox, py + oy);
                if (tile && Game.Tile.isSolid(tile.type)) return true;
            }
            return false;
        }
    }

    return Player;
})();
