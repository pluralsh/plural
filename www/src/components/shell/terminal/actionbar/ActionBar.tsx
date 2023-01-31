import {
  Dispatch,
  MutableRefObject,
  ReactElement,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Button, Flex } from 'honorable'
import { CliIcon, ToolIcon, Tooltip } from '@pluralsh/design-system'

import { TerminalThemeSelector } from './theme/Selector'

import { Cheatsheet } from './cheatsheet/Cheatsheet'
import { MoreOptions } from './options/MoreOptions'

interface ActionBarItemProps {
  tooltip?: string,
  icon?: ReactElement,
  children?: ReactElement
  onClick?: Dispatch<any>
}

function ActionBarItemRef({
  tooltip, icon, children, onClick,
}: ActionBarItemProps, ref) {
  const content = icon ? (
    <Button
      width={32}
      height={32}
      onClick={onClick}
      small
      secondary
      ref={ref}
    >{icon}
    </Button>
  ) : children

  return (
    <>
      {tooltip && (
        <Tooltip label={tooltip}>
          <div>{content}</div>
        </Tooltip>
      )}
      {!tooltip && content}
    </>
  )
}

const ActionBarItem = forwardRef(ActionBarItemRef)

function ActionBar({ onRepairViewport }) {
  const [showCheatsheet, setShowCheatsheet] = useState(false)
  const cheatsheetButtonRef = useRef<HTMLElement>()

  useEffect(() => {
    console.log(cheatsheetButtonRef)
  }, [cheatsheetButtonRef])

  return (
    <Flex
      height={64}
      minHeight={64}
      gap="small"
      align="center"
      justify="flex-end"
      marginRight="medium"
    >
      <ActionBarItem
        tooltip="Repair Viewport"
        onClick={() => onRepairViewport()}
        icon={<ToolIcon />}
      />
      <ActionBarItem tooltip="Shell Theme"><TerminalThemeSelector /></ActionBarItem>
      <ActionBarItem
        tooltip="CLI Cheat Sheet"
        onClick={() => setShowCheatsheet(true)}
        icon={<CliIcon />}
        ref={cheatsheetButtonRef}
      />
      <ActionBarItem><MoreOptions /></ActionBarItem>

      {showCheatsheet && (
        <Cheatsheet
          onClose={() => setShowCheatsheet(false)}
        />
      )}
    </Flex>
  )
}

export { ActionBar }
