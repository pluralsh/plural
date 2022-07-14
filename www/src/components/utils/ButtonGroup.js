import { Box } from 'grommet'
import { Span } from 'honorable'
import { useCallback, useState } from 'react'

const ROUND = '3px'

function ButtonItem({ val, onChange, active, first, last }) {
  return (
    <Box
      flex={false}
      pad={{ horizontal: '12px', vertical: '8px' }}
      border={last ? true : [{ side: 'left' }, { side: 'horizontal' }]}
      background={val === active ? 'action-primary' : null}
      round={first ? { corner: 'left', size: ROUND } : (last ? { corner: 'right', size: ROUND } : null)}
      onClick={() => onChange(val)}
    >
      <Span fontWeight="500">{val}</Span>
    </Box>
  )
} 

export function ButtonGroup({ tabs, onChange, default: def }) {
  const [active, setActive] = useState(def)
  const doChange = useCallback(v => {
    setActive(v)
    onChange(v)
  }, [setActive, onChange])

  const len = tabs.length

  return (
    <Box
      flex={false}
      direction="row"
    >
      {tabs.map((t, i) => (
        <ButtonItem
          key={t}
          val={t}
          first={i === 0}
          last={i === len - 1}
          onChange={doChange}
          active={active}
        />
      ))}
    </Box>
  )
}
