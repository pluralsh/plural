import { FormField, Input } from '@pluralsh/design-system'
import { useEffect, useMemo } from 'react'

import { IsObjectEmpty } from '../../../../../../utils/object'

function AWS({ props, setProps, setValid }) {
  const isValid = useMemo(() => !IsObjectEmpty(props?.aws), [props])

  // Init props provider object
  useEffect(() => {
    setProps({ aws: { secretKey: '', accessKey: '' } })
  }, [setProps])

  useEffect(() => setValid(isValid), [isValid, setValid])

  return (
    <>
      <FormField
        label="Access Key ID"
        width="100%"
      >
        <Input onChange={({ target: { value } }) => setProps(props => ({ aws: { ...props.aws, accessKey: value } }))} />
      </FormField>

      <FormField
        label="Secret Access Key"
        width="100%"
      >
        <Input
          onChange={({ target: { value } }) => setProps(props => ({ aws: { ...props.aws, secretKey: value } }))}
          type="password"
        />
      </FormField>
    </>
  )
}

export default AWS
