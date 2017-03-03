const clone = require('./utils/clone');

function parseLayout(layoutString){
  return layoutString.split('\n')
    .filter((l) => l !== '')
    .map((l) => l.split(''));
}

function animProp(subject, prop, target){
  let current = subject[prop];
  let delta = (target - current) * 0.1;
  subject[prop] += delta;
  if(Math.abs(delta) < 0.01){
    subject[prop] = target;
  }
}

const model = {

  init(levelData){
    this.turtle = clone(levelData.turtle);
    this.turtle.display = clone(levelData.turtle);
    this.layout = parseLayout(levelData.layout);
    this.treasure = clone(levelData.treasure);
    this.tileSize = levelData.tileSize;
  },

  update(delta){
    (['x', 'y', 'orientation']).forEach((prop) => {
      animProp(this.turtle.display, prop, this.turtle[prop]);
    });
  },

  getTileAt(x, y){
    try{
      return this.layout[y][x];
    }
    catch(e){
      return null;
    }
  },

}

export default model;