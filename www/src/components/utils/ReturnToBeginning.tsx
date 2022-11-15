import { Layer } from 'grommet'
import { Button, CaretUpIcon } from '@pluralsh/design-system'

export function ReturnToBeginning({ beginning }: any) {
  return (
    <Layer
      position="bottom-right"
      modal={false}
      plain
    >
      <Button
        onClick={beginning}
        endIcon={<CaretUpIcon size={14} />}
        marginRight="100px"
        marginBottom="30px"
      >
        Go to most recent
      </Button>
    </Layer>
  )
}
