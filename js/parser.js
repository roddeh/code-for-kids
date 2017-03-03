const trim = require('./utils/trim');

function parseCommand(command){

  let code = command.code;

  let parts = [];
  let i = 0;
  let currentPart = '';
  let buildingString = false;

  while(i < code.length){
    let c = code.charAt(i);
    if(c === '\''){
      if(buildingString){
        buildingString = false;
        currentPart += c;
        parts.push(currentPart);
        currentPart = '';
      }
      else{
        buildingString = true;
        currentPart += c;
      }
    }
    else if(c === ' '){
      if(buildingString){
        currentPart += c;
      }
      else{
        if(currentPart !== ''){
          parts.push(currentPart);
          currentPart = '';
        }  
      }
    }
    else {
      currentPart += c;
    }

    i++;
  }

  if(currentPart !== ''){
    parts.push(currentPart);
  }

  command.method = parts[0];
  command.params = parts.slice(1);

  // console.log("PARTS", parts);

  return command;
}

// let comm = parseCommand({code:"say 'hi yugo 4' 5 blah blah  'you are funny'"})
// let comm = parseCommand({code:'walk turtle 5'});
// let comm = parseCommand({code:"say blah    blah blah"})
// console.log(comm);

function parseFunction(func){
  let parts = func.code.split(' ');
  func.name = parts[1];
  func.params = parts.slice(2);
  func.body = [];
  return func;
}

function parseLoop(loop){
  let parts = loop.code.split(' ');
  loop.method = 'loop';
  // loop.params = [parseInt(parts[1])];
  loop.params = parts.slice(1);
  loop.body = [];
  return loop;
}


const parser = {
  
  parse(code){
    let lines = code.split('\n')
      .map((l, i) => {
        return {lineNumber:i, code:trim(l)}
      })
      .filter((l) => l.code !== '')

    let program = {}

    program._main = {
      name: '_main',
      params: [],
      body: [],
    }



    let currentFunction = '_main';

    let functionStack = [];

    let loopCounter = 0;

    let loops = [];

    lines.forEach((l) => {
      if(l.code.indexOf('function ') === 0){
        let func = parseFunction(l);

        functionStack.push(currentFunction);
        currentFunction = func.name;

        program[func.name] = func;
      }
      else if(l.code.indexOf('loop ') === 0){
        // Create the loop
        let loop = parseLoop(l);
        loop.name = '_loop' + loopCounter++;
        program[loop.name] = loop;
        // Add the call of the loop to the current function
        program[currentFunction].body.push(loop);
        functionStack.push(currentFunction);
        currentFunction = loop.name;
        loops.push(loop);
      }
      else if(l.code === 'end'){
        currentFunction = functionStack.pop();
      }
      else{
        program[currentFunction].body.push(
          parseCommand(l)
        );
      }
    })


    console.log("PROGRAM", program);

    

    return program;
  },


};

export default parser;