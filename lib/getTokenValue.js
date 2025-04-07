/**
 * Retrieve the token value from the tokens object.
 *
 * @param {string} token
 *   The token name, using dot notation for nested values. Some examples:
 *     blue
 *     colors.blue
 *     colors.brand.blue
 * @param {object} tokens
 *   The object of tokens to search within.
 *
 * @return {string|null|undefined}
 *   The token value or undefined if it wasn't found.
 */
const getTokenValue = (tokenStr, tokens) => {
	// Clone tokens to avoid mutating the original object.
	const tokensClone = Object.assign({}, tokens);

	const tokenPath = tokenStr.split('.');
	if (!tokenPath.length) {
		return null;
	}

	// Loop through the tokens. Supports the W3C design token spec.
	let tokensObj = tokensClone;
	let i = 0;
	do {
		const key = tokenPath[i];
		if (tokensObj[key] === undefined) {
			// If tokensObj["$value"] is an object, we need to check if the key is in there.
			if (tokensObj['$value'] !== undefined && typeof tokensObj['$value'] === 'object') {
				// Set to $value object and continue through the loop with the same key.
				tokensObj = tokensObj['$value'];
				continue;
			}
			tokensObj = undefined;
			break;
		}
		tokensObj = tokensObj[key];
		i += 1;
	} while (i < tokenPath.length);

	let value = null;

	if (tokensObj !== undefined) {
		if (typeof tokensObj === 'string') {
			value = tokensObj;
		} else if (tokensObj['$value'] !== undefined && typeof tokensObj['$value'] === 'string') {
			value = tokensObj['$value'];
		}
	}

	// If value is wrapped in {}, remove it and search again.
	// This is for the W3C design token spec.
	// Example: value => "{colors.blue}" => colors.blue
	if (value && value.startsWith('{') && value.endsWith('}')) {
		const valuePathStr = value.slice(1, -1);

		// Reset value to null and search again.
		value = null;

		// getTokenValue will throw if it can't find the token.
		try {
			value = getTokenValue(valuePathStr, tokensClone);
			if (!value) {
				throw `Could not find the token: ${valuePathStr}`;
			}
		} catch (error) {
			// Remove any root keys from tokens that start with $, like '$metadata' or '$themes'
			for (const key in tokensClone) {
				if (key.startsWith('$')) {
					delete tokensClone[key];
				}
			}

			// If tokens only has one value at root level, search the root level.
			if (Object.keys(tokensClone).length === 1) {
				const rootLevelKey = Object.keys(tokensClone)[0];
				value = getTokenValue(valuePathStr, tokensClone[rootLevelKey]);
			}
		}
	}

	return value || null;
};
module.exports = getTokenValue;
