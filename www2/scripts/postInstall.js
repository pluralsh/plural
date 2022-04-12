const fs = require('fs')
const path = require('path')

function main() {
  const location = path.join(__dirname, '../node_modules')

  recursivelySearchForGraphql(location)
}
function recursivelySearchForGraphql(location) {
  const files = fs.readdirSync(location)

  files.forEach(file => {
    const filePath = path.join(location, file)
    const stats = fs.statSync(filePath)

    if (stats.isDirectory()) {
      if (location.endsWith('node_modules') && file === 'graphql') {
        updateGraphqlPackage(filePath)
      }
      else {
        recursivelySearchForGraphql(filePath)
      }
    }
  })
}

function updateGraphqlPackage(location) {
  console.log('updating', location)
  const pkgLocation = path.resolve(location, 'package.json')
  const pkg = require(pkgLocation)

  delete pkg.module
  pkg.main = './index.js'

  fs.writeFileSync(pkgLocation, JSON.stringify(pkg, null, 2))

  const outerPkgLocation = path.resolve(location, '../../package.json')
  const outerPkg = require(outerPkgLocation)

  delete pkg.module

  fs.writeFileSync(outerPkgLocation, JSON.stringify(outerPkg, null, 2))
}

main()
