const Ractive = require('ractive')

const denodeify = require('then-denodeify')
const renderStatic = denodeify(require('noddity-render-static'))
const Linkifier = require('noddity-linkifier')

module.exports = function makeLazyRenderer({ butler, data = {}, indexHtml }) {
	const linkifier = Linkifier('/')

	const getPostPromise = denodeify(butler.getPost)
	const replacingRender = makeReplacingRenderer(indexHtml)

	let renderedPosts = mapFactory()

	butler.on('index changed', () => renderedPosts = mapFactory())
	butler.on('post changed', (postname) => renderedPosts[postname] = mapFactory())

	return async function lazyRender({ key = '?', file, sessionData = {} }) {
		if (!renderedPosts[file]) {
			renderedPosts[file] = mapFactory()
		}

		const postCache = renderedPosts[file]

		if (!postCache[key]) {
			postCache[key] = render({ butler, getPostPromise, data, sessionData, file, linkifier, replacingRender })
		}

		return postCache[key]
	}
}

async function render({ butler, getPostPromise, data, sessionData, file, linkifier, replacingRender }) {
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

	return replacingRender({
		html,
		data: {
			metadata: postToRender.metadata
		}
	})
}

function mapFactory() {
	return Object.create(null)
}

function makeReplacingRenderer(indexHtml) {
	const uniqueNonMustacheString = `This string should be reasonably unique, one would hope. be02a4d5-e4c9-450e-8e99-4536cb1cb2ac`
	const template = Ractive.parse(indexHtml.replace('{{{html}}}', uniqueNonMustacheString), { preserveWhitespace: true })

	return function render({ html, data }) {
		const output = new Ractive({
			template,
			data
		}).toHTML()

		return output.replace(uniqueNonMustacheString, html)
	}
}
