/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var vm = __webpack_require__(1);
	var environment = __webpack_require__(2);
	var parser = __webpack_require__(3);
	var level = __webpack_require__(4);
	var model = __webpack_require__(5);
	var stageView = __webpack_require__(6);
	
	var lastTime = undefined;
	
	var lineHighlight = undefined;
	var lineHighlightCaller = undefined;
	var sayOutput = undefined;
	var codeEntry = undefined;
	
	function show(target) {
	  target.style.visibility = "visible";
	}
	
	function hide(target) {
	  target.style.visibility = "hidden";
	}
	
	function moveToLine(target, lineNumber) {
	  target.style.top = lineNumber * 21 + 1 + "px";
	}
	
	function init() {
	  lineHighlight = document.getElementById("line-highlight");
	  lineHighlightCaller = document.getElementById("line-highlight-caller");
	  sayOutput = document.getElementById("say-output");
	  codeEntry = document.getElementById("code-entry");
	
	  vm.addEventListener(vm.RUN_FUNCTION, function (f) {
	    moveToLine(lineHighlight, f.lineNumber);
	
	    if (f.caller) {
	      show(lineHighlightCaller);
	      moveToLine(lineHighlightCaller, f.caller.lineNumber);
	    } else {
	      hide(lineHighlightCaller);
	    }
	  });
	
	  vm.addEventListener(vm.START, function () {
	    show(lineHighlight);
	  });
	
	  vm.addEventListener(vm.COMPLETE, function () {
	    hide(lineHighlight);
	    hide(lineHighlightCaller);
	  });
	
	  stageView.init(400, 400);
	  reset();
	  window.environment = environment;
	
	  environment.sayOutput = sayOutput;
	
	  environment.addEventListener(environment.GAME_ERROR, pause);
	  environment.addEventListener(environment.GAME_COMPLETE, pause);
	
	  var goButton = document.getElementById("go-button");
	  // let pauseButton = document.getElementById('pause-button');
	  var resetButton = document.getElementById("reset-button");
	
	  goButton.addEventListener("click", run);
	  // pauseButton.addEventListener('click', pause);
	  resetButton.addEventListener("click", reset);
	
	  restoreCode("level1");
	
	  lastTime = new Date().getTime();
	  animate();
	}
	
	function run() {
	
	  // if(vm.isPaused()){
	  //   vm.continueRun();
	  // }
	  // else{
	  reset();
	  var programString = codeEntry.value;
	  var program = parser.parse(programString);
	
	  // console.log(program);
	  vm.run(program, environment);
	
	  saveCode("level1", programString);
	}
	
	function pause() {
	  vm.pause();
	}
	
	function reset() {
	  vm.pause();
	  vm.unpause();
	  model.init(level);
	  environment.model = model;
	  environment.turtle = model.turtle;
	  stageView.update(model, 0);
	  sayOutput.innerHTML = "";
	  hide(lineHighlight);
	  hide(lineHighlightCaller);
	}
	
	function animate(timestamp) {
	  var delta = Math.max(0, timestamp - lastTime) || 0;
	  lastTime = timestamp;
	  requestAnimationFrame(animate);
	  model.update(delta);
	  stageView.update(model, delta);
	}
	
	function saveCode(level, code) {
	  localStorage.setItem("level:" + level, code);
	}
	
	function restoreCode(level) {
	  var code = localStorage["level:" + level];
	  if (code) {
	    codeEntry.value = code;
	  }
	}
	
	document.body.onload = init;
	// }

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var EventDispacher = __webpack_require__(7);
	
	var STEP_TIME = 1000;
	var paused = false;
	var stack = undefined;
	var timeoutInterval = undefined;
	
	var nativeFunctions = {
	  loop: function loop(params, commands, program, environment, paramHash, caller, loopCommand) {
	    var times = params[0];
	    for (var i = 0; i < times; i++) {
	      evaluateCommands(commands, program, environment, paramHash, loopCommand);
	    }
	  }
	};
	
	// Methods that evaluate the program that has been passed to the VM.
	
	function evaluateFunction(program, environment, func, functionParams, caller) {
	
	  var func = program[func];
	  var commands = func.body;
	  var params = func.params;
	  var paramHash = {};
	
	  if (params) {
	    params.forEach(function (p, i) {
	      paramHash[p] = functionParams[i];
	    });
	  }
	
	  evaluateCommands(commands, program, environment, paramHash, caller);
	}
	
	function evaluateCommands(commands, program, environment, paramHash, caller) {
	  commands.forEach(function (c) {
	    var method = c.method;
	
	    var params = evaluateParameters(c.params, paramHash, environment);
	
	    if (typeof nativeFunctions[method] === "function") {
	      // params.push(program, environment, paramHash, caller, c)
	      nativeFunctions[method](params, c.body, program, environment, paramHash, caller, c);
	      return;
	      // return stack.push({method:nativeFunctions[method], scope:nativeFunctions, params:params, lineNumber:c.lineNumber, caller})
	    } else if (typeof environment[method] === "function") {
	      return stack.push({ method: environment[method], scope: environment, params: params, lineNumber: c.lineNumber, caller: caller });
	    } else if (program[method]) {
	      return evaluateFunction(program, environment, method, params, c);
	    }
	
	    throw new Error("Unknown function", method);
	  });
	}
	
	function evaluateParameters(params, localParams, environment) {
	  return params.map(function (p) {
	    // Check to see if we are dealing with an integer.
	    var intP = parseInt(p);
	    if (!isNaN(intP)) {
	      return intP;
	    }
	
	    // Check to see if we are dealing with a string.
	    if (p.charAt(0) === "'" && p.charAt(p.length - 1) === "'") {
	      return p.substring(1, p.length - 1);
	    }
	
	    // Otherwise look for the var in localParams followed by the environment.
	    return localParams[p] || environment[p];
	  });
	}
	
	// Methods that actually run through the stack after it has been evaluated
	
	function runStack() {
	  vm.dispatchEvent(vm.START);
	  runFunction();
	}
	
	function runFunction() {
	  if (!stack.length || paused) {
	    vm.dispatchEvent(vm.COMPLETE);
	    return;
	  }
	
	  var func = stack.shift();
	  func.method.apply(func.scope, func.params);
	
	  vm.dispatchEvent(vm.RUN_FUNCTION, func);
	  runNext();
	}
	
	function runNext() {
	  timeoutInterval = setTimeout(runFunction, STEP_TIME);
	}
	
	var vm = {
	
	  START: "start",
	  RUN_FUNCTION: "runFunction",
	  COMPLETE: "complete",
	
	  run: function run(program, environment) {
	    clearInterval(timeoutInterval);
	    stack = [];
	    evaluateFunction(program, environment, "_main", [], null);
	    paused = false;
	    runStack();
	  },
	
	  pause: function pause() {
	    clearInterval(timeoutInterval);
	    paused = true;
	  },
	
	  unpause: function unpause() {
	    paused = false;
	  },
	
	  continueRun: function continueRun() {
	    paused = false;
	    runFunction();
	  },
	
	  isPaused: function isPaused() {
	    return paused;
	  } };
	
	EventDispacher.init(vm);
	
	module.exports = vm;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var EventDispatcher = __webpack_require__(7);
	
	var LAND = "L";
	var WATER = "W";
	var VOID = "0";
	
	function move(target, distance, material, errorMessage) {
	  var dir = target.orientation === 0 || target.orientation === 2 ? "y" : "x";
	  var mod = target.orientation === 0 || target.orientation === 3 ? -1 : 1;
	  var movesToMake = distance * mod;
	
	  while (movesToMake !== 0) {
	    movesToMake -= mod;
	
	    var nextPos = {
	      x: target.x,
	      y: target.y };
	
	    nextPos[dir] += mod;
	
	    var tileType = environment.model.getTileAt(nextPos.x, nextPos.y);
	
	    if (tileType === material) {
	      target[dir] += mod;
	    } else {
	      environment.say(errorMessage);
	      environment.dispatchEvent(environment.GAME_ERROR);
	      return;
	    }
	
	    if (target.x === environment.model.treasure.x && target.y === environment.model.treasure.y) {
	      environment.dispatchEvent(environment.GAME_COMPLETE);
	      environment.say("I FOUND THE TREASURE");
	    }
	  }
	}
	
	var environment = {
	
	  left: -1,
	  right: 1,
	
	  GAME_ERROR: "gameError",
	  GAME_COMPLETE: "gameComplete",
	
	  walk: function walk(target, distance) {
	    move(target, distance, LAND, "I can only walk on land");
	  },
	
	  swim: function swim(target, distance) {
	    move(target, distance, WATER, "I can only swim in the water");
	  },
	
	  turn: function turn(target, direction) {
	    target.orientation += direction % 4;
	    if (target.orientation < 0) {
	      target.orientation = 4 + target.orientation;
	    }
	    target.orientation = target.orientation % 4;
	  },
	
	  say: function say(str, p1, p2, p3) {
	    console.log("SAY", str, p1, p2, p3);
	    environment.sayOutput.innerHTML = str;
	  }
	};
	
	EventDispatcher.init(environment);
	
	module.exports = environment;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var trim = __webpack_require__(8);
	
	function parseCommand(command) {
	
	  var code = command.code;
	
	  var parts = [];
	  var i = 0;
	  var currentPart = "";
	  var buildingString = false;
	
	  while (i < code.length) {
	    var c = code.charAt(i);
	    if (c === "'") {
	      if (buildingString) {
	        buildingString = false;
	        currentPart += c;
	        parts.push(currentPart);
	        currentPart = "";
	      } else {
	        buildingString = true;
	        currentPart += c;
	      }
	    } else if (c === " ") {
	      if (buildingString) {
	        currentPart += c;
	      } else {
	        if (currentPart !== "") {
	          parts.push(currentPart);
	          currentPart = "";
	        }
	      }
	    } else {
	      currentPart += c;
	    }
	
	    i++;
	  }
	
	  if (currentPart !== "") {
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
	
	function parseFunction(func) {
	  var parts = func.code.split(" ");
	  func.name = parts[1];
	  func.params = parts.slice(2);
	  func.body = [];
	  return func;
	}
	
	function parseLoop(loop) {
	  var parts = loop.code.split(" ");
	  loop.method = "loop";
	  // loop.params = [parseInt(parts[1])];
	  loop.params = parts.slice(1);
	  loop.body = [];
	  return loop;
	}
	
	var parser = {
	
	  parse: function parse(code) {
	    var lines = code.split("\n").map(function (l, i) {
	      return { lineNumber: i, code: trim(l) };
	    }).filter(function (l) {
	      return l.code !== "";
	    });
	
	    var program = {};
	
	    program._main = {
	      name: "_main",
	      params: [],
	      body: [] };
	
	    var currentFunction = "_main";
	
	    var functionStack = [];
	
	    var loopCounter = 0;
	
	    var loops = [];
	
	    lines.forEach(function (l) {
	      if (l.code.indexOf("function ") === 0) {
	        var func = parseFunction(l);
	
	        functionStack.push(currentFunction);
	        currentFunction = func.name;
	
	        program[func.name] = func;
	      } else if (l.code.indexOf("loop ") === 0) {
	        // Create the loop
	        var loop = parseLoop(l);
	        loop.name = "_loop" + loopCounter++;
	        program[loop.name] = loop;
	        // Add the call of the loop to the current function
	        program[currentFunction].body.push(loop);
	        functionStack.push(currentFunction);
	        currentFunction = loop.name;
	        loops.push(loop);
	      } else if (l.code === "end") {
	        currentFunction = functionStack.pop();
	      } else {
	        program[currentFunction].body.push(parseCommand(l));
	      }
	    });
	
	    console.log("PROGRAM", program);
	
	    return program;
	  } };
	
	module.exports = parser;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var layout = "\nLL000000\n0LL00000\n00LL0000\n000LWLWL\n0000000L\n0000000L\n0000000L\n0000000L\n";
	
	module.exports = {
	  tileSize: 50,
	  layout: layout,
	  turtle: {
	    x: 0,
	    y: 0,
	    orientation: 1
	  },
	  treasure: {
	    x: 7,
	    y: 7 }
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var clone = __webpack_require__(9);
	
	function parseLayout(layoutString) {
	  return layoutString.split("\n").filter(function (l) {
	    return l !== "";
	  }).map(function (l) {
	    return l.split("");
	  });
	}
	
	function animProp(subject, prop, target) {
	  var current = subject[prop];
	  var delta = (target - current) * 0.1;
	  subject[prop] += delta;
	  if (Math.abs(delta) < 0.01) {
	    subject[prop] = target;
	  }
	}
	
	var model = {
	
	  init: function init(levelData) {
	    this.turtle = clone(levelData.turtle);
	    this.turtle.display = clone(levelData.turtle);
	    this.layout = parseLayout(levelData.layout);
	    this.treasure = clone(levelData.treasure);
	    this.tileSize = levelData.tileSize;
	  },
	
	  update: function update(delta) {
	    var _this = this;
	
	    ["x", "y", "orientation"].forEach(function (prop) {
	      animProp(_this.turtle.display, prop, _this.turtle[prop]);
	    });
	  },
	
	  getTileAt: function getTileAt(x, y) {
	    try {
	      return this.layout[y][x];
	    } catch (e) {
	      return null;
	    }
	  } };
	
	module.exports = model;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	// const debugPlane = require('./debug_plane');
	// const debugBlock = require('./debug_block');
	
	var ctx = undefined;
	var w = undefined;
	var h = undefined;
	
	var turtleImage = undefined;
	var treasureImage = undefined;
	
	// let tileSize = 80;
	
	var tileColours = {
	  W: "#6666CC",
	  L: "#BA6223",
	  G: "#B0ff07",
	  "0": "#000000" };
	
	function drawTile(tile, x, y, tileSize) {
	  var colour = tileColours[tile];
	
	  ctx.beginPath();
	  ctx.strokeStyle = "#000000";
	  ctx.fillStyle = colour;
	  ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
	  ctx.rect(x * tileSize, y * tileSize, tileSize, tileSize);
	  ctx.stroke();
	  // ctx.fill();
	}
	
	function drawAtPointWithRotation(x, y, rotation, drawMethod) {
	  ctx.save();
	  ctx.translate(x, y);
	  ctx.rotate(rotation);
	  drawMethod();
	  ctx.restore();
	}
	
	var stageView = {
	
	  init: function init(w, h) {
	    var canvas = document.getElementById("stage");
	    canvas.width = w;
	    canvas.height = h;
	    ctx = canvas.getContext("2d");
	
	    turtleImage = document.getElementById("turtle-image");
	    treasureImage = document.getElementById("treasure-image");
	  },
	
	  update: function update(model) {
	
	    model.layout.forEach(function (row, i) {
	      row.forEach(function (col, j) {
	        drawTile(col, j, i, model.tileSize);
	      });
	    });
	
	    ctx.drawImage(treasureImage, model.treasure.x * model.tileSize, model.treasure.y * model.tileSize, model.tileSize, model.tileSize);
	
	    drawAtPointWithRotation(model.turtle.display.x * model.tileSize + model.tileSize * 0.4, model.turtle.display.y * model.tileSize + model.tileSize * 0.5, Math.PI / 2 * model.turtle.display.orientation, function () {
	      ctx.drawImage(turtleImage, -model.tileSize * 0.35, -model.tileSize * 0.45, model.tileSize * 0.65, model.tileSize * 0.75);
	    });
	  }
	};
	
	module.exports = stageView;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = {
	  init: function init(target) {
	    var listeners = [];
	
	    target.addEventListener = function (type, callback) {
	      listeners.push({ type: type, callback: callback });
	    };
	
	    target.removeEventListener = function (type, callback) {
	      listeners = listeners.filter(function (l) {
	        return l.type !== type || l.callback !== callback;
	      });
	    };
	
	    target.dispatchEvent = function (type) {
	      var params = Array.prototype.slice.apply(arguments, [1]);
	      listeners.filter(function (l) {
	        return l.type === type;
	      }).forEach(function (l) {
	        l.callback.apply(null, params);
	      });
	    };
	  }
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = function (str) {
	  var leading = 0;
	  var trailing = str.length;
	
	  var i = 0;
	  while (str.charAt(i++) === " ") {
	    leading++;
	  }
	
	  i = str.length - 1;
	  while (str.charAt(i--) === " ") {
	    trailing--;
	  }
	
	  return str.substr(leading, trailing - leading);
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = function (subject) {
	  var target = arguments[1] === undefined ? {} : arguments[1];
	
	  for (var i in subject) {
	    target[i] = subject[i];
	  }
	  return target;
	};

/***/ }
/******/ ]);
//# sourceMappingURL=client.js.map