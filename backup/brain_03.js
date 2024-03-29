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
    this.add = add;
    this.unpack = unpack;
    this.deleteOne = deleteOne;

    function add(p) {
      this.list.push(p);
    }

    function containsOne(s) {
      for (var i = 0; i < this.list.length; ++i) {
        //console.log('list[' + i + '] is ' + list[i].name);
        for (var j = 0; j < s.list.length; ++j) {
          //console.log('s.list[' + j + '] is ' + s.list[j].name);
          if (this.list[i].equalTo(s.list[j])) {
            //console.log('found! ' + list[i].name + ' equalTo ' + s.list[j].name);
            return true;
          }
        }
      }
      return false;
    }

    function containsAll(s) {
      for (var j = 0; j < s.list.length; ++j) {
        var match = false;
        //console.log('list[' + i + '] is ' + list[i].name);
        for (var i = 0; i < this.list.length; ++i) {
          //console.log('s.list[' + j + '] is ' + s.list[j].name);
          if (this.list[i].equalTo(s.list[j])) {
            //console.log('found! ' + list[i].name + ' equalTo ' + s.list[j].name);
            match = true;
          }
        }
        //console.log('evaluated one member. match found?: ' + match);
        //console.log(this.list[j]);
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
    function unpack() {
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

    function deleteOne(predicate) {
      for (var i = 0; i < this.list.length; ++i) {
        if (this.list[i].equalTo(predicate)) {
          this.list.splice(i,1);
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
      op: Op_stack
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


  function strips(move,ops,members,thisPath) {
    // starts with a stack which has a move on the top of it
    // expand the move
    var current = currentCallback();
    var stack = move.p.unpack();
    var correctMove = "";
    //console.log(stack);
    //console.log(current);
    //console.log(planCallback());

    for (var i = (stack.length - 1); i >= 0; --i) {
      var properlyContained = true;
      if (currentCallback().containsAll(stack[i])) {
        //console.log('found a true predicate: ' + stack[i]);
        // pop any true predicates
        stack.pop();
      } else if (!stack[i].isAnExpandedStatement){
        // we need to generate a move and recurse. hopefully it will result in moving in the right direction..
        var validMoves = ops.generateOperations(stack[i],members);
        //console.log('valid moves:');
        //console.log(validMoves);
        // try moves until one works or you run out of moves
        for (var j = 0; j < validMoves.length; ++j) {
          var tryThisMove = validMoves[j];
          var doneBefore = (thisPath.indexOf(tryThisMove.name) > -1);
          //console.log('tested if this was done before. was it? ' + doneBefore);
          if (!doneBefore) {
            thisPath.push(tryThisMove.name);
            if (strips(tryThisMove,ops,members,thisPath)) {
              //console.log('list length of delete-able predicates: ' + tryThisMove.d.list.length);
              for (var k = 0; k < tryThisMove.d.list.length; ++k) {
                //console.log('deleting this guy: ' + tryThisMove.d.list[k]);
                currentCallback('d', tryThisMove.d.list[k]);
              }
              for (var k = 0; k < tryThisMove.a.list.length; ++k) {
                //console.log('adding this guy: ' + tryThisMove.a.list[k]);
                currentCallback('a', tryThisMove.a.list[k]);
              }
              correctMove = tryThisMove.name;
              console.log('CORRECT MOVE');
              console.log(correctMove);
              planCallback(correctMove);
              stack.pop();
              j = validMoves.length;  // break this for loop
            }
          }
          //console.log('at end of loop through valid moves, call depth ' + thisPath.length);
          //console.log(currentCallback().toString());
          //console.log(planCallback());
        }
      }
    }
    // if we got here, and we cleared the stack, aka, the move that we generated this strips() call with can be applied to
    // our plan and our current state.
    //console.log('cleared the stack? ' + (stack.length == 0))
    console.log('move name: ' + move.name);
    console.log('stack.length: ' + stack.length);
    if (move.name == 'goal') {
      return true;
    }
    return (stack.length == 0);
  }


  // tests
  //var shouldBe = 'should be true: ';
  //var shouldNotBe = 'should be false: ';
  var p1 = new Predicate('on', 'A', 'B');
  var p2 = new Predicate('on', 'B', 'A');
  //var p3 = new Predicate('on', 'A', 'B');
  var p4 = new Predicate('armempty');
  //console.log(shouldNotBe + p1.equalTo(p2));
  //console.log(shouldBe + p1.equalTo(p1));
  //console.log(shouldBe + p1.equalTo(p3));
  var s1 = new Statement([p1, p2]);
  var s2 = new Statement([p1]);
  var s3 = new Statement([p2]);
  var s4 = new Statement([p2,p4]);
  //console.log(shouldBe + s1.containsOne(s2));
  //console.log(shouldNotBe + s2.containsOne(s3));
  //

  var start = new Statement([
    new Predicate('on', 'B', 'A'),
    new Predicate('ontable', 'A'),
    new Predicate('ontable', 'C'),
    new Predicate('ontable', 'D'),
    new Predicate('armempty')
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
  var plan = [];
  var current = start;


  function planCallback(move) {
    if (move == null) {
      return plan;
    } else {
      plan.push(move);
    }
  }

  function currentCallback(flag,body) {
    var stubContents = ((flag==null) ? "" : flag + ',' + body);
      //console.log('currentCallback(' + stubContents +')');
    if (flag == null) {
      return current;
    } else if (flag == 'a') {
      current.add(body);
    } else if (flag == 'd') {
      current.deleteOne(body);
    }
  }


  //console.log(s1.containsAll(s2));
  //console.log(start.containsAll(s4))
  //console.log(currentCallback().toString());

  //planCallback('abcd');
  //console.log(planCallback());
  //currentCallback('a',new Predicate('jojo'));
  //console.log(currentCallback());
  //currentCallback('d',new Predicate('jojo'));
  //console.log(currentCallback());
  //var valid = ops.generateOperations(goal, members);
  //console.log('valid operations:');
  //console.log(valid);
  //console.log(start.toString());
  strips(
    goal,
    blocksWorldOperations(),
    members,
    []
  );

  console.log('done. our plan is (backwards order): ');
  console.log(plan);

  function testTheCallback () {
    currentCallback('a', new Predicate('jojo'));
    currentCallback('a', new Predicate('iggy pop'));
    currentCallback('d', new Predicate('iggy pop'));
    console.log(currentCallback());
  }
  testTheCallback();

})();