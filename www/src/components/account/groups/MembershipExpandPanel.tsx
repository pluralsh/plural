import {
  AppIcon,
  Button,
  CaretRightIcon,
  Flex,
  IconFrame,
  Spinner,
} from '@pluralsh/design-system'
import { TRUNCATE } from 'components/utils/Truncate'
import { Body2P, CaptionP } from 'components/utils/Typography'
import {
  Children,
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react'
import styled from 'styled-components'

export const MEMBERSHIP_VISIBLE_ROWS = 5

const MEMBERSHIP_ROW_HEIGHT = 68
// Table cells use a 52px minimum content height, 32px of loose padding, and a 1px border.
const MEMBERSHIP_TABLE_ROW_HEIGHT = 85

export const membershipExpandTableProps = {
  loose: true,
  expandedRowType: 'custom' as const,
  expandedBgColor: 'fill-zero' as const,
  getRowCanExpand: () => true,
  onRowClick: (
    _e: MouseEvent<HTMLTableRowElement>,
    row: { getToggleExpandedHandler: () => () => void }
  ) => {
    row.getToggleExpandedHandler()()
  },
  reactVirtualOptions: {
    estimateSize: () => MEMBERSHIP_TABLE_ROW_HEIGHT,
  },
  lockColumnsOnScroll: false,
}

export const ColMembershipExpander = {
  id: 'expander',
  header: () => null,
  meta: { gridTemplate: '48px' },
  cell: ({ row }) =>
    row.getCanExpand() && (
      <IconFrame
        clickable
        size="small"
        type="tertiary"
        tooltip={row.getIsExpanded() ? 'Collapse' : 'Expand'}
        icon={
          <CaretRightIcon
            color="icon-light"
            style={{
              transform: `rotate(${row.getIsExpanded() ? 90 : 0}deg)`,
              transition: 'transform .2s',
            }}
          />
        }
        onClick={(e) => {
          e.stopPropagation()
          row.getToggleExpandedHandler()()
        }}
      />
    ),
}

function useCopyList(getText: () => Promise<string>) {
  const [copied, setCopied] = useState(false)
  const [copying, setCopying] = useState(false)

  useEffect(() => {
    if (!copied) return

    const timeout = setTimeout(() => setCopied(false), 1000)

    return () => clearTimeout(timeout)
  }, [copied])

  const handleCopy = useCallback(() => {
    setCopying(true)

    return getText()
      .then((text) => window.navigator.clipboard.writeText(text))
      .then(() => setCopied(true))
      .finally(() => setCopying(false))
  }, [getText])

  return { copied, copying, handleCopy }
}

export function MembershipExpandPanel({
  getCopyText,
  loading,
  emptyMessage,
  viewAll,
  previewRows,
  children,
}: {
  getCopyText: () => Promise<string>
  loading?: boolean
  emptyMessage?: string
  viewAll?: { onClick: () => void }
  previewRows?: number
  children?: ReactNode
}) {
  const { copied, copying, handleCopy } = useCopyList(getCopyText)
  const items = Children.toArray(children).slice(0, MEMBERSHIP_VISIBLE_ROWS)
  const showEmpty = !loading && items.length === 0
  const listRows = loading
    ? Math.min(previewRows ?? MEMBERSHIP_VISIBLE_ROWS, MEMBERSHIP_VISIBLE_ROWS)
    : items.length

  return (
    <WrapperSC onClick={(e) => e.stopPropagation()}>
      <BodySC>
        <MembershipListSC
          style={
            listRows > 0
              ? { minHeight: listRows * MEMBERSHIP_ROW_HEIGHT }
              : undefined
          }
        >
          {loading && (
            <Flex
              justify="center"
              padding="medium"
            >
              <Spinner />
            </Flex>
          )}
          {showEmpty && emptyMessage && (
            <MembershipListRowSC>
              <CaptionP $color="text-xlight">{emptyMessage}</CaptionP>
            </MembershipListRowSC>
          )}
          {!loading && items}
        </MembershipListSC>
        {viewAll && (
          <SeeFullListSC
            type="button"
            onClick={viewAll.onClick}
          >
            See full list
          </SeeFullListSC>
        )}
      </BodySC>
      <Button
        small
        secondary
        disabled={copying || showEmpty}
        onClick={handleCopy}
        width="fit-content"
      >
        <CopyLabelSC>
          <span style={{ visibility: copied ? 'hidden' : 'visible' }}>
            Copy list
          </span>
          <span
            aria-live="polite"
            style={{ visibility: copied ? 'visible' : 'hidden' }}
          >
            Copied
          </span>
        </CopyLabelSC>
      </Button>
    </WrapperSC>
  )
}

export function MembershipUserRow({
  name,
  email,
  avatar,
}: {
  name?: string | null
  email?: string | null
  avatar?: string | null
}) {
  return (
    <MembershipListRowSC>
      <Flex
        align="center"
        gap="small"
        grow={1}
        minWidth={0}
        overflow="hidden"
      >
        <AppIcon
          url={avatar ?? undefined}
          name={name ?? undefined}
          spacing={avatar ? 'none' : undefined}
          size="xxsmall"
        />
        <Body2P
          $color="text-light"
          css={TRUNCATE}
        >
          {name}
        </Body2P>
      </Flex>
      {email && (
        <CaptionP
          $color="text-xlight"
          css={{ flexShrink: 0 }}
        >
          {email}
        </CaptionP>
      )}
    </MembershipListRowSC>
  )
}

export function HoverActions({ children }: { children: ReactNode }) {
  return (
    <HoverActionsSC onClick={(e) => e.stopPropagation()}>
      {children}
    </HoverActionsSC>
  )
}

export const MembershipListRowSC = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing.small,
  boxSizing: 'border-box',
  height: MEMBERSHIP_ROW_HEIGHT,
  flexShrink: 0,
  overflow: 'hidden',
  padding: `${theme.spacing.medium} ${theme.spacing.medium} ${theme.spacing.medium} ${theme.spacing.small}`,
  backgroundColor: theme.colors['fill-zero'],
  borderBottom: theme.borders.default,
  '&:nth-child(even)': {
    backgroundColor: theme.colors['fill-zero-selected'],
  },
  '&:last-child': { borderBottom: 'none' },
}))

const WrapperSC = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing.medium,
  padding: theme.spacing.large,
  backgroundColor: theme.colors['fill-zero'],
}))

const BodySC = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.xsmall,
  flex: 1,
  minWidth: 0,
}))

export const MembershipListSC = styled.div(({ theme }) => ({
  overflow: 'hidden',
  border: theme.borders['fill-two'],
  borderRadius: theme.borderRadiuses.large,
}))

const CopyLabelSC = styled.span({
  display: 'grid',
  justifyItems: 'center',
  '& > *': { gridArea: '1 / 1' },
})

const SeeFullListSC = styled.button(({ theme }) => ({
  ...theme.partials.text.caption,
  color: theme.colors['text-xlight'],
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  width: 'fit-content',
  '&:hover': { color: theme.colors['text-light'] },
}))

const HoverActionsSC = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.xsmall,
  opacity: 0,
  pointerEvents: 'none',
  transition: 'opacity 0.12s ease',
  'tr:hover &, tr:has(:hover) &, tr:focus-within &, &:focus-within': {
    opacity: 1,
    pointerEvents: 'auto',
  },
}))
