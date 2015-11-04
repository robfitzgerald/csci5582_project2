/**
 * Created by robfitzgerald on 11/4/15.
 */

(function() {

  function predicate0(name) {
    this.name = name;
  }

  function predicate1(name, x) {
    this.name = name;
    this.x = x;
  }

  function predicate2(name, x, y) {
    this.name = name;
    this.x = x;
    this.y = y;
  }

  function statement() {
    var thisStatement = this;
    this.list = [];

    function addPredicate(p) {
      thisStatement.list.push(p);
    }

    function testForPreconditions(statement) {
      return (thisStatement.list.containsPredicate(statement) == true)
    }
    return {
      list: this.list,
      length: this.list.length,
      addPredicate: addPredicate,
      testForPreconditions: testForPreconditions
    }
  }

  /**
   * checks if every member in the comparing array of predicates is found in the source array
   * @param statement
   * @returns {boolean}
   */
  Array.prototype.containsPredicate = function (statement) {
    var result = statement;
    for (var i = 0; i < statement.length; ++i) {
      for (var j = 0; j < this.length; ++j) {
        if (this[i] === statement[j]) {
          j = this.length;
          result.splice(i,1);
        }
      }
    }
    return (result.length == 0);
  };

  var myStatement = statement();
  var p0 = predicate0('armempty');
  var p1 = predicate1('ontable', 'A');
  var p2 = predicate2('on', 'A', 'B');

  myStatement.addPredicate(p0);
  console.log('should be true:');
  console.log(myStatement.testForPreconditions(predicate0('armempty')));
  console.log('should be false:');
  console.log(myStatement.testForPreconditions(predicate0('farmempty')));

  /*
     Diskutil list
     diskutil unmountDisk /dev/disk2
     sudo newfs_msdos -F 16 /dev/disk2
     sudo dd bs=1m if=~wheezyxxxxxxx.img of=/dev/rdisk2
   */


})();