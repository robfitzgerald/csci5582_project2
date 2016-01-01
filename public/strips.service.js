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
      runstrips(ops, members1, ex1Goal, ex1StartState, ex1Goal, [], 1, false, function (result) {
        deferred.resolve({
          moves: result.moves,
          current: ex1StartState,
          goal: ex1GoalState
        });
      });
      return deferred.promise;
    }

    function example2() {
      console.log('in StripsFactory.example2()')
      var deferred = $q.defer();
      runstrips(ops, members2, ex2Goal, ex2StartState, ex2Goal, [], 1, true, function (result) {
        deferred.resolve({
          moves: result.moves,
          current: ex2StartState,
          goal: ex2GoalState
        });
      });
      return deferred.promise;
    }

    function example3() {
      var deferred = $q.defer();
      console.log('example3()')
      runstrips(ops, members3, ex3Goal, ex3StartState, ex3Goal, [], 1, false, function (result) {
        deferred.resolve({
          moves: deepCopy(result.moves),
          current: deepCopy(ex3StartState),
          goal: deepCopy(ex3GoalState)
        });
      });
      return deferred.promise;
    }


    var ops = blocksWorldOperations();

    var members1 = [
      'A', 'B', 'C', 'D'
    ];

    var ex1StartState = new Statement([
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
    var ex3StartState = new Statement([
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
     * this is still an array because i had believed i might want causalLinks to go both ways, and there are no
     * guarantees on the number of causalLinks that can travel from start toward finish.
     */
    function hasCausalLink() {
      var numLinks = this.causalLinks.length;
      return (numLinks == 1);
    }
    function removeCausalLink(pred) {
      var found = null;
      for (var i = 0; i < this.causalLinks.length; ++i) {
        if (this.causalLinks[i].equalTo(pred)) {
          // console.log('Predicate.removeCausalLink(), found match: ' + this.causalLinks[i].toString() + ' and ' + pred.toString())
          found = i;
        }
      }
      // console.log('if we found a match, this should be a number: ' + found)
      if (found != null) {
        var spliced = this.causalLinks.splice(found, 1);
        // console.log('Predicate.removeCausalLink(): removed ' + spliced.toString());
        if (this.causalLinks.length == 0) {
          // console.log('Predicate.removeCausalLink(): setting this predicate to open')
          this.open = true;
        }
      } else {
        // console.log('Predicate.removeCausalLink() failed: ' + pred.toString() + ' was not found.')
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
      generateBlocksSubGoal: generateBlocksSubGoal,
      Op_stack: Op_stack,
      Op_unstack: Op_unstack,
      Op_pickup: Op_pickup,
      Op_putdown: Op_putdown
    };


    function Op_stack(x, y) {
      this.x = x;
      this.y = y;
      this.name = 'stack(' + x + ',' + y + ')';
      this.id = 'st' + x + y;
      this.oppositeName = 'unstack(' + x + ',' + y + ')';
      this.p = new Statement([new Predicate('clear', y), new Predicate('holding', x)]);
      this.d = new Statement([new Predicate('clear', y), new Predicate('holding', x)]);
      this.a = new Statement([new Predicate('armempty'), new Predicate('on', x, y)]);
      this.child = [];
      this.orderBeforeList = [];
      this.orderAfterList = [];
      this.orderBefore = orderBefore;
      this.orderAfter = orderAfter;
      this.removeBefore = removeBefore;
      this.removeAfter = removeAfter;
    }

    function Op_unstack(x, y) {
      this.x = x;
      this.y = y;
      this.name = 'unstack(' + x + ',' + y + ')';
      this.id = 'un' + x + y;
      this.oppositeName = 'stack(' + x + ',' + y + ')';
      this.p = new Statement([new Predicate('on', x, y), new Predicate('clear', x), new Predicate('armempty')]);
      this.d = new Statement([new Predicate('on', x, y), new Predicate('armempty')]);
      this.a = new Statement([new Predicate('holding', x), new Predicate('clear', y)]);
      this.child = [];
      this.orderBeforeList = [];
      this.orderAfterList = [];
      this.orderBefore = orderBefore;
      this.orderAfter = orderAfter;
      this.removeBefore = removeBefore;
      this.removeAfter = removeAfter;
    }

    function Op_pickup(x) {
      this.x = x;
      this.y = null;
      this.name = 'pickup(' + x + ')';
      this.id = 'pi' + x
      this.oppositeName = 'putdown(' + x + ')';
      this.p = new Statement([new Predicate('clear', x), new Predicate('ontable', x), new Predicate('armempty')]);
      this.d = new Statement([new Predicate('ontable', x), new Predicate('armempty')]);
      this.a = new Statement([new Predicate('holding', x)]);
      this.child = [];
      this.orderBeforeList = [];
      this.orderAfterList = [];
      this.orderBefore = orderBefore;
      this.orderAfter = orderAfter;
      this.removeBefore = removeBefore;
      this.removeAfter = removeAfter;
    }

    function Op_putdown(x) {
      this.x = x;
      this.y = null;
      this.name = 'putdown(' + x + ')';
      this.id = 'pu' + x;
      this.oppositeName = 'pickup(' + x + ')';
      this.p = new Statement([new Predicate('holding', x)]);
      this.d = new Statement([new Predicate('holding', x)]);
      this.a = new Statement([new Predicate('ontable', x), new Predicate('armempty')]);
      this.child = [];
      this.orderBeforeList = [];
      this.orderAfterList = [];
      this.orderBefore = orderBefore;
      this.orderAfter = orderAfter;
      this.removeBefore = removeBefore;
      this.removeAfter = removeAfter;
    }

    function orderBefore(move) {
      this.orderBeforeList.push(move);
      ///////// DEBUG //////////
      var found = false;
      this.orderBeforeList.forEach(function(link) {
        if (move === link) {
          // console.log('Move.orderBefore() success')
          found = true;
        }
      })
      if (!found) {
        // console.log('Move.orderBefore() failure')
      }
    }

    function orderAfter(move) {
       this.orderAfterList.push(move);
    }

    function removeBefore(move) {
      for (var i = 0; i < this.orderBeforeList.length; ++i) {
        if (move === this.orderBeforeList[i]) {
          // console.log('Move.removeBefore(): ' + move.name + ' and ' + this.orderBeforeList[i].name + ' match found')
          var spliced = this.orderBeforeList.splice(i,1);
          // console.log('Move.removeBefore() success at removing ' + spliced[0].name)
        }
      }
    }

    function removeAfter(move) {
      for (var i = 0; i < this.orderAfterList.length; ++i) {
        if (move === this.orderAfterList[i]) {
          // console.log('Move.removeAfter(): ' + move.name + ' and ' + this.orderAfterList[i].name + ' match found')
          var spliced = this.orderAfterList.splice(i,1);
          // console.log('Move.removeAfter() success at removing ' + spliced[0].name)
        }
      }
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
        /* one-parameter operations */
        var pickup = new Op_pickup(members[i]);
        if (currentSingle.containsOne(pickup.a)/* && currentState.containsAll(pickup.p)*/) {
          ops.push(pickup);
        }
        var putdown = new Op_putdown(members[i]);
        if (currentSingle.containsOne(putdown.a)/* && currentState.containsAll(putdown.p)*/) {
          ops.push(putdown);
        }

        for (var j = 0; j < members.length; j++) {
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
        op.depth = depth;
      })
      return ops;
    }

    function generateBlocksSubGoal(members) {
      var predicates = [];
      members.forEach(function(block) {
        predicates.push(new Predicate('ontable', block));
        predicates.push(new Predicate('clear', block));
      })
      predicates.push(new Predicate('armempty'))
      return {
        name: 'goal',
        p: new Statement(predicates),
        a: new Statement(),
        d: new Statement(),
        child: [],
        causalLinks: []
      }
    }

    function generatePopOperations(predicate,members,start) {
      var ops = [];
      var evaluateAsStatement = new Statement([predicate]);
      for (var i = 0; i < members.length; ++i) {
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
      if (evaluateAsStatement.containsOne(start.a)) {
        ops.push(start);
      }
      ops.forEach(function (op) {
        op.p.list.map(function(operationPredicate) {
          operationPredicate.parent = op;
        })
        op.a.list.map(function(operationPredicate) {
          operationPredicate.parent = op;
        })       
      });
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
  function strips(ops, members, move, current, goal, triedMoves, depth, modified) {
    if (depth > 7) {
      return {
        validBranch: false
      }
    }
    // var newStripsLog = "";
    // for (var i = 0; i < depth; ++i) {
    //  newStripsLog += "~|";
    // }
    // newStripsLog += '~ strips() with move ' + move.name;
    // console.log(newStripsLog);
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
        stripsHeuristic(possibleMoves, current, goal.p, modified, triedMoves);
        for (var j = possibleMoves.length - 1; j >= 0; --j) {
          var recurseMove = deepCopy(possibleMoves[j]);
          var recurseCurrent = deepCopy(current);
          triedMoves.push(recurseMove);
          var recurseTriedMoves = deepCopy(triedMoves);
          var recurse = strips(ops, members, recurseMove, recurseCurrent, goal, recurseTriedMoves, (depth + 1), modified);
          if (recurse.validBranch) {
            // console.log('recurse came back valid!')
            // var tree = "";
            // for (var i = 0; i < depth; ++i) {
            //  tree += " ";
            // }
            // tree += recurseMove.name;
            // tree += "               | depth= " + depth + ", stripsHeuristic= " + recurseMove.stripsHeuristic;
            // tree += " triedMoves.length= " + triedMoves.length;
            // console.log(tree);
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

  function stripsHeuristic(possibleMoves, thisCurrent, goal, modified, triedMoves) {
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

    // sort ascending, since we will move through array in descending order, and higher numbers are better
    possibleMoves.sort(function moveHeuristicSort(a, b) {
      return a.heuristic - b.heuristic;
    });
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

  function runstrips(ops, members, move, current, goal, thisPlan, depth, modified, callback) {
    var result = null;
    if (modified) {
      var subGoal = ops.generateBlocksSubGoal(members);
      var subGoalState = ops.generateBlocksSubGoal(members);
      subGoalState = subGoalState.p;
      var stageTwo = strips(ops, members, move, subGoalState, goal, [], depth, modified);
      var stageOne = strips(ops, members, subGoal, current, subGoal, [], depth, modified);
      var combinedResult = [];
      findMoves(stageOne.thisMove, combinedResult);
      findMoves(stageTwo.thisMove, combinedResult);
      result = {
        thisMove: goal,
        moves: combinedResult,
        current: current,
        validBranch: true
      }
    } else {
      result = strips(ops, members, move, current, goal, thisPlan, depth, modified);
      result.moves = [];
      findMoves(result.thisMove, result.moves);
      delete result.triedMoves;
    }
    deleteOpposites(result.moves);
    callback(result);
  }






















  function runPopStrips(ops, members, startMove, goalMove, callback) {
    // ------ config ------
    // one little bit of config here
    // put names (name attribute) of the start and goal actions here
    // and any other moves you don't want to connect to the plan for whatever reason
    // index 0 reserved for start, 1 reserved for goal
    var ignoreNames = ['start', 'goal']; 
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ runPopStrips() TOP ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    // set constraint start is less than goal
    // no causal links
    // goal preconditions are on the open precondition list
    var start = deepCopy(startMove)
    var goal = deepCopy(goalMove)
    console.log('plan:')
    console.log(goal)
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    console.log('')
    start.constraint = 0;
    // hijacked. v2 should set a parent attribute for all predicates that are part of actions.
    start.a.list.forEach(function(pred) {
      pred.parent = start;
    })
    goal.constraint = 100;
    var result = popStrips(ops, members, start, goal, 1);
    printPlan(result.plan);
    callback(result);

    function popStrips(ops, members, start, plan, depth) {
      console.log('~~~~~~~~~~~~~~~~~~~~~~~~ begin popStrips() of depth ' + depth + '~~~~~~~~~~~~~~~~~~~~~~~~')
      var spacer = '';
      for (var i = 0; i < depth; ++i) {
        spacer += ' + '
      }
      if (depth > 10) {
        console.log(spacer + 'past max depth, returning false')
        return {
          plan: plan,
          success: false
        }
      }
      var open = getOpen(plan);
      open.sort(function prioritizeGoalside(a, b) {
        // console.log(a.parent.name + '.constraint=' + a.parent.constraint + ' < ' + b.parent.name + '.constraint=' + b.parent.constraint + ' ?' + (a.parent.constraint < b.parent.constraint))
        return a.parent.constraint < b.parent.constraint
      })
      console.log(spacer + 'open list')
      console.log(open)
      if (open.length == 0) {
        var allStartPredicatesClosed = true;
        start.a.list.forEach(function(pred) {
          if (pred.isOpen()) {
            allStartPredicatesClosed = false;
          }
        })
        if (allStartPredicatesClosed) {
          console.log(spacer + 'empty open list and start is fully connected; returning with plan and success.')
          return {
            plan: plan,
            success: true
          } 
        } else {
          console.log(spacer + 'empty open list but start not fully connected. returning with plan and failure.')
          return {
            plan: plan,
            success: false
          }
        }
      }

      var thisPrecondition = open[0];

      var possibleMoves = ops.generatePopOperations(thisPrecondition, members, start);
      var debugPossibleMoves = [];
      possibleMoves.forEach(function(poss) {
        debugPossibleMoves.push(poss.name)
      })
      console.log(spacer + 'possible moves from generatePopOperations')
      console.log(debugPossibleMoves)

      removeDuplicateMoves(possibleMoves, thisPrecondition);
      ignoreMoves(possibleMoves)
      heuristicSort(possibleMoves,start);

      debugPossibleMoves = [];
      possibleMoves.forEach(function(poss) {
        debugPossibleMoves.push(poss.name)
      })
      console.log(spacer + 'possible moves after removing duplicates, ignoreMoves and after heuristicSort')
      console.log(debugPossibleMoves)
      console.log(spacer + 'about to apply one of ' + possibleMoves.length + ' moves')

      ////////////////////////////// APPLY MOVE //////////////////////////////
      for (var i = 0; i < possibleMoves.length; ++i) {
        // pick i'th move and run with it
        var thisMove = possibleMoves[i];
        console.log(spacer + 'chose ' + thisMove.name + ' to solve for ' + thisPrecondition.toString())
        // console.log('thisMove')
        // console.log(thisMove);
        // connect chosen move precondition to this closed precondition
        var connectedMovePredicate = findMatchingPredicateIn(thisPrecondition, thisMove.a.list);
        connectPredicates(thisPrecondition,connectedMovePredicate);
        // now the open list should include the predicates from the recently added move. update our open list.
        open = getOpen(plan);
        // set constraint: move.constraint = parent-of-precondition-constraint - 1
        thisMove.constraint = thisPrecondition.parent.constraint - 1;
        // connect any predicates on the open list to the start.a.list if we can
        start.a.list.forEach(function(startPredicate) {
          if (startPredicate.isOpen()) {
            open.forEach(function(openPredicate) {
              if (startPredicate.equalTo(openPredicate)) {
                console.log(spacer + 'connecting ' + startPredicate.toString() + ' to ' + openPredicate.toString() + ' because the new move made it available')
                connectPredicates(startPredicate,openPredicate);
                console.log(spacer + 'done connecting this predicate to the start add list predicate')
              }
            })
          }
        })

        ////////////////////////// ORDERING //////////////////////////
        var allConnectedMoves = getMovesExceptThisMove(plan,thisMove);
        console.log(spacer + 'ORDERING: allConnectedMoves not including thisMove:')
        console.log(allConnectedMoves)
        var movesConnectedTo = [];
        allConnectedMoves.forEach(function(connectedMove) {
          if (connectedMove.d.containsOne(thisMove.p)) {
            console.log(spacer + 'connecting ' + thisMove.name + ' -> ' + connectedMove.name);
            connectMovesBeforeToAfter(thisMove,connectedMove)
            movesConnectedTo.push(connectedMove)
          }
        })

        ///////////////////////// PRE-RECURSE DEBUG ////////////////////
        console.log(spacer + 'about to recurse. here is the plan at this point:')
        printPlan(plan);
        var debugOpenList = {};
        open.forEach(function(precondition) {
          debugOpenList[precondition.parent.name] = ''
        })
        open.forEach(function(precondition) {
          debugOpenList[precondition.parent.name] += precondition.toString() + ' ';
        })
        console.log(spacer + 'actions with open predicates')
        console.log(debugOpenList);


        var recurse = popStrips(ops, members, start, plan, depth + 1);
        console.log(spacer + 'return from recurse with success=' + recurse.success);
        if (recurse.success) {
          return recurse;
        }
        console.log(spacer + 'FAILED. disconnect ' + thisMove.name + ' and retry')
        console.log(movesConnectedTo)
        disconnectPredicates(thisPrecondition,connectedMovePredicate);
        movesConnectedTo.forEach(function(connectedMove) {
          console.log(spacer + 'disconnecting ' + thisMove.name + ' -x ' + connectedMove.name);
          disconnectMovesBeforeToAfter(thisMove,connectedMove);
        })
        console.log(spacer + 'the two formerly associated preconditions should be open')
        console.log(spacer + 'thisPrecondition open? ' + thisPrecondition.isOpen());
        console.log(spacer + 'connectedMovePredicate open? ' + connectedMovePredicate.isOpen());
      }

      console.log(spacer + 'got to end of possibleMoves list, returning failure')
      return {
        plan: plan,
        success: false
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

      function ignoreMoves (possibles) {
        // ignoreNames comes from runPopStrips() as a config
        for (var i = possibles.length - 1; i >= 0; --i) {
          for (var j = 0; j < ignoreNames.length; ++j) {
            if (possibles[i].name === ignoreNames[j]) {
              var spliced = possibles.splice(i,1);
              // console.log('ignoreMoves(): removing ' + spliced[0].name + ' because it is in the list of ignoreNames')
              break;
            }
          }
        }
      }

      function heuristicSort (possibles,start) {
        // for each possible move,
        //   better moves have preconditions that match the start state's a.list predicates
        // so, given the start state and the list possibleMoves, assign value based on
        //  # of matches between predicates
        // console.log('heuristicSort()')
        var openStartPredicates = start.a.list.filter(function removeClosed(predicate) {
          // console.log('is ' + predicate.toString() + ' an open predicate? ' + predicate.isOpen());
          return predicate.isOpen();
        })
        // console.log('result of filtering by open status:')
        // console.log(openStartPredicates)
        var openStartStatement = new Statement(openStartPredicates);
        possibles.forEach(function(move) {
          // if (move.name === 'start') {
          //   move.heuristic = 100;
          // } else {
            var count = move.p.containsSome(openStartStatement);
            move.heuristic = count;
          // }
        })
        possibles.sort(function popHeuristicSort(a,b) {
          return b.heuristic - a.heuristic;
        })
        // console.log('after heuristic sort')
        // console.log(possibles)
      }

      /**
       *
       * @desc finds moves that are attached to the top node, not including the top. used to generate ordering.
       */
      function getMovesExceptThisMove(node,thisMove) {
        // ignoreNames comes from runPopStrips()
        var moves = _getMoves(node);
        // console.log('hey im free')
        // OMG tried Array.prototype.filter over and over, no dice.
        for (var i = moves.length - 1; i >= 0; --i) {
          for (var j = 0; j < ignoreNames.length; ++j) {
            if (moves[i].name === ignoreNames[j]) {
              moves.splice(i,1);
              break;
            }
          }
        }
        for (var i = moves.length - 1; i >= 0; --i) {
          if (thisMove === moves[i]) {
            moves.splice(i,1);
            break;
          }
        }
        return moves;

        function _getMoves(node) {
          //var startMoveName = 'start' // don't add start to this list
          // console.log('_getMoves()')
          // console.log('performing operation on ' + node.name)
          var moves = [];
          moves.push(node);
          // console.log('node.p.list.forEach()')          
          node.p.list.forEach(function(predicate) {
            // console.log('if pred is closed and there are links')
            var links = predicate.getCausalLinks();
            if (!predicate.isOpen() && predicate.hasCausalLink()) {
              // console.log('oh yes pred was closed')
              var move = links[0].parent;
              // console.log('at predicate parent aka destination move')
              // console.log(move);
              // if (move.name !== startMoveName) {
              // console.log('move found:')
              // console.log(move)
              // console.log('testing if ' + move.name + ' !== ' + ignoreNames[0] + ': ' + (move.name !== ignoreNames[0]))
              if (move.name !== ignoreNames[0]) {
                var recurse = _getMoves(move);
                // console.log('recurse return with length ' + recurse.length)
                recurse.forEach(function(recurseMove) {
                  // console.log('ok, we\'re adding ' + recurseMove.name + ' now')
                  moves.push(recurseMove);
                })
              } else {
                // console.log('whoa buddy, ' + move.name + ' has the name of the start action which _getMoves() ignores')
              }
            }
          });
          // console.log('returning moves')
          return moves;          
        }
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
        console.log('connectPredicates(): connecting ' + p1.toString() + ' to ' + p2.toString() + '?')
        console.log('connectPredicates(): ' + p1.toString() + ' links: ' + p1.getCausalLinks().length + ', ' + p2.toString() + ' links: ' + p2.getCausalLinks().length)
        console.log(p1)
        console.log(p2)
      }

      function disconnectPredicates(p1, p2) {
        console.log('these two were previously linked together')
        console.log('p1 had ' + p1.causalLinks.length + ' links and p2 had ' + p2.causalLinks.length + ' links')
        console.log('and p1.isOpen() ' + p1.isOpen() + ' and p2.isOpen() ' + p2.isOpen());
        p1.removeCausalLink(p2);
        p2.removeCausalLink(p1);
        console.log('now p1 has ' + p1.causalLinks.length + ' links and p2 has ' + p2.causalLinks.length + ' links')
        console.log('and p1.isOpen() ' + p1.isOpen() + ' and p2.isOpen() ' + p2.isOpen());
      }

      function connectMovesBeforeToAfter(m1, m2) {
        m1.orderBefore(m2);
        m2.orderAfter(m1);
      }

      function disconnectMovesBeforeToAfter(m1, m2) {
        m1.removeBefore(m2);
        m2.removeAfter(m1);
        // console.log('done disconnecting moves')
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
        // console.log('found matching name or opposite name')
        //moves[j].deleteMe == true;
        // console.log('deleting i and j: ' + moves[i].name + ', ' + moves[j].name + ', and restarting search')
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

  /**
   *
   * @desc finds moves that are attached to the top node, not including the top. used to generate ordering.
   */
  function printPlan(node) {
    console.log('~~~~~CURRENT PLAN~~~~~')
    var ignoreNames = ['goal', 'start']
    var moves = _getMoves(node);
    // OMG tried Array.prototype.filter over and over, no dice.
    for (var i = moves.length - 1; i >= 0; --i) {
      for (var j = 0; j < ignoreNames.length; ++j) {
        if (moves[i].name === ignoreNames[j]) {
          moves.splice(i,1);
          break;
        }
      }
    }
    
    moves.forEach(function(move) {
      var comesBefore = [];
      move.orderBeforeList.forEach(function(link) {
        comesBefore.push(link.name)
      })
      console.log(move.name + ': comes before ' + JSON.stringify(comesBefore));
    })

    console.log('~~~~~~~~~~~~~~~~~~~~~~')

    function _getMoves(node) {
      //var startMoveName = 'start' // don't add start to this list
      // console.log('getMoves()')
      var moves = [];
      moves.push(node);
      // console.log('node.p.list.forEach()')
      node.p.list.forEach(function(predicate) {
        // console.log('if pred is closed and there are links')
        var links = predicate.getCausalLinks();
        if (!predicate.isOpen() && predicate.hasCausalLink()) {
          // console.log('oh yes pred was closed')
          var move = links[0].parent;
          // console.log('traversed to move over causal link')
         // if (move.name !== startMoveName) {
            // console.log('move found:')
            // console.log(move)
            var recurse = _getMoves(move);
            // console.log('recurse return with length ' + recurse.length)
            recurse.forEach(function(recurseMove) {
              // console.log('ok, we\'re adding ' + recurseMove.name + ' now')
              moves.push(recurseMove);
            })
        //  }
        }
      });
      // console.log('returning moves')
      return moves;          
    }
  }
  
  // function printPlan(node) {
  //   var header = '';
  //   for (var i = 0; i < (100 - node.constraint); ++i) {
  //     header += ' ';
  //   }
  //   header += node.name;
  //   console.log(header);
  //   node.p.list.forEach(function(precondition) {
  //     if (!precondition.isOpen()) {
  //       console.log(header + ' ' + precondition.toString() + ' --> ')
  //       var recurseOn = precondition.causalLinks[0].parent;
  //       // console.log('recurse on this move:')
  //       // console.log(recurseOn)
  //       printPlan(recurseOn);
  //     }
  //   })
  // }

})();
