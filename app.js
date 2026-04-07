// シンプルなスペースインベーダー風ゲーム
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// プレイヤー、弾、敵の定義
let player;
let bullet;
let enemies;
let enemyDirection;
let enemyStep;
let lastEnemyMoveTime;
let enemyMoveInterval;
let enemyBullets;
let gameOver;
let gameClear;

// 敵の初期配置を作成
function createEnemies() {
  let newEnemies = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      newEnemies.push({
        x: 50 + col * 60,
        y: 50 + row * 40,
        w: 30,
        h: 20,
      });
    }
  }
  return newEnemies;
}

// ゲームの初期化
function resetGame() {
  player = { x: canvas.width / 2 - 20, y: 450, w: 40, h: 10 };
  bullet = null;
  enemies = createEnemies();
  enemyDirection = 1;
  enemyStep = 12;
  lastEnemyMoveTime = 0;
  enemyMoveInterval = 300;
  enemyBullets = [];
  gameOver = false;
  gameClear = false;
}

// ゲームをリセットして開始
resetGame();

// キーボードの操作
document.addEventListener("keydown", (e) => {
  // ゲームオーバー or クリア時はスペースでリセット
  if ((gameOver || gameClear) && e.key === " ") {
    resetGame();
    return;
  }

  if (gameOver || gameClear) return;

  // 左右の移動
  if (e.key === "ArrowLeft") player.x -= 20;
  if (e.key === "ArrowRight") player.x += 20;

  // スペースキーで弾を発射
  if (e.key === " " && !bullet) {
    bullet = { x: player.x + 18, y: player.y, w: 5, h: 10 };
  }
});

// ゲームの更新
function update() {
  if (gameOver || gameClear) return;

  // プレイヤーの画面端処理
  if (player.x < -player.w) {
    player.x = canvas.width;
  }

  if (player.x > canvas.width) {
    player.x = -player.w;
  }

  // 敵の移動
  const now = Date.now();

  if (now - lastEnemyMoveTime > enemyMoveInterval) {
    enemies.forEach((e) => {
      e.x += enemyStep * enemyDirection;
    });

    let hitEdge = enemies.some((e) => e.x <= 0 || e.x + e.w >= canvas.width);

    if (hitEdge) {
      enemyDirection *= -1;
      enemies.forEach((e) => {
        e.y += 20;
      });
    }

    lastEnemyMoveTime = now;
  }

  // 敵がランダムで弾を撃つ
  if (Math.random() < 0.02 && enemies.length > 0) {
    const shooter = enemies[Math.floor(Math.random() * enemies.length)];
    enemyBullets.push({
      x: shooter.x + shooter.w / 2 - 2,
      y: shooter.y + shooter.h,
      w: 5,
      h: 10,
    });
  }

  // 敵の弾を移動
  enemyBullets.forEach((b) => {
    b.y += 4;
  });

  // 画面外の敵弾を削除
  enemyBullets = enemyBullets.filter((b) => b.y < canvas.height);

  // 敵弾とプレイヤーの当たり判定
  enemyBullets.forEach((b) => {
    if (
      b.x < player.x + player.w &&
      b.x + b.w > player.x &&
      b.y < player.y + player.h &&
      b.y + b.h > player.y
    ) {
      gameOver = true;
    }
  });

  // プレイヤーの弾の移動と敵との衝突判定
  if (bullet) {
    bullet.y -= 10;

    enemies = enemies.filter((e) => {
      if (
        bullet &&
        bullet.x < e.x + e.w &&
        bullet.x + bullet.w > e.x &&
        bullet.y < e.y + e.h &&
        bullet.y + bullet.h > e.y
      ) {
        bullet = null;
        return false;
      }
      return true;
    });

    // 弾が画面外に出たら消す
    if (bullet && bullet.y < 0) bullet = null;
  }

  // クリア判定
  if (enemies.length === 0) {
    gameClear = true;
  }
}

// ゲームの描画
function draw() {
  // 画面をクリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // プレイヤー
  ctx.fillStyle = "cyan";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // プレイヤーの弾
  if (bullet) {
    ctx.fillStyle = "yellow";
    ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
  }

  // 敵
  ctx.fillStyle = "lime";
  enemies.forEach((e) => {
    ctx.fillRect(e.x, e.y, e.w, e.h);
  });

  // 敵の弾
  ctx.fillStyle = "red";
  enemyBullets.forEach((b) => {
    ctx.fillRect(b.x, b.y, b.w, b.h);
  });

  // ゲームオーバー表示
  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "40px sans-serif";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "20px sans-serif";
    ctx.fillText(
      "Press Space to Restart",
      canvas.width / 2,
      canvas.height / 2 + 20,
    );
  }

  // クリア表示
  if (gameClear) {
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "40px sans-serif";
    ctx.fillText("GAME CLEAR", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "20px sans-serif";
    ctx.fillText(
      "Press Space to Restart",
      canvas.width / 2,
      canvas.height / 2 + 20,
    );
  }
}

// ゲームループ
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// ゲーム開始
loop();
