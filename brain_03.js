(function () {

  /**
   *
   * @param name - identifier for predicate
   * @param val1 - value, if present
   * @param val2 - value, if present
   * @returns {Predicate}
   * @constructor
   */
  function Predicate(name, val1, val2) {
    this.name = name;
    this.x = val1;
    this.y = val2;
    this.equalTo = equalTo;
    function equalTo(p) {
      return ((this.name == p.name) && (this.x == p.x) && (this.y == p.y));
    }
  }

  /**
   *
   * @param {Predicate} predicates - array of Predicate objects
   * @constructor
   */
  function Statement(predicates) {
    this.list = predicates || [];
    this.containsOne = containsOne;

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
  }

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

      /* zero-parameter operations */

      for (var i = 0; i < members.length; ++i) {

        /* one-parameter operations */
        console.log(members[i]);
        var pickup = new Op_pickup(members[i]);
        console.log(pickup);
        if (current.containsOne(pickup.a)) {
          ops.push(pickup);
        }
        var putdown = new Op_putdown(members[i]);
        if (current.containsOne(putdown.a)) {
          ops.push(putdown);
        }

        for (var j = 0; i < members.length; i++) {
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
      ;

      return ops;
    }

  }

  // tests
  var shouldBe = 'should be true: ';
  var shouldNotBe = 'should be false: ';
  var p1 = new Predicate('one', 'A', 'B');
  var p2 = new Predicate('two', 'B', 'C');
  var p3 = new Predicate('one', 'A', 'B');
  console.log(shouldNotBe + p1.equalTo(p2));
  console.log(shouldBe + p1.equalTo(p1));
  console.log(shouldBe + p1.equalTo(p3));
  var s1 = new Statement([p1, p2]);
  var s2 = new Statement([p1]);
  var s3 = new Statement([p2]);
  console.log(shouldBe + s1.containsOne(s2));
  console.log(shouldNotBe + s2.containsOne(s3));

  var start = new Statement([
    new Predicate('on', 'B', 'A'),
    new Predicate('ontable', 'A'),
    new Predicate('ontable', 'C'),
    new Predicate('ontable', 'D'),
    new Predicate('armempty')
  ]);
  var goal = new Statement([
    new Predicate('on', 'C', 'A'),
    new Predicate('on', 'B', 'D'),
    new Predicate('ontable', 'A'),
    new Predicate('ontable', 'D')
  ]);
  var members = [
    'A', 'B', 'C', 'D'
  ];
  var ops = blocksWorldOperations();
  var valid = ops.generateOperations(goal, members);
  console.log('valid operations:');
  console.log(valid);

})();