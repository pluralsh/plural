import { Box, Text } from 'grommet'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'

const StepContext = React.createContext({})
const ICON_SIZE = '25px'

function BetweenStep({step, width}) {
  const {current} = useContext(StepContext)
  return (
    <Box border={{color: current > step ? 'brand' : 'light-3', size: '1px', side: 'bottom'}} width={width} />
  )
}

function StepProvider({step, children}) {
  const steps = useRef({})
  const [current, setCurrent] = useState(0)
  const register = useCallback((name, ind) => {
    steps.current = {...steps.current, [name]: ind}
  }, [steps])
  useEffect(() => {
    if (steps.current[step] !== undefined) setCurrent(steps.current[step])
  }, [step, steps])

  return (
    <StepContext.Provider value={{current, setCurrent, register}}>
      {children}
    </StepContext.Provider>
  )
}

export function Step({step, name, onStep}) {
  const {current, setCurrent, register} = useContext(StepContext)
  const onSelect = useCallback(() => {
    onStep()
    setCurrent(step)
  }, [setCurrent, onStep, current])
  useEffect(() => {
    register(name, step)
  }, [register])

  return (
    <Box flex={false} pad='small' direction='row' align='center' gap='xsmall' onClick={onSelect} focusIndicator={false}>
      <Box width={ICON_SIZE} height={ICON_SIZE} align='center' justify='center' 
           background={current >= step ? 'brand' : 'light-1'} round='full'>
        <Text size='small' color={current >= step ? null : 'light-5'}>{step + 1}</Text>
      </Box>
      <Text size='small' color={current >= step ? null : 'light-5'}>{name}</Text>
    </Box>
  )
}

function* intersperse(steps) {
  let len = steps.length
  yield React.cloneElement(steps[0], {step: 0})
  for (let i = 1; i < len; i++) {
    yield <BetweenStep key={`btw-${i}`} step={i - 1} width={`${100 / (len - 1)}%`} />
    yield React.cloneElement(steps[i], {key: `stp-${i}`, step: i})
  }
}

export function Steps({step, children}) {
  return (
    <StepProvider step={step}>
      <Box direction='row' align='center' justify='center'>
        {[...intersperse(children)]}
      </Box>
    </StepProvider>
  )
}