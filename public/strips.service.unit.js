(function() {

	beforeEach(bard.asyncModule('project2'));

	var StripsFactory;
	beforeEach(inject(function(_StripsFactory_) {
		StripsFactory = _StripsFactory_;
	}))

	describe('strips.service.js', function() {

		describe('StripsFactory', function() {
			describe('Predicate', function() {
				it('should store all parameters passed to it', function() {
					var t1 = new StripsFactory.Predicate('name', 'x', 'y');
					expect(t1.name).to.equal('name')
					expect(t1.x).to.equal('x');
					expect(t1.y).to.equal('y');
					expect(t1.toString()).to.equal('name(x,y)')
				})
				it('should recognize an equivalent Predicate', function() {
					var t1 = new StripsFactory.Predicate('a','b','c');
					var t2 = new StripsFactory.Predicate('a','b','c');
					expect(t1.equalTo(t2)).to.be.true;
				})
				it('should produce toString()s for each different possible configuration', function() {
					var t1 = new StripsFactory.Predicate('a');
					var t2 = new StripsFactory.Predicate('a','b');
					var t3 = new StripsFactory.Predicate('a','b','c');
					expect(t1.toString()).to.equal('a()');
					expect(t2.toString()).to.equal('a(b)');
					expect(t3.toString()).to.equal('a(b,c)');
				})
			})
			describe('Statement', function() {
				var p1,p2,p3,p4,s1;
				var containsOnePos,containsOneNeg,containsAllPos,containsAllNeg;
				var addPos, addNeg, deletePos, deleteNeg;
				before(function() {
					p1 = new StripsFactory.Predicate('a');
					p2 = new StripsFactory.Predicate('a','b');
					p3 = new StripsFactory.Predicate('a','b','c');
					p4 = new StripsFactory.Predicate('d','e','f');
					s1 = new StripsFactory.Statement([p1,p2,p3]);
					containsOnePos = new StripsFactory.Statement([p1,p4]);
					containsOneNeg = new StripsFactory.Statement([p4]);
					containsAllPos = new StripsFactory.Statement([p1,p2]);
					containsAllNeg = new StripsFactory.Statement([p1,p4]);
					addPos = new StripsFactory.Statement([p4]);
					addNeg = new StripsFactory.Statement([]);
					deletePos = new StripsFactory.Statement([p4]);
					deleteNeg = new StripsFactory.Statement([p4]);
				})
				it('should store all predicates passed to it', function() {
					expect(s1.list[0]).to.equal(p1);
					expect(s1.list[1]).to.equal(p2);
					expect(s1.list[2]).to.equal(p3);
				})
				it('containsOne() positive', function() {
					expect(s1.containsOne(containsOnePos)).to.be.true;
				})
				it('containsOne() negative', function() {
					expect(s1.containsOne(containsOneNeg)).to.be.false;
				})
				it('containsAll() positive', function() {
					expect(s1.containsAll(containsAllPos)).to.be.true;
				})
				it('containsAll() negative', function() {
					expect(s1.containsAll(containsAllNeg)).to.be.false;
				})
				it('toString()', function() {
					expect(s1.toString()).to.equal('[a() ^ a(b) ^ a(b,c)]')
				})
				it('expand()', function() {
					var expand = s1.expand();
					expect(expand[0].list.length).to.equal(3);
					expect(expand[1].list.length).to.equal(1);
					expect(expand[2].list.length).to.equal(1);
					expect(expand[3].list.length).to.equal(1);
					expect(expand[0].list[0]).to.equal(p1);
					expect(expand[0].list[1]).to.equal(p2);
					expect(expand[0].list[2]).to.equal(p3);
					expect(expand[1].list[0]).to.equal(p3);
					expect(expand[2].list[0]).to.equal(p2);
					expect(expand[3].list[0]).to.equal(p1);
				})
				it('addStatement() positive', function() {
					s1.addStatement(addPos);
					expect(s1.list[3]).to.equal(p4);
				})
				it('addStatement() negative', function() {
					s1.addStatement(addNeg);
					expect(s1.list.length).to.equal(4);
				})
				it('deleteStatement() positive', function() {
					s1.deleteStatement(deletePos);
					expect(s1.list.length).to.equal(3);
					expect(s1.list[0]).to.equal(p1);
					expect(s1.list[1]).to.equal(p2);
					expect(s1.list[2]).to.equal(p3);
				})
				it('deleteStatement() negative', function() {
					s1.deleteStatement(deleteNeg);
					expect(s1.list.length).to.equal(3);
					expect(s1.list[0]).to.equal(p1);
					expect(s1.list[1]).to.equal(p2);
					expect(s1.list[2]).to.equal(p3);
				})
			})
			describe('blocksWorldOperations', function() {
				
			})

			describe.skip('example 1', function() {
				it('should respond with a tuple with expected keys', function(done) {
					StripsFactory.example1()
						.then(function(res) {
							expect(res).to.have.all.keys(['moves', 'current', 'goal']);
							done();
						})
				})
			})
			describe.skip('example 2', function() {
				it('should respond with a tuple with expected keys', function(done) {
					StripsFactory.example2()
						.then(function(res) {
							expect(res).to.have.all.keys(['moves', 'current', 'goal']);
							done();
						})
				})
			})
			describe.skip('example 3', function() {
				it('should respond with a tuple with expected keys', function(done) {
					StripsFactory.example3()
						.then(function(res) {
							expect(res).to.have.all.keys(['moves', 'current', 'goal']);
							done();
						})
				})
			})
		})
	})

})();