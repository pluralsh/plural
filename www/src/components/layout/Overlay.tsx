import styled from 'styled-components'
import chroma from 'chroma-js'
import { animated, useTransition } from 'react-spring'
import { easings } from '@react-spring/web'
import {
  ComponentProps,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useReducer,
} from 'react'
import useUnmount from 'components/hooks/useUnmount'
import { produce } from 'immer'

const getTransitionProps = (isOpen: boolean) => ({
  from: { opacity: 0 /* , backdropFilter: 'blur(0px)' */ },
  enter: { opacity: 1 /* , backdropFilter: 'blur(1px)' */ },
  leave: { opacity: 0 /* , backdropFilter: 'blur(0px)' */ },
  config: isOpen
    ? {
      easing: easings.easeOutSine,
      duration: 100,
    }
    : {
      easing: easings.easeInSine,
      duration: 50,
    },
})

const OverlayBG = styled(animated.div)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: `${chroma(theme.colors['fill-zero']).alpha(0.5)}`,
  zIndex: theme.zIndexes.selectPopover - 2,
}))

export const ContentOverlay = () => {
  const showOverlay = !!useContext(OverlayContext)?.showOverlay
  const transitionProps = useMemo(() => getTransitionProps(showOverlay),
    [showOverlay])

  const transitions = useTransition(showOverlay ? [true] : [], transitionProps)

  return transitions(styles => <OverlayBG style={{ ...styles }} />)
}

type OverlayContextT = {
  setShowOverlay: (id: string, show: boolean) => void
  showOverlay: boolean
}

const OverlayContext = createContext<OverlayContextT | null>(null)

const activeOverlaysReducer = produce((activeOverlays: Record<string, boolean>,
  { id, show }: { id: string; show: boolean }) => {
  if (show) {
    activeOverlays[id] = true
  }
  else {
    delete activeOverlays[id]
  }

  return activeOverlays
})

export function OverlayContextProvider(props: Omit<ComponentProps<typeof OverlayContext.Provider>, 'value'>) {
  const [activeOverlays, dispatch] = useReducer(activeOverlaysReducer, {})

  const setShowOverlay = useCallback((id: string, show: boolean) => dispatch({ id, show }),
    [])

  const value = useMemo(() => ({
    setShowOverlay,
    showOverlay: Object.entries(activeOverlays).length !== 0,
  }),
  [activeOverlays, setShowOverlay])

  return (
    <OverlayContext.Provider
      {...props}
      value={value}
    />
  )
}

export const useContentOverlay = (show: boolean) => {
  const id = useId()
  const overlayCtx = useContext(OverlayContext)

  if (!overlayCtx) {
    throw Error('useContentOverlay() must be used inside an <OverlayContextProvider />')
  }
  useEffect(() => {
    overlayCtx.setShowOverlay(id, show)
  }, [id, overlayCtx, show])

  useUnmount(() => {
    overlayCtx.setShowOverlay(id, false)
  })
}
