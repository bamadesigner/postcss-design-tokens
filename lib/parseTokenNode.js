const parser = require("postcss-value-parser")

/**
 * Parse a node to look for the token function.
 *
 * @param {object} node
 *   A node as returned by postcss-value-parser.
 *
 * @return {string|boolean}
 *   The parsed token name, or false if it's not a token() function
 */
module.exports = node => {
  if (node.type !== "function" || node.value !== "token") {
    return {
      token: false,
      fallback: false,
    }
  }

  // Use the first arg only.
  const arg = node.nodes[0]

  // Allow arg in "string" or "word" format.
  const allowed_types = ["string", "word"]

  if (!arg || !allowed_types.includes(arg.type)) {
    throw `Incorrect or missing argument for token() function`
  }

  let token = parser.stringify(arg)

  // Remove quotes from string.
  if (arg.type === "string") {
    const search = new RegExp(arg.quote, "g")
    token = token.replace(search, "")
  }

  const rest_of_nodes = node.nodes.slice(1)

  // Loop through to find any fallbacks
  let fallback_parts = []
  rest_of_nodes.forEach((node, index) => {
    if (allowed_types.includes(node.type) && node.value) {
      fallback_parts.push(node.value)
    }
  })

  let fallback = false
  if (fallback_parts.length) {
    fallback = fallback_parts.join(" ")
  }

  return {
    token,
    fallback,
  }
}
