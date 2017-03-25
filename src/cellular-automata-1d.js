function CA(N, S) {
	var n = N === undefined ? 1 : N;
	var s = S === undefined ? 2 : S;

	var c = 128; // number of cells
	var center = Math.floor(c / 2);

	var rule = dec2basekStr(0, s);

	var ruleLengthBaseK = Math.pow(s, (2*n)+1);
	rule = padZerosStr(rule, ruleLengthBaseK - rule.length);

	var numRuns = 0;

	var cells = initCells(c);

	function initCells(num) {
		var mycells = [];
		for (var i=0; i<c; i++) {
			mycells[i] = new Cell(i);
		}
		numRuns = 0;
		return mycells;
	}

	function Cell(loc) {
		this.location = loc;
		this.currentState = loc === center ? 1 : 0;
		this.pastStates = [this.currentState];
		this.nextState = null;
		this.localGroup = []; // includes self
		this.note = midiFreq(loc+32);

		for (var i=-n; i<=n; i++) {
			var nLoc = mod(loc + i, c);
			this.localGroup.push(nLoc);
		}

		this.computeNextState = function(allCells) {
			var lg = [];
			this.localGroup.forEach(function(a) {
				lg.push(allCells[a].currentState);
			});

			var config = lg.join("");
			// console.log(config);
			// console.log("Cell #" + loc);
			// console.log(lg);
			// console.log("Config: " + config);
			var ruleLoc = +basek2decStr(config, s);
			// console.log("Rule Location: " + ruleLoc);
			// console.log("Rule: " + rule[ruleLengthBaseK - ruleLoc - 1]);
			// console.log("Ruleset: " + rule);
			// console.log("----");

			this.nextState = rule[ruleLengthBaseK - ruleLoc - 1];
		};

		this.updateState = function() {
			this.currentState = this.nextState;
			this.pastStates.push(this.currentState);
			this.nextState = null;
		};

		this.playMe = function() {
			var mySynth = new Tone.Synth().toMaster();
			mySynth.triggerAttackRelease(this.note, "4n");
		};

	}

	


	function my() {}

	// formula for number of 1-D rules:
	// s^(s^(2n+1))
	my.ruleRange = function() {
		var pow = Math.pow(s, (2*n)+1);
		return [0, Math.pow(s, pow)-1];
	};

	my.centerLoc = function() {
		return center;
	};

	my.randomRule = function() {
		var s = [];
		for (var i=0; i<ruleLengthBaseK; i++) {
			s[i] = rint(0, my.numStates()-1);
		}
		rule = s.join("");
		console.log(rule);

		return my;
	};

	my.rule = function(value) {
		if (!arguments.length) return basek2decStr(rule, s);
		var b = my.ruleRange();
		value = bound(value, b[0], b[1]);
		rule = dec2basekStr(value, s);
		rule = padZerosStr(rule, ruleLengthBaseK - rule.length);
		return my;
	};

	my.ruleComponents = function() {
		var r = dec2basek(my.rule(), my.numStates());
		r = padZeros(r, ruleLengthBaseK - r.length);
		return r;
	};

	my.ruleComponentsStr = function(str) {
		// if (!arguments.length) {
		// 	var r = dec2basekStr(my.rule(), my.numStates());
		// 	r = padZerosStr(r, ruleLengthBaseK - r.length);
		// 	return r;
		// }

		if (!arguments.length) return rule;

		if (str.length === ruleLengthBaseK) {
			for (var i=0; i<str.length; i++) {
				if (!(str[i] >= 0 && str[i] < my.numStates())) {
					return "Configuration not valid";
				}
			}
			rule = str;
		}

		return my;
	};

	my.cells = function() {
		return cells;
	};

	my.numCells = function(value) {
		if (!arguments.length) return c;
		c = value;
		center = Math.floor(c / 2);
		cells = initCells(c);

		return my;
	};

	my.run = function(times) {
		if (!arguments.length) times = 1;
		for (var i=0; i<times; i++) {
			for (var c=0; c<cells.length; c++) {
				cells[c].computeNextState(cells);
			}
			for (c=0; c<cells.length; c++) {
				cells[c].updateState();
			}
			numRuns++;
		}
		
		return my;
	};

	my.randomizeStates = function() {
		for (var i=0; i<cells.length; i++) {
			cells[i].currentState = rint(0, s-1);
			cells[i].pastStates[numRuns] = cells[i].currentState;
		}

		return my;
	};

	my.customStates = function(stateStr) {
		for (var i=0; i<cells.length; i++) {
			cells[i].currentState = +stateStr[i];
			cells[i].pastStates[numRuns] = cells[i].currentState;
		}

		return my;
	};

	my.currentCellStates = function() {
		return cells.map(function(m){ return +m.currentState; });
	};

	my.cellStates = function(from, to) {
		if (from === undefined) {
			from = 0;
			to = numRuns;
		}
		else if (to === undefined) {
			to = from;
		}
		else {
			from = bound(from, 0, numRuns);
			to = bound(to, 0, numRuns);
		}
		

		// console.log(from + " to " + to);

		var stateList = [];

		for (var i=from; i<=to; i++) {
			var ti = cells.map(function(m){ return +m.pastStates[i]; });
			stateList.push(ti);
		}

		// stateList.push(my.currentCellStates());
		// stateList.forEach(function(a){ console.log(a.join("")); });

		return stateList;
	};

	my.cellStatesStr = function(from, to) {
		if (from === undefined) {
			from = 0;
			to = numRuns;
		}
		else if (to === undefined) {
			to = from;
		}
		else {
			from = bound(from, 0, numRuns);
			to = bound(to, 0, numRuns);
		}

		// console.log(from + " to " + to);

		var stateList = [];

		for (var i=from; i<=to; i++) {
			var ti = cells.map(function(m){ return +m.pastStates[i]; });
			stateList.push(ti.join(""));
		}

		// stateList.push(my.currentCellStates().join(""));

		return stateList;
	};

	my.reset = function() {
		my.numCells(c);

		return my;
	};

	my.numStates = function() {
		return s;
	};

	my.numNeighbors = function() {
		return n;
	};

	my.ruleLengthBaseK = function() {
		return ruleLengthBaseK;
	};

	return my;
}







function padZeros(arr, n) {
	var myarray = arr;
	for (var i=0; i<n; i++) {
		myarray.unshift(0);
	}
	return myarray;
}

function padZerosStr(str, n) {
	var mystr = str;
	for (var i=0; i<n; i++) {
		mystr = "0".concat(mystr);
	}

	return mystr;
}


function dec2basek(n, k) {
	var basek = [];
	while (n > (k-1)) {
		basek.unshift(n % k);
		n = Math.floor(n / k);
	}
	basek.unshift(n);

	return basek;
}

function dec2basekStr(n, k) {
	return n.toString(k);
}

function basek2dec(basek, k) {
	basek = basek.reverse();
	var sum = 0;
	basek.forEach(function(a,i){
		sum += a * Math.pow(k, i);
	});
	return sum;
}

function basek2decStr(basek, k) {
	var sum = 0;
	for (var i=0; i<basek.length; i++) {
		sum += (+basek[i]) * Math.pow(k, basek.length - i - 1);
	}
	return sum;
}

function rint(min,max) {
	return Math.floor(Math.random()*(max-min+1)+min);
}

function bound(value, min, max) {
	return Math.max(min, Math.min(value, max));
}

function mod(value, n) {
	return ((value % n) + n) % n;
}

function midiFreq(i) {
	var pow = (i - 69) / 12;
	return 440 * Math.pow(2, pow);
}












// Totalistic CA
function TCA(N, S) {
	var n = N === undefined ? 1 : N;
	var s = S === undefined ? 2 : S;

	var c = 128; // number of cells
	var center = Math.floor(c / 2);

	var rule = dec2basekStr(0, s);

	var ruleLengthBaseK = (s-1) * ((2 * n) + 1) + 1;
	rule = padZerosStr(rule, ruleLengthBaseK - rule.length);

	var numRuns = 0;

	var cells = initCells(c);

	function initCells(num) {
		var mycells = [];
		for (var i=0; i<c; i++) {
			mycells[i] = new Cell(i);
		}
		numRuns = 0;
		return mycells;
	}

	function Cell(loc) {
		this.location = loc;
		this.currentState = loc === center ? 1 : 0;
		this.pastStates = [this.currentState];
		this.nextState = null;
		this.localGroup = []; // includes self
		this.note = midiFreq(loc+32);

		for (var i=-n; i<=n; i++) {
			var nLoc = mod(loc + i, c);
			this.localGroup.push(nLoc);
		}

		this.computeNextState = function(allCells) {
			var total = 0;
			this.localGroup.forEach(function(a) {
				total += +allCells[a].currentState;
			});


			// console.log(rule);
			// console.log(ruleLengthBaseK);
			// console.log(total);
			// console.log(rule[ruleLengthBaseK - total - 1]);
			// console.log("----");


			this.nextState = +rule[ruleLengthBaseK - total - 1];
		};

		this.updateState = function() {
			this.currentState = this.nextState;
			this.pastStates.push(this.currentState);
			this.nextState = null;
		};

		this.playMe = function() {
			var mySynth = new Tone.Synth().toMaster();
			mySynth.triggerAttackRelease(this.note, "4n");
		};

	}

	


	function my() {}

	// formula for number of 1-D rules:
	// s^(s^(2n+1))
	my.ruleRange = function() {
		var pow = Math.pow(s, ruleLengthBaseK);
		return [0, Math.pow(s, pow)-1];
	};

	my.centerLoc = function() {
		return center;
	};

	my.randomRule = function() {
		var s = [];
		for (var i=0; i<ruleLengthBaseK; i++) {
			s[i] = rint(0, my.numStates()-1);
		}
		rule = s.join("");
		console.log(rule);

		return my;
	};

	my.rule = function(value) {
		if (!arguments.length) return basek2decStr(rule, s);
		var b = my.ruleRange();
		value = bound(value, b[0], b[1]);
		rule = dec2basekStr(value, s);
		rule = padZerosStr(rule, ruleLengthBaseK - rule.length);
		return my;
	};

	my.ruleComponents = function() {
		var r = dec2basek(my.rule(), my.numStates());
		r = padZeros(r, ruleLengthBaseK - r.length);
		return r;
	};

	my.ruleComponentsStr = function(str) {
		// if (!arguments.length) {
		// 	var r = dec2basekStr(my.rule(), my.numStates());
		// 	r = padZerosStr(r, ruleLengthBaseK - r.length);
		// 	return r;
		// }

		if (!arguments.length) return rule;

		if (str.length === ruleLengthBaseK) {
			for (var i=0; i<str.length; i++) {
				if (!(str[i] >= 0 && str[i] < my.numStates())) {
					return "Configuration not valid";
				}
			}
			rule = str;
		}

		return my;
	};

	my.cells = function() {
		return cells;
	};

	my.numCells = function(value) {
		if (!arguments.length) return c;
		c = value;
		center = Math.floor(c / 2);
		cells = initCells(c);

		return my;
	};

	my.run = function(times) {
		if (!arguments.length) times = 1;
		for (var i=0; i<times; i++) {
			for (var c=0; c<cells.length; c++) {
				cells[c].computeNextState(cells);
			}
			for (c=0; c<cells.length; c++) {
				cells[c].updateState();
			}
			numRuns++;
		}
		
		return my;
	};

	my.randomizeStates = function() {
		for (var i=0; i<cells.length; i++) {
			cells[i].currentState = rint(0, s-1);
			cells[i].pastStates[numRuns] = cells[i].currentState;
		}

		return my;
	};

	my.customStates = function(stateStr) {
		for (var i=0; i<cells.length; i++) {
			cells[i].currentState = +stateStr[i];
			cells[i].pastStates[numRuns] = cells[i].currentState;
		}

		return my;
	};

	my.currentCellStates = function() {
		return cells.map(function(m){ return +m.currentState; });
	};

	my.cellStates = function(from, to) {
		if (from === undefined) {
			from = 0;
			to = numRuns;
		}
		else if (to === undefined) {
			to = from;
		}
		else {
			from = bound(from, 0, numRuns);
			to = bound(to, 0, numRuns);
		}
		

		// console.log(from + " to " + to);

		var stateList = [];

		for (var i=from; i<=to; i++) {
			var ti = cells.map(function(m){ return +m.pastStates[i]; });
			stateList.push(ti);
		}

		// stateList.push(my.currentCellStates());
		// stateList.forEach(function(a){ console.log(a.join("")); });

		return stateList;
	};

	my.cellStatesStr = function(from, to) {
		if (from === undefined) {
			from = 0;
			to = numRuns;
		}
		else if (to === undefined) {
			to = from;
		}
		else {
			from = bound(from, 0, numRuns);
			to = bound(to, 0, numRuns);
		}

		// console.log(from + " to " + to);

		var stateList = [];

		for (var i=from; i<=to; i++) {
			var ti = cells.map(function(m){ return +m.pastStates[i]; });
			stateList.push(ti.join(""));
		}

		// stateList.push(my.currentCellStates().join(""));

		return stateList;
	};

	my.reset = function() {
		my.numCells(c);

		return my;
	};

	my.numStates = function() {
		return s;
	};

	my.numNeighbors = function() {
		return n;
	};

	my.ruleLengthBaseK = function() {
		return ruleLengthBaseK;
	};

	return my;
}

function sum(arr) {
	var s = 0;
	for (var i=0; i<arr.length; i++) {
		s += arr[i];
	}
	return s;
}


