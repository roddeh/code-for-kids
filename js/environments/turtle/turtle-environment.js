let EventDispatcher = require('../../utils/event_dispatcher');

const levels = {
  'level_1':require('./levels/level_1'),
  'level_2':require('./levels/level_2'),
  'level_3':require('./levels/level_3'),
  'level_4':require('./levels/level_4'),
  'level_5':require('./levels/level_5'),
  'level_6':require('./levels/level_6'),
  'level_7':require('./levels/level_7'),
  'level_8':require('./levels/level_8'),
  'level_9':require('./levels/level_9'),
  'level_10':require('./levels/level_10'),
}


const LAND = 'L';
const WATER = 'W';
const VOID = '0'


function move(target, distance, material, errorMessage){
  let dir = (target.orientation === 0 || target.orientation === 2) ? 'y' : 'x';
  let mod = (target.orientation === 0 || target.orientation === 3) ? -1 : 1;
  let movesToMake = distance * mod;

  while(movesToMake !== 0){
    movesToMake -= mod;

    let nextPos = {
      x: target.x,
      y: target.y, 
    };

    nextPos[dir] += mod;

    let tileType = environment.model.getTileAt(nextPos.x, nextPos.y);

    if(tileType === material){
      target[dir] += mod;  
    }
    else{
      environment.say(errorMessage);
      environment.dispatchEvent(environment.GAME_ERROR);
      return;
    }

    if(target.x === environment.model.treasure.x && target.y === environment.model.treasure.y){
      environment.dispatchEvent(environment.GAME_COMPLETE);
      environment.say('I FOUND THE TREASURE');
    }
  }
}


let environment = {

  left:-1,
  right:1,

  GAME_ERROR: 'gameError',
  GAME_COMPLETE: 'gameComplete',

  levels,

  walk(target, distance){
    move(target, distance, LAND, 'I can only walk on land');
  },

  swim(target, distance){
    move(target, distance, WATER, 'I can only swim in the water');
  },

  turn(target, direction){
    target.orientation += direction % 4;
    if(target.orientation < 0){
      target.orientation = 4 + target.orientation;
    }
    target.orientation = target.orientation % 4;
  },

  say(str, p1, p2, p3){
    console.log('SAY', str, p1, p2, p3);
    environment.sayOutput.innerHTML = str;
  }
};

EventDispatcher.init(environment);

export default environment;