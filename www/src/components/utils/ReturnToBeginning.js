import { Layer } from 'grommet'
import { Up } from 'grommet-icons'
import { Button } from 'pluralsh-design-system'

export function ReturnToBeginning({ beginning }) {
  return (
    <Layer
      position="bottom-right"
      modal={false}
      plain
    >
      <Button
        onClick={beginning}
        endIcon={<Up size="small" />}
        marginRight="100px"
        marginBottom="30px"
      >
        Go to most recent
      </Button>
    </Layer>
  )
}
