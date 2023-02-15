import { useMemo } from 'react'
import { withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { createEditor } from 'slate'

import { withMentions } from '../../_deprecated/components/utils/TypeaheadEditor'

export function useEditor() {
  return useMemo(() => withMentions(withReact(withHistory(createEditor()))), [])
}
