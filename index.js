const Ractive = require('ractive')

const denodeify = require('then-denodeify')
const renderStatic = denodeify(require('noddity-render-static'))
const Linkifier = require('noddity-linkifier')

module.exports = function makeLazyRenderer({ butler, data = {}, indexHtml }) {
	const linkifier = Linkifier('/')
	const template = Ractive.parse(indexHtml, { preserveWhitespace: true })
	const getPostPromise = denodeify(butler.getPost)

	let renderedPosts = mapFactory()

	butler.on('index changed', () => renderedPosts = mapFactory())
	butler.on('post changed', (postname) => renderedPosts[postname] = mapFactory())

	return async function lazyRender({ key = '?', file, sessionData = {} }) {
		if (!renderedPosts[file]) {
			renderedPosts[file] = mapFactory()
		}

		const postCache = renderedPosts[file]

		if (!postCache[key]) {
			postCache[key] = render({ butler, getPostPromise, data, sessionData, file, linkifier, template })
		}

		return postCache[key]
	}
}

async function render({ butler, getPostPromise, data, sessionData, file, linkifier, template }) {
	const renderData = Object.assign({}, data, sessionData)

	const [ templatePost, postToRender ] = await Promise.all([
		getPostPromise('post'),
		getPostPromise(file)
	])

	const html = await renderStatic(templatePost, postToRender, {
		butler,
		linkifier,
		data: renderData,
	})

	return new Ractive({
		template,
		data: {
			html,
			metadata: postToRender.metadata
		}
	}).toHTML()
}

function mapFactory() {
	return Object.create(null)
}
