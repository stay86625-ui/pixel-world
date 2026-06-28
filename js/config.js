window.Game = window.Game || {};

Game.Config = {
    // 畫布解析度（像素世界內部解析度）
    WIDTH: 320,
    HEIGHT: 180,
    SCALE: 4,          // 放大倍數 → 顯示 1280x720

    // Tile
    TILE: 16,          // 每格 16x16 像素
    CHUNK_SIZE: 16,    // 每個 Chunk 16x16 格

    // 世界生成
    SEED: 12345,
    NOISE_SCALE: 0.04,

    // 攝影機視野（以 tile 為單位）
    VIEW_W: 20,        // 320/16
    VIEW_H: 12,        // 180/16（約）

    // 實體
    PLAYER_SPEED: 80,  // 像素/秒

    // 調色盤（全局 8 色 UI + 各生態區自行定義）
    PALETTE: {
        BLACK:      0x0d0d0d,
        WHITE:      0xf0f0e8,
        UI_BG:      0x1a1a2e,
        UI_BORDER:  0x4a4a6a,
        UI_TEXT:    0xe8e8d0,
        HP_FULL:    0xe05050,
        HP_EMPTY:   0x3a1a1a,
        SHADOW:     0x000000,
    },
};
