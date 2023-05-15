import { getRuntimeSchema } from '@pluralsh/design-system/dist/markdoc'
import * as config from '@pluralsh/design-system/dist/markdoc/config'
import * as functions from '@pluralsh/design-system/dist/markdoc/functions'
import * as nodes from '@pluralsh/design-system/dist/markdoc/nodes'
import * as tags from '@pluralsh/design-system/dist/markdoc/tags'
import merge from 'lodash/merge'

// Extend default schema here
const baseSchema = merge(
  {
    nodes,
    functions,
    tags,
    ...config,
  },
  {
    variables: { consoleGlobalTestVar: 'Console global test content' },
  }
)

const { components, ...schemaConfig } = getRuntimeSchema(baseSchema)

export { components, schemaConfig as config }
