import React from 'react'
import { getMdContent } from '@pluralsh/design-system/dist/markdoc'
import { type RenderableTreeNode, renderers } from '@markdoc/markdoc'

import { components, config } from '../../../markdoc/mdSchema'

export default function MarkdocComponent({
  raw,
  content,
  components: userComponents = {},
}: {
  raw?: string | null
  content?: RenderableTreeNode
  components?: any
}) {
  content = content || getMdContent(raw, config)

  if (!content) {
    return null
  }

  const node = renderers.react(content, React, {
    components: {
      ...components,
      // Allows users to override default components
      ...userComponents,
    },
  })

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{node}</>
}
