const vm = require('./virtual_machine');
const environment = require('./environment');
const parser = require('./parser');
const level = require('./levels/level_1');
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
  reset();
  window.environment = environment;

  environment.sayOutput = sayOutput;

  environment.addEventListener(environment.GAME_ERROR, pause);
  environment.addEventListener(environment.GAME_COMPLETE, pause);


  let goButton = document.getElementById('go-button');
  // let pauseButton = document.getElementById('pause-button');
  let resetButton = document.getElementById('reset-button');

  goButton.addEventListener('click', run);
  // pauseButton.addEventListener('click', pause);
  resetButton.addEventListener('click', reset);

  restoreCode('level1');

  lastTime = new Date().getTime();
  animate();

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

    saveCode('level1', programString)
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
  requestAnimationFrame(animate);
  model.update(delta);
  stageView.update(model, delta);
}

function saveCode(level, code){
  localStorage.setItem('level:' + level, code);
}

function restoreCode(level){
  let code = localStorage['level:' + level];
  if(code){
    codeEntry.value = code; 
  }
}

document.body.onload = init;