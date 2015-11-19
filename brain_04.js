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
   *
   * @param ops
   * @param members
   * @param move
   * @param thisPlan
   * @returns boolean
   */
  function strips(ops,members,move,thisPlan) {
    // expand the statement vertically
    if (thisPlan.length > 4) {
      return false;
    }
    var stack = move.p.expand();
    var triedMoves = thisPlan.slice();
    //console.log('STRIPS dawg, stack.length = ' + stack.length);
    //console.log(stack);
    //console.log('current state');
    //console.log(currentCallback());
    for (var i = stack.length-1; i >= 0; --i) {
      // if we are looking at the top of the stack
      // ,and the predicate at this location is present in the current state
      if (
        (i == stack.length-1) &&
        currentCallback().containsAll(stack[i])
      ) {
        //console.log('popping ' + stack[i].list.length + ' predicates found in stack[' + i + ']');
        stack.pop();
      } else {
        if (stack[i].list.length == 1) {
          var possibleMoves = ops.generateOperations(stack[i],members);
          //console.log('possible moves');
          //console.log(possibleMoves);
          for (var j = possibleMoves.length-1; j >= 0; --j) {
            for (var k = triedMoves.length-1; k >= 0; --k) {
              if (possibleMoves[j].name.includes(moveNameFromString(triedMoves[k]))) {
                //console.log(possibleMoves[j].name + ' was found to have some characters from a move in the triedMoves array');
                if (possibleMoves[j].name == triedMoves[k]) {
                  //console.log(possibleMoves[j].name + ' was found to be exactly this move, so we will remove it.');
                  possibleMoves.splice(j, 1);
                  removedDuplicateInTriedMoves = true;
                }
                // we were only interested in any match with the one most recent call to this function
                k = -1;  // break the loop
              }
            }
          }
          // try moves
          for (var j = possibleMoves.length-1; j >= 0; --j) {
            // possibles[j] is the top-most possible move function
            // MOVED TO A nested loop above^^
/*            for (var k = triedMoves.length-1; k >= 0; --k) {
              //console.log('this j: ' + j + ', this k: ' + k);
              // TODO: more constraints on possible moves so we can't endlessly perform moves
              // find if there was a previous occurence of this move
              // if so, check if the most recent occurrence is an exact match, including parameters
              // if so, then delete this possible move (prevent endless repetition of the same move)
              if (possibleMoves[j].name.includes(moveNameFromString(triedMoves[k]))) {
                // TODO: just made moveNameFromString(). maybe test it in this context a little bit
                // operation name match.  compare now that they are completely equal, including parameters.
                // if so, wipe it. either way, end the loop of k
                //console.log(possibleMoves[j].name + ' was found to have some characters from a move in the triedMoves array');
                if (possibleMoves[j].name == triedMoves[k]) {
                  //console.log(possibleMoves[j].name + ' was found to be exactly this move, so we will remove it.');
                  possibleMoves.splice(j,1);
                  removedDuplicateInTriedMoves = true;
                }
                // we were only interested in any match with the one most recent call to this function
                k = -1;  // break the loop
              }
            }*/
            //console.log('trying the possible move ' + possibleMoves[j].name + ' because it is not in the triedMoves array');
            triedMoves.push(possibleMoves[j].name);
            if (strips(ops,members,possibleMoves[j],triedMoves)) {
              //console.log('STRIPS returned TRUE so we should pop ' + stack[i].list[0].name);
              //console.log('and modify the current state');
              currentCallback('d',possibleMoves[j].d);
              currentCallback('a',possibleMoves[j].a);
              planCallback(possibleMoves[j].name);
              stack.pop();
            } else {
              // nope. bad move. remove it. try another move.
              triedMoves.pop();
            }
          }
        }
        // TODO: if stack[i].list.length > 1 then it's the precondition list for the move that called this instance of STRIPS
        // in which case, this shit it totally bunk and we should toss it.
        // toss it.  is it that simple? return false or something?
        // ** do nothing? **
      }
      // hey, out of the loop
      // but, if we got here without clearing out the array 'stack', then, we want to return an empty plan[]
      // if the array is empty.. really?  cool!  then return thisPlan.  or return nothing?  what's uh the deal?
    }
    //console.log('returning from an outer call based on the move ' + move.name + ' with stack.length==0 being ' + ((stack.length == 0)? 'true':'false'));
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
    } else if (flag == 'd') {
      current.deleteStatement(statement);
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
})();