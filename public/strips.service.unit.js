(function() {

	beforeEach(bard.asyncModule('project2'));

	var StripsFactory;
	beforeEach(inject(function(_StripsFactory_) {
		StripsFactory = _StripsFactory_;
	}))

	describe('strips.service.js', function() {
		describe('StripsFactory', function() {
			describe('example 1', function() {
				it('should respond with a tuple with expected keys', function(done) {
					StripsFactory.example1()
						.then(function(res) {
							expect(res).to.have.all.keys(['moves', 'start', 'goal']);
							done();
						})
				})
			})
			describe('example 2', function() {
				it('should respond with a tuple with expected keys', function(done) {
					StripsFactory.example2()
						.then(function(res) {
							expect(res).to.have.all.keys(['moves', 'start', 'goal']);
							done();
						})
				})
			})
			describe('example 3', function() {
				it('should respond with a tuple with expected keys', function(done) {
					StripsFactory.example3()
						.then(function(res) {
							expect(res).to.have.all.keys(['moves', 'start', 'goal']);
							done();
						})
				})
			})
		})
	})

})();