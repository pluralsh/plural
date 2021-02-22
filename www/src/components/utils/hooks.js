import { useMemo } from 'react'
import { withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { createEditor } from 'slate'

export function useEditor() {
  return useMemo(() => withReact(withHistory(createEditor())), [])
}