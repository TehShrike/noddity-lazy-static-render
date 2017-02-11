A lazy renderer that caches the rendered HTML in-memory so future renders of that page will be as fast as possible.

Whenever a post changes, or the index.json changes, all HTML in the cache is cleared.

Some stuff is still kind of hardcoded - for example, right now it assumes you have a post named `post` that is your root post.  If you need any changes, PRs+tests will be merged happily.

## API

[![Greenkeeper badge](https://badges.greenkeeper.io/TehShrike/noddity-lazy-static-render.svg)](https://greenkeeper.io/)

This module exports a single function.

### `makeLazyRenderer({ butler, data = {}, indexHtml })`

Returns a `lazyRender` function.

- `butler`: a [noddity-butler](https://github.com/TehShrike/noddity-butler) instance
- `data` [optional]: any data to be merged with the other data passed to Ractive to render the templates
- `indexHtml`: a Ractive template for the rendered posts to be embedded in.  It has access to the post's `metadata` object, as well as the `html` of the rendered file.

### `lazyRender({ key = '?', file, sessionData = {} })`

Returned by the factory function above.  Returns a promise that resolves to HTML based on the `indexHtml` passed to the factory function.

- `file`: the post filename to be fetched from the butler.
- `key` [optional]: a string identifier used for caching.  Should uniquely identify the `sessionData`.
- `sessionData` [optional]: data to be merged with the global data passed to the factory function, plus any data on the post, before rendering the html

## Example

<!-- js
require('ractive').DEBUG = false
const makeTestState = require('./test/helpers/test-state')

const createLazyRenderer = require('./')

const state = makeTestState()

state.retrieval.addPost('post', { title: 'TEMPLAAAATE', markdown: false }, '<h1>{{metadata.title}}</h1>\n<article>{{>current}}</article>')
state.retrieval.addPost('file1.md', { title: 'Sweet example post', date: new Date('2017-01-31T00:32:51.468Z') }, 'Some cool post')

const butler = state.butler
-->

`post`:
```
---
title: TEMPLAAAATE
markdown: false
---

<h1>{{metadata.title}}</h1>
<article>{{>current}}</article>
```

`file1.md`:
```
---
title: Sweet example post
date: 2017-01-31T00:32:51.468Z
---

Some cool post
```

Library usage:

```js
const lazyRender = createLazyRenderer({
	butler: butler,
	data: {
		siteName: 'Sweet Example Site'
	},
	indexHtml: `<html>
<head><title>{{siteName}}</title></head>
<body>{{{html}}}</body>
</html>`
})

const expected = `<html>
<head><title></title></head>
<body><h1>Sweet example post</h1> <article><p>Some cool post</p>
</article></body>
</html>`

lazyRender({
	file: 'file1.md'
}).then(html => {
	html // => expected
})
```

## License

[WTFPL](http://wtfpl2.com)
