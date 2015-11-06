/**
 * Created by robfitzgerald on 11/4/15.
 */

(function() {



  /**
   * Represents a predicate in our system
   * @param name
   * @param x
   * @param y
   * @returns {{x: (*|null), y: (*|null), name: String}}
   * @constructor
   */
  function Predicate(name, x, y) {
    var thisX = x || null;
    var thisY = y || null;
    return {
      x: thisX,
      y: thisY,
      name: name,
      equivalent: equivalent
    };

    function equivalent(p) {
      return ((this.x == p.x) && (this.y == p.y) && (this.name == p.name))
    }
  }

  /**
   * Represents a statement of predicates held together by the AND operation.
   * @constructor
   * @param {Array} predicates - initialization list of predicates
   * @returns {{list: (*|Array), addPredicate: addPredicate, matchStatement: matchStatement, containsAPredicateIn: containsAPredicateIn}}
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
          if (list[j].equivalent(element)) {
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
      for (var i = 0; i < statement.list.length; ++i) {
        for (var j = 0; j < list.length; ++j) {
          if (statement.list[i].equivalent(list[j])) {
            console.log('found!');
            console.log(list[j]);
            return true;
          }
        }
      }
      return false;
    }

    return {
      list: list,
      addPredicate: addPredicate,
      matchStatement: matchStatement,
      containsAPredicateIn: containsAPredicateIn
    }
  }



  function blocksWorldOperations() {
    return {
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
        if (current.containsAPredicateIn(pickup.a)) {
          ops.push(pickup);
        }
        var putdown = op_putdown(members[i]);
        if (current.containsAPredicateIn(putdown.a)) {
          ops.push(putdown);
        }

        for (var j = 0; i < members.length; i++) {
          if (i == j) {
            // do nothing
          } else {

            /* two-parameter operations */
            var stack = op_stack(members[i], members[j]);
            if (current.containsAPredicateIn(stack.a)) {
              ops.push(stack);
            }
            var unstack = op_unstack(members[i], members[j]);
            if (current.containsAPredicateIn(unstack.a)) {
              ops.push(stack);
            }
          }
        }

      };

      return ops;
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

  //var blocksWorld = stackBasedSTRIPS([
  //  /* start state */
  //  Predicate('on', 'B', 'A'),
  //  Predicate('ontable', 'A'),
  //  Predicate('ontable', 'C'),
  //  Predicate('ontable', 'D'),
  //  Predicate('armempty')
  //],[
  //  /* goal state */
  //  Predicate('on', 'C', 'A'),
  //  Predicate('on', 'B', 'D'),
  //  Predicate('ontable', 'A'),
  //  Predicate('ontable', 'D')
  //],[
  //  /* members */
  //  'A', 'B', 'C', 'D'
  //],
  //  /* operations */
  //  blocksWorldOperations()
  //);

  //var testCurrentStatement = Statement();
  //var statementOne = Statement();
  //var statementTwo = Statement();
  //var p0 = Predicate('armempty');
  //var p1 = Predicate('ontable', 'A');
  //var p2 = Predicate('on', 'A', 'B');
  //var p3 = Predicate('pickup', 'A');
  //
  //
  //testCurrentStatement.addPredicate(p3);
  //testCurrentStatement.addPredicate(p0);
  //statementOne.addPredicate(p3);
  //statementTwo.addPredicate(p0);
  //statementTwo.addPredicate(p1);
  //
  //
  //
  //console.log('should be true:');
  //console.log(testCurrentStatement.matchStatement(statementOne));
  //console.log('should be true:');
  //console.log(testCurrentStatement.matchStatement(statementTwo));
  //
  //statementTwo.addPredicate(p2);
  //console.log('should be false:');
  //console.log(testCurrentStatement.matchStatement(statementTwo));
  //console.log('should be true')
  //console.log(testCurrentStatement.containsAPredicateIn(statementOne))
  //console.log(statementOne.containsAPredicateIn(testCurrentStatement))
  //console.log('should be true still')
  //console.log(testCurrentStatement.containsAPredicateIn(statementTwo))



  var goal = Statement([
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
  var valid = ops.generateOperations(goal, members);
  console.log('valid operations:');
  console.log(valid);
})();