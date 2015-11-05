/**
 * Created by robfitzgerald on 11/4/15.
 */

(function() {

  function predicate(name, x, y) {
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
      putdown: op_putdown
    };

    function op_stack(x, y) {
      return {
        p: statement([predicate('clear', y), predicate('holding', x)]),
        d: statement([predicate('clear', y), predicate('holding', x)]),
        a: statement([predicate('armempty'), predicate('on', x, y)])
      }
    }
    function op_unstack(x, y) {
      return {
        p: statement([predicate('on', x, y), predicate('clear', x), predicate('armempty')]),
        d: statement([predicate('on', x, y), predicate('armempty')]),
        a: statement([predicate('holding', x), predicate('clear', y)])
      }
    }
    function op_pickup(x) {
      return {
        p: statement([predicate('clear', x), predicate('ontable', x), predicate('armempty')]),
        d: statement([predicate('ontable', x), predicate('armempty')]),
        a: statement([predicate('holding', x)])
      }
    }
    function op_putdown(x) {
      return {
        p: statement([predicate('holding', x)]),
        d: statement([predicate('holding', x)]),
        a: statement([predicate('ontable', x), predicate('armempty')])
      }
    }

  }

  /**
   *
   * @returns {Statement} a list of predicates
   */
  function statement(predicates) {
    var list = predicates || [];

    function addPredicate(p) {
      list.push(p);
    }

    /**
     * checks if every member in the comparing array of predicates is found in the source array
     * @param statement
     * @returns {boolean} precondition matches current state
     */
    function cullPredicates (statement) {
      var found = [];
      statement.list.forEach(function(element,index,array) {
        for (var j = 0; j < list.length; ++j) {
          if (list[j] === element) {
            //console.log('found!');
            //console.log(list[j]);
            found.push(list[j]);
          }
        }
      });
      //console.log('state has: ' + list.length + ', found: ' + found.length + ', testing for: ' + statement.list.length);
      return (found.length == statement.list.length);
    }

    return {
      list: list,
      addPredicate: addPredicate,
      cullPredicates: cullPredicates
    }
  }

  function state(current) {
    var validOps = [];
    // contains a statement which represents the state predicates
    // a statement being an array of predicates

    // operations on state: try to apply an operation,
    //  for each statement in state, cullPredicates. when done, if applied statement is now empty, then
    //   operation is valid.
  }

  var blocksWorld = stackBasedSTRIPS([
    /* start state */
    predicate('on', 'B', 'A'),
    predicate('ontable', 'A'),
    predicate('ontable', 'C'),
    predicate('ontable', 'D'),
    predicate('armempty')
  ],[
    /* goal state */
    predicate('on', 'C', 'A'),
    predicate('on', 'B', 'D'),
    predicate('ontable', 'A'),
    predicate('ontable', 'D')
  ],[
    /* members */
    'A', 'B', 'C', 'D'
  ],
    /* operations */
    blocksWorldOperations()
  );

  var myStatement = statement();
  var statementTrue = statement();
  var statementFalse = statement();
  var p0 = predicate('armempty');
  var p1 = predicate('ontable', 'A');
  var p2 = predicate('on', 'A', 'B');
  var p3 = predicate('pickup', 'A');


  myStatement.addPredicate(p3);
  myStatement.addPredicate(p0);
  statementTrue.addPredicate(p3);
  statementFalse.addPredicate(p0);


  console.log('should be true:');
  console.log(myStatement.cullPredicates(statementTrue));
  console.log('should be true:');
  console.log(myStatement.cullPredicates(statementFalse));


  /*
     Diskutil list
     diskutil unmountDisk /dev/disk2
     sudo newfs_msdos -F 16 /dev/disk2
     sudo dd bs=1m if=~wheezyxxxxxxx.img of=/dev/rdisk2
   */


})();