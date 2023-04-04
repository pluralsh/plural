import { Button, CaretRightIcon, IconFrame } from '@pluralsh/design-system'
import styled from 'styled-components'

import { CellWrap, columnHelper } from './misc'

const Wrap = styled(CellWrap)({ alignSelf: 'end' })

export const ColActions = columnHelper.accessor(row => row.consoleUrl, {
  id: 'actions',
  enableGlobalFilter: false,
  enableSorting: false,
  cell: ({ row: { original: { consoleUrl, mock } } }) => (
    <Wrap>
      {mock && (
        <Button
          secondary
          small
          as="a"
          href="https://www.plural.sh/demo-login"
          target="_blank"
          rel="noopener noreferrer"
        >
          View live demo console
        </Button>
      )}
      {consoleUrl && (
        <Button
          secondary
          small
          as="a"
          href={consoleUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Launch Console
        </Button>
      )}
      <IconFrame
        clickable={!mock}
        size="medium"
        icon={<CaretRightIcon />}
        onClick={() => null} // TODO: Navigate to details page.
        textValue=""
        type="tertiary"
      />
    </Wrap>
  ),
  header: '',
})
