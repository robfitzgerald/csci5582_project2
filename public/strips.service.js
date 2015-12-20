(function() {

  angular
  .module('project2')
  .factory('StripsFactory', ['$q', StripsFactory]);

  function StripsFactory($q) {
    var StripsFactory = {
      example1: example1,  // simple problem
      example2: example2,  // sussman anomoly
      example3: example3   // of your choice
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
      console.log('example3()')
      runstrips(ops,members3,ex3Goal,ex3Start,ex3GoalState,[],1,function(result) {
        console.log('complete with result')
        console.log(result)
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
      new Predicate('on', 'B', 'A'),
      new Predicate('ontable', 'A'),
      new Predicate('ontable', 'C'),
      new Predicate('ontable', 'D'),
      new Predicate('armempty'),
      new Predicate('clear', 'B'),
      new Predicate('clear', 'C'),
      new Predicate('clear', 'D')
      ]);
    var ex1GoalState = new Statement([
      new Predicate('on', 'C', 'A'),
      new Predicate('on', 'B', 'D'),
      new Predicate('ontable', 'A'),
      new Predicate('ontable', 'D'),
      new Predicate('armempty')
      ]);

    var ex1Goal = {
      name: 'goal',
      p: ex1GoalState,
      a: new Statement(),
      d: new Statement()
    };

    var members2 = [
    'A', 'B', 'C'
    ];

    var ex2Start = new Statement([
      new Predicate('on', 'C', 'A'),
      new Predicate('ontable', 'A'),
      new Predicate('ontable', 'B'),
      new Predicate('armempty'),
      new Predicate('clear', 'B'),
      new Predicate('clear', 'C')
      ]);
    var ex2GoalState = new Statement([
      new Predicate('on', 'B', 'C'),
      new Predicate('on', 'A', 'B')
      ]);

    var ex2Goal = {
      name: 'goal',
      p: ex2GoalState,
      a: new Statement(),
      d: new Statement()
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
      d: new Statement()
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
              ops.push(unstack);
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
    /* prints search tree to console */
    var tree = "";
    for (var i = 0; i < depth; ++i) {
      tree += "  ";
    }
    tree += move.name;
    console.log(tree);
    if (depth > 12) {
      return {
        validBranch: false,
        current: deepCopy(current),
        triedMoves: deepCopy(thisPlan)
      }
    }
    var stack = move.p.expand();
    var thisCurrent = deepCopy(current);
    var triedMoves = deepCopy(thisPlan);
    for (var i = stack.length-1; i >= 0; --i) {
      if (i == 0) {
        if (thisCurrent.containsAll(stack[i])) {
          return {
            validBranch: true,
            current: deepCopy(thisCurrent),
            triedMoves: deepCopy(triedMoves)
          }
        } else {
          return {
            validBranch: false,
            current: deepCopy(current),
            triedMoves: deepCopy(thisPlan)
          }
        }
      } else if ((i == stack.length - 1) && thisCurrent.containsAll(stack[i])) {
        stack.pop();
      }  else {
        var possibleMoves = ops.generateOperations(stack[i],members);

        // cull possible moves
        cullPossibleMoves(possibleMoves,triedMoves);

        // evaluate better moves
        heuristic(possibleMoves,thisCurrent,goal);

        // try moves
        for (var j = possibleMoves.length-1; j >= 0; --j) {
          var thisPossibleMoveName = possibleMoves[j].name;
          triedMoves.push(possibleMoves[j]);
          var recurse = strips(ops,members,possibleMoves[j],thisCurrent,goal,triedMoves,(depth+1));
          if (recurse.validBranch) {
            triedMoves = deepCopy(recurse.triedMoves);
            thisCurrent = deepCopy(recurse.current);
            thisCurrent.deleteStatement(possibleMoves[j].d);
            thisCurrent.addStatement(possibleMoves[j].a);
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

  // TODO: maybe could be rewritten without being O(n^2)
  // triedMoves is idempotent through this procedure
  function cullPossibleMoves(possibleMoves,triedMoves) {
    console.log('cullPossibleMoves()');
    var lastTriedMove = ((triedMoves.length > 0) ? triedMoves.length - 1 : 0);
    console.log(lastTriedMove + ' is lastTriedMove');

    // no matter the move, don't do it twice in a row
    for (var j = possibleMoves.length-1; j >= 0; --j) {
      var possibleMoveName = possibleMoves[j].name;
      for (var k = triedMoves.length-1; k >= 0; --k) {
        var previousMoveName = triedMoves[k].name;
        if (hasSubstring(possibleMoveName,moveNameFromString(previousMoveName))) {
          if ((possibleMoveName === previousMoveName) && (k == triedMoves.length-1)) {
            possibleMoves.splice(j, 1);
            k = -1;
          }
        }
      }
    }
    
    //var previousMoveName = triedMoves[lastTriedMove].name;
    //console.log(previousMoveName);
    // possibleMoves.forEach(function(move,index,moves) {
    //   console.log('checking ' + move.name)
    //   if (hasSubstring(move.name,moveNameFromString(previousMoveName))) {
    //     console.log('splicing index ' + index + ' which is move ' + move.name);
    //     possibleMoves.splice(index,1);
    //   }
    // })

    // if we are stacking or unstacking ('stack' is a substring of 'unstack')
    // make sure we only ever use stack or unstack with
    // this exact list of parameters once in a list of triedMoves
    for (var j = possibleMoves.length-1; j >= 0; --j) {
      var possibleMoveName = possibleMoves[j].name;
      for (var k = triedMoves.length-1; k >= 0; --k) {
        var previousMoveName = triedMoves[k].name;
        if (possibleMoveName.indexOf('stack') != -1) {
          if (possibleMoveName === previousMoveName) {
            possibleMoves.splice(j, 1);
            k = -1;
          }
        }
      }  
    }    
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
    for (var j = possibleMoves.length-1; j >= 0; --j) {
      if (possibleMoves[j].heuristic == 0) {
        possibleMoves.splice(j,1);
      }
    }

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
    var result = strips(ops,members,move,current,goal,thisPlan,depth);
    result.moves = [];
    for (var i = result.triedMoves.length - 1; i >= 0; --i) {
      result.moves.push(result.triedMoves[i]);
    }
    delete result.triedMoves;
    callback(result);
  }

})();
