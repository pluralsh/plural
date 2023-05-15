import { Dispatch, ReactElement, forwardRef, useContext, useState } from 'react'
import { Button, ButtonProps, Flex } from 'honorable'
import { CliIcon, ToolIcon, Tooltip } from '@pluralsh/design-system'

import CurrentUserContext from '../../../../contexts/CurrentUserContext'

import { TerminalThemeSelector } from './theme/Selector'

import { Cheatsheet } from './cheatsheet/Cheatsheet'
import { MoreOptions } from './options/MoreOptions'
import { DeleteDemoModal } from './options/DeleteShellModal'

type ActionBarItemProps = {
  tooltip?: string
  icon?: ReactElement
  children?: ReactElement
  onClick?: Dispatch<any>
} & ButtonProps

function ActionBarItemRef(
  { tooltip, icon, children, onClick, ...props }: ActionBarItemProps,
  ref
) {
  const content = icon ? (
    <Button
      width={32}
      height={32}
      onClick={onClick}
      small
      secondary
      ref={ref}
      {...props}
    >
      {icon}
    </Button>
  ) : (
    children
  )

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
  const [demoDelete, setDemoDelete] = useState(false)
  const { demoing } = useContext(CurrentUserContext)
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
      {demoDelete && <DeleteDemoModal onClose={() => setDemoDelete(false)} />}
      {demoing && (
        <Button
          small
          onClick={() => setDemoDelete(true)}
        >
          Delete Demo
        </Button>
      )}
      <ActionBarItem
        data-phid="repair-viewport"
        tooltip="Repair Viewport"
        onClick={() => onRepairViewport()}
        icon={<ToolIcon />}
      />
      <ActionBarItem
        data-phid="shell-theme"
        tooltip="Shell Theme"
      >
        <TerminalThemeSelector />
      </ActionBarItem>
      <ActionBarItem
        data-phid="cli-cheat-sheet"
        tooltip="CLI Cheat Sheet"
        onClick={() => setShowCheatsheet(true)}
        icon={<CliIcon />}
      />
      <ActionBarItem>
        <MoreOptions />
      </ActionBarItem>

      {showCheatsheet && (
        <Cheatsheet onClose={() => setShowCheatsheet(false)} />
      )}
    </Flex>
  )
}

export { ActionBar }
