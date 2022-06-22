import { Flex, Span } from 'honorable'
import { createContext, useContext, useMemo } from 'react'

const TableContext = createContext({})

function HeaderItem({ label, index }) {
  const { sizes } = useContext(TableContext)

  return (
    <Flex
      width={sizes[index]}
      align="center"
    >
      <Span fontWeight="bold">{label}</Span>
    </Flex>
  )
}

export function TableRow({ children, suffix, last }) {
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
    >
      {children.map((child, i) => (
        <Flex
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

export function TableData({ children }) {
  return <Span color="text-light">{children}</Span>
}

export function Table({ sizes, headers, children, background, ...flex }) {
  const value = useMemo(() => ({
    sizes, background,
  }), [sizes, background])

  return (
    <Flex
      direction="column"
      background={background}
      {...flex}
    >
      <TableContext.Provider value={value}>
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
