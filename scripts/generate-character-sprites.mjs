import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public");

const W = 32;
const H = 48;

const RED = [255, 0, 0];
const DARK_RED = [51, 0, 0];
const WHITE = [255, 255, 255];
const MAGENTA = [255, 0, 255];

function createCanvas() {
  return new PNG({ width: W, height: H });
}

function setPixel(png, x, y, [r, g, b], alpha = 255) {
  if (x < 0 || y < 0 || x >= W || y >= H) {
    return;
  }

  const index = (W * y + x) << 2;
  png.data[index] = r;
  png.data[index + 1] = g;
  png.data[index + 2] = b;
  png.data[index + 3] = alpha;
}

function fillRect(png, x, y, width, height, color, alpha = 255) {
  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      setPixel(png, x + col, y + row, color, alpha);
    }
  }
}

function writeSprite(relativePath, png) {
  const filePath = path.join(publicDir, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, PNG.sync.write(png));
  console.log(`wrote ${relativePath}`);
}

function drawSkin() {
  const png = createCanvas();
  fillRect(png, 11, 6, 10, 10, RED);
  fillRect(png, 10, 16, 12, 14, RED);
  fillRect(png, 8, 30, 6, 12, RED);
  fillRect(png, 18, 30, 6, 12, RED);
  fillRect(png, 6, 18, 4, 10, RED);
  fillRect(png, 22, 18, 4, 10, RED);
  fillRect(png, 12, 8, 8, 2, DARK_RED);
  writeSprite("character/skin/skin-1.png", png);
}

function drawPantsVariant(index, widthOffset) {
  const png = createCanvas();
  fillRect(png, 8 + widthOffset, 28, 7 - widthOffset, 14, RED);
  fillRect(png, 17, 28, 7 - widthOffset, 14, RED);
  if (index === 2) {
    fillRect(png, 8, 26, 16, 4, RED);
  }
  if (index === 3) {
    fillRect(png, 7, 24, 18, 6, RED);
  }
  writeSprite(`character/pants/pants-${index}.png`, png);
}

function drawShoesVariant(index) {
  const png = createCanvas();
  fillRect(png, 6, 40, 8, 4, RED);
  fillRect(png, 18, 40, 8, 4, RED);
  if (index >= 2) {
    fillRect(png, 5, 42, 10, 2, DARK_RED);
    fillRect(png, 17, 42, 10, 2, DARK_RED);
  }
  if (index === 3) {
    fillRect(png, 4, 38, 12, 3, RED);
    fillRect(png, 16, 38, 12, 3, RED);
  }
  writeSprite(`character/shoes/shoes-${index}.png`, png);
}

function drawTorsoVariant(index) {
  const png = createCanvas();
  fillRect(png, 9, 16, 14, 14, RED);
  if (index >= 2) {
    fillRect(png, 7, 18, 3, 10, RED);
    fillRect(png, 22, 18, 3, 10, RED);
  }
  if (index >= 3) {
    fillRect(png, 11, 18, 10, 8, DARK_RED);
  }
  if (index === 4) {
    fillRect(png, 10, 14, 12, 4, RED);
  }
  writeSprite(`character/torso/torso-${index}.png`, png);
}

function drawEyesVariant(index) {
  const png = createCanvas();
  fillRect(png, 12, 10, 3, 3, index === 1 ? RED : WHITE);
  fillRect(png, 17, 10, 3, 3, index === 1 ? RED : WHITE);
  fillRect(png, 13, 11, 1, 1, MAGENTA);
  fillRect(png, 18, 11, 1, 1, MAGENTA);
  if (index === 2) {
    fillRect(png, 11, 9, 5, 5, WHITE);
    fillRect(png, 16, 9, 5, 5, WHITE);
    fillRect(png, 13, 11, 2, 2, RED);
    fillRect(png, 18, 11, 2, 2, RED);
  }
  writeSprite(`character/eyes/eyes-${index}.png`, png);
}

function drawHeadVariant(index) {
  const png = createCanvas();
  const y = index <= 3 ? 4 : 2;
  fillRect(png, 10, y, 12, index >= 5 ? 12 : 10, RED);
  if (index === 2) {
    fillRect(png, 8, y + 2, 3, 3, RED);
    fillRect(png, 21, y + 2, 3, 3, RED);
  }
  if (index === 3) {
    fillRect(png, 9, y - 1, 14, 3, RED);
  }
  if (index >= 4) {
    fillRect(png, 11, y + 1, 10, 4, DARK_RED);
  }
  if (index >= 6) {
    fillRect(png, 9, y - 2, 14, 4, RED);
  }
  if (index === 7) {
    fillRect(png, 7, y, 4, 8, RED);
    fillRect(png, 21, y, 4, 8, RED);
  }
  writeSprite(`character/head/head-${index}.png`, png);
}

drawSkin();
for (let index = 1; index <= 3; index += 1) {
  drawPantsVariant(index, index - 1);
  drawShoesVariant(index);
}
for (let index = 1; index <= 4; index += 1) {
  drawTorsoVariant(index);
}
for (let index = 1; index <= 2; index += 1) {
  drawEyesVariant(index);
}
for (let index = 1; index <= 7; index += 1) {
  drawHeadVariant(index);
}

console.log("Character sprites generated.");
