(function() {

	beforeEach(bard.asyncModule('project2'));

	var StripsFactory;
	beforeEach(inject(function(_StripsFactory_) {
		StripsFactory = _StripsFactory_;
	}))

	describe('strips.service.js', function() {
		describe('StripsFactory', function() {
			describe('example 1', function() {
				it('result', function(done) {
					StripsFactory.example3()
						.then(function(res) {
							expect(res).to.be.true;
							done();
						})
				})
			})
		})
	})

})();