window.Game = window.Game || {};

Game.Player = (function () {
    const SPD = Game.Config.PLAYER_SPEED;
    const CW = 24, CH = 32;   // 角色畫布尺寸

    // ── 顏色定義 [R, G, B] ──
    const C = {
        OUT: [20, 14, 10],        // 外輪廓
        SK:  [224, 168, 112],     // 膚色
        SKS: [176, 120, 68],      // 膚色陰影
        SKH: [248, 202, 158],     // 膚色高光
        HD:  [38, 22, 8],         // 頭髮深
        HM:  [76, 48, 18],        // 頭髮中
        HL:  [110, 72, 30],       // 頭髮高光
        EW:  [242, 238, 222],     // 眼白
        EB:  [28, 76, 200],       // 眼球藍
        EP:  [12, 18, 28],        // 瞳孔
        EH:  [180, 210, 255],     // 眼睛高光
        AL:  [208, 218, 238],     // 盔甲亮
        AM:  [144, 158, 192],     // 盔甲中
        AD:  [68, 84, 128],       // 盔甲暗
        AT:  [72, 130, 228],      // 盔甲藍邊飾
        ATL: [140, 190, 255],     // 邊飾亮
        BL:  [68, 46, 20],        // 腰帶
        BLL: [96, 68, 34],        // 腰帶高光
        BK:  [222, 182, 68],      // 扣環金
        BKH: [255, 222, 130],     // 扣環高光
        PD:  [42, 38, 70],        // 褲子深
        PM:  [62, 58, 98],        // 褲子中
        PL:  [84, 80, 130],       // 褲子亮
        BD:  [42, 24, 8],         // 靴子深
        BM:  [66, 42, 16],        // 靴子中
        BLT: [92, 62, 26],        // 靴子亮
    };

    // pixel setter
    function px(img, x, y, c) {
        if (!c || x < 0 || x >= CW || y < 0 || y >= CH) return;
        const i = (y * CW + x) * 4;
        img[i] = c[0]; img[i+1] = c[1]; img[i+2] = c[2]; img[i+3] = 255;
    }
    // rect fill
    function rr(img, x, y, w, h, c) {
        for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) px(img, x+dx, y+dy, c);
    }
    // outline pass（邊緣像素加輪廓）
    function addOutline(data) {
        const alpha = new Uint8Array(CW * CH);
        for (let i = 0; i < CW * CH; i++) alpha[i] = data[i*4+3];
        const [or, og, ob] = C.OUT;
        for (let y = 0; y < CH; y++) {
            for (let x = 0; x < CW; x++) {
                if (alpha[y*CW+x]) continue;
                const nbr = (x>0&&alpha[y*CW+x-1])||(x<CW-1&&alpha[y*CW+x+1])||(y>0&&alpha[(y-1)*CW+x])||(y<CH-1&&alpha[(y+1)*CW+x]);
                if (nbr) { const i=(y*CW+x)*4; data[i]=or;data[i+1]=og;data[i+2]=ob;data[i+3]=255; }
            }
        }
    }

    function buildFrame(walkPhase) {
        // walkPhase 0-3，控制腿部位置
        const canvas = document.createElement('canvas');
        canvas.width = CW; canvas.height = CH;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(CW, CH);
        const d = imgData.data;

        // ── 頭髮 (rows 0-4) ──
        rr(d, 6, 0, 12, 1, C.HD);          // 頂部
        rr(d, 5, 1, 14, 4, C.HD);          // 髮帽
        // 頭髮高光
        rr(d, 8, 1, 3, 1, C.HM);
        rr(d, 13, 1, 3, 1, C.HM);
        px(d, 10, 0, C.HM); px(d, 11, 0, C.HL); px(d, 12, 0, C.HM);

        // ── 臉部 (rows 3-9) ──
        rr(d, 7, 3, 10, 7, C.SK);          // 臉底色
        rr(d, 8, 3, 8,  1, C.SKH);         // 額頭高光
        // 兩側頭髮遮臉
        rr(d, 6, 3, 1, 6, C.HD);
        rr(d, 17, 3, 1, 6, C.HD);
        // 眉毛
        rr(d, 9,  3, 3, 1, C.HD);
        rr(d, 13, 3, 3, 1, C.HD);
        // 左眼 (x=8-10, y=4-5)
        rr(d, 8, 4, 3, 2, C.EW);
        px(d, 9, 4, C.EB); px(d, 9, 5, C.EP);
        px(d, 8, 4, C.EH);                 // 眼睛高光
        px(d, 10, 4, C.SKS);              // 眼角陰影
        // 右眼 (x=13-15, y=4-5)
        rr(d, 13, 4, 3, 2, C.EW);
        px(d, 14, 4, C.EB); px(d, 14, 5, C.EP);
        px(d, 13, 4, C.EH);
        px(d, 15, 4, C.SKS);
        // 鼻影
        px(d, 11, 6, C.SKS); px(d, 12, 6, C.SKS);
        // 臉頰陰影
        rr(d, 7, 7, 2, 1, C.SKS);
        rr(d, 15, 7, 2, 1, C.SKS);
        // 嘴巴
        rr(d, 10, 8, 5, 1, C.SKS);
        // 下巴
        rr(d, 8, 9, 8, 1, C.SKS);

        // ── 脖子 (rows 10-11) ──
        rr(d, 10, 10, 4, 2, C.SK);
        px(d, 10, 10, C.SKS); px(d, 10, 11, C.SKS);
        px(d, 13, 10, C.SKS); px(d, 13, 11, C.SKS);

        // ── 盔甲軀體 (rows 12-22) ──
        rr(d, 6, 12, 12, 11, C.AM);        // 主體
        rr(d, 6, 12, 12, 1, C.AL);         // 頂邊高光
        rr(d, 6, 12, 1, 11, C.AL);         // 左邊高光
        rr(d, 17, 12, 1, 11, C.AD);        // 右邊陰影
        rr(d, 6, 22, 12, 1, C.AD);         // 底邊陰影
        // 護胸甲（中心亮區）
        rr(d, 9, 13, 6, 7, C.AL);
        rr(d, 9, 13, 6, 1, C.AL);
        // 藍色邊飾
        rr(d, 10, 14, 4, 1, C.AT);         // 橫飾 1
        rr(d, 10, 17, 4, 1, C.AT);         // 橫飾 2
        px(d, 11, 15, C.AT); px(d, 12, 15, C.AT);
        px(d, 11, 16, C.AT); px(d, 12, 16, C.AT);
        // 藍飾高光
        px(d, 10, 14, C.ATL); px(d, 10, 17, C.ATL);
        // 肩甲
        rr(d, 6, 12, 3, 3, C.AL);
        rr(d, 15, 12, 3, 3, C.AL);
        rr(d, 7, 12, 1, 3, C.AM);
        rr(d, 16, 12, 1, 3, C.AM);
        // 衣領
        rr(d, 9, 12, 6, 1, C.AD);

        // ── 手臂（走路時輕微擺動）──
        const armSwing = [0, 1, 0, -1][walkPhase];
        // 左臂
        rr(d, 3, 13 + armSwing, 4, 8, C.AM);
        rr(d, 3, 13 + armSwing, 1, 8, C.AL);
        rr(d, 6, 13 + armSwing, 1, 8, C.AD);
        // 左手腕/手
        rr(d, 4, 20 + armSwing, 2, 2, C.SK);
        // 右臂（反向）
        rr(d, 17, 13 - armSwing, 4, 8, C.AM);
        rr(d, 17, 13 - armSwing, 1, 8, C.AL);
        rr(d, 20, 13 - armSwing, 1, 8, C.AD);
        rr(d, 18, 20 - armSwing, 2, 2, C.SK);

        // ── 腰帶 (rows 22-23) ──
        rr(d, 6, 22, 12, 2, C.BL);
        rr(d, 6, 22, 12, 1, C.BLL);        // 腰帶頂面高光
        rr(d, 10, 22, 4, 2, C.BK);         // 金扣
        px(d, 11, 22, C.BKH); px(d, 12, 22, C.BKH);  // 扣環高光

        // ── 腿部（walk 動畫）──
        // 0: 靜止；1: 左腿前、右腿後；2: 靜止；3: 右腿前、左腿後
        const legL = [[0,0],[1,-1],[0,0],[-1,1]][walkPhase];   // [x偏, y偏]
        const legR = [[0,0],[-1,1],[0,0],[1,-1]][walkPhase];

        const lx = 6 + legL[0], ly = 24 + legL[1];
        rr(d, lx, ly, 5, 7, C.PD);
        rr(d, lx, ly, 1, 7, C.PL);
        rr(d, lx, ly, 5, 1, C.PM);
        // 左靴
        rr(d, lx-1, ly+6, 7, 2, C.BD);
        rr(d, lx-1, ly+6, 7, 1, C.BM);
        rr(d, lx,   ly+6, 3, 1, C.BLT);   // 靴面高光

        const rx = 13 + legR[0], ry = 24 + legR[1];
        rr(d, rx, ry, 5, 7, C.PD);
        rr(d, rx, ry, 1, 7, C.PL);
        rr(d, rx, ry, 5, 1, C.PM);
        // 右靴
        rr(d, rx-1, ry+6, 7, 2, C.BD);
        rr(d, rx-1, ry+6, 7, 1, C.BM);
        rr(d, rx,   ry+6, 3, 1, C.BLT);

        // 外輪廓
        addOutline(d);

        ctx.putImageData(imgData, 0, 0);
        return PIXI.Texture.from(canvas);
    }

    // 建立 4 幀走路動畫
    function buildFrames() {
        return [0, 1, 2, 3].map(f => buildFrame(f));
    }

    // ── Player 類別 ──
    class Player {
        constructor() {
            this.x = 0; this.y = 0;
            this.vx = 0; this.vy = 0;
            this.hp = 100; this.maxHp = 100;
            this.facing = 'down';
            this.animFrame = 0;
            this.animTimer = 0;
            this.ANIM_FPS = 7;

            const frames = buildFrames();
            this.sprite = new PIXI.AnimatedSprite(frames);
            this.sprite.animationSpeed = 0;
            this.sprite.anchor.set(0, 0);
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

            if (Math.abs(this.vx) > Math.abs(this.vy)) {
                this.facing = this.vx > 0 ? 'right' : 'left';
            } else if (this.vy !== 0) {
                this.facing = this.vy > 0 ? 'down' : 'up';
            }

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
                this.sprite.x = this.x + CW;
            } else {
                this.sprite.scale.x = 1;
                this.sprite.x = this.x;
            }
            this.sprite.y = this.y;
        }

        _solid(px, py) {
            const T = Game.Config.TILE;
            const offsets = [[2, 28], [21, 28], [2, 20], [21, 20]];
            for (const [ox, oy] of offsets) {
                const tile = Game.ChunkManager.getTileAt(px + ox, py + oy);
                if (tile && Game.Tile.isSolid(tile.type)) return true;
            }
            return false;
        }
    }

    return Player;
})();
