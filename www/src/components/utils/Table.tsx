import { Flex, type FlexProps } from '@pluralsh/design-system'
import { type ReactNode, createContext, useContext, useMemo } from 'react'
import toUpper from 'lodash/toUpper'
import styled, { useTheme } from 'styled-components'

import { OverlineH1, SpanSC } from './Typography'

type TableContextT = {
  sizes: FlexProps['width'][]
  background?: string
}

const TableContext = createContext<TableContextT>({ sizes: [] })

function HeaderItem({ label, index }: { label: ReactNode; index: number }) {
  const { sizes } = useContext(TableContext)

  return (
    <Flex
      width={sizes[index]}
      align="center"
    >
      <HeaderLabelSC>{label}</HeaderLabelSC>
    </Flex>
  )
}

type TableRowProps = FlexProps & {
  children: ReactNode[]
  suffix?: ReactNode
  last?: boolean
}

export function TableRow({ children, suffix, last, ...flex }: TableRowProps) {
  const theme = useTheme()
  const { sizes } = useContext(TableContext)

  const len = children.length

  return (
    <Flex
      padding="small"
      direction="row"
      width="100%"
      align="center"
      borderBottom={last ? undefined : theme.borders.default}
      {...flex}
    >
      {children.map((child, i) => (
        <Flex
          key={i}
          width={sizes[i]}
          align="center"
          direction="row"
        >
          <Flex grow={1}>{child}</Flex>
          {i === len - 1 ? suffix : null}
        </Flex>
      ))}
    </Flex>
  )
}

export function TableData({ children }: { children?: ReactNode }) {
  return <SpanSC $color="text-light">{children}</SpanSC>
}

type TableProps = FlexProps & {
  sizes: FlexProps['width'][]
  headers: string[]
  background?: string
  heading?: string
}

export function Table({
  sizes,
  headers,
  children,
  background,
  heading,
  ...flex
}: TableProps) {
  const theme = useTheme()
  const value = useMemo(
    () => ({
      sizes,
      background,
    }),
    [sizes, background]
  )

  return (
    <Flex
      direction="column"
      border={theme.borders.default}
      borderRadius={theme.borderRadiuses.large}
      background={
        background ? (theme.colors[background] ?? background) : undefined
      }
      {...flex}
    >
      <TableContext.Provider value={value}>
        {heading && (
          <OverlineH1
            as="p"
            $color="text-xlight"
            css={{ padding: theme.spacing.medium }}
          >
            {toUpper(heading)}
          </OverlineH1>
        )}
        <Flex
          borderBottom={theme.borders.default}
          padding="small"
          align="center"
        >
          {headers.map((label, index) => (
            <HeaderItem
              key={label + index}
              label={label}
              index={index}
            />
          ))}
        </Flex>
        {children}
      </TableContext.Provider>
    </Flex>
  )
}

const HeaderLabelSC = styled.span({
  fontWeight: 600,
})
