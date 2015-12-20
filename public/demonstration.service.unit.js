(function() {

	beforeEach(bard.asyncModule('project2'));

	var DemonstrationService,
			StripsFactory;

	describe('DemonstrationService', function() {

		beforeEach(inject(function(_DemonstrationService_, _StripsFactory_) {
			DemonstrationService = _DemonstrationService_;
			StripsFactory = _StripsFactory_;
		}))

		describe('applyMoves()', function() {
			var strips;
			
			// these tests depend on StripsFactory.example1() 
			// being a valid strips problem that StripsFactory can solve.
			beforeEach(function(done) {
				StripsFactory.example1()
					.then(function(result) {
						strips = result;
						done();
					})				
			})

			it('should return a promise and take two parameters', function(done){
				DemonstrationService.applyMoves(strips)
					.then(function(appliedMoves) {
						done();
					})
			})
			it('should return a steps array with as many steps as moves', function(done) {
				DemonstrationService.applyMoves(strips)
					.then(function(appliedMoves) {
						expect(appliedMoves.length).to.equal(strips.moves.length);
						done();
					})
			})
			it('when applied iteratively for each move, eventually the current state should contain the goal state', function(done) {
				DemonstrationService.applyMoves(strips)
					.then(function(appliedMoves) {
						var lastMoveIndex = appliedMoves.length - 1;
						expect(appliedMoves[lastMoveIndex].current.containsAll(strips.goal)).to.be.true;
						done();
					})
			});
			it('but the middle current states shouldn\'t be the same as the goal', function(done) {
				DemonstrationService.applyMoves(strips)
					.then(function(appliedMoves) {
						var lastMoveIndex = appliedMoves.length - 1;
						for (var i = 1; i < lastMoveIndex - 1; ++i) {
							expect(appliedMoves[i].current.containsAll(strips.goal)).to.be.false;
						}
						done();
					})
			});
		})
	})

})();