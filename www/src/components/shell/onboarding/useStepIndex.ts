import { useLocation } from 'react-router-dom'

import { urlPartToStepIndex } from '../ShellRouter'

function useStepIndex() {
  const urlPart = useLocation().pathname.split('/').pop() || ''

  return urlPartToStepIndex[urlPart] || -1
}

export default useStepIndex
