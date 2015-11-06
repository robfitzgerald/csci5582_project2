/**
 * Created by robfitzgerald on 11/4/15.
 */

(function() {

  /**
   *
   * @param name
   * @param x
   * @param y
   * @returns {{x: (*|null), y: (*|null), name: *}}
   * @constructor
   */
  function Predicate(name, x, y) {
    var thisX = x || null;
    var thisY = y || null;
    return {
      x: thisX,
      y: thisY,
      name: name
    }
  }

  function stackBasedSTRIPS(start, goal, members, operations) {

  }

  function blocksWorldOperations() {
    return {
      stack: op_stack,
      unstack: op_unstack,
      pickup: op_pickup,
      putdown: op_putdown,
      generateOperations: generateOperations
    };

    function op_stack(x, y) {
      return {
        p: Statement([Predicate('clear', y), Predicate('holding', x)]),
        d: Statement([Predicate('clear', y), Predicate('holding', x)]),
        a: Statement([Predicate('armempty'), Predicate('on', x, y)])
      }
    }
    function op_unstack(x, y) {
      return {
        p: Statement([Predicate('on', x, y), Predicate('clear', x), Predicate('armempty')]),
        d: Statement([Predicate('on', x, y), Predicate('armempty')]),
        a: Statement([Predicate('holding', x), Predicate('clear', y)])
      }
    }
    function op_pickup(x) {
      return {
        p: Statement([Predicate('clear', x), Predicate('ontable', x), Predicate('armempty')]),
        d: Statement([Predicate('ontable', x), Predicate('armempty')]),
        a: Statement([Predicate('holding', x)])
      }
    }
    function op_putdown(x) {
      return {
        p: Statement([Predicate('holding', x)]),
        d: Statement([Predicate('holding', x)]),
        a: Statement([Predicate('ontable', x), Predicate('armempty')])
      }
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
        var pickup = op_pickup(members[i]);
        if (current.matchStatement(pickup.a)) {
          ops.push(pickup);
        }
        var putdown = op_putdown(members[i]);
        if(members[i] == 'A') {
          console.log('putdown(A)');
          console.log(putdown.a.list);
          console.log(current.list)
        }
        if (current.matchStatement(putdown.a)) {
          console.log('found!');
          ops.push(putdown);
        }

        for (var j = 0; i < members.length; i++) {
          if (i == j) {
            // do nothing
          } else {

            /* two-parameter operations */
            var stack = op_stack(members[i], members[j]);
            if (current.matchStatement(stack.a)) {
              ops.push(stack);
            }
            var unstack = op_unstack(members[i], members[j]);
            if (current.matchStatement(unstack.a)) {
              ops.push(stack);
            }
          }
        }

      };

      return ops;
    }

  }

  /**
   * Statement class
   * @param {Array} predicates
   * @returns {{list: (*|Array), addPredicate: addPredicate, matchStatement: matchStatement, containsAPredicateIn: containsAPredicateIn}}
   * @constructor
   */
  function Statement(predicates) {
    var list = predicates || [];

    function addPredicate(p) {
      list.push(p);
    }

    /**
     * checks if every member in the comparing array of predicates is found in the source array
     * @param statement
     * @returns {boolean} precondition matches current state
     */
    function matchStatement (statement) {
      var found = [];
      statement.list.forEach(function(element,index,array) {
        for (var j = 0; j < list.length; ++j) {
          if (list[j] === element) {
            console.log('found!');
            console.log(list[j]);
            found.push(list[j]);
          }
        }
      });
      //console.log('state has: ' + list.length + ', found: ' + found.length + ', testing for: ' + Statement.list.length);
      return (found.length == statement.list.length);
    }

    /**
     * checks if this statement contains at least one of the predicates in the passed statement
     * @param {Statement} statement
     * @returns {boolean}
     */
    function containsAPredicateIn (statement) {
      var found = [];
      statement.list.forEach(function(element,index,array) {
        //console.log(element);
        //console.log(statement);
        for (var j = 0; j < list.length; ++j) {
          if (list[j] === element) {
            console.log('found!');
            console.log(list[j]);
            return true;
          }
        }
      });
      return false;
    }

    return {
      list: list,
      addPredicate: addPredicate,
      matchStatement: matchStatement,
      containsAPredicateIn: containsAPredicateIn
    }
  }

  function state(current) {
    var validOps = [];
    // contains a Statement which represents the state predicates
    // a Statement being an array of predicates

    // operations on state: try to apply an operation,
    //  for each Statement in state, matchStatement. when done, if applied Statement is now empty, then
    //   operation is valid.
  }

  var blocksWorld = stackBasedSTRIPS([
    /* start state */
    Predicate('on', 'B', 'A'),
    Predicate('ontable', 'A'),
    Predicate('ontable', 'C'),
    Predicate('ontable', 'D'),
    Predicate('armempty')
  ],[
    /* goal state */
    Predicate('on', 'C', 'A'),
    Predicate('on', 'B', 'D'),
    Predicate('ontable', 'A'),
    Predicate('ontable', 'D')
  ],[
    /* members */
    'A', 'B', 'C', 'D'
  ],
    /* operations */
    blocksWorldOperations()
  );

  //var myStatement = Statement();
  //var statementTrue = Statement();
  //var statementFalse = Statement();
  //var p0 = Predicate('armempty');
  //var p1 = Predicate('ontable', 'A');
  //var p2 = Predicate('on', 'A', 'B');
  //var p3 = Predicate('pickup', 'A');
  //
  //
  //myStatement.addPredicate(p3);
  //myStatement.addPredicate(p0);
  //statementTrue.addPredicate(p3);
  //statementFalse.addPredicate(p0);


  //console.log('should be true:');
  //console.log(myStatement.matchStatement(statementTrue));
  //console.log('should be true:');
  //console.log(myStatement.matchStatement(statementFalse));

  var start = Statement([
    Predicate('on', 'B', 'A'),
    Predicate('ontable', 'A'),
    Predicate('ontable', 'C'),
    Predicate('ontable', 'D'),
    Predicate('armempty')
  ]);
  var members = [
    'A', 'B', 'C', 'D'
  ];
  var ops = blocksWorldOperations();
  var valid = ops.generateOperations(start, members);
  console.log('valid operations:');
  console.log(valid);
})();