import { Flex, P, Span } from 'honorable'
import { createContext, useContext, useMemo } from 'react'
import toUpper from 'lodash/toUpper'

const TableContext = createContext<any>({})

function HeaderItem({
  label, index,
}: any) {
  const { sizes } = useContext(TableContext)

  return (
    <Flex
      width={sizes[index]}
      align="center"
    >
      <Span fontWeight="600">{label}</Span>
    </Flex>
  )
}

export function TableRow({
  children, suffix, last, ...flex
}: any) {
  const { sizes } = useContext(TableContext)

  const len = children.length

  return (
    <Flex
      px={0.75}
      py={0.75}
      direction="row"
      width="100%"
      align="center"
      borderBottom={last ? null : '1px solid border'}
      {...flex}
    >
      {children.map((child, i) => (
        <Flex
          key={i}
          width={sizes[i]}
          align="center"
          direction="row"
        >
          <Flex flexGrow={1}>
            {child}
          </Flex>
          {i === len - 1 ? suffix : null}
        </Flex>
      ))}
    </Flex>
  )
}

export function TableData({ children }: any) {
  return (
    <Span color="text-light">
      {children}
    </Span>
  )
}

export function Table({
  sizes, headers, children, background, heading, ...flex
}: any) {
  const value = useMemo(() => ({
    sizes, background,
  }), [sizes, background])

  return (
    <Flex
      direction="column"
      border="1px solid border"
      borderRadius="large"
      background={background}
      {...flex}
    >
      <TableContext.Provider value={value}>
        {heading && (
          <P
            overline
            color="text-xlight"
            padding={16}
          >{toUpper(heading)}
          </P>
        )}
        <Flex
          borderBottom="1px solid border"
          px={0.75}
          py={0.75}
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
