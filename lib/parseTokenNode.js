const parser = require("postcss-value-parser")
const getTokenValue = require("./getTokenValue")

/**
 * Parse a node to look for the token function.
 *
 * @param {object} node
 *   A node as returned by postcss-value-parser.
 *
 * @return {string|null}
 *   The parsed token name, or null if not found.
 */

const parseTokenNode = (root_node, tokens) => {
  if (root_node.type !== "function" || root_node.value !== "token") {
    return null
  }

  // Have to have child nodes for processing because first child id token name.
  if (!root_node.nodes || !root_node.nodes.length) {
    throw `Incorrect or missing argument for token() function`
  }

  let fallback_values = []

  for (let i = 0; i < root_node.nodes.length; i++) {
    const node = root_node.nodes[i]

    if (!node.type) {
      throw `Incorrect or missing argument for token() function`
    }

    // First node should be the token name.
    if (i === 0) {
      if (!["string", "word"].includes(node.type)) {
        throw `Incorrect or missing argument for token() function`
      }

      let token = parser.stringify(node)

      // Remove quotes from string.
      if (node.type === "string") {
        const search = new RegExp(node.quote, "g")
        token = token.replace(search, "")
      }

      const value_from_tokens = getTokenValue(token, tokens)
      if (value_from_tokens) {
        return value_from_tokens
      }

      continue
    }

    // Any other nodes might be fallback values.

    if ("div" === node.type && "," === node.value) {
      if (fallback_values.length) {
        return fallback_values.join(" ")
      }
      continue
    }

    if (["string", "word"].includes(node.type)) {
      fallback_values.push(node.value)
      continue
    }

    if ("function" === node.type && "token" === node.value) {
      const function_value = parseTokenNode(node, tokens)
      if (function_value) {
        fallback_values.push(function_value)
      }
    }
  }

  if (fallback_values.length) {
    return fallback_values.join(" ")
  }

  return null
}
module.exports = parseTokenNode
