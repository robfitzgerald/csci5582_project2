(function () {

  /**
   * Represents a boolean predicate function of up to 2 parameters
   * @param name - identifier for predicate
   * @param val1 - value, if present
   * @param val2 - value, if present
   * @returns {Predicate}
   * @constructor
   */
  function Predicate(name, val1, val2) {
    this.name = name;
    this.x = val1 || null;
    this.y = val2 || null;
    this.equalTo = equalTo;
    this.toString = toString;
    function equalTo(p) {
      return ((this.name === p.name) && (this.x === p.x) && (this.y === p.y));
    }
    function toString() {
      if (this.y != null) {
        return this.name + '(' + this.x + ',' + this.y + ')';
      } else if (this.x != null) {
        return this.name + '(' + this.x + ')';
      } else {
        return this.name + '()';
      }
    }
  }

  /**
   * Represents a list of Predicates held together by the AND operation
   * @param {Array} predicates - array of Predicate objects
   * @constructor
   */
  function Statement(predicates) {
    this.list = predicates || [];
    this.containsOne = containsOne;
    this.containsAll = containsAll;
    this.toString = toString;
    this.addStatement = addStatement;
    this.expand = expand;
    this.deleteStatement = deleteStatement;


    function addStatement(s) {
      for (var i = 0; i < s.list.length; ++i) {
        this.list.push(s.list[i]);
        //console.log(s.list[i].name);
      }
    }

    function containsOne(s) {
      for (var i = 0; i < this.list.length; ++i) {
        ////console.log('list[' + i + '] is ' + list[i].name);
        for (var j = 0; j < s.list.length; ++j) {
          ////console.log('s.list[' + j + '] is ' + s.list[j].name);
          if (this.list[i].equalTo(s.list[j])) {
            ////console.log('found! ' + list[i].name + ' equalTo ' + s.list[j].name);
            return true;
          }
        }
      }
      return false;
    }

    function containsAll(s) {
      for (var j = 0; j < s.list.length; ++j) {
        var match = false;
        ////console.log('list[' + i + '] is ' + list[i].name);
        for (var i = 0; i < this.list.length; ++i) {
          ////console.log('s.list[' + j + '] is ' + s.list[j].name);
          if (this.list[i].equalTo(s.list[j])) {
            ////console.log('found! ' + list[i].name + ' equalTo ' + s.list[j].name);
            match = true;
          }
        }
        ////console.log('evaluated one member. match found?: ' + match);
        ////console.log(this.list[j]);
        if (!match) {
          return false;
        }
      }
      return true;
    }

    /**
     * unpacks a statement into an array of singleton statements
     * @returns {Array} - array of Statements, each containing one predicate
     */
    function expand() {
      var output = [(new Statement(this.list))];
      output[0].isAnExpandedStatement = true;
      for (var i = this.list.length - 1; i >= 0; --i) {
        output.push(new Statement([this.list[i]]));
      }
      return output;
    }

    function toString() {
      var output = "[";
      for (var i = 0; i < this.list.length; ++i) {
        output += this.list[i].toString();
        if (i != this.list.length - 1) {
          output += ' ^ ';
        }
      }
      return output + ']'
    }

    function deleteStatement(statement) {
      for (var j = 0; j < statement.list.length; ++j) {
        for (var i = 0; i < this.list.length; ++i) {
          if (this.list[i].equalTo(statement.list[j])) {
            this.list.splice(i,1);
          }
        }
      }
    }

  }

  /**
   * A Singleton used to generate moves specific to the blocks world
   * @returns {{generateOperations: generateOperations}}
   */
  function blocksWorldOperations() {
    return {
      generateOperations: generateOperations
    };


    function Op_stack(x, y) {
      this.name = 'stack(' + x + ',' + y + ')';
      this.p = new Statement([new Predicate('clear', y), new Predicate('holding', x)]);
      this.d = new Statement([new Predicate('clear', y), new Predicate('holding', x)]);
      this.a = new Statement([new Predicate('armempty'), new Predicate('on', x, y)]);
    }

    function Op_unstack(x, y) {
      this.name = 'unstack(' + x + ',' + y + ')';
      this.p = new Statement([new Predicate('on', x, y), new Predicate('clear', x), new Predicate('armempty')]);
      this.d = new Statement([new Predicate('on', x, y), new Predicate('armempty')]);
      this.a = new Statement([new Predicate('holding', x), new Predicate('clear', y)]);
    }

    function Op_pickup(x) {
      this.name = 'pickup(' + x + ')';
      this.p = new Statement([new Predicate('clear', x), new Predicate('ontable', x), new Predicate('armempty')]);
      this.d = new Statement([new Predicate('ontable', x), new Predicate('armempty')]);
      this.a = new Statement([new Predicate('holding', x)]);
    }

    function Op_putdown(x) {
      this.name = 'putdown(' + x + ')';
      this.p = new Statement([new Predicate('holding', x)]);
      this.d = new Statement([new Predicate('holding', x)]);
      this.a = new Statement([new Predicate('ontable', x), new Predicate('armempty')]);
    }


    /**
     *
     * @param {Statement} current
     * @param {Array} members, a string array
     * @returns {Array}
     */
    function generateOperations(current, members) {
      var ops = [];
      for (var i = 0; i < members.length; ++i) {
        /* one-parameter operations */
        var pickup = new Op_pickup(members[i]);
        if (current.containsOne(pickup.a)) {
          ops.push(pickup);
        }
        var putdown = new Op_putdown(members[i]);
        if (current.containsOne(putdown.a)) {
          ops.push(putdown);
        }

        for (var j = 0; j < members.length; j++) {
          if (i == j) {
            // do nothing
          } else {
            /* two-parameter operations */
            var stack = new Op_stack(members[i], members[j]);
            if (current.containsOne(stack.a)) {
              ops.push(stack);
            }
            var unstack = new Op_unstack(members[i], members[j]);
            if (current.containsOne(unstack.a)) {
              ops.push(stack);
            }
          }
        }
      }
      return ops;
    }
  }

  /**
   * recursive planning operation
   * @param {function} ops - a function with a member function, generateOptions, which takes a stack and a language as its parameters
   * @param {Array} members - the language of this problem
   * @param move - the operation, of the form of a member of ops, which will begin this subproblem
   * @param current - the current state
   * @param goal - the goal state, which doesn't get mutated
   * @param {Array} thisPlan -
   * @param {int} depth - track recursion depth
   * @returns {boolean}
   */
  function strips(ops,members,move,current,goal,thisPlan,depth) {
    if (depth > 9) {
      //console.log('returning from depth ' + depth + ' because of depth check at beginning of function ');
      return {
        current: deepCopy(current),
        triedMoves: deepCopy(thisPlan)
      }
    }
    // expand the statement vertically
    var stack = move.p.expand();
    var thisCurrent = deepCopy(current);
    var triedMoves = deepCopy(thisPlan); // makes a copy of the thisPlan array, so this branch has it's own record
    for (var i = stack.length-1; i >= 0; --i) {
      // if we are looking at the top of the stack
      // ,and the predicate at this location is present in the current state
      if (
        (i == stack.length-1) &&
        thisCurrent.containsAll(stack[i])
      ) {
        stack.pop();
      } else {
        if (stack[i].list.length == 1) {
          var possibleMoves = ops.generateOperations(stack[i],members);

          // prevents repetitions of most recent move configurations
          for (var j = possibleMoves.length-1; j >= 0; --j) {
            var thisPossibleMoveName = possibleMoves[j].name;
            for (var k = thisPlan.length-1; k >= 0; --k) {
              var checkTriedMove = thisPlan[k];
              if (thisPossibleMoveName.includes(moveNameFromString(checkTriedMove))) {
                if (thisPossibleMoveName === checkTriedMove) {
                  possibleMoves.splice(j, 1);
                }
                // we were only interested in any match with the one most recent call to this function,
                // unless it is stack() or unstack(), which only happen once per configuration
                if (!thisPossibleMoveName.includes('stack')) {
                  break;
                }
              }
            }
          }

          // evaluate better moves
          for (var j = possibleMoves.length-1; j >= 0; --j) {
            if (goal.containsOne(possibleMoves[j].a)/* && !currentCallback().containsOne(possibleMoves[j].a)*/) {
              if (goal.containsAll(possibleMoves[j].a)) {
                // best possible
                possibleMoves[j].heuristic = 2;
              } else {
                // still worth noting
                possibleMoves[j].heuristic = 1;
              }
            } else {
              // hmm. this doesn't help so much
              possibleMoves[j].heuristic = 0;
            }
          }
          // sort ascending, since we will move through array in descending order, and higher numbers are better
          possibleMoves.sort(function moveHeuristicSort (a,b){
            return a.heuristic - b.heuristic;
          });

          // try moves
          for (var j = possibleMoves.length-1; j >= 0; --j) {
            var thisPossibleMoveName = possibleMoves[j].name;
            triedMoves.push(thisPossibleMoveName);
            //console.log('"tried" moves');
            //console.log(triedMoves);
            var recurse = strips(ops,members,possibleMoves[j],thisCurrent,goal,triedMoves,(depth+1));
            //console.log('triedMoves');
            //console.log(triedMoves);
            //console.log('recurse.triedMoves');
            //console.log(recurse.triedMoves);
            //console.log('recurse.current');
            //console.log(recurse.current);
            if (recurse.validBranch) {
              triedMoves = deepCopy(recurse.triedMoves);
              console.log('applying move ' + thisPossibleMoveName);
              //document.write('<p>applying the move ' + thisPossibleMoveName + '</p>');
              thisCurrent.deleteStatement(possibleMoves[j].d);
              thisCurrent.addStatement(possibleMoves[j].a);
              stack.pop();
              break; // we're done applying moves to the predicate we just deleted, bro
            } else {
              // nope. bad move. remove it. try another move. unless you're the head of the recursion tree.
              // then it's ok to try again later.
              triedMoves.pop();
            }
          }
        } else {
          // nothing, and eventually, this function will return false.
        }
      }
    }

    if (stack.length==0) {
      //console.log('returning modified stuff cuz it was all good');
      //console.log('and this should be true: ' + (triedMoves.length > thisPlan.length));
      return {
        validBranch: true,
        current: deepCopy(thisCurrent),
        triedMoves: deepCopy(triedMoves)
      }
    } else {
      //console.log('returning original stuff because stuff was bad news');
      return {
        validBranch: false,
        current: current,
        triedMoves: thisPlan
      }
    }
  }

  function moveNameFromString(str) {
    //console.log('moveNameFromString(' + str +')');
    var output = "";
    for (var i = 0; i < str.length; ++i) {
      if (str.charAt(i) == '(') {
        return output;
      } else {
        output += str.charAt(i);
      }
    }
    return output;
  }

  function deepCopy(oldObj) {
    var newObj = oldObj;
    if (oldObj && typeof oldObj === 'object') {
      newObj = Object.prototype.toString.call(oldObj) === "[object Array]" ? [] : {};
      for (var i in oldObj) {
        newObj[i] = deepCopy(oldObj[i]);
      }
    }
    return newObj;
  }

  ////////////////////////////////////////////////////////
  // Blocks World Example
  ////////////////////////////////////////////////////////

  var startState = new Statement([
    new Predicate('on', 'B', 'A'),
    new Predicate('ontable', 'A'),
    new Predicate('ontable', 'C'),
    new Predicate('ontable', 'D'),
    new Predicate('armempty'),
    new Predicate('clear', 'B'),
    new Predicate('clear', 'C'),
    new Predicate('clear', 'D')
  ]);
  var goalState = new Statement([
    new Predicate('on', 'C', 'A'),
    new Predicate('on', 'B', 'D'),
    new Predicate('ontable', 'A'),
    new Predicate('ontable', 'D'),
    new Predicate('armempty')
  ]);
  var goalMove = {
    name: 'goal',
    p: goalState,
    a: new Statement(),
    d: new Statement()
  };
  var members = [
    'A', 'B', 'C', 'D'
  ];
  var ops = blocksWorldOperations();

  var result =  strips(ops,members,goalMove,startState,goalState,[/*'stack(C,A)'*/],1);
  document.write('<h2>STRIPS result valid?: ' + result.validBranch + '</h2>');
  document.write('<h5>start state</h5><p>');
  for (var i = 0; i < result.current.list.length; ++i) {
    document.write(startState.list[i].toString()+'  ')
  }
  document.write('<h5>resulting goal state via STRIPS</h5><p>');
  for (var i = 0; i < result.current.list.length; ++i) {
    document.write(result.current.list[i].toString()+'  ')
  }
  document.write('</p>');
  document.write('<h5>goal state provided to STRIPS</h5><p>');
  for (var i = 0; i < goalState.list.length; ++i) {
    document.write(goalState.list[i].toString()+'  ')
  }
  document.write('</p>');
  document.write('<h5>plan list</h5><p>');
  for (var i = 0; i < result.triedMoves.length; ++i) {
    document.write(result.triedMoves[i]+'  ');
  }
  document.write('</p>');

})();