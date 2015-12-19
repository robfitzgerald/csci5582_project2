(function() {

  /**
   *
   * @param name - identifier for predicate
   * @param val1 - value, if present
   * @param val2 - value, if present
   * @returns {Predicate}
   * @constructor
   */
  function Predicate(name1, val1, val2) {
    var x = val1 || null;
    var y = val2 || null;
    var name = name1 || null;
    return {
      name: name,
      x: x,
      y: y
    };
  }


  function Statement(predicates) {
    list = predicates || [];

    return {
      list: list,
      containsOne: containsOne,
      equalTo: equalTo
    };
    function containsOne(s) {
      for (var i = 0; i < list.length; ++i) {
        console.log('list[' + i + '] is ' + list[i].name);
        for (var j = 0; j < s.list.length; ++j) {
          console.log('s.list[' + j + '] is ' + s.list[j].name);
          if (list[i].equalTo(s.list[j])) {
            console.log('found! ' + list[i].name + ' equalTo ' + s.list[j].name);
            return true;
          }
        }
      }
      return false;
    }
    function equalTo(p1, p2) {
      console.log('are these equal? ' + p1.name + ' & ' + p2.name);
      return ((p1.x == p2.x) && (p1.y == p2.y) && p1.name == p2.name)
    }
  }

  // test predicate
  var p1 = Predicate('one', 'A', 'B');
  var p2 = Predicate('two', 'C', 'D');
  var p1Clone = Predicate('one', 'A', 'B');
  console.log('should be true: ' + Statement().equalTo(p1,p1Clone));
  console.log('should be false: ' +  p1.equalTo(p2));
  var s1 = Statement([p1,p2]);
  var s2 = Statement([p1Clone]);
  console.log('should be true: ' + s1.containsOne(s2));
  var s3 = Statement([p2]);
  console.log('should be false: ' + s2.containsOne(s3));
  console.log([p1,p2,p1Clone,s1,s2,s3])

})();