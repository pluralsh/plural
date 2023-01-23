import { Dispatch, ReactElement, useState } from 'react'
import { Button, Flex } from 'honorable'
import { CliIcon, ToolIcon, Tooltip } from '@pluralsh/design-system'

import { TerminalThemeSelector } from '../theme/Selector'

import { Cheatsheet } from './Cheatsheet'
import { MoreOptions } from './MoreOptions'

interface ActionBarItemProps {
  tooltip?: string,
  icon?: ReactElement,
  children?: ReactElement
  onClick?: Dispatch<any>
}

function ActionBarItem({
  tooltip, icon, children, onClick,
}: ActionBarItemProps) {
  const content = icon ? (
    <Button
      width={32}
      height={32}
      onClick={onClick}
      small
      secondary
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

function ActionBar({ onRepairViewport }) {
  const [showCheatsheet, setShowCheatsheet] = useState(false)

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
      />
      <ActionBarItem><MoreOptions /></ActionBarItem>

      {showCheatsheet && <Cheatsheet onClose={() => setShowCheatsheet(false)} />}
    </Flex>
  )
}

export { ActionBar }
