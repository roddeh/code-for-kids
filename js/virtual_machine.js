const EventDispacher = require('./utils/event_dispatcher');


const STEP_TIME = 1000;
let paused = false;
let stack;
let timeoutInterval;

const nativeFunctions = {
  loop(params, commands, program, environment, paramHash, caller, loopCommand){
    let times = params[0];
    for(var i = 0; i < times; i++){
      evaluateCommands(commands, program, environment, paramHash, loopCommand);
    }    
  }
};

// Methods that evaluate the program that has been passed to the VM.

function evaluateFunction(program, environment, func, functionParams ,caller){

  let func = program[func];
  let commands = func.body;
  let params = func.params;
  let paramHash = {};

  if(params){
    params.forEach((p, i) => {
      paramHash[p] = functionParams[i];
    });        
  }

  evaluateCommands(commands, program, environment, paramHash, caller);
}


function evaluateCommands(commands, program, environment, paramHash, caller){
  commands.forEach((c) => {
    let method = c.method;

    let params = evaluateParameters(
      c.params,
      paramHash,
      environment
    );

    if(typeof nativeFunctions[method] === 'function'){
      // params.push(program, environment, paramHash, caller, c)
      nativeFunctions[method](params, c.body, program, environment, paramHash, caller, c);
      return;
      // return stack.push({method:nativeFunctions[method], scope:nativeFunctions, params:params, lineNumber:c.lineNumber, caller})
    }
    else if(typeof environment[method] === 'function'){
      return stack.push({method:environment[method], scope:environment, params:params, lineNumber:c.lineNumber, caller})
    }
    else if(program[method]){
      return evaluateFunction(program, environment, method, params, c);
    }

    throw new Error('Unknown function', method);
  });
}

function evaluateParameters(params, localParams, environment){
  return params.map((p) => {
    // Check to see if we are dealing with an integer.
    let intP = parseInt(p);
    if(!isNaN(intP)){
      return intP;
    }

    // Check to see if we are dealing with a string.
    if(p.charAt(0) === '\'' && p.charAt(p.length - 1) === '\''){
      return p.substring(1, p.length - 1);
    }

    // Otherwise look for the var in localParams followed by the environment.
    return localParams[p] || environment[p];
  })
}

// Methods that actually run through the stack after it has been evaluated

function runStack(){
  vm.dispatchEvent(vm.START)
  runFunction();
}

function runFunction(){
  if(!stack.length || paused){
    vm.dispatchEvent(vm.COMPLETE)
    return;
  }

  let func = stack.shift();
  func.method.apply(func.scope, func.params);

  vm.dispatchEvent(vm.RUN_FUNCTION, func)
  runNext()
}

function runNext(){
  timeoutInterval = setTimeout(runFunction, STEP_TIME);  
}


let vm = {

  START: 'start',
  RUN_FUNCTION: 'runFunction',
  COMPLETE: 'complete',

  run(program, environment){
    clearInterval(timeoutInterval);
    stack = [];
    evaluateFunction(program, environment, '_main', [], null);
    paused = false;
    runStack();
  },

  pause(){
    clearInterval(timeoutInterval);
    paused = true;
  },

  unpause(){
    paused = false;
  },

  continueRun(){
    paused = false;
    runFunction();
  },

  isPaused(){
    return paused;
  },

}

EventDispacher.init(vm);

export default vm;