import { Button, CaretRightIcon, IconFrame } from '@pluralsh/design-system'
import styled from 'styled-components'

import { CellWrap, columnHelper } from './misc'

const Wrap = styled(CellWrap)({ alignSelf: 'end' })

export const ColActions = navigate => (columnHelper.accessor(row => row.consoleUrl, {
  id: 'actions',
  enableGlobalFilter: false,
  enableSorting: false,
  cell: ({ row: { original: { id, consoleUrl } } }) => (
    <Wrap>
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
        clickable
        size="medium"
        icon={<CaretRightIcon />}
        onClick={() => navigate(`/clusters/${id}`)}
        textValue=""
        type="tertiary"
      />
    </Wrap>
  ),
  header: '',
}))
