const TestRetrieval = require('noddity-render-static/test/helpers/retrieval-stub.js')
const levelmem = require('level-mem')
const Butler = require('noddity-butler')

module.exports = function testState() {
	const retrieval = new TestRetrieval()
	const db = levelmem('no location', {
		valueEncoding: require('noddity-butler/test/retrieval/encoding.js')
	})
	const butler = new Butler(retrieval, db, {
		refreshEvery: 100
	})

	return {
		butler,
		retrieval
	}
}
