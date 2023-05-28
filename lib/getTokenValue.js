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
 * @return {string|undefined}
 *   The token value or undefined if it wasn't found.
 */
const getTokenValue = (token, tokens) => {
  try {
    // Attempt to get the token value by splitting the string.
    return token.split(".").reduce((o, i) => o[i], tokens)
  } catch (error) {
    return null
  }
}
module.exports = getTokenValue
