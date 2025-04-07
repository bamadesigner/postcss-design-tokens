const parser = require('postcss-value-parser');
const parseTokenNode = require('./parseTokenNode');

/**
 * Parse a result string to find a token.
 *
 * @param {string} result
 *   The string to parse.
 * @param {object} tokens
 *   The object list of tokens.
 *
 * @return {string}
 *   A string suitable to replace the result.
 */
module.exports = (result, tokens) =>
	parser(result)
		.walk((node) => {
			const value = parseTokenNode(node, tokens);
			if (value) {
				node.type = 'word';
				node.value = value;
			}
		})
		.toString();
