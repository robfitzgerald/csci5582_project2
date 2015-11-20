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
      return ((this.name == p.name) && (this.x == p.x) && (this.y == p.y));
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
   * @param {Array} thisPlan -
   * @returns {boolean}
   */
  function strips(ops,members,move,thisPlan) {
    //console.log('booting a new strips function with triedMoves array:');
    //console.log(thisPlan);

    //if (thisPlan.length > 40) {
    //  return false;
    //}
    // expand the statement vertically
    var stack = move.p.expand();
    var triedMoves = thisPlan.slice(); // makes a copy of the thisPlan array, so this branch has it's own record
    for (var i = stack.length-1; i >= 0; --i) {
      // if we are looking at the top of the stack
      // ,and the predicate at this location is present in the current state
      if (
        (i == stack.length-1) &&
        currentCallback().containsAll(stack[i])
      ) {
        stack.pop();
      } else {
        if (stack[i].list.length == 1) {
          var possibleMoves = ops.generateOperations(stack[i],members);
          for (var j = possibleMoves.length-1; j >= 0; --j) {
            var thisPossibleMoveName = possibleMoves[j].name;
            for (var k = triedMoves.length-1; k >= 0; --k) {
              var checkTriedMove = moveNameFromString(triedMoves[k]);
              //console.log('comparing if ' + thisPossibleMoveName + ' includes the move name from string ' + checkTriedMove);
              //console.log('includes() results in ' + (thisPossibleMoveName.includes(checkTriedMove)));
              //console.log('=== results in ' + thisPossibleMoveName === checkTriedMove);
              if (thisPossibleMoveName.includes(checkTriedMove)) {
                if (thisPossibleMoveName === checkTriedMove) {
                  //console.log('removed duplicate move: ' + possibleMoves[j].name);
                  possibleMoves.splice(j, 1);
                  removedDuplicateInTriedMoves = true;
                }
                // we were only interested in any match with the one most recent call to this function
                k = -1;  // break the loop
              }
            }
          }
          // evaluate better moves
          for (var j = possibleMoves.length-1; j >= 0; --j) {
            if (goalState.containsOne(possibleMoves[j].a)) {
              if (goalState.containsAll(possibleMoves[j].a)) {
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
          //console.log('sorted list of possible moves');
          //console.log(possibleMoves);
          // try moves
          for (var j = possibleMoves.length-1; j >= 0; --j) {
            //console.log('trying the possible move ' + possibleMoves[j].name + ' because it is not in the triedMoves array');
            triedMoves.push(thisPossibleMoveName);
            if (strips(ops,members,possibleMoves[j],triedMoves)) {
              //console.log('STRIPS returned TRUE so we should pop ' + stack[i].list[0].name);
              //console.log('and modify the current state');
              //console.log('found a valid new move. modifying current state. before:');
              //console.log(currentCallback());
              currentCallback('d',possibleMoves[j].d);
              currentCallback('a',possibleMoves[j].a);
              //console.log('after applying ' + possibleMoves[j].name + ':');
              //console.log(currentCallback());
              planCallback(thisPossibleMoveName);
              stack.pop();
              j = -1; // we're done applying moves to the predicate we just deleted, bro
              //if (goalState.containsAll(currentCallback())) {
              //  return true;
              //}
            } else {
              // nope. bad move. remove it. try another move.
              triedMoves.pop();
            }
          }
        } else {
          // if stack[i].list.length > 1 then it's the precondition list for the move that called this instance of STRIPS
          // in which case, this shit it totally bunk and we should toss it.
          // toss it.
          //return false;
        }

      }
      // hey, end of the i loop
      // but, if we got here without clearing out the array 'stack', then, we want to return an empty plan[]
      // if the array is empty.. really?  cool!  then return thisPlan.  or return nothing?  what's uh the deal?
    }
    //console.log('returning from an outer call based on the move ' + move.name + ' with stack.length==0 being ' + ((stack.length == 0)? 'true':'false'));
    //if (goalState.containsAll(currentCallback())) {
    //  return true;
    //}
    return stack.length == 0;
  }


  var startState = new Statement([
    new Predicate('on', 'B', 'A'),
    new Predicate('ontable', 'A'),
    new Predicate('ontable', 'C'),
    new Predicate('ontable', 'D'),
    new Predicate('armempty'),
    new Predicate('clear', 'A'),
    new Predicate('clear', 'C'),
    new Predicate('clear', 'D')
  ]);
  var goalState = new Statement([
    new Predicate('on', 'C', 'A'),
    new Predicate('on', 'B', 'D'),
    new Predicate('ontable', 'A'),
    new Predicate('ontable', 'D')
  ]);
  var goal = {
    name: 'goal',
    p: goalState,
    a: new Statement(),
    d: new Statement()
  };
  var members = [
    'A', 'B', 'C', 'D'
  ];
  var ops = blocksWorldOperations();

  ////////////////////////////////////////
  /* globally available state variables */
  var plan = [];
  var current = startState;
  function planCallback(move) {
    if (move == null) {
      return plan;
    } else {
      plan.push(move);
    }
  }
  function currentCallback(flag,statement) {
    var stubContents = ((flag==null) ? "" : flag + ',' + statement);
      ////console.log('currentCallback(' + stubContents +')');
    if (flag == null) {
      return current;
    } else if (flag == 'a') {
      current.addStatement(statement);
      console.log('current, after add: ');
      console.log(current);
    } else if (flag == 'd') {
      current.deleteStatement(statement);
      console.log('current, after delete: ');
      console.log(current)
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

  //var del = new Statement([new Predicate('on', 'B', 'A'), new Predicate('armempty')]);

  //console.log('moveNameFromString');
  //console.log(moveNameFromString('stack(C,A)'));
  //console.log('should be true: ' + 'stack(C,A)'.includes(moveNameFromString('stack(C,A)')));
  //var someOp = ops.generateOperations(new Statement([new Predicate('on', 'A', 'B')]),members);
  //console.log(someOp);
  //console.log('should be true: ' + someOp[0].name.includes(moveNameFromString('stack(A,B)')));
  //console.log('should also be true: ' + someOp[0].name === 'stack(A,B)');
  //var copiedToVar = someOp[0].name;
  //console.log('should really be true since ' + copiedToVar + ' === stack(A,B): ' + (copiedToVar === 'stack(A,B)'));
  console.log('begin');
  console.log('STRIPS evaluated to: ' + strips(ops,members,goal,[]));
  var final = currentCallback().list;
  console.log('final list');
  for (var i = 0; i < final.length; ++i) {
    console.log(final[i].toString())
  }
  console.log('should be');
  for (var i = 0; i < goalState.list.length; ++i) {
    console.log(goalState.list[i].toString())
  }
  console.log('plan list');
  console.log(planCallback());
})();