const clc = require("cli-color");
const parser = require("fast-xml-parser");
const colorConvert = require("color-convert");
const yScale = 12;
const xScale = 7;
const serviceColors = {
  lambda: clc.bgYellow,
  apigateway: clc.bgRed,
  sqs: clc.bgRed,
  sns: clc.bgRed,
  dynamodb: clc.bgBlue,
};

let highestY = 0;
function render(xml) {
  const doc = parser.parse(xml, {
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });

  console.clear();
  const mxGraphModel = doc.mxGraphModel || doc.mxfile.diagram.mxGraphModel;
  for (const cell of mxGraphModel.root.mxCell) {
    if (
      cell.mxGeometry &&
      cell.mxGeometry.Array &&
      cell.mxGeometry.Array.as === "points"
    ) {
      let lastKnownX, lastKnownY;
      const color = Math.floor(Math.random() * 200 + 100);
      for (let i = 0; i < cell.mxGeometry.Array.mxPoint.length; i++) {
        const point = cell.mxGeometry.Array.mxPoint[i];
        if (lastKnownX && lastKnownY) {
          edge(
            lastKnownX / xScale,
            lastKnownY / yScale,
            (point.x || lastKnownX) / xScale,
            (point.y || lastKnownY) / yScale,
            color,
            i === cell.mxGeometry.Array.mxPoint.length - 1
          );
        }
        lastKnownX = point.x || lastKnownX;
        lastKnownY = point.y || lastKnownY;
        highestY = Math.max(highestY, lastKnownY);
      }
    }
  }

  for (const cell of mxGraphModel.root.mxCell) {
    if (cell.mxGeometry && cell.mxGeometry.width) {
      const resourceType = cell.style.match(/resIcon=mxgraph.aws4.(.+);/);
      const color = cell.style.match(/fillColor=#(.+?);/);
      box(
        cell.mxGeometry.x / xScale,
        cell.mxGeometry.y / yScale,
        resourceType ? resourceType[1] : "",
        cell.value,
        color ? color[1] : "#000000"
      );
      highestY = Math.max(cell.mxGeometry.y + 4, highestY);
    }
  }
  process.stdout.write(clc.move.bottom);
  process.stdout.write(clc.move.lineBegin);
}

function edge(fromX, fromY, toX, toY, color, isLast) {
  const coloredLine = clc.xterm(color);
  let x = fromX;
  let y = fromY;
  const deltaX = Math.max(Math.min(1, (toX - fromX) / xScale), -1);
  const deltaY = Math.max(Math.min(1, (toY - fromY) / yScale), -1);
  let prevX = Math.floor(x);
  let prevY = Math.floor(y);
  let safetyExit = 0;
  while (
    (Math.floor(x) !== Math.floor(toX) || Math.floor(y) !== Math.floor(toY)) &&
    safetyExit++ < 50
  ) {
    const flooredX = Math.floor(x);
    const flooredY = Math.floor(y);
    if (flooredX !== Math.floor(toX)) x = x + deltaX;
    if (flooredY !== Math.floor(toY)) y = y + deltaY;
    let char = "+";
    if (flooredY === prevY && flooredX !== prevX) char = "─";
    if (flooredY === prevY && flooredX === prevX) char = "─";
    if (flooredY > prevY) {
      if (flooredX == prevX) char = "│";
      if (flooredX > prevX) {
        char = "└";
        moveToAbsolute(flooredX, flooredY - 1);
        process.stdout.write(coloredLine("┐"));
      }
      if (flooredX < prevX) {
        char = "┘";
        moveToAbsolute(flooredX, flooredY - 1);
        process.stdout.write(coloredLine("┌"));
      }
    }
    if (flooredY < prevY) {
      if (flooredX === prevX) char = "│";
      if (flooredX > prevX) {
        char = "┌";
        moveToAbsolute(flooredX, flooredY + 1);
        process.stdout.write(coloredLine("┘"));
      }
      if (flooredX < prevX) {
        char = "┐";
        moveToAbsolute(flooredX, flooredY + 1);
        process.stdout.write(coloredLine("└"));
      }
    }
    prevX = flooredX;
    prevY = flooredY;
    moveToAbsolute(flooredX, flooredY);
    process.stdout.write(coloredLine(char));
  }
  if (isLast) {
    moveToAbsolute(toX, toY);
    if (fromX > toX) process.stdout.write(coloredLine("<"));
    else process.stdout.write(coloredLine(">"));
  }
}

function box(x, y, type, text, color) {
  const coloredBox =
    clc.bgXterm(rgbToX256(...colorConvert.hex.rgb(color))) || clc.bgBlack;

  y = y || 0;
  x = x || 0;
  const height = 2;
  if (text.length > 20) {
    text = text.substring(0, 20) + "...";
  }
  const width = Math.max(text.length, type.length + 2) + 2;
  moveToAbsolute(x, y);
  print(coloredBox, `┌${"─".repeat(width - 2)}╮`);
  for (let row = 0; row < height; row++) {
    moveToRelative(-width, 1);
    print(coloredBox, `│${" ".repeat(width - 2)}│`);
  }
  moveToRelative(-width, 1);
  print(coloredBox, `╰${"─".repeat(width - 2)}╯`);
  moveToAbsolute(x + 1, y + Math.floor(height / 2));
  print(coloredBox, text);
  moveToAbsolute(x + 1, y + Math.floor(height / 2) + 1);
  print(coloredBox, `(${type})`);
}

function print(coloredBox, text) {
  process.stdout.write(coloredBox(text));
}

function moveToAbsolute(x, y) {
  process.stdout.write(clc.move.to(x, y + 7));
}

function moveToRelative(x, y) {
  process.stdout.write(clc.move(x, y));
}

function rgbToX256(r, g, b) {
  // Calculate the nearest 0-based color index at 16 .. 231
  const v2ci = (v) => {
    if (v < 48) {
      return 0;
    } else if (v < 115) {
      return 1;
    } else {
      return Math.trunc((v - 35) / 40);
    }
  };

  const ir = v2ci(r);
  const ig = v2ci(g);
  const ib = v2ci(b);
  const colorIndex = 36 * ir + 6 * ig + ib;

  // Calculate the nearest 0-based gray index at 232 .. 255
  const average = Math.trunc((r + g + b) / 3);
  const grayIndex = average > 238 ? 23 : Math.trunc((average - 3) / 10);

  // Calculate the represented colors back from the index
  const i2cv = [0, 0x5f, 0x87, 0xaf, 0xd7, 0xff];
  const cr = i2cv[ir];
  const cg = i2cv[ig];
  const cb = i2cv[ib];
  const gv = 8 + 10 * grayIndex;

  // Return the one which is nearer to the original input rgb value
  const distSquare = (A, B, C, a, b, c) => {
    return (A - a) * (A - a) + (B - b) * (B - b) + (C - c) * (C - c);
  };
  const colorErr = distSquare(cr, cg, cb, r, g, b);
  const grayErr = distSquare(gv, gv, gv, r, g, b);

  return colorErr <= grayErr ? 16 + colorIndex : 232 + grayIndex;
}

module.exports = {
  render,
};
