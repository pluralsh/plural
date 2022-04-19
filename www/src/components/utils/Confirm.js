
import { Box, Layer } from 'grommet'
import { Button, SecondaryButton } from 'forge-core'

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
          <SecondaryButton
            label="Cancel"
            onClick={cancel}
          />
          <Button
            label={label || 'Continue'}
            onClick={submit}
            loading={loading}
          />
        </Box>
      </Box>
    </Layer>
  )
}
