(function() {

	angular
	.module('project2')
	.factory('DemonstrationService', ['$q', DemonstrationService]);

	function DemonstrationService($q) {
		var DemonstrationService = {};
		DemonstrationService.applyMoves = applyMoves;

		return DemonstrationService;

		/**
		 * @function applyMoves
		 * @param strips the result of solving a blocks world problem using StripsFactory
		 * @returns {Promise}
		 */
		 function applyMoves(strips) {
		 	var deferred = $q.defer();
		 	var result = [];
		 	var current;
		 	if (
		 		strips.hasOwnProperty('moves') &&
		 		strips.moves.hasOwnProperty('length')
		 		) {	
		 		current = deepCopy(strips.current);
		 	strips.moves.forEach(function(move,index,moves) {
		 		var thisMove = {};
		 		thisMove.moves = deepCopy(strips.moves);
		 		current.deleteStatement(move.d);
		 		current.addStatement(move.a);
		 		thisMove.current = deepCopy(current);
		 		thisMove.goal = deepCopy(strips.goal);
		 		result.push(thisMove);
		 	})
		 	deferred.resolve(result);
		 } else {
		 	deferred.reject('DemonstrationService.applyMoves(strips) - strips didn\'t have a moves array');
		 }
		 return deferred.promise;
		}
	}

	function deepCopy(oldObj) {
		var newObj = oldObj;
		if (oldObj && typeof oldObj === 'object') {
			newObj = Object.prototype.toString.call(oldObj) === "[object Array]" ? [] : {};
			for (var i in oldObj) {
				newObj[i] = deepCopy(oldObj[i]);
			}
		}
		return newObj;
	}

})();