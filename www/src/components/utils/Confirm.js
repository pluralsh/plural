import { Box, Layer } from 'grommet'
import { Button } from 'honorable'

import { Alert, AlertStatus, GqlError } from './Alert'

export function Confirm({ submit, error, loading, label, header, cancel, description }) {
  return (
    <Layer
      onClickOutside={cancel}
      onEsc={cancel}
    >
      <Box
        width="40vw"
        pad="medium"
        gap="medium"
      >
        {error && (
          <GqlError
            header="Something went wrong"
            error={error}
          />
        )}
        <Alert
          status={AlertStatus.INFO}
          header={header || 'Are you sure?'}
          description={description}
        />
        <Box
          direction="row"
          align="center"
          justify="end"
          gap="xsmall"
        >
          <Button
            secondary
            onClick={cancel}
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            loading={loading}
          >
            {label || 'Continue'}
          </Button>
        </Box>
      </Box>
    </Layer>
  )
}
