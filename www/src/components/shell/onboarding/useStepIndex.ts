import { useLocation } from 'react-router-dom'

import { SECTION_TO_STEP_INDEX, SECTION_TO_URL } from '../constants'

const URL_TO_SECTION = Object.entries(SECTION_TO_URL).reduce((acc, [section, url]) => {
  acc[url] = section

  return acc
}, {})

function useStepIndex() {
  const urlPart = useLocation().pathname.split('/').pop() || ''
  const cleanedUrlPart = urlPart.split('?')[0]

  return SECTION_TO_STEP_INDEX[URL_TO_SECTION[cleanedUrlPart]]
}

export default useStepIndex
