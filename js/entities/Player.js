window.Game = window.Game || {};

Game.Player = (function () {
    const SPD = Game.Config.PLAYER_SPEED;
    const CW = 16, CH = 22;  // Core Keeper 比例

    // 調色盤 [R,G,B]
    const P = [
        null,                   // 0 = 透明
        [18,  12,  8  ],       // 1  輪廓
        [220, 164, 108 ],      // 2  膚色
        [168, 112,  60 ],      // 3  膚色暗
        [248, 200, 152 ],      // 4  膚色亮
        [ 36,  20,   6 ],      // 5  髮色深
        [ 96,  60,  20 ],      // 6  髮色亮
        [244, 238, 218 ],      // 7  眼白
        [ 28,  72, 204 ],      // 8  眼球藍
        [ 12,  16,  26 ],      // 9  瞳孔
        [210, 220, 240 ],      // 10 盔甲亮
        [144, 158, 196 ],      // 11 盔甲中
        [ 72,  88, 136 ],      // 12 盔甲暗
        [ 68, 128, 228 ],      // 13 藍邊飾
        [185, 200, 228 ],      // 14 盔甲高光（極亮）
        [ 64,  44,  18 ],      // 15 腰帶
        [220, 182,  64 ],      // 16 金扣
        [248, 224, 128 ],      // 17 金扣亮
        [ 40,  36,  68 ],      // 18 褲子深
        [ 64,  60, 100 ],      // 19 褲子亮
        [ 38,  22,   6 ],      // 20 靴子深
        [ 66,  42,  16 ],      // 21 靴子中
        [ 92,  62,  26 ],      // 22 靴子亮
    ];

    // 16×22 手工設計像素模板（正面）
    // 腿部(rows 15-21)在動畫時會被替換
    const BASE = [
        // row 0  髮頂
        [0, 0, 0, 0, 0, 1, 5, 5, 5, 5, 1, 0, 0, 0, 0, 0],
        // row 1  髮帽
        [0, 0, 0, 0, 1, 5, 6, 5, 5, 6, 5, 1, 0, 0, 0, 0],
        // row 2  額頭
        [0, 0, 0, 1, 5, 2, 2, 2, 2, 2, 2, 5, 1, 0, 0, 0],
        // row 3  額頭高光
        [0, 0, 0, 1, 5, 4, 2, 2, 2, 2, 4, 5, 1, 0, 0, 0],
        // row 4  眼睛
        [0, 0, 0, 1, 2, 7, 8, 2, 2, 8, 7, 2, 1, 0, 0, 0],
        // row 5  瞳孔
        [0, 0, 0, 1, 2, 7, 9, 2, 2, 9, 7, 2, 1, 0, 0, 0],
        // row 6  鼻
        [0, 0, 0, 1, 2, 3, 2, 2, 2, 2, 3, 2, 1, 0, 0, 0],
        // row 7  嘴
        [0, 0, 0, 1, 3, 2, 3, 2, 2, 3, 2, 3, 1, 0, 0, 0],
        // row 8  下巴
        [0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0],
        // row 9  頸+領口
        [0, 0, 0, 1,10,10, 2, 2, 2, 2,10,10, 1, 0, 0, 0],
        // row 10 肩甲
        [0, 0, 1,14,10,10,10,10,10,10,10,10,14, 1, 0, 0],
        // row 11 胸甲細節（藍飾）
        [0, 0, 1,11,10,13,10,10,10,10,13,10,11, 1, 0, 0],
        // row 12 胸甲
        [0, 0, 1,11,10,10,10,10,10,10,10,10,11, 1, 0, 0],
        // row 13 下胸甲
        [0, 0, 1,12,11,11,13,11,11,13,11,11,12, 1, 0, 0],
        // row 14 腰帶+金扣
        [0, 0, 0, 1,15,15,16,17,17,16,15,15, 1, 0, 0, 0],
    ];

    // 4組腿部幀（rows 15-21 for 左腿 和 右腿）
    // 每組: [左腿cols 3-6, 右腿cols 9-12] 各行
    // 格式: 每行16像素
    const LEGS = [
        // 幀0: 靜止
        [
            [0,0,0,1,18,19, 1, 0, 0, 1,19,18, 1, 0,0,0],
            [0,0,0,1,19,18, 1, 0, 0, 1,18,19, 1, 0,0,0],
            [0,0,0,1,18,19, 1, 0, 0, 1,19,18, 1, 0,0,0],
            [0,0,0,1,20,21, 1, 0, 0, 1,21,20, 1, 0,0,0],
            [0,0,0,1,20,22,21, 0, 0,21,22,20, 1, 0,0,0],
            [0,0,0,1,20,21,21, 0, 0,21,21,20, 1, 0,0,0],
            [0,0,0,0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0,0,0],
        ],
        // 幀1: 左腿前
        [
            [0,0,1,18,19, 1, 0, 0, 0, 0, 1,18,19, 1,0,0],
            [0,0,1,19,18, 1, 0, 0, 0, 0, 1,19,18, 1,0,0],
            [0,0,1,18,19, 1, 0, 0, 0, 0, 1,18,19, 1,0,0],
            [0,0,1,20,21, 1, 0, 0, 0, 0, 1,20,21, 1,0,0],
            [0,0,1,20,22,21, 0, 0, 0, 21,22,20, 1, 0,0,0],
            [0,0,1,20,21,21, 0, 0, 0, 21,21,20, 1, 0,0,0],
            [0,0,0, 1, 1, 1, 0, 0, 0,  1, 1, 1, 0, 0,0,0],
        ],
        // 幀2: 靜止(同0)
        [
            [0,0,0,1,18,19, 1, 0, 0, 1,19,18, 1, 0,0,0],
            [0,0,0,1,19,18, 1, 0, 0, 1,18,19, 1, 0,0,0],
            [0,0,0,1,18,19, 1, 0, 0, 1,19,18, 1, 0,0,0],
            [0,0,0,1,20,21, 1, 0, 0, 1,21,20, 1, 0,0,0],
            [0,0,0,1,20,22,21, 0, 0,21,22,20, 1, 0,0,0],
            [0,0,0,1,20,21,21, 0, 0,21,21,20, 1, 0,0,0],
            [0,0,0,0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0,0,0],
        ],
        // 幀3: 右腿前
        [
            [0,0,0,0,1,18,19, 1, 0,0,1,19,18, 1,0,0],
            [0,0,0,0,1,19,18, 1, 0,0,1,18,19, 1,0,0],
            [0,0,0,0,1,18,19, 1, 0,0,1,18,19, 1,0,0],
            [0,0,0,0,1,20,21, 1, 0,0,1,20,21, 1,0,0],
            [0,0,0,0,1,20,22,21, 21,22,20, 1, 0,0,0,0],
            [0,0,0,0,1,20,21,21, 21,21,20, 1, 0,0,0,0],
            [0,0,0,0, 1, 1, 1,  0,  1, 1, 1, 0, 0,0,0,0],
        ],
    ];

    function buildFrame(frame) {
        const canvas = document.createElement('canvas');
        canvas.width = CW; canvas.height = CH;
        const ctx = canvas.getContext('2d');
        const img = ctx.createImageData(CW, CH);
        const d = img.data;

        function sp(x, y, ci) {
            if (!ci || x < 0 || x >= CW || y < 0 || y >= CH) return;
            const c = P[ci]; if (!c) return;
            const i = (y * CW + x) * 4;
            d[i] = c[0]; d[i+1] = c[1]; d[i+2] = c[2]; d[i+3] = 255;
        }

        // 繪製 BASE (rows 0-14)
        for (let y = 0; y < BASE.length; y++) {
            for (let x = 0; x < CW; x++) sp(x, y, BASE[y][x]);
        }

        // 繪製腿部 (rows 15-21)
        const legRows = LEGS[frame];
        for (let r = 0; r < legRows.length; r++) {
            for (let x = 0; x < CW; x++) sp(x, 15 + r, legRows[r][x]);
        }

        // 外輪廓 pass
        const alpha = new Uint8Array(CW * CH);
        for (let i = 0; i < CW * CH; i++) alpha[i] = d[i * 4 + 3];
        const [or, og, ob] = P[1];
        for (let y = 0; y < CH; y++) {
            for (let x = 0; x < CW; x++) {
                if (alpha[y * CW + x]) continue;
                const nb = (x>0 && alpha[y*CW+x-1]) || (x<CW-1 && alpha[y*CW+x+1]) ||
                           (y>0 && alpha[(y-1)*CW+x]) || (y<CH-1 && alpha[(y+1)*CW+x]);
                if (nb) { const i=(y*CW+x)*4; d[i]=or;d[i+1]=og;d[i+2]=ob;d[i+3]=255; }
            }
        }

        ctx.putImageData(img, 0, 0);
        return PIXI.Texture.from(canvas);
    }

    class Player {
        constructor() {
            this.x = 0; this.y = 0;
            this.vx = 0; this.vy = 0;
            this.hp = 100; this.maxHp = 100;
            this.facing = 'right';
            this.animFrame = 0;
            this.animTimer = 0;
            this.ANIM_FPS = 8;

            const frames = [0,1,2,3].map(f => buildFrame(f));
            this.sprite = new PIXI.AnimatedSprite(frames);
            this.sprite.anchor.set(0, 0);
            this.sprite.scale.set(1);
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

            if (this.facing === 'left') {
                this.sprite.scale.x = -1;
                this.sprite.x = Math.round(this.x) + CW;
            } else {
                this.sprite.scale.x = 1;
                this.sprite.x = Math.round(this.x);
            }
            this.sprite.y = Math.round(this.y);
        }

        _solid(px, py) {
            const T = Game.Config.TILE;
            for (const [ox, oy] of [[2,18],[13,18],[2,10],[13,10]]) {
                const tile = Game.ChunkManager.getTileAt(px + ox, py + oy);
                if (tile && Game.Tile.isSolid(tile.type)) return true;
            }
            return false;
        }
    }

    return Player;
})();
