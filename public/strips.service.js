(function() {

  angular
  .module('project2')
  .factory('StripsFactory', ['$q', StripsFactory]);

  function StripsFactory($q) {
    var StripsFactory = {
      example1: example1,  // simple problem
      example2: example2,  // sussman anomoly
      example3: example3,   // of your choice
      blocksWorldOperations: blocksWorldOperations,
      Predicate: Predicate,
      Statement: Statement,
      moveNameFromString: moveNameFromString,
      hasSubstring: hasSubstring
    };


    function example1() {
      var deferred = $q.defer();
      runstrips(ops,members1,ex1Goal,ex1Start,ex1GoalState,[],1,function(result) {
        deferred.resolve({
          moves: result.moves,
          current: ex1Start,
          goal: ex1GoalState
        });
      });
      return deferred.promise;
    }

    function example2() {
      var deferred = $q.defer();
      runstrips(ops,members2,ex2Goal,ex2Start,ex2GoalState,[],1,function(result) {
        deferred.resolve({
          moves: result.moves,
          current: ex2Start,
          goal: ex2GoalState
        });
      });
      return deferred.promise;
    }

    function example3() {
      var deferred = $q.defer();
      //console.log('example3()')
      runstrips(ops,members3,ex3Goal,ex3Start,ex3GoalState,[],1,function(result) {
        //console.log('complete with result')
        //console.log(result)
        deferred.resolve({
          moves: result.moves,
          current: ex3Start,
          goal: ex3GoalState
        });
      });
      return deferred.promise;
    }


    var ops = blocksWorldOperations();

    var members1 = [
    'A', 'B', 'C', 'D'
    ];

    var ex1Start = new Statement([
      new Predicate('armempty'),
      new Predicate('clear', 'B'),
      new Predicate('clear', 'C'),
      new Predicate('clear', 'D'),
      new Predicate('ontable', 'A'),
      new Predicate('ontable', 'D'),
      new Predicate('ontable', 'C'),
      new Predicate('on', 'B', 'A')
      ]);
    var ex1GoalState = new Statement([
      new Predicate('ontable', 'A'),
      new Predicate('ontable', 'D'),
      new Predicate('armempty'),
      new Predicate('on', 'C', 'A'),
      new Predicate('clear', 'C'),
      new Predicate('clear', 'B'),
      new Predicate('on', 'B', 'D')
      ]);

    var ex1Goal = {
      name: 'goal',
      p: ex1GoalState,
      a: new Statement(),
      d: new Statement(),
      child: []
    };

    var members2 = [
    'A', 'B', 'C'
    ];

    var ex2Start = new Statement([
      new Predicate('armempty'),
      new Predicate('clear', 'B'),
      new Predicate('clear', 'C'),
      new Predicate('ontable', 'A'),
      new Predicate('ontable', 'B'),
      new Predicate('on', 'C', 'A')
      ]);
    var ex2GoalState = new Statement([
      new Predicate('on', 'B', 'C'),
      new Predicate('on', 'A', 'B')

      ]);

    var ex2Goal = {
      name: 'goal',
      p: ex2GoalState,
      a: new Statement(),
      d: new Statement(),
      child: []
    };

    var members3 = [
    'A', 'B', 'C', 'D'
    ];

    var ex3Start = new Statement([
      new Predicate('ontable', 'A'),
      new Predicate('ontable', 'B'),
      new Predicate('ontable', 'C'),
      new Predicate('ontable', 'D'),
      new Predicate('armempty'),
      new Predicate('clear', 'A'),
      new Predicate('clear', 'B'),
      new Predicate('clear', 'C'),
      new Predicate('clear', 'D')
      ]);
    var ex3GoalState = new Statement([
      new Predicate('on', 'A', 'B'),
      new Predicate('on', 'C', 'D')
      ]);
    var ex3Goal = {
      name: 'goal',
      p: ex3GoalState,
      a: new Statement(),
      d: new Statement(),
      child: []
    };

    return StripsFactory;
  }

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
      for (var i = 0; i < this.list.length; ++i) {
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
      generateOperations: generateOperations,
      Op_stack: Op_stack,
      Op_unstack: Op_unstack,
      Op_pickup: Op_pickup,
      Op_putdown: Op_putdown
    };


    function Op_stack(x, y) {
      this.x = x;
      this.y = y;
      this.name = 'stack(' + x + ',' + y + ')';
      this.oppositeName = 'unstack(' + x + ',' + y + ')';
      this.p = new Statement([new Predicate('clear', y), new Predicate('holding', x)]);
      this.d = new Statement([new Predicate('clear', y), new Predicate('holding', x)]);
      this.a = new Statement([new Predicate('armempty'), new Predicate('on', x, y)]);
      this.child = [];
    }

    function Op_unstack(x, y) {
      this.x = x;
      this.y = y;
      this.name = 'unstack(' + x + ',' + y + ')';
      this.oppositeName = 'stack(' + x + ',' + y + ')';
      this.p = new Statement([new Predicate('on', x, y), new Predicate('clear', x), new Predicate('armempty')]);
      this.d = new Statement([new Predicate('on', x, y), new Predicate('armempty')]);
      this.a = new Statement([new Predicate('holding', x), new Predicate('clear', y)]);
      this.child = [];
    }

    function Op_pickup(x) {
      this.x = x;
      this.y = null;
      this.name = 'pickup(' + x + ')';
      this.oppositeName = 'putdown(' + x + ')';
      this.p = new Statement([new Predicate('clear', x), new Predicate('ontable', x), new Predicate('armempty')]);
      this.d = new Statement([new Predicate('ontable', x), new Predicate('armempty')]);
      this.a = new Statement([new Predicate('holding', x)]);
      this.child = [];
    }

    function Op_putdown(x) {
      this.x = x;
      this.y = null;
      this.name = 'putdown(' + x + ')';
      this.oppositeName = 'pickup(' + x + ')';
      this.p = new Statement([new Predicate('holding', x)]);
      this.d = new Statement([new Predicate('holding', x)]);
      this.a = new Statement([new Predicate('ontable', x), new Predicate('armempty')]);
      this.child = [];
    }


    /**
     *
     * @param {Statement} currentSingle The Predicate we are trying to affect
     * @param {Statement} currentState The currentState state
     * @param {Array} members, a string array
     * @returns {Array}
     */
     function generateOperations(currentSingle, currentState, members, depth) {
      var ops = [];
      for (var i = 0; i < members.length; ++i) {
        //console.log('i is ' + i + ' and members[i] is ' + members[i])
        /* one-parameter operations */
        var pickup = new Op_pickup(members[i]);
        //console.log('new Op_pickup(), currentSingle, currentState')
        //console.log(pickup)
        //console.log(currentSingle)
        //console.log(currentState)

        //console.log('(currentSingle.containsOne(pickup.a) && currentState.containsAll(pickup.p)): ' + (currentSingle.containsOne(pickup.a) && currentState.containsAll(pickup.p)))

        if (currentSingle.containsOne(pickup.a)/* && currentState.containsAll(pickup.p)*/) {
          ops.push(pickup);
        }
        var putdown = new Op_putdown(members[i]);
        if (currentSingle.containsOne(putdown.a)/* && currentState.containsAll(putdown.p)*/) {
          ops.push(putdown);
        }

        for (var j = 0; j < members.length; j++) {
          //console.log('j is ' + i + ' and members[i] is ' + members[i])
          if (i == j) {
            // do nothing
          } else {
            /* two-parameter operations */
            var stack = new Op_stack(members[i], members[j]);
            if (currentSingle.containsOne(stack.a)/* && currentState.containsAll(stack.p)*/) {
              ops.push(stack);
            }
            var unstack = new Op_unstack(members[i], members[j]);
            if (currentSingle.containsOne(unstack.a)/* && currentState.containsAll(unstack.p)*/) {
              ops.push(unstack);
            }
          }
        }
      }
      ops.forEach(function(op) {
        op.currentState = currentState.toString();
        op.depth = depth;
      })
      // console.log('generatedOperations:')
      // console.log(ops);
      return ops;
    }
  }

  // REVISED 12/22/2015
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
   function strips(ops,members,move,current,goal,triedMoves,depth,parentMovePtr) {
    if (depth > 6) {
      return {
        validBranch: false
      }
    }
    // debugPrintNewStrips(depth,move);
    var stack = move.p.expand();
    for (var i = stack.length-1; i >= 0; --i) {
      // FINAL STEP: if all of the preconditions for a move are present in the current state, then apply move
      // else, this was not a valid branch.
      if (i == 0) {
        if (current.containsAll(stack[i]) || current.containsAll(goal)) {
          // we don't modify the goal state at depth 1
          if (depth != 1) {
            current.deleteStatement(move.d);
            current.addStatement(move.a);
          }
          return {
            validBranch: true,
            current: deepCopy(current),
            triedMoves: deepCopy(triedMoves),
            thisMove: move
          }
        } else {
          return {
            validBranch: false,
          }
        }
        // EASY STEP: this precondition is a match, so, pop it.
      } else if ((i == stack.length - 1) && current.containsAll(stack[i])) {
        stack.pop();
        // HARD STEP: this precondition isn't a match, so, generate possible moves and recurse.
      }  else {
        var possibleMoves = ops.generateOperations(stack[i], current, members, depth);
        heuristic(possibleMoves,current,goal);
        for (var j = possibleMoves.length-1; j >= 0; --j) {
          var recurseMove = deepCopy(possibleMoves[j]);
          var recurseCurrent = deepCopy(current);
          triedMoves.push(recurseMove);
          var recurseTriedMoves = deepCopy(triedMoves);
          var recurse = strips(ops,members,recurseMove,recurseCurrent,goal,recurseTriedMoves,(depth+1),move);
          if (recurse.validBranch) {
            // debugPrintTree(triedMoves, recurseMove, depth);
            triedMoves = deepCopy(recurse.triedMoves);
            current = deepCopy(recurse.current);
            move.child.push(deepCopy(recurse.thisMove));
            stack.pop();
            j = -1; // we're done applying moves to the predicate we just deleted, bro
          } else {
            // nope. bad move. remove it. try another move.
            triedMoves.pop();
          }
        }
      }
    }
  }

  /**
   * @description debug print function for the start of a new strips() call
   */
  function debugPrintNewStrips(depth, move) {
    var newStripsLog = "";
    for (var i = 0; i < depth; ++i) {
      newStripsLog += "~|";
    }
    newStripsLog += '~ strips() with move ' + move.name;
    console.log(newStripsLog);
  }

/**
 * @description debug print function for the current search tree upon recurse success
 */
  function debugPrintTree(triedMoves, recurseMove, depth) {
    var tree = "";
    for (var i = 0; i < depth; ++i) {
      tree += " ";
    }
    tree += recurseMove.name;
    tree += "               | depth= " + depth + ", heuristic= " + recurseMove.heuristic;
    tree += " triedMoves.length= " + triedMoves.length;
    console.log(tree);  
  }


  function heuristic(possibleMoves,thisCurrent,goal) {
    for (var j = possibleMoves.length-1; j >= 0; --j) {
      if (goal.containsOne(possibleMoves[j].a)) {
        if (goal.containsAll(possibleMoves[j].a)) {
          // best possible
          possibleMoves[j].heuristic = 8;
        } else {
          // still worth noting
          possibleMoves[j].heuristic = 4;
        }
      } else {
        // hmm. this doesn't help so much
        possibleMoves[j].heuristic = 0;
      }
      if (thisCurrent.containsOne(possibleMoves[j].p)) {
        if (thisCurrent.containsAll(possibleMoves[j].p)) {
          // best possible
          possibleMoves[j].heuristic += 2;
        } else {
          // still worth noting
          possibleMoves[j].heuristic += 1;
        }
      } else {
        // hmm. this doesn't help so much
        possibleMoves[j].heuristic += 0;
      }
    }
    // for (var j = possibleMoves.length-1; j >= 0; --j) {
    //   if (possibleMoves[j].heuristic == 0) {
    //     possibleMoves.splice(j,1);
    //   }
    // }

    // sort ascending, since we will move through array in descending order, and higher numbers are better
    possibleMoves.sort(function moveHeuristicSort (a,b){
      return a.heuristic - b.heuristic;
    });

    // possibleMoves.forEach(function(move,index,moves) {
    //   console.log(move.name + ' has heuristic ' + move.heuristic);
    // });
}

function moveNameFromString(str) {
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

function hasSubstring(str1,str2) {
  return (str1.indexOf(str2) != -1);
}

function runstrips(ops,members,move,current,goal,thisPlan,depth,callback) {
  // console.log('solving the blocks world problem with this pair of start and goal states')
  // console.log(deepCopy(current))
  // console.log(deepCopy(goal))
  var result = strips(ops,members,move,current,goal,thisPlan,depth,move);
  result.moves = [];
  findMoves(result.thisMove, result.moves);
  delete result.triedMoves;
  deleteOpposites(result.moves);
  console.log('DONE. calling callback with this result object')
  console.log(deepCopy(result));
  callback(result);
}

function findMoves(move,list) {
  _findMoves(move,list);
  var lastInListIsTheGoalWeRemove = list.length - 1;
  list.splice(lastInListIsTheGoalWeRemove, 1);
}

function _findMoves(move,list) {
  for (var i = 0; i < move.child.length; ++i) {
    _findMoves(move.child[i],list);
  }
  list.push(deepCopy(move));
}

function deleteOpposites(moves) {
  for (var i = 0; i < moves.length - 1; ++i) {
    for (var j = i + 1; j < moves.length; ++j) {
      if (moves[i].x === moves[j].x && moves[i].y === moves[j].y) {
        console.log('found matching parameters for ' + moves[i].name + ', ' + moves[j].name + ' at i,j=' + i + ', ' + j)
        if (moves[i].name === moves[j].name || moves[i].name === moves[j].oppositeName) {
          console.log('found matching name or opposite name')
          //moves[j].deleteMe == true;
          console.log('deleting i and j: ' + moves[i].name + ', ' + moves[j].name + ', and restarting search')
          moves.splice(j,1)
          moves.splice(i,1)
          i = 0;
          j = moves.length;
        } else {
          console.log('ending search for duplicates of this i')
          j = moves.length;
        }
      }
    }
  }
}

})();
