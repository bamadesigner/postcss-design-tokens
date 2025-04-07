const parser = require('postcss-value-parser');
const getTokenValue = require('./getTokenValue');

/**
 * Parse a node to look for the token function.
 *
 * @param {object} node
 *   A node as returned by postcss-value-parser.
 *
 * @return {string|null}
 *   The parsed token name, or null if not found.
 */
const parseTokenNode = (rootNode, tokens) => {
	if (rootNode.type !== 'function' || rootNode.value !== 'token') {
		return null;
	}

	// Have to have child nodes for processing because first child id token name.
	if (!rootNode.nodes || !rootNode.nodes.length) {
		throw `Incorrect or missing argument for token() function`;
	}

	let fallbackValues = [];

	for (let i = 0; i < rootNode.nodes.length; i++) {
		const node = rootNode.nodes[i];

		if (!node.type) {
			throw `Incorrect or missing argument for token() function`;
		}

		// First node should be the token name.
		if (i === 0) {
			if (!['string', 'word'].includes(node.type)) {
				throw `Incorrect or missing argument for token() function`;
			}

			let tokenName = parser.stringify(node);

			// Remove quotes from strings.
			if (node.type === 'string') {
				const search = new RegExp(node.quote, 'g');
				tokenName = tokenName.replace(search, '');
			}
			const valueFromTokens = getTokenValue(tokenName, tokens);
			if (valueFromTokens) {
				return valueFromTokens;
			}

			continue;
		}

		// Any other nodes might be fallback values.
		if ('div' === node.type && ',' === node.value) {
			if (fallbackValues.length) {
				return fallbackValues.join(' ');
			}
			continue;
		}

		if (['string', 'word'].includes(node.type)) {
			fallbackValues.push(node.value);
			continue;
		}

		if ('function' === node.type && 'token' === node.value) {
			const functionValue = parseTokenNode(node, tokens);
			if (functionValue) {
				fallbackValues.push(functionValue);
			}
		}
	}

	if (fallbackValues.length) {
		return fallbackValues.join(' ');
	}

	return null;
};
module.exports = parseTokenNode;
