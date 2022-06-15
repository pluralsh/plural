import { useEffect, useMemo, useState } from 'react'
import { Div, Flex, H2, Img } from 'honorable'
import { CSSTransition, Transition } from 'react-transition-group'

const logoSizeBig = 48
const logoSizeSmall = 40

const fadeTransitionStyles = {
  entering: { opacity: 1 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 },
}
  
const splashTranslate = 'calc(50vh - (110px))'
  
const logoTranslateTransition = {
  '&, &.enter, &.enter-active, &.enter-done, &.exit': {
    transform: `translateY(${splashTranslate})`,
  },
  '&.exit-active': {
    transition: 'all 0.6s cubic-bezier(0.5, 0, 0.5, 1)',
  },
  '&.exit-active, &.exit-done': {
    transform: 'translateY(0)',
  },
}
  
const logoScaleTransition = {
  '&, .enter &, .enter-active &, .enter-done &, .exit &': {
    transform: `scale(${logoSizeBig / logoSizeSmall})`,
  },
  '.exit-active &': {
    transition: 'all 0.6s cubic-bezier(0.5, 0, 0.5, 1)',
  },
  '.exit-active &, .exit-done &': {
    transform: 'scale(1)',
  },
}
  
const splashEnterTransitions = {
  opacity: 0,
  transform: 'translateY(30px)',
  '.appear &, .enter &': {
    opacity: 0,
    transform: 'translateY(30px)',
  },
  '.appear-active &, .enter-active &': {
    transition: 'all 0.7s ease',
  },
  '.appear-active &, .enter-active &, .appear-done &, .enter-done': {
    opacity: 1,
    transform: 'translateY(0)',
  },
}

const splashLogoTransitions = {
  ...splashEnterTransitions,
  '.appear-active &, .enter-active &': {
    transition: 'all 0.7s ease',
    transitionDelay: '0.1s',
  },
  '.appear &, .enter &': {
    opacity: 0,
    transform: 'translateY(30px) scale(0.5)',
  },
  '.appear-active &, .enter-active &, .appear-done &, .enter-done': {
    opacity: 1,
    transform: 'translateY(0) scale(1)',
  },
  '.exit &, .exit-active &, .exit-done &': {
    opacity: 1,
    transform: 'none',
  },
}

const splashTextTransitions = {
  ...splashEnterTransitions,
  '.exit &': {
    opacity: 1,
    transform: 'translateY(0)',
  },
  '.exit-active &': {
    transition: 'all 0.3s ease',
  },
  '.exit-active &, .exit-done &': {
    opacity: 0,
  },
  '.exit-done &': {
    visibility: 'hidden',
  },
}

export default function SplashToLogoTransition({ showSplashScreen = false, ...props }) {
  if (showSplashScreen) {
    return <LogoAndSplash {...props} />
  }
 
  return <LogoOnly>{props.children}</LogoOnly>
}

function LogoOnly({ children }) {    
  return (
    <>
      <Div
        position="relative"
        zIndex={1}
      >
        <Flex
          width="100%"
          justify="center"
        >
          <Div
            width={logoSizeSmall}
            height={logoSizeSmall}
          >
            <Img
              display="block"
              width="100%"
              src="/plural-logo-white.svg"
            />
          </Div>
        </Flex>
      </Div>
      {children}
    </>
  )
}

export function LogoAndSplash({ splashTimeout = 1200, childIsReady = false, children }) {
  const [splashTimerDone, setSplashTimerDone] = useState(false)
  
  useEffect(() => {
    setTimeout(() => {
      setSplashTimerDone(true)
    }, splashTimeout)
  }, [splashTimeout])
  
  const showSplashScreen = useMemo(
    () => (!childIsReady || !splashTimerDone),
    [childIsReady, splashTimerDone]
  )

  return (
    <>
      <CSSTransition
        in={showSplashScreen}
        appear
        timeout={1000}
      >
        <Div
          position="relative"
          zIndex={1}
          {...logoTranslateTransition}
        >
          <Flex
            width="100%"
            justify="center"
            {...splashLogoTransitions}
          >
            <Div
              width={logoSizeSmall}
              height={logoSizeSmall}
              {...logoScaleTransition}
            >
              <Img
                display="block"
                width="100%"
                src="/plural-logo-white.svg"
              />
            </Div>
          </Flex>
        </Div>
      </CSSTransition>
      <CSSTransition
        in={showSplashScreen}
        appear
        timeout={1000}
      >
        <Div
          transform={`translateY(${splashTranslate})`}
          position="relative"
          width="100%"
          height={0}
        >
          <H2
            h2
            position="absolute"
            marginTop={`-${logoSizeBig - logoSizeSmall}px`}
            paddingTop="xlarge"
            width="100%"
            textAlign="center"
            {...splashTextTransitions}
          >
            Welcome to Plural
          </H2>
        </Div>
      </CSSTransition>
      <Transition
        in={!showSplashScreen}
        mountOnEnter
        unmountOnExit
        timeout={1000}
      >
        {transitionState => (
          <Flex
            width="100%"
            justify="center"
            transition="all 0.6s ease"
            opacity={0}
            className={transitionState}
            {...fadeTransitionStyles[transitionState]}
          >
            {children}
          </Flex>
        )}
      </Transition>
    </>
  )
}
  
