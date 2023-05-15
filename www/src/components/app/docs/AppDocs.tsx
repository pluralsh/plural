import { scrollIntoContainerView } from '@pluralsh/design-system'
import { capitalize } from 'lodash'
import { useEffect, useRef } from 'react'

import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom'

import { getDocsData } from '../App'

import { ScrollablePage } from '../../utils/layout/ScrollablePage'

import { useDocPageContext } from './AppDocsContext'

import MarkdocComponent from './MarkdocContent'

export function AppDocs() {
  const scrollRef = useRef<HTMLElement>()
  const { appName, docName } = useParams()

  const { docs } = useOutletContext() as {
    docs: ReturnType<typeof getDocsData>
  }
  const { scrollHash, scrollToHash } = useDocPageContext()
  const hashFromUrl = useLocation().hash.slice(1)

  useEffect(() => {
    scrollToHash(hashFromUrl)
    // Only want to run this on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currentDoc = docs?.find((doc) => doc.id === docName)
  const location = useLocation()

  useEffect(() => {
    if (scrollHash.value && scrollRef.current) {
      const hashElt = scrollRef.current.querySelector(`#${scrollHash.value}`)

      if (!hashElt) {
        return
      }
      scrollIntoContainerView(hashElt, scrollRef.current, {
        behavior: 'smooth',
        block: 'start',
        blockOffset: 32,
        preventIfVisible: false,
      })
    }
  }, [scrollHash])

  const navigate = useNavigate()

  if (!currentDoc) {
    navigate(location.pathname.split('/').slice(0, -1).join('/'))

    return null
  }
  const displayAppName = capitalize(appName)

  return (
    <ScrollablePage
      heading={`${displayAppName} docs`}
      scrollRef={scrollRef}
    >
      <MarkdocComponent content={currentDoc?.content} />
    </ScrollablePage>
  )
}
