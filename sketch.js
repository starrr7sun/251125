let stopSheet;
let rollSheet;
let stopAnimation = [];
let rollAnimation = [];
let jumpSheet;
let jumpAnimation = [];
let lightningSheet;
let lightningAnimation = [];
let boomSheet;
let boomAnimation = [];

const stopFrameCount = 15;
const stopFrameWidth = 745 / 15;

const rollFrameCount = 10;
const rollFrameWidth = 705 / 10; // 70.5
const rollFrameHeight = 53;

const jumpFrameCount = 12;
const jumpFrameWidth = 679 / 12; // 56.58...
const jumpFrameHeight = 52;

const lightningFrameCount = 12;
const lightningFrameWidth = 883 / 12; // 73.58...
const lightningFrameHeight = 152;

const boomFrameCount = 8;
const boomFrameWidth = 715 / 8; // 89.375
const boomFrameHeight = 105;

let currentFrame = 0;
let jumpFrame = 0;
let lightningFrame = 0;
let boomFrame = 0;

let characterX, characterY;
let originalY;
const characterSpeed = 5;
let isFacingLeft = false; // 追蹤角色方向
let isJumping = false;
let velocityY = 0;
const gravity = 0.6;
const jumpPower = -15;
let isLightning = false;
let isBooming = false;

function preload() {
  // 預先載入圖片精靈檔案
  stopSheet = loadImage('1/stop/stop.png');
  rollSheet = loadImage('1/roll/roll.png');
  jumpSheet = loadImage('1/jump/jump.png');
  lightningSheet = loadImage('1/lightning/lightning.png');
  boomSheet = loadImage('1/boom/boom.png');
}

function setup() {
  // 建立一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);

  // 初始化角色位置於畫布中央
  characterX = width / 2;
  characterY = height / 2;
  originalY = characterY;

  // 從 'stop.png' 圖片精靈中擷取每一個影格
  for (let i = 0; i < stopFrameCount; i++) {
    const x = Math.round(i * stopFrameWidth);
    const nextX = Math.round((i + 1) * stopFrameWidth);
    const w = nextX - x; // 51px
    let frame = stopSheet.get(x, 0, w, 51);
    stopAnimation.push(frame);
  }

  // --- 為 roll 動畫建立乾淨的圖片精靈 ---
  const cleanRollFrameWidth = 70;
  const cleanRollSheetWidth = cleanRollFrameWidth * rollFrameCount;
  let cleanRollSheet = createGraphics(cleanRollSheetWidth, rollFrameHeight);
  for (let i = 0; i < rollFrameCount; i++) {
    const sourceX = Math.floor(i * rollFrameWidth);
    const sourceW = Math.floor((i + 1) * rollFrameWidth) - sourceX;
    cleanRollSheet.image(rollSheet, i * cleanRollFrameWidth, 0, cleanRollFrameWidth, rollFrameHeight, sourceX, 0, sourceW, rollFrameHeight);
  }
  for (let i = 0; i < rollFrameCount; i++) {
    let frame = cleanRollSheet.get(i * cleanRollFrameWidth, 0, cleanRollFrameWidth, rollFrameHeight);
    rollAnimation.push(frame);
  }

  // --- 為 jump 動畫建立乾淨的圖片精靈 ---
  const cleanJumpFrameWidth = 56;
  const cleanJumpSheetWidth = cleanJumpFrameWidth * jumpFrameCount;
  let cleanJumpSheet = createGraphics(cleanJumpSheetWidth, jumpFrameHeight);
  for (let i = 0; i < jumpFrameCount; i++) {
    const sourceX = Math.floor(i * jumpFrameWidth);
    const sourceW = Math.floor((i + 1) * jumpFrameWidth) - sourceX;
    cleanJumpSheet.image(jumpSheet, i * cleanJumpFrameWidth, 0, cleanJumpFrameWidth, jumpFrameHeight, sourceX, 0, sourceW, jumpFrameHeight);
  }
  for (let i = 0; i < jumpFrameCount; i++) {
    let frame = cleanJumpSheet.get(i * cleanJumpFrameWidth, 0, cleanJumpFrameWidth, jumpFrameHeight);
    jumpAnimation.push(frame);
  }

  // --- 為 lightning 動畫建立乾淨的圖片精靈 ---
  const cleanLightningFrameWidth = 73;
  const cleanLightningSheetWidth = cleanLightningFrameWidth * lightningFrameCount;
  let cleanLightningSheet = createGraphics(cleanLightningSheetWidth, lightningFrameHeight);
  for (let i = 0; i < lightningFrameCount; i++) {
    const sourceX = Math.floor(i * lightningFrameWidth);
    const sourceW = Math.floor((i + 1) * lightningFrameWidth) - sourceX;
    cleanLightningSheet.image(lightningSheet, i * cleanLightningFrameWidth, 0, cleanLightningFrameWidth, lightningFrameHeight, sourceX, 0, sourceW, lightningFrameHeight);
  }
  for (let i = 0; i < lightningFrameCount; i++) {
    let frame = cleanLightningSheet.get(i * cleanLightningFrameWidth, 0, cleanLightningFrameWidth, lightningFrameHeight);
    lightningAnimation.push(frame);
  }

  // --- 為 boom 動畫建立乾淨的圖片精靈 ---
  const cleanBoomFrameWidth = 89;
  const cleanBoomSheetWidth = cleanBoomFrameWidth * boomFrameCount;
  let cleanBoomSheet = createGraphics(cleanBoomSheetWidth, boomFrameHeight);
  for (let i = 0; i < boomFrameCount; i++) {
    const sourceX = Math.floor(i * boomFrameWidth);
    const sourceW = Math.floor((i + 1) * boomFrameWidth) - sourceX;
    cleanBoomSheet.image(boomSheet, i * cleanBoomFrameWidth, 0, cleanBoomFrameWidth, boomFrameHeight, sourceX, 0, sourceW, boomFrameHeight);
  }
  for (let i = 0; i < boomFrameCount; i++) {
    let frame = cleanBoomSheet.get(i * cleanBoomFrameWidth, 0, cleanBoomFrameWidth, boomFrameHeight);
    boomAnimation.push(frame);
  }

  // 將圖片的繪製模式設定為中心對齊
  imageMode(CENTER);
}

function draw() {
  // 設定背景顏色
  background('#90e0ef');

  let activeAnimation;
  let currentAnimationLength;
  let animationDirection = 1; // 1 代表正向播放, -1 代表反向

  // 檢查是否要觸發一次性動畫
  if (keyIsDown(UP_ARROW) && !isJumping && !isLightning && !isBooming) {
    isJumping = true;
    velocityY = jumpPower;
    jumpFrame = 0;
  }
  if (keyIsDown(DOWN_ARROW) && !isLightning && !isJumping && !isBooming) {
    isLightning = true;
    velocityY = jumpPower / 2; // 使用較小的力道
    lightningFrame = 0;
  }
  if (keyIsDown(32) && !isBooming && !isJumping && !isLightning) { // 32 是空白鍵
    isBooming = true;
    boomFrame = 0;
  }

  if (isJumping) {
    activeAnimation = jumpAnimation;
    currentAnimationLength = jumpFrameCount;
    characterY += velocityY;
    velocityY += gravity;

    // 當角色掉回或低於原始位置時，將其固定在原始位置
    if (characterY > originalY) {
      characterY = originalY;
      velocityY = 0;
    }

    // 播放跳躍動畫
    if (frameCount % 8 === 0) { // 用較快的速度播放跳躍動畫
      jumpFrame++;
    }
    // 確保 currentFrame 不會超過動畫的最大索引
    currentFrame = min(jumpFrame, jumpFrameCount - 1);

    // 動畫結束且回到地面
    if (jumpFrame >= jumpFrameCount) {
      isJumping = false;
      characterY = originalY; // 重設回地面
      currentFrame = 0; // 重置影格，以便下一個動畫從頭開始
    }
  } else if (isLightning) {
    activeAnimation = lightningAnimation;
    currentAnimationLength = lightningFrameCount;
    characterY += velocityY;
    velocityY += gravity;

    // 播放 lightning 動畫
    if (frameCount % 8 === 0) {
      lightningFrame++;
    }
    // 更新 currentFrame 以便繪製正確的影格
    currentFrame = min(lightningFrame, lightningFrameCount - 1); // 確保索引不超過範圍

    // 動畫結束且回到地面
    if (currentFrame >= lightningFrameCount - 1) { // 檢查是否為最後一格
      isLightning = false;
      characterY = originalY; // 重設回地面
      currentFrame = 0; // 重置影格，以便下一個動畫從頭開始
    }
  } else if (isBooming) {
    activeAnimation = boomAnimation;
    currentAnimationLength = boomFrameCount;

    // 播放 boom 動畫
    if (frameCount % 8 === 0) {
      boomFrame++;
    }
    // 確保 currentFrame 不會超過動畫的最大索引
    currentFrame = min(boomFrame, boomFrameCount - 1);

    // 動畫結束且回到地面
    if (boomFrame >= boomFrameCount) {
      isBooming = false;
      characterY = height / 2; // 重設回地面
      currentFrame = 0; // 重置影格，以便下一個動畫從頭開始
    }
  } else {
    // 處理左右移動和站立
    if (keyIsDown(RIGHT_ARROW)) {
      activeAnimation = rollAnimation; // 向右滾動
      currentAnimationLength = rollFrameCount;
      characterX += characterSpeed;
      isFacingLeft = false;
      animationDirection = 1;
    } else if (keyIsDown(LEFT_ARROW)) {
      activeAnimation = rollAnimation; // 向左滾動
      currentAnimationLength = rollFrameCount;
      characterX -= characterSpeed;
      isFacingLeft = true;
      animationDirection = -1; // 反向播放滾動
    } else {
      activeAnimation = stopAnimation; // 根據最後方向站立
      currentAnimationLength = stopFrameCount;
      animationDirection = 1;
    }

    if (frameCount % 12 === 0) {
      currentFrame = (currentFrame + animationDirection + currentAnimationLength) % currentAnimationLength;
    }
  }

  // 繪製角色
  push();
  translate(characterX, characterY);
  if (isFacingLeft) {
    scale(-1, 1); // 水平翻轉
  }
  image(activeAnimation[currentFrame], 0, 0);
  pop();
}
