'use strict';

// const debugPlane = require('./debug_plane');
// const debugBlock = require('./debug_block');

let ctx;
let w;
let h;

let turtleImage;
let treasureImage;

// let tileSize = 80;

let tileColours = {
  'W':'#6666CC',
  'L':'#BA6223',
  'G':'#B0ff07',
  '0':'#000000',
}

function drawTile(tile, x, y, tileSize){
  let colour = tileColours[tile];

  ctx.beginPath();
  ctx.strokeStyle = '#000000';
  ctx.fillStyle = colour;
  ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
  ctx.rect(x * tileSize, y * tileSize, tileSize, tileSize);
  ctx.stroke();
  // ctx.fill();
}

function drawAtPointWithRotation(x, y, rotation, drawMethod){
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  drawMethod();
  ctx.restore();
}


const stageView = {

  init(w, h){
    let canvas = document.getElementById('stage');
    canvas.width = w;
    canvas.height = h;
    ctx = canvas.getContext('2d');

    turtleImage = document.getElementById('turtle-image');
    treasureImage = document.getElementById('treasure-image');
  },

  update(model){

    model.layout.forEach((row, i) => {
      row.forEach((col, j) => {
        drawTile(col, j, i, model.tileSize);
      });
    });

    ctx.drawImage(treasureImage, 
      model.treasure.x * model.tileSize,
      model.treasure.y * model.tileSize,
      model.tileSize, model.tileSize
    );

    drawAtPointWithRotation(
      model.turtle.display.x * model.tileSize + model.tileSize * 0.4,
      model.turtle.display.y * model.tileSize + model.tileSize * 0.5,
      Math.PI / 2 * model.turtle.display.orientation,
      () => {
        ctx.drawImage(turtleImage, -model.tileSize * 0.35, -model.tileSize * 0.45, model.tileSize * 0.65, model.tileSize * 0.75);
      }
    )
  }
}

export default stageView;