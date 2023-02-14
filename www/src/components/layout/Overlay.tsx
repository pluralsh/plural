import styled from 'styled-components'
import chroma from 'chroma-js'
import { animated, useTransition } from 'react-spring'
import { easings } from '@react-spring/web'
import {
  ComponentProps,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

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
  setShowOverlay: (show: boolean) => void
  showOverlay: boolean
}

const OverlayContext = createContext<OverlayContextT | null>(null)

export function OverlayContextProvider(props: Omit<ComponentProps<typeof OverlayContext.Provider>, 'value'>) {
  const [showOverlay, setShowOverlay] = useState(false)
  const value = useMemo(() => ({
    setShowOverlay,
    showOverlay,
  }),
  [showOverlay])

  return (
    <OverlayContext.Provider
      {...props}
      value={value}
    />
  )
}

export const useContentOverlay = (show: boolean) => {
  const overlayCtx = useContext(OverlayContext)

  if (!overlayCtx) {
    throw Error('useContentOverlay() must be used inside an <OverlayContextProvider />')
  }
  useEffect(() => {
    if (overlayCtx.showOverlay !== show) {
      overlayCtx.setShowOverlay(show)
    }
  }, [overlayCtx, show])
}
