const { override, adjustWorkbox, addBabelPlugins } = require('customize-cra')

module.exports = override(
  adjustWorkbox(wb => Object.assign(wb, {
    navigateFallbackBlacklist: [...(wb.navigateFallbackBlacklist || []), /^\/graphiql.*/],
  })),
  addBabelPlugins('@babel/plugin-proposal-optional-chaining')
)