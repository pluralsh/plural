import { useMemo } from 'react'
import { withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { createEditor } from 'slate'

import { useLocation, useNavigate } from 'react-router-dom'

import { withMentions } from './TypeaheadEditor'

export function useEditor() {
  return useMemo(() => withMentions(withReact(withHistory(createEditor()))), [])
}

export function withRouter(Component) {
  return function (props) {
    return (
      <Component
        {...props}
        navigate={useNavigate()}
        location={useLocation()}
      />
    )
  }  
}
