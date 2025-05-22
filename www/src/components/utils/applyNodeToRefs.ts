// basically the internal part of mergeRefs, but makes eslint happy
import { MutableRefObject, RefCallback } from 'react'

export function applyNodeToRefs(
  refArray: (
    | Nullable<RefCallback<HTMLElement | null>>
    | MutableRefObject<HTMLElement | null>
  )[],
  node: HTMLElement | null
) {
  refArray.forEach((ref) => {
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  })
}
