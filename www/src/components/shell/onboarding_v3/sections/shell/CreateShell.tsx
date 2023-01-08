import { Div } from 'honorable'

import { GqlError } from '../../../../utils/Alert'

import { ShellStatus } from './ShellStatus'

const EMPTY_SHELL = ({ alive: false, status: {} })

function CreateShell() {
  const data = { shell: undefined }
  const error = undefined

  return (
    <>
      <ShellStatus
        shell={data?.shell || EMPTY_SHELL}
        error={error}
      />
      {!!error && (
        <Div marginTop="medium">
          <GqlError
            header="Error while creating shell instance"
            error={error}
          />
        </Div>
      )}
    </>
  )
}

export default CreateShell
