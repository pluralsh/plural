import { Flex } from 'honorable'

export const flexBasis = '365px'

// Workaround that will render empty columns to align the last row.
// It is better to use bigger columns number to prevent issues on all kinds of viewports.
export function fillEmptyColumns(columns) {
  return (
    <>
      {[...Array(columns)].map((x, i) => (
        <Flex
          key={i}
          flexGrow={1}
          flexBasis={flexBasis}
        />
      ))}
    </>
  )
}
