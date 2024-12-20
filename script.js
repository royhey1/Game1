let drawing = false;
let points = [];
let startPoint = null; // 明示的に初期化
let endPoint = null; // 明示的に初期化
let startTime = 0;
let stageTime = 60 * 1000; // 60秒
let totalTime = 60 * 1000; // 総時間
let currentStage = 0;
let score = 0;
let obstacles = [];
let gameStarted = false; // ゲームが開始されているか

function setup() {
  createCanvas(400, 400);
  background(220); // 初期化時に背景を描画
  createStartButton(); // ゲーム開始ボタンを作成
  noLoop(); // 初期状態で描画を停止

  // 初期値設定を確認
  console.log("Initial setupStage call...");
  setupStage(); // ゲーム開始前にステージを初期化
}

function draw() {
  if (!gameStarted) return; // ゲーム開始後のみ描画

  background(220);

  // startPoint と endPoint の状態をチェック
  if (startPoint && endPoint) {
    fill(0, 255, 0);
    ellipse(startPoint.x, startPoint.y, 20, 20); // スタート地点
    fill(255, 0, 0);
    ellipse(endPoint.x, endPoint.y, 20, 20); // ゴール地点
  } else {
    console.log('Error: startPoint or endPoint is null');
  }

  // 障害物の描画
  fill(100);
  for (let obs of obstacles) {
    rect(obs.x, obs.y, obs.w, obs.h);
  }

  // 線を描画中の場合
  if (drawing) {
    let point = {x: mouseX, y: mouseY};
    points.push(point);
    noFill();
    stroke(0);
    strokeWeight(2);
    beginShape();
    for (let p of points) {
      vertex(p.x, p.y);
      if (checkCollision(p.x, p.y)) {
        drawing = false;
        alert('Hit an obstacle! Try again.');
        setupStage(); // ステージをリセット
        return;
      }
    }
    endShape();
  }

  // 残り時間を計算
  let elapsedTime = millis() - startTime;
  let remainingTime = stageTime - elapsedTime;

  // テキスト情報を描画
  fill(0);
  textSize(20);
  textAlign(LEFT);
  text(`Time: ${(remainingTime / 1000).toFixed(1)}`, 10, 30);
  text(`Stage: ${currentStage + 1}`, 10, 50);
  text(`Score: ${score.toFixed(1)}`, 10, 70);

  if (remainingTime <= 0) {
    drawing = false;
    alert('Time up!');
    setupStage();
  }
}

function mousePressed() {
  handleInputStart(mouseX, mouseY);
}

function mouseReleased() {
  handleInputEnd(mouseX, mouseY);
}

function touchStarted() {
  handleInputStart(touchX, touchY);
  return false; // デフォルトのスクロール動作を防ぐ
}

function touchEnded() {
  handleInputEnd(touchX, touchY);
  return false; // デフォルトのスクロール動作を防ぐ
}

function handleInputStart(x, y) {
  if (startPoint && dist(x, y, startPoint.x, startPoint.y) < 20) {
    drawing = true;
    points = [];
    startTime = millis();
  }
}

function handleInputEnd(x, y) {
  if (drawing) {
    if (endPoint && dist(x, y, endPoint.x, endPoint.y) < 20) {
      calculateScore();
      alert('Stage Cleared! Score: ' + score.toFixed(1));
      setupStage();
    }
    drawing = false;
  }
}

function setupStage() {
  points = []; // 線をリセット
  startPoint = createVector(random(50, 350), random(50, 350)); // スタート地点
  endPoint = createVector(random(50, 350), random(50, 350)); // ゴール地点
  obstacles = generateObstacles(currentStage); // 障害物を生成
  currentStage++;
  startTime = millis();

  // デバッグ用ログ
  console.log('setupStage called');
  console.log('Start Point:', startPoint);
  console.log('End Point:', endPoint);
}

function generateObstacles(stage) {
  let numObstacles = stage;
  let obs = [];
  for (let i = 0; i < numObstacles; i++) {
    let x = random(50, 350);
    let y = random(50, 350);
    let w = random(30, 100);
    let h = random(30, 100);
    obs.push({ x, y, w, h });
  }
  return obs;
}

function calculateScore() {
  let lineLength = 0;
  for (let i = 1; i < points.length; i++) {
    lineLength += dist(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y);
  }
  let shortestDistance = dist(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
  let scoreForStage = Math.max(0, 100 - (lineLength / shortestDistance) * 100);
  score += scoreForStage;
}

function checkCollision(x, y) {
  for (let obs of obstacles) {
    if (x > obs.x && x < obs.x + obs.w && y > obs.y && y < obs.y + obs.h) {
      return true;
    }
  }
  return false;
}

function createStartButton() {
  let button = createButton('ゲームを開始する');
  button.position(width / 2 - 50, height / 2 - 20); // 中央に配置
  button.mousePressed(() => {
    gameStarted = true;
    button.remove();
    setupStage(); // ステージを初期化
    loop(); // 描画を再開
  });
}
