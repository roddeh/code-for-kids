const vm = require('./virtual_machine');
// const environment = require('./environment');

const environment = require('./environments/turtle/turtle-environment');

const parser = require('./parser');
// const level = require('./levels/level_1');
const model = require('./model');
const stageView = require('./stage_view');

let lastTime;

let lineHighlight;
let lineHighlightCaller;
let sayOutput;
let codeEntry;

function show(target){
  target.style.visibility = 'visible';
}

function hide(target){
  target.style.visibility = 'hidden';
}

function moveToLine(target, lineNumber){
  target.style.top = lineNumber * 21 + 1 + 'px'; 
}

function init(){
  lineHighlight = document.getElementById('line-highlight');
  lineHighlightCaller = document.getElementById('line-highlight-caller');
  sayOutput = document.getElementById('say-output');
  codeEntry = document.getElementById('code-entry');

  vm.addEventListener(vm.RUN_FUNCTION, (f) => {
    moveToLine(lineHighlight, f.lineNumber)

    if(f.caller){
      show(lineHighlightCaller);
      moveToLine(lineHighlightCaller, f.caller.lineNumber)
    }
    else{
      hide(lineHighlightCaller);
    }

  });

  vm.addEventListener(vm.START, () => {
    show(lineHighlight);
  });

  vm.addEventListener(vm.COMPLETE, () => {
    hide(lineHighlight);
    hide(lineHighlightCaller);
  });






  stageView.init(400, 400);



  // let loadLevelButton = document.getElementById('load-level');
  // loadLevelButton.addEventListener('click', () => { loadLevel();});

  let levelSelect = document.getElementById('level-select');
  levelSelect.addEventListener('change', loadLevel);

  environment.sayOutput = sayOutput;
  environment.addEventListener(environment.GAME_ERROR, pause);
  environment.addEventListener(environment.GAME_COMPLETE, pause);


  let goButton = document.getElementById('go-button');
  let resetButton = document.getElementById('reset-button');
  goButton.addEventListener('click', run);
  resetButton.addEventListener('click', reset);


  // loadLevel(envName, lvlName);
  setDefaultLevel();
  loadLevel();

  lastTime = new Date().getTime();
  animate();
}

let environmentName;
let levelName;
let level;

function setDefaultLevel(){
  console.log('setDefaultLevel');
  let lastLevel = localStorage['lastLevel'];

  if(!lastLevel){
    return;
  }

  lastLevel = lastLevel.split(':');
  if(lastLevel.length != 2){
    return;
  }

  document.getElementById('environment-select').value = lastLevel[0];
  document.getElementById('level-select').value = lastLevel[1];  
}

function setSelectValue(id, value){
  let select = document.getElementById(id);
  select.childNodes.forEach((cn) => {
    console.log(cn);
  })
}


function loadLevel(){
  console.log('load');
  environmentName = document.getElementById('environment-select').value;
  levelName = document.getElementById('level-select').value;

  stageView.clear();
  // 
  level = environment.levels[levelName];
  restoreCode();

  reset();

  // Set the last level
  localStorage.setItem('lastLevel', environmentName + ':' + levelName);
}

function run(){

  // if(vm.isPaused()){
  //   vm.continueRun();
  // }
  // else{
    reset();
    let programString = codeEntry.value;
    let program = parser.parse(programString);

    // console.log(program);
    vm.run(program, environment);  

    saveCode(programString)
  // }
}

function pause(){
  vm.pause();
}

function reset(){
  vm.pause();
  vm.unpause();
  model.init(level);
  environment.model = model;
  environment.turtle = model.turtle;
  stageView.update(model, 0);
  sayOutput.innerHTML = '';
  hide(lineHighlight);
  hide(lineHighlightCaller);
}

function animate(timestamp) {  
  let delta = Math.max(0, timestamp - lastTime) || 0;
  lastTime = timestamp;
  model.update(delta);
  stageView.update(model, delta);


  requestAnimationFrame(animate);
}

function saveCode(code){
  localStorage.setItem(environmentName + '-' + levelName, code);
}

function restoreCode(){
  let code = localStorage[environmentName + '-' + levelName];
  codeEntry.value = code || ''; 
}

document.body.onload = init;