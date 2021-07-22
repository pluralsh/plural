const { override, adjustWorkbox } = require('customize-cra')

module.exports = override(
  adjustWorkbox(wb => Object.assign(wb, {
    navigateFallbackWhitelist: [...(wb.navigateFallbackWhitelist || []), /^\/graphiql.*/],
  }))
)