const { override, adjustWorkbox } = require('customize-cra')

module.exports = override(
  adjustWorkbox(wb => Object.assign(wb, {
    navigateFallbackBlacklist: [...(wb.navigateFallbackBlacklist || []), /^\/graphiql.*/],
  }))
)