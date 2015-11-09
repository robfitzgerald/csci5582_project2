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
    this.toString = toString;
    this.add = add;
    this.unpack = unpack;

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

    /**
     * unpacks a statement into an array of singleton statements
     * @returns {Array} - array of Statements, each containing one predicate
     */
    function unpack() {
      var output = [];
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


  function strips(move,current,ops,plan) {
    // starts with a stack which has a move on the top of it
    // expand the move
    var stack = move.a.unpack();
    console.log(stack);
    console.log(current);
    console.log('should be true: ' + stack[1].containsOne(current));

    // evaluate the stack: for each member in the stack
    //   is it a move? if we arrived at it by this process, then that means we need to apply it to the current
    //    also, add the move.name to the 'plan'.
    //   if not a move, it's a predicate. is it true? if so, pop, repeat.
    //   if it's false, then generate moves from it and recurse.
    for (var i = (stack.length - 1); i >= 0; --i) {
      if (stack[i].containsOne(current)) {
        console.log('found a true predicate: ' + stack[i]);
        // pop any true predicates
        stack.pop();
      } else {
        // we need to generate a move which is valid
      }
    }

    // if we got here, we cleared the stack, aka, the move that we generated this strips() call with can be applied to
    // our plan and our current state.

    /* TODO: apply move to plan and current state */

  }


  // tests
  //var shouldBe = 'should be true: ';
  //var shouldNotBe = 'should be false: ';
  var p1 = new Predicate('one', 'A', 'B');
  var p2 = new Predicate('two', 'B', 'C');
  var p3 = new Predicate('one', 'A', 'B');
  //console.log(shouldNotBe + p1.equalTo(p2));
  //console.log(shouldBe + p1.equalTo(p1));
  //console.log(shouldBe + p1.equalTo(p3));
  var s1 = new Statement([p1, p2]);
  var s2 = new Statement([p1]);
  var s3 = new Statement([p2]);
  //console.log(shouldBe + s1.containsOne(s2));
  //console.log(shouldNotBe + s2.containsOne(s3));
  //
  //var start = new Statement([
  //  new Predicate('on', 'B', 'A'),
  //  new Predicate('ontable', 'A'),
  //  new Predicate('ontable', 'C'),
  //  new Predicate('ontable', 'D'),
  //  new Predicate('armempty')
  //]);
  //var goal = new Statement([
  //  new Predicate('on', 'C', 'A'),
  //  new Predicate('on', 'B', 'D'),
  //  new Predicate('ontable', 'A'),
  //  new Predicate('ontable', 'D')
  //]);
  //var members = [
  //  'A', 'B', 'C', 'D'
  //];
  var ops = blocksWorldOperations();
  //var valid = ops.generateOperations(goal, members);
  //console.log('valid operations:');
  //console.log(valid);
  //console.log(start.toString());
  var testStrips = [];
  testStrips.push(new ops.op('Y','Z'));
  strips(
    new ops.op('Y','Z'),
    new Statement([new Predicate('armempty')])
  );

})();