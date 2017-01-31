require('ractive').DEBUG = false

const test = require('tape')
const makeTestState = require('./helpers/test-state')

const createLazyRenderer = require('../')

test('render something', t => {
	const state = makeTestState()

	state.retrieval.addPost('post', { title: 'TEMPLAAAATE', markdown: false }, '{{>current}}')
	state.retrieval.addPost('file1.md', { title: 'Some title', date: new Date() }, 'This is a ::file2.md:: post that I *totally* wrote {{externalValue}} {{sessionValue}}')
	state.retrieval.addPost('file2.md', { title: 'Some title', date: new Date() }, 'lol yeah ::herp|wat:: ::herp|huh::')
	state.retrieval.addPost('herp', { title: 'Some title', date: new Date(), markdown: false }, 'lookit {{1}}')

	const lazyRender = createLazyRenderer({
		butler: state.butler,
		data: {
			externalValue: 'yarp'
		},
		indexHtml: '<body>{{{html}}}</body>'
	})

	lazyRender({
		file: 'file1.md',
		sessionData: {
			sessionValue: 'blurp'
		}
	}).then(html => {
		t.equal(html, `<body><p>This is a <p>lol yeah lookit wat lookit huh</p>
 post that I <em>totally</em> wrote yarp blurp</p>
</body>`)
		t.end()
	}).catch(e => {
		t.fail('Promise resolved to an error')
		console.error(e)
		t.end()
	})
})
