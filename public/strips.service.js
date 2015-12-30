(function () {

  angular
    .module('project2')
    .factory('StripsFactory', ['$q', '$log', StripsFactory]);

  function StripsFactory($q, $log) {
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
      runstrips(ops, members1, ex1Goal, ex1Start, ex1Goal, [], 1, function (result) {
        deferred.resolve({
          moves: result.moves,
          current: ex1Start,
          goal: ex1GoalState
        });
      });
      return deferred.promise;
    }

    function example2() {
      console.log('in StripsFactory.example2()')
      var deferred = $q.defer();
      // runstrips(ops,members2,ex2Goal,ex2Start,ex2Goal,[],1,function(result) {
      //   deferred.resolve({
      //     moves: result.moves,
      //     current: ex2Start,
      //     goal: ex2GoalState
      //   });
      // });
      runPopStrips(ops, members2, ex2Start, ex2Goal, function (result) {
        $log.info('result in StripsFactory.example2()')
        $log.info(result);
        deferred.resolve({
          result: result,
          current: ex2Start,
          goal: ex2Goal
        });
      })
      return deferred.promise;
    }

    function example3() {
      var deferred = $q.defer();
      //console.log('example3()')
      runstrips(ops, members3, ex3Goal, ex3Start, ex3Goal, [], 1, function (result) {
        //console.log('complete with result')
        //console.log(result)
        deferred.resolve({
          moves: deepCopy(result.moves),
          current: deepCopy(ex3Start),
          goal: deepCopy(ex3GoalState)
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
      child: [],
      causalLinks: []
    };

    var members2 = [
      'A', 'B', 'C'
    ];

    var ex2StartState = new Statement([
      new Predicate('armempty'),
      new Predicate('clear', 'B'),
      new Predicate('clear', 'C'),
      new Predicate('ontable', 'A'),
      new Predicate('ontable', 'B'),
      new Predicate('on', 'C', 'A')
    ]);
    var ex2GoalState = new Statement([
      new Predicate('on', 'A', 'B'),
      new Predicate('on', 'B', 'C')
    ]);

    var ex2Start = {
      name: 'start',
      p: new Statement(),
      a: ex2StartState,
      d: new Statement(),
      child: [],
      causalLinks: []
    }

    var ex2Goal = {
      name: 'goal',
      p: ex2GoalState,
      a: new Statement(),
      d: new Statement(),
      child: [],
      causalLinks: []
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
      child: [],
      causalLinks: []
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

    // PopStrips
    this.open = true;
    this.causalLinks = [];
    this.setCausalLink = setCausalLink;
    this.getCausalLinks = getCausalLinks;
    this.hasCausalLink = hasCausalLink;
    this.removeCausalLink = removeCausalLink;
    this.close = close;
    this.isOpen = isOpen;

    function setCausalLink (pred) {
      this.causalLinks.push(pred);
      this.open = false;
    }
    function getCausalLinks () {
      return this.causalLinks;
    }
    /**
     * @desc identifies if a predicate on a precondition list has a causal link. should only be 1.
     */
    function hasCausalLink() {
      var numLinks = this.causalLinks.length;
      return (numLinks == 1);
    }
    function removeCausalLink(pred) {
      var found = null;
      for (var i = 0; i < this.causalLinks.length; ++i) {
        if (this.causalLinks[i].equalTo(pred)) {
          found = i;
        }
      }
      if (found) {
        this.causalLinks.splice(i,1);
      }
    }
    function close () {
      this.open = false;
    }
    function isOpen () {
      return this.open;
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
    this.containsSome = containsSome;
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

    function containsSome(s) {
      var count = 0;
      for (var i = 0; i < this.list.length; ++i) {
        ////console.log('list[' + i + '] is ' + list[i].name);
        for (var j = 0; j < s.list.length; ++j) {
          ////console.log('s.list[' + j + '] is ' + s.list[j].name);
          if (this.list[i].equalTo(s.list[j])) {
            ////console.log('found! ' + list[i].name + ' equalTo ' + s.list[j].name);
            ++count;
          }
        }
      }
      return count;
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
            this.list.splice(i, 1);
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
      generatePopOperations: generatePopOperations,
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
      this.orderBefore = null;
      this.orderAfter = null;
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
      this.orderBefore = null;
      this.orderAfter = null;
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
      this.orderBefore = null;
      this.orderAfter = null;
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
      this.orderBefore = null;
      this.orderAfter = null;
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
      ops.forEach(function (op) {
        //op.currentState = currentState.toString();
        op.depth = depth;
      })
      // console.log('generatedOperations:')
      // console.log(ops);
      return ops;
    }

    function generatePopOperations(predicate,members,start) {
      var ops = [];
      var evaluateAsStatement = new Statement([predicate]);
      for (var i = 0; i < members.length; ++i) {
        //console.log('i is ' + i + ' and members[i] is ' + members[i])
        /* one-parameter operations */
        var pickup = new Op_pickup(members[i]);

        if (evaluateAsStatement.containsOne(pickup.a)) {
          ops.push(pickup);
        }
        var putdown = new Op_putdown(members[i]);
        if (evaluateAsStatement.containsOne(putdown.a)) {
          ops.push(putdown);
        }

        for (var j = 0; j < members.length; j++) {
          //console.log('j is ' + i + ' and members[i] is ' + members[i])
          if (i == j) {
            // do nothing
          } else {
            /* two-parameter operations */
            var stack = new Op_stack(members[i], members[j]);
            if (evaluateAsStatement.containsOne(stack.a)) {
              ops.push(stack);
            }
            var unstack = new Op_unstack(members[i], members[j]);
            if (evaluateAsStatement.containsOne(unstack.a)) {
              ops.push(unstack);
            }
          }
        }
      }
      //console.log('done iterative.')
      if (evaluateAsStatement.containsOne(start.a)) {
        ops.push(start);
      }
      //console.log('done checking start.')
      ops.forEach(function (op) {
        //console.log('forEach: ' + op.name)
        op.p.list.map(function(operationPredicate) {
          //console.log('map: ' + operationPredicate.toString());
          operationPredicate.parent = op;
        })
        op.a.list.map(function(operationPredicate) {
          //console.log('map: ' + operationPredicate.toString());
          operationPredicate.parent = op;
        })       
      });
       console.log('generatedPopOperations:')
       console.log(ops);
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
   * @param {Array} triedMoves -
   * @param {int} depth - track recursion depth
   * @returns {boolean}
   */
  function strips(ops, members, move, current, goal, triedMoves, depth, parentMovePtr) {
    if (depth > 6) {
      return {
        validBranch: false
      }
    }
    //var newStripsLog = "";
    //for (var i = 0; i < depth; ++i) {
    //  newStripsLog += "~|";
    //}
    //newStripsLog += '~ strips() with move ' + move.name;
    //console.log(newStripsLog);
    var stack = move.p.expand();
    for (var i = stack.length - 1; i >= 0; --i) {
      // FINAL STEP: if all of the preconditions for a move are present in the current state, then apply move
      // else, this was not a valid branch.
      if (i == 0) {
        if (current.containsAll(stack[i]) || current.containsAll(goal.p)) {
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
      } else {
        var possibleMoves = ops.generateOperations(stack[i], current, members, depth);
        // stripsHeuristic(possibleMoves,current,goal.p);
        for (var j = possibleMoves.length - 1; j >= 0; --j) {
          var recurseMove = deepCopy(possibleMoves[j]);
          var recurseCurrent = deepCopy(current);
          triedMoves.push(recurseMove);
          var recurseTriedMoves = deepCopy(triedMoves);
          var recurse = strips(ops, members, recurseMove, recurseCurrent, goal, recurseTriedMoves, (depth + 1), move);
          if (recurse.validBranch) {
            //var tree = "";
            //for (var i = 0; i < depth; ++i) {
            //  tree += " ";
            //}
            //tree += recurseMove.name;
            //tree += "               | depth= " + depth + ", stripsHeuristic= " + recurseMove.stripsHeuristic;
            //tree += " triedMoves.length= " + triedMoves.length;
            //console.log(tree);
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

  function stripsHeuristic(possibleMoves, thisCurrent, goal) {
    for (var j = possibleMoves.length - 1; j >= 0; --j) {
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
    possibleMoves.sort(function moveHeuristicSort(a, b) {
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

  function hasSubstring(str1, str2) {
    return (str1.indexOf(str2) != -1);
  }

  function runstrips(ops, members, move, current, goal, thisPlan, depth, callback) {
    console.log('solving the blocks world problem with this pair of start and goal states')
    console.log(deepCopy(current))
    console.log(deepCopy(goal))
    var result = strips(ops, members, move, current, goal, thisPlan, depth, move);
    result.moves = [];
    findMoves(result.thisMove, result.moves);
    delete result.triedMoves;
    deleteOpposites(result.moves);
    console.log('--DONE--   calling callback with this result object')
    console.log(deepCopy(result));
    callback(result);
  }


  function runPopStrips(ops, members, startMove, goalMove, callback) {
    console.log('in runPopStrips()')
    // set constraint start is less than goal
    // no causal links
    // goal preconditions are on the open precondition list
    var start = deepCopy(startMove)
    var goal = deepCopy(goalMove)
    console.log('plan')
    console.log(goal)
    start.constraint = 0;
    goal.constraint = 100;
    var result = popStrips(ops, members, start, goal, 1);
    callback(result);

    function printPlan(node) {
      var header = '';
      for (var i = 0; i < (100 - node.constraint); ++i) {
        header += ' ';
      }
      header += node.name;
      console.log(header);
      node.p.list.forEach(function(precondition) {
        if (!precondition.isOpen()) {
          console.log(header + ' ' + precondition.toString() + ' --> ')
          var recurseOn = precondition.causalLinks[0].parent;
          // console.log('recurse on this move:')
          // console.log(recurseOn)
          printPlan(recurseOn);
        }
      })
    }

    function popStrips(ops, members, start, plan, depth) {
      if (depth > 4) {
        return false;
      }
      console.log('~~~~~~~~~~~~~~~~~~~~~~~~in popStrips() of depth ' + depth)
      // console.log(plan)
      var open = getOpen(plan);
      console.log('open list')
      console.log(open)
      if (open.length == 0) {
        return plan;
      }
      var thisPrecondition = open[0];
      thisPrecondition.close();
      //var preconditionAsStatement = new Statement([thisPrecondition]);  // wrapper expected in generate logic
      // TODO: handle when generateOperations is passed Predicate instead of Statement for param 1
      var possibleMoves = ops.generatePopOperations(thisPrecondition, members, start);
      // console.log('possibleMoves length is ' + possibleMoves.length)
      
      >>>>>> WHY IS IT NOT USING PICKUP AND PUTDOWN?

      removeDuplicateMoves(possibleMoves, thisPrecondition);
      //console.log(possibleMoves)
      heuristicSort(possibleMoves,start);
      for (var i = 0; i < possibleMoves.length; ++i) {
        // pick i'th move and run with it
        var thisMove = possibleMoves[i];
        // console.log('thisMove')
        // console.log(thisMove);
        // connect chosen move precondition to this closed precondition
        var connectedMovePredicate = findMatchingPredicateIn(thisPrecondition, thisMove.a.list);
        connectPredicates(thisPrecondition,connectedMovePredicate);
        // set constraint: move.constraint = parent-of-precondition-constraint - 1
        thisMove.constraint = thisPrecondition.parent.constraint - 1;
        // connect any predicates on the open list to the start.a.list if we can
        start.a.list.forEach(function(startPredicate) {
          if (startPredicate.isOpen()) {
            open.forEach(function(openPredicate) {
              if (startPredicate.equalTo(openPredicate)) {
                connectPredicates(startPredicate,openPredicate);
              }
            })
          }
        })
        var recurse = popStrips(ops, members, start, plan, depth + 1);
        if (recurse) {
          return recurse;
        }
        disconnectPredicates(thisPrecondition,connectedMovePredicate);
        // console.log('recurse back to PopTartStrips @ depth ' + depth)
        // console.log(recurse)
        // if (noConflicts) {
        //   return true;
        // }
        //printPlan(plan);
      }

      function removeDuplicateMoves (possibleMoves, thisPrecondition) {
        // console.log('removeDuplicateMoves()');
        var thisMove = thisPrecondition.parent;
        for (var i = possibleMoves.length - 1; i >= 0; --i) {
          // console.log('testing move ' + i + ' in possibleMoves')
          // console.log(thisMove.oppositeName + ' === ' + possibleMoves[i].name + ' ? ' + (thisMove.oppositeName === possibleMoves[i].name))
          // console.log(thisMove.name + ' === ' + possibleMoves[i].name + ' ? ' + (thisMove.name === possibleMoves[i].name))
          if (thisMove.oppositeName === possibleMoves[i].name || thisMove.name === possibleMoves[i].moveNameFromString) {
            // console.log('deleting ' + possibleMoves[i].name + ' from possibleMoves because it is the opposite of this move: ' + thisMove.name)
            var spliced = possibleMoves.splice(i,1);
            // console.log('spliced ' + spliced[0].name);
          }
        }
      }

      function heuristicSort (possibles,start) {
        // for each possible move,
        //   better moves have preconditions that match the start state's a.list predicates
        // so, given the start state and the list possibleMoves, assign value based on
        //  # of matches between predicates
        var openStartPredicates = start.a.list.filter(function removeClosed(predicate) {
          // console.log('checking if this is true to keep this one: ' + predicate.isOpen());
          return predicate.isOpen();
        })
        var openStartStatement = new Statement(openStartPredicates);
        possibles.forEach(function(move) {
          var count = move.p.containsSome(openStartStatement);
          // console.log('count becomes heuristic: ' + count)
          // console.log('where containsOne is ' + move.p.containsOne(start.a) + ' and containsAll is ' + move.p.containsAll (start.a))
          move.heuristic = count;
        })
        possibles.sort(function popHeuristicSort(a,b) {
          return b.heuristic - a.heuristic;
        })
        console.log('after heuristic sort')
        console.log(possibles)
      }

      function getMoves(node) {
        // console.log('getMoves()')
        var moves = [];
        node.p.list.forEach(function(predicate) {
          var move = predicate.getLink();
          if (move) {
            //console.log('found a move: ' + move.name)
            moves.push(move)
            moves.concat(getMoves(move))
          }
        });
        return moves;
      }
      function getOpen(node) {
        var open = [];
        // console.log('in getOpen(), node is')
        // console.log(node)
        node.p.list.forEach(function(predicate) {
          if (predicate.isOpen()) {
            predicate.parent = node;
            // console.log('pushing ' + predicate.toString())
            open.push(predicate)
          } else if (predicate.hasCausalLink()) {
            // console.log('recurse on ' + predicate.toString())
            var links = predicate.getCausalLinks();
            var parentMoveOfLinkedPredicate = links[0].parent;
            var recurse = getOpen(parentMoveOfLinkedPredicate);
            // console.log('recurse complete with result:')
            // console.log(recurse);
            recurse.forEach(function(res) {
              open.push(res);
            })
            // open.concat(recurse);  Array.prototype.concat was failing.
            // console.log('concatenated recurse result with open list to produce a list of length ' + open.length)
          }
        });
        // console.log('resulting open list:')
        // console.log(open)
        return open;
      }

      function findMatchingPredicateIn(predicate,moveList) {
        // console.log('findMatchingPredicateIn()')
        // console.log(predicate)
        // console.log(moveList)
        var result = null;
        moveList.forEach(function(movePredicate) {
          // console.log('checking if this is true: ' + movePredicate.equalTo(predicate))
          if (movePredicate.equalTo(predicate)) {
            // console.log('returning the pred')
            result = movePredicate;
          }
        })
        return result;
      }

      function connectPredicates(p1, p2) {
        var p1Links = p1.getCausalLinks();
        var p2Links = p2.getCausalLinks();
        var notYetLinked = true;
        p1Links.forEach(function(link) {
          if (link.equalTo(p2)) {
            notYetLinked = false;
          }
        })
        p2Links.forEach(function(link) {
          if (link.equalTo(p1)) {
            notYetLinked = false;
          }
        })
        if (notYetLinked) {
          p1.setCausalLink(p2);
          p2.setCausalLink(p1);          
        }
        // console.log('causal links set')
        // console.log(p1)
        // console.log(p2)
      }

      function disconnectPredicates(p1, p2) {
        // console.log('these two were previously linked together')
        // console.log('p1 had ' + p1.causalLinks.length + ' links and p2 had ' + p2.causalLinks.length + ' links')
        // console.log(p1)
        // console.log(p2)
        p1.removeCausalLink(p2);
        p2.removeCausalLink(p1);
      }

      function connectMoves(m1, m2) {
        m1.orderBefore = m2;
        m2.orderAfter = m1;
      }
    }
  }

  function findMoves(move, list) {
    _findMoves(move, list);
    var lastInListIsTheGoalWeRemove = list.length - 1;
    list.splice(lastInListIsTheGoalWeRemove, 1);
  }

  function _findMoves(move, list) {
    for (var i = 0; i < move.child.length; ++i) {
      _findMoves(move.child[i], list);
    }
    list.push(deepCopy(move));
  }

  function deleteOpposites(moves) {
    for (var i = 0; i < moves.length - 1; ++i) {
      // for (var j = i + 1; j < moves.length; ++j) {
      var j = i + 1;
      // if (moves[i].x === moves[j].x && moves[i].y === moves[j].y) {
      // console.log('found matching parameters for ' + moves[i].name + ', ' + moves[j].name + ' at i,j=' + i + ', ' + j)
      if (moves[i].name === moves[j].name || moves[i].name === moves[j].oppositeName) {
        console.log('found matching name or opposite name')
        //moves[j].deleteMe == true;
        console.log('deleting i and j: ' + moves[i].name + ', ' + moves[j].name + ', and restarting search')
        // moves.splice(j,1)
        // moves.splice(i,1)
        moves.splice(i, 2);
        i = 0;
        // j = moves.length;
        // } else {
        // console.log('nothing. moving on to next i')
        // j = moves.length;
        // }
      }
      // }
    }
  }

})();
