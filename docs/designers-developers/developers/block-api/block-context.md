# Block Context

Block context is a feature which enables ancestor blocks to provide values which can be consumed by descendent blocks within its own hierarchy. Those descendent blocks can inherit these values without resorting to hard-coded values and without an explicit awareness of the block which provides those values.

This is especially useful in full-site editing where, for example, the contents of a block may depend on the context of the post in which it is displayed. A blogroll template may show excerpts of many different posts. Using block context, there can still be one single "Post Excerpt" block which displays the contents of the post based on an inherited post ID.

If you are familiar with [React Context](https://reactjs.org/docs/context.html), block context adopts many of the same ideas. In fact, the client-side block editor implementation of block context is a very simple application of React Context. Block context is also supported in server-side `render_callback` implementations, demonstrated in the examples below.

## Defining Block Context

Block context is defined in the registered settings of a block. A block can provide a context value, or consume a value it seeks to inherit.

### Providing Block Context

A block can provide a context value by assigning a `providesContext` property in its registered settings. This is an object which maps a context name to one of the block's own attribute. The value corresponding to that attribute value is made available to descendent blocks and can be referenced by the same context name. Currently, block context only supports values derived from the block's own attributes. This could be enhanced in the future to support additional sources of context values.

`record/block.json`

```json
{
	"name": "my-plugin/record",
	"attributes": {
		"recordId": {
			"type": "number"
		}
	},
	"providesContext": {
		"my-plugin/recordId": "recordId"
	}
}
```

### Consuming Block Context

A block can inherit a context value from an ancestor provider by assigning a `context` property in its registered settings. This should be assigned as an array of the context names the block seeks to inherit.

`record-title/block.json`

```json
{
	"name": "my-plugin/record-title",
	"context": [ "my-plugin/recordId" ]
}
```

## Using Block Context

Once a block has defined the context it seeks to inherit, this can be accessed in the implementation of `edit` (JavaScript) and `render_callback` (PHP). It is provided as an object (JavaScript) or associative array (PHP) of the context values which have been defined for the block. Note that even if there is an ancestor which provides a context value, the value will only be made available if the block explicitly defines a desire to inherit that value.

### JavaScript

`record-title/edit.js`

```js
function edit( { context } ) {
	return 'The current record ID is: ' + context[ 'my-plugin/recordId' ];
}
```

### PHP

Note that in PHP, block context is accessed using the `$block` global which is assigned at the time a block is registered. This is unlike block attributes or block content, which are provided as arguments to the `render_callback` function. At some point in the future, block context may be integrated into the function arguments signature of `render_callback`, or an alternative block settings configuration may enable a render callback to receive the full block array as its argument.

`record-title/index.php`

```js
function my_plugin_render_block_record_title() {
	global $block;

	return 'The current record ID is: ' . $block['context']['my-plugin/recordId'];
}
```
