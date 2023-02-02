import { Flex } from 'honorable'
import { FormField, Input } from '@pluralsh/design-system'
import { useEffect, useMemo } from 'react'

import { IsObjectEmpty } from '../../../../../../utils/object'

function Azure({ props, setProps, setValid }) {
  const isValid = useMemo(() => !IsObjectEmpty(props?.azure), [props])

  // Init props provider object
  useEffect(() => {
    setProps({
      azure: {
        clientID: '', clientSecret: '', subscriptionID: '', tenantID: '', storageAccount: '',
      },
    })
  }, [setProps])

  useEffect(() => setValid(isValid), [isValid, setValid])

  return (
    <>
      <Flex gap="large">
        <FormField
          label="Client ID"
          width="100%"
        >
          <Input
            onChange={({ target: { value } }) => setProps(props => ({ azure: { ...props.azure, clientID: value } }))}
          />
        </FormField>
        <FormField
          label="Client Secret"
          width="100%"
        >
          <Input
            onChange={({ target: { value } }) => setProps(props => ({ azure: { ...props.azure, clientSecret: value } }))}
            type="password"
          />
        </FormField>
      </Flex>

      <Flex gap="large">
        <FormField
          label="Subscription ID"
          width="100%"
        >
          <Input
            onChange={({ target: { value } }) => setProps(props => ({ azure: { ...props.azure, subscriptionID: value } }))}
          />
        </FormField>
        <FormField
          label="Tenant ID"
          width="100%"
        >
          <Input
            onChange={({ target: { value } }) => setProps(props => ({ azure: { ...props.azure, tenantID: value } }))}
          />
        </FormField>
      </Flex>
    </>
  )
}

export default Azure
